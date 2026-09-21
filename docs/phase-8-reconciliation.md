# Phase 8 — Réconciliation technique

Statut : **livré**. Cette phase ne crée aucune fonctionnalité : elle referme les
doublons, les raccourcis et les « à faire plus tard » laissés par les phases 4 à
7, qui ont été menées en parallèle. Chaque point ci-dessous dit ce qui a changé,
pourquoi, et ce qui reste ouvert (§9).

Documents concernés : `docs/phase-4-editeur.md` §6, `docs/phase-5-6-publication-rsvp.md`
§6, §10 et §11, `docs/phase-7-activation-admin.md` §1.

---

## 1. Un seul mécanisme de seed des thèmes

**Avant.** Deux seeds coexistaient : `src/db/seed.ts` (identifiants
déterministes `theme-<slug>`, utilisé par `pnpm db:seed:local` et par l'éditeur)
et `src/db/seed-themes.ts` (identifiants aléatoires, appelé par `/admin` et
`/activate`). Les deux étaient idempotents par `slug`, donc la ligne créée
dépendait de qui passait en premier — et l'identifiant d'un thème n'était pas
reproductible d'un environnement à l'autre.

**Après.** `src/db/seed-themes.ts` est supprimé. `src/db/seed.ts` est la source
unique et porte désormais aussi `ensureThemesSeeded(db)` et
`getThemeIdBySlug(db, slug)` ; les appelants (`/admin`, `/activate`,
`src/lib/activation.ts`) n'ont changé que d'import.

Le seed insère **les trois thèmes du registre**, est idempotent par `slug`, et
rafraîchit `name` / `version` quand le manifeste a bougé (une lecture préalable
évite d'écrire quand rien n'a changé, car `/admin` et `/activate` l'appellent à
chaque affichage). `status` n'est écrit **qu'à l'insertion** : un thème
délibérément passé en brouillon ou archivé en base le reste. L'insertion est
protégée par un `try`/`catch` qui relit la ligne en cas de course.

## 2. Variables d'environnement centralisées

`src/lib/env.ts` est le seul module qui lit `process.env` (vérifiable :
`grep -rn "process.env" src emails`). S'y ajoutent, validées par Zod :

| Variable | Accesseur | Comportement |
| --- | --- | --- |
| `RSVP_IP_SALT` | `rsvpIpSalt()` | repli sur `BETTER_AUTH_SECRET` |
| `CRON_SECRET` | `cronSecret()` | `null` si absent **ou** plus court que 16 caractères ; la route refuse alors tout appel, mais l'application ne tombe pas |
| `ALLOW_FREE_DRAFTS` | `allowFreeDrafts()` | `true` / `1` / `yes` / `on` ; faux par défaut |
| `LEGAL_*` (8) | `getLegalCompanyInfo()` | une variable absente garde son placeholder `[[…]]`, visible sur la page |

`src/lib/retention.ts` ré-exporte `cronSecret` pour ne pas casser ses appelants.
Les variables sont documentées dans `.env.example` et dans le README §3.

**Contrainte gardée à l'esprit** : `env.ts` ne doit jamais se retrouver dans un
module importé côté client. Ses deux nouveaux appelants (`src/app/(app)/app/page.tsx`,
`src/app/(app)/legal/company.ts`) sont des modules serveur.

## 3. Cron de rétention : un vrai handler `scheduled`

`@opennextjs/cloudflare` régénère `.open-next/worker.js` à chaque build et ce
module n'exporte que `fetch` — le `triggers.crons` de `wrangler.jsonc` n'avait
donc rien à appeler. La façon documentée d'étendre le Worker est de posséder le
point d'entrée et de déléguer au module généré :

- `worker/index.ts` : `fetch` délégué tel quel, plus `scheduled()` ;
- `wrangler.jsonc` : `"main": "worker/index.ts"` et un alias
  `"open-next-worker": "./.open-next/worker.js"` ;
- `worker/open-next-worker.d.ts` : les types de ce module.

L'alias n'est pas cosmétique : un import relatif de `../.open-next/worker.js`
fait échouer `pnpm typecheck` sur un dépôt fraîchement cloné (le fichier
n'existe qu'après un build) et `@ts-expect-error` ne convient pas non plus,
puisque la directive devient fautive dès que le build a eu lieu. L'alias est
résolu par wrangler au bundling, la déclaration par TypeScript, et les deux
états compilent.

`scheduled()` prend le binding `DB` dans l'`env` que lui passe le runtime :
`getCloudflareContext()` n'est peuplé que dans une requête, alors que
`purgeExpiredRsvps(db?)` accepte déjà une base explicite. Il supprime les
réponses dont l'événement a plus de `RSVP_RETENTION_MONTHS` (6 mois) et passe en
`expired` les invitations dont l'`expires_at` est dépassé. Les erreurs sont
journalisées sans faire tomber le Worker : la tâche est idempotente et repassera.

`POST /api/cron/retention` (protégée par `CRON_SECRET`) reste en secours.

Vérifié par `pnpm exec wrangler deploy --dry-run` : le bundle produit contient
bien `scheduled`, `deleteRsvpsForEventsBefore` et `expireDuePublications`, et
les six bindings sont résolus.

## 4. Tests de bout en bout avec les bindings

`next start` n'a pas les bindings : les spécifications `editor` et `rsvp` se
sautaient ou exigeaient un serveur lancé à la main. `playwright.config.ts`
démarre maintenant `next dev` :

- sur **`localhost`** et non `127.0.0.1` — Better Auth compare l'origine à
  `APP_URL`, et la page ne s'hydrate pas si les deux orthographes divergent ;
- avec `APP_URL`, `PORT` (3110 par défaut), `BETTER_AUTH_SECRET`,
  `ADMIN_EMAILS=admin@example.com`, `ALLOW_FREE_DRAFTS=true` (le parcours de
  l'éditeur crée son brouillon depuis `/app`) et `MAIL_DRIVER=console` ;
- avec **`workers: 1`** : les fixtures passent par `wrangler d1 execute --local`,
  un second processus sur le même fichier SQLite, et la D1 locale renvoie des
  erreurs internes dès que deux écritures se croisent ;
- après `pretest:e2e` (`pnpm db:migrate:local && pnpm db:seed:local`), qui
  s'exécute avant que Playwright ne démarre quoi que ce soit.

Les `test.skip` conditionnels de `tests/e2e/rsvp.spec.ts` sont retirés : une
invitation publiée qui ne se sert pas est maintenant une **erreur**. Le parcours
de l'éditeur crée ses comptes en base avant de demander un lien magique, parce
que le verrou de connexion de la phase 7 ne l'envoie qu'à une adresse connue —
c'est ce qu'aurait fait une activation validée.

`NODE_ENV=test` n'est pas passé : `next dev` a besoin de `development`.

Le navigateur reste celui de l'image (`/opt/pw-browsers/chromium`) ; s'il
n'existe pas, Playwright utilise le sien. C'est ce qui permet au nouveau job
`e2e` de `.github/workflows/ci.yml` d'installer Chromium
(`pnpm exec playwright install --with-deps chromium`) — le seul endroit du
projet où cette commande est lancée.

## 5. Bouton « Créer une invitation »

Il ne vérifiait aucun achat. Il n'apparaît désormais que pour un administrateur
ou si `ALLOW_FREE_DRAFTS=true` ; sinon, le tableau de bord vide renvoie vers
`/activate`. `createDraftInvitationAction` applique la même règle **côté
serveur** (un formulaire se poste sans la page) et redirige vers `/activate`.
Un acheteur reçoit son brouillon par l'activation, comme prévu.

## 6. `invitations.locale` resynchronisée

`content.locale` fait foi pour le rendu, mais la colonne est ce que lisent le
tableau de bord, la page de partage et les e-mails ; les deux divergeaient dès
que le couple changeait la langue dans l'éditeur.
`updateInvitationContentForOwner` accepte un `locale` optionnel et l'écrit dans
la même requête ; `saveInvitationContentAction` lui passe `content.locale`.

## 7. Fuseau horaire : une seule conversion

`eventInstant()` construisait `new Date('YYYY-MM-DDTHH:MM')`, lu dans le fuseau
du **visiteur** : un invité à Montréal voyait un compte à rebours décalé de six
heures. Le thème et le `.ics` avaient chacun ajouté leur propre correction.

`src/content/derived.ts` porte maintenant la conversion, sans dépendance :

- `zoneOffsetMs(instant, timeZone)` — l'écart UTC↔zone, lu en formatant
  l'instant dans la zone avec `Intl.DateTimeFormat` puis en le relisant comme de
  l'UTC ;
- `zonedTimeToUtc(date, time, timeZone)` — construit les deux candidats permis
  par les décalages en vigueur la veille et le lendemain, puis garde ceux qui se
  relisent bien comme l'heure demandée. Une heure **ambiguë** (retour à l'heure
  d'hiver, 02:30 existe deux fois) donne la première occurrence ; une heure
  **inexistante** (passage à l'heure d'été) est décalée en avant plutôt que
  ramenée la veille. Une zone inconnue retombe sur la lecture naïve ;
- `eventInstant(content)` applique tout ça à `content.event.timezone`.

`src/lib/ics.ts` et `src/themes/*/animations/time.ts` (les trois thèmes,
modification strictement limitée à ce fichier) ré-exportent ces fonctions au
lieu d'en avoir une copie.

18 tests (`tests/unit/content/derived-time.test.ts`) couvrent Europe/Paris été
et hiver, America/New_York, Pacific/Auckland (hémisphère sud), Asia/Kolkata
(demi-heure), les deux transitions, et les zones inconnues.

## 8. Commandes et résultats

```bash
pnpm lint          # 0 erreur
pnpm typecheck     # 0 erreur
pnpm format:check  # tout formaté
pnpm test          # 324 tests (dont 20 ajoutés par cette phase)
pnpm test:e2e      # 45 tests sur les 3 viewports
pnpm build:cf      # bundle Worker produit
pnpm exec wrangler deploy --dry-run   # le Worker personnalisé se bundle
```

## 9. Ce qui reste ouvert

1. **`pnpm preview` / `pnpm deploy` ne sont toujours pas validés** depuis cet
   environnement (processus longs interrompus, aucune ressource Cloudflare
   créée). Le `--dry-run` prouve que le bundle se construit, pas que le Worker
   démarre. À essayer en premier sur une vraie machine, y compris
   `wrangler dev --test-scheduled` pour déclencher `scheduled()` à la main.
2. **Cache KV non branché** (`docs/phase-5-6-publication-rsvp.md` §2) : à faire
   avec l'invalidation dans le chemin de sauvegarde.
3. **Pas d'image Open Graph**, pas de `robots.txt`, pas de `sitemap.xml`.
4. **Une seule taille de photo stockée** (1600 px) et **les photos supprimées
   restent dans R2** : `deleteInvitationPhotos()` existe mais la tâche de
   rétention ne l'appelle pas encore — c'est le prolongement naturel de
   `scheduled()`.
5. **Activation Etsy V1** (vérification automatique par l'API) toujours non
   implémentée : plan dans `docs/phase-7-activation-admin.md` §3.
6. **Les identifiants de `wrangler.jsonc` sont des placeholders** et
   `CRON_SECRET` doit être poussé en production, sans quoi la route de secours
   refusera tout (la tâche planifiée, elle, fonctionne sans secret).
7. **Aucun test ne couvre `scheduled()` de bout en bout** : la purge est testée
   unitairement, l'enveloppe du Worker ne l'est pas (il faudrait `wrangler dev`,
   impossible à maintenir en vie ici).
8. **`node:sqlite` reste expérimental** et les tests affichent son
   avertissement.
