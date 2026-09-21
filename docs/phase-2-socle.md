# Phase 2 — Socle technique

Statut : **livré**. Ce document décrit ce qui est réellement en place dans le
dépôt, les versions retenues, les commandes, ce qu'il reste à faire côté compte
Cloudflare, et les limites connues.

Spécification de référence : `docs/phase-1-cadrage.md`. Les écarts avec ce
document sont listés au §7.

---

## 1. Ce qui est fait

| Domaine | État |
|---|---|
| Projet Next.js (App Router, TypeScript strict) | ✅ |
| Déploiement Cloudflare Workers via `@opennextjs/cloudflare` | ✅ (`open-next.config.ts`, `wrangler.jsonc`, scripts `preview` / `deploy`) |
| Bindings locaux en dev (`initOpenNextCloudflareForDev`) | ✅ |
| D1 + Drizzle ORM, migration SQL générée et appliquée | ✅ (`drizzle/0000_init.sql`) |
| R2 (clé photo, ticket d'upload signé, lecture publique) | ✅ (couche `src/lib/r2.ts`, route d'upload à écrire en phase 4) |
| KV (cache incrémental Next + cache applicatif) | ✅ déclarés |
| Rate limiting (binding Workers + repli mémoire) | ✅ |
| Better Auth : lien magique, sessions en base, pas de mot de passe | ✅ testé de bout en bout |
| Abstraction mail (console en dev, Resend en prod) | ✅ |
| i18n next-intl **sans préfixe de langue** (cookie → `Accept-Language` → `en`) | ✅ |
| Schéma de contenu Zod + valeurs par défaut + migrations de version | ✅ + tests |
| Contrat de thème + registre + thème « Noir & ivoire » (statique) | ✅ + tests |
| `/demo/mariage-noir-ivoire` alimenté par `demo.json` | ✅ |
| `/login` fonctionnel, `/app` (e-mail, liste vide, déconnexion) | ✅ |
| Stubs propres pour les autres routes | ✅ |
| Vitest, Playwright (3 viewports + captures), GitHub Actions | ✅ |
| `.env.example`, `.gitignore`, `README.md` | ✅ |

Ce qui n'est **pas** fait (et ne devait pas l'être) : les animations du thème
(phase 3), l'éditeur (phase 4), la publication (phase 5), le RSVP réel et le
tableau de bord (phase 6), l'activation Etsy (phase 7), les textes légaux
(phase 8).

---

## 2. Versions réellement installées

Choisies après vérification des versions publiées sur npm et des dépendances
entre paquets (`npm view … peerDependencies`).

| Paquet | Version | Remarque |
|---|---|---|
| Node | 22 | imposé par le brief |
| pnpm | 10.33 | |
| `next` | **16.3.5** | dernière version stable acceptée par `@opennextjs/cloudflare` (`next: >=15.5.24 <16 \|\| >=16.3.3`) |
| `react` / `react-dom` | 19.3.0 | |
| `@opennextjs/cloudflare` | 1.20.6 | |
| `wrangler` | 4.136.0 | |
| `drizzle-orm` / `drizzle-kit` | 0.45.3 / 0.31.11 | versions exigées par Better Auth |
| `better-auth` | 1.7.5 | plugins `magicLink` + `nextCookies` |
| `next-intl` | 4.14.6 | |
| `zod` | 4.6.5 | |
| `tailwindcss` | 4.3.3 | via `@tailwindcss/postcss` |
| `vitest` | 5.0.1 | |
| `@playwright/test` | 1.63.0 | |
| `eslint` | **9.39.5** | `eslint-config-next` 16 livre des *flat configs* natives ; ESLint 10 existe mais n'est pas encore éprouvé avec cette chaîne |
| `prettier` | 3.9.8 | |
| `resend` | 6.28.1 | installé, mais l'envoi passe par `fetch` (voir §7) |
| `@fontsource/{bodoni-moda,cormorant-garamond,pinyon-script,mrs-saint-delafield,allura}` | 5.3.0 | les cinq paquets **non variables** existent ; pas besoin de `@fontsource-variable/*` |

---

## 3. Commandes

```bash
pnpm install
pnpm cf-typegen                 # cloudflare-env.d.ts (non versionné)
pnpm dev                        # http://localhost:3000, bindings locaux

pnpm lint
pnpm format:check
pnpm typecheck
pnpm test                       # Vitest
pnpm test:e2e                   # Playwright, captures dans tests/e2e/screenshots/

pnpm build                      # next build
pnpm build:cf                   # next build + bundle Worker (.open-next/)
pnpm preview                    # workerd en local
pnpm deploy                     # déploiement Cloudflare

pnpm db:generate --name xxx     # nouvelle migration SQL dans drizzle/
pnpm db:migrate:local
pnpm db:migrate:remote
```

Toutes ces commandes ont été exécutées avec succès dans l'environnement de
développement, y compris `wrangler d1 migrations apply --local`, sauf
`pnpm preview` et `pnpm deploy` (voir §8.4).

---

## 4. À faire dans le compte Cloudflare

### 4.1 Créer les ressources

```bash
# Base de données, hébergée en Europe de l'Ouest
wrangler d1 create invitations-db --location-hint weur

# Bucket photos, résidence UE garantie (la juridiction est définitive)
wrangler r2 bucket create invitations-photos --jurisdiction eu

# Cache du rendu incrémental Next.js
wrangler kv namespace create NEXT_INC_CACHE_KV

# Cache applicatif (invitations publiées)
wrangler kv namespace create CACHE
```

Reporter les identifiants renvoyés dans `wrangler.jsonc`, à la place des
placeholders `00000000-…` / `0000…`. Le limiteur de débit (`ratelimits`) ne
demande **aucune** création : son `namespace_id` est un entier libre, unique
dans le Worker.

### 4.2 Pousser les secrets

```bash
wrangler secret put BETTER_AUTH_SECRET   # openssl rand -base64 32
wrangler secret put RESEND_API_KEY
```

En local, ces mêmes valeurs vont dans `.dev.vars` (pour wrangler/workerd) et
`.env.local` (pour `next dev`). Les deux fichiers sont ignorés par git.

### 4.3 Appliquer les migrations puis déployer

```bash
pnpm db:migrate:remote
pnpm deploy
```

### 4.4 Jeton API (permissions minimales)

Pour un jeton utilisé par une CI ou par un agent, créer un *Custom token* dans
*My Profile → API Tokens*, limité au compte concerné, avec :

| Permission | Niveau | Pourquoi |
|---|---|---|
| Account · **Workers Scripts** | Edit | déployer le Worker |
| Account · **Workers KV Storage** | Edit | créer/écrire les namespaces KV |
| Account · **Workers R2 Storage** | Edit | créer le bucket et y écrire |
| Account · **D1** | Edit | créer la base et appliquer les migrations |
| Account · **Account Settings** | Read | `wrangler whoami`, résolution de l'`account_id` |
| Zone · **Workers Routes** | Edit | **seulement** si un domaine personnalisé est rattaché |

Aucune permission DNS, Cache ou Firewall n'est nécessaire tant qu'il n'y a pas
de domaine personnalisé.

### 4.5 Prévisualisations par branche (Workers Builds)

Tableau de bord → *Workers & Pages* → le Worker → *Settings* → *Builds* →
connecter le dépôt GitHub :

- build : `pnpm build:cf`
- deploy : `pnpm exec opennextjs-cloudflare deploy`
- branche de production : `main`
- activer *Non-production branch builds* : chaque branche obtient une URL de
  prévisualisation à partager en fin de phase.

---

## 5. Points d'architecture à connaître

### 5.1 i18n sans préfixe d'URL

`src/i18n/config.ts` est la source unique des locales (`['en', 'fr']`, défaut
`en`). `src/i18n/locale.ts` lit le cookie `locale`, sinon négocie
`Accept-Language`, sinon retombe sur `en`. `src/i18n/request.ts` fusionne les
sept espaces de messages (`common`, `auth`, `editor`, `dashboard`, `admin`,
`legal`, `marketing`). Le sélecteur de langue est un simple `<form>` relié à une
*server action* : il fonctionne sans JavaScript.

**L'invitation publique ne lit jamais ce cookie** : sa langue vient de
`content.locale`, et le thème charge ses propres messages
(`src/themes/<slug>/messages/{en,fr}.json`).

### 5.2 Groupes de routes

`src/app/(app)/` porte l'en-tête, le conteneur Tailwind et le sélecteur de
langue. `/[slug]` et `/demo/[theme]` vivent **en dehors** de ce groupe : l'invité
ne voit que l'invitation, sans rien de l'application.

### 5.3 Isolation des données

Il n'y a pas de RLS sur D1. Chaque requête de `src/db/queries/` prend un
`ownerId` et le place dans la clause `WHERE` ; un test vérifie qu'une invitation
d'Alice est invisible et non modifiable par Bob, et que les RSVP ne remontent
qu'au propriétaire de l'invitation.

### 5.4 Upload R2

Le binding R2 n'expose pas d'URL présignée S3. `src/lib/r2.ts` produit donc un
**ticket signé HMAC-SHA256** (Web Crypto, aucune dépendance) valable 10 minutes,
que la route d'upload vérifiera en phase 4. Clé :
`invitations/{id}/photos/{uuid}.webp`. Lecture publique via
`R2_PUBLIC_BASE_URL`, qui pointe soit vers un domaine R2 public, soit vers une
route Worker.

### 5.5 Contrat de thème

`src/themes/types.ts` définit `ThemeManifest` (palettes avec leurs six variables
CSS, écritures, emplacements photo, sections, bornes), `ThemeModule`
(`manifest` + `Extras` Zod + `Invitation`) et le mode de rendu
(`public | preview | demo`). `Invitation` peut être un composant serveur
asynchrone, ce qui permet à un thème de charger lui-même ses messages.
`src/themes/registry.ts` charge chaque thème paresseusement : rien d'un thème
n'est empaqueté tant qu'il n'est pas demandé.

---

## 6. Tests

- **Vitest** — 62 tests : schéma de contenu et ses valeurs par défaut,
  migrations de version, slugs (réservés, `slugify`, `suggestSlug`), manifeste
  et `demo.json` du thème, parité des clés de messages FR/EN, négociation de
  locale, tickets d'upload R2, limiteur mémoire, environnement, mailer.
- **Tests base de données** — ils utilisent **`node:sqlite`** (intégré à Node 22)
  enveloppé dans un faux binding D1 minimal (`tests/unit/helpers/d1.ts`), avec
  **les migrations réellement générées**. Choix documenté :
  `@cloudflare/vitest-pool-workers` est bloqué sur `vitest@^4.1` alors que le
  dépôt utilise Vitest 5 ; et `better-sqlite3` télécharge ses binaires
  précompilés depuis GitHub, injoignable ici. `node:sqlite` évite les deux
  problèmes, reste du vrai SQLite, et le pilote `drizzle-orm/d1` est bien celui
  qui est exercé. À rebasculer sur `vitest-pool-workers` quand il acceptera
  Vitest 5.
- **Playwright** — `playwright.config.ts` déclare trois projets (mobile 390 px,
  tablette 768 px, desktop 1440 px), pointe `executablePath` sur
  `/opt/pw-browsers/chromium` et ne lance jamais `playwright install`. Le test
  `tests/e2e/demo.spec.ts` ouvre `/demo/mariage-noir-ivoire`, vérifie le contenu
  venu de `demo.json` et enregistre les trois captures dans
  `tests/e2e/screenshots/` (dossier vidé par git, `.gitkeep` conservé).
  Le serveur de test est `next start` sur le port 3100.
- **CI** — `.github/workflows/ci.yml` : install, `cf-typegen`, lint,
  `format:check`, typecheck, tests, `build`, `build:cf`. Playwright n'y est pas
  branché (pas de navigateur dans le *runner* par défaut).

---

## 7. Décisions prises en cours de route

Détails non couverts par le cadrage, tranchés au plus simple :

1. **Next 16.3.5** plutôt que 15 : c'est la dernière version stable acceptée par
   l'adaptateur Cloudflare.
2. **`src/i18n/config.ts` comme source unique des locales**, réutilisée par le
   schéma de contenu — le cadrage définissait `Locale` deux fois.
3. **Ordre `['en', 'fr']`** (et non `['fr', 'en']`) pour coller au défaut `en`
   décidé pour l'interface.
4. **Envoi Resend par `fetch`** plutôt que par le SDK : moins de poids dans le
   Worker, et pas de dépendance Node. Le paquet `resend` reste installé pour la
   phase 6 (gabarits React Email).
5. **Ticket d'upload HMAC** au lieu d'une URL présignée S3 (voir §5.4).
6. **`src/content/derived.ts`** ajouté : initiales, `12.06.27`, `12·VI·27`, date
   longue localisée, URL d'itinéraire. Ces valeurs ne sont jamais stockées.
7. **Slug réservés** : la liste de `src/lib/slugs.ts` couvre les routes, les deux
   locales, les fichiers bien connus ; tout slug contenant un point est refusé
   pour ne pas masquer un fichier statique.
8. **`images.unoptimized: true`** : l'optimiseur `next/image` n'existe pas sur
   Workers et les photos sont déjà redimensionnées côté client.
9. **`agentRules: false`** dans `next.config.ts` : Next 16 écrit sinon des
   `AGENTS.md` / `CLAUDE.md` à la racine du dépôt.
10. **`cloudflare-env.d.ts` non versionné** : il est régénéré par
    `pnpm cf-typegen`, y compris dans la CI.
11. **`docs/`, `BRIEF.md` et `reference/` exclus de Prettier**, pour ne pas
    réécrire des documents de référence.
12. **Arborescence légèrement resserrée** par rapport au §3 du cadrage : pas de
    segment `[locale]` (décision d'i18n), les dossiers encore vides ne sont pas
    créés (`src/editor/` arrivera en phase 4, `emails/` en phase 6,
    `src/themes/<slug>/{sections,animations}/` en phase 3), et le CSS global de
    l'application vit dans `src/app/globals.css` plutôt que dans `src/styles/`,
    au plus près de la racine App Router qui l'importe.

---

## 8. Limites connues et points à surveiller

1. **Le thème est volontairement statique.** `Invitation.tsx` rend les sections
   en HTML simple avec le CSS du thème : aucune animation, aucune enveloppe qui
   s'ouvre, aucun chapitre collant. C'est la phase 3 qui le remplace — sans
   toucher à autre chose que le dossier du thème.
2. **Aucun asset graphique.** `assets/README.md` liste précisément ce qui est
   attendu (enveloppe, rabat, cachet, timbres ×2, tampon, arum, hortensia,
   amarante, papiers déchirés, scotch : format, dimensions, transparence,
   variables colorisables). En attendant, les visuels sont des aplats CSS.
3. **Aucune ressource Cloudflare n'existe encore** : tous les identifiants de
   `wrangler.jsonc` sont des placeholders. `pnpm deploy` échouera tant que le §4
   n'aura pas été fait.
4. **`pnpm preview` et `pnpm deploy` n'ont pas été validés** depuis
   l'environnement de développement : seul le registre npm y est joignable, et
   les processus de longue durée y sont interrompus, donc `wrangler dev` n'a pas
   pu être maintenu en vie. Ce qui est vérifié : `pnpm build`, `pnpm build:cf`
   (le bundle `.open-next/worker.js` est bien produit) et le fait que **workerd
   démarre ici** — `wrangler d1 migrations apply --local` a exécuté les 26
   instructions de la migration. `pnpm preview` est donc à essayer en premier
   sur votre machine.
5. **Le limiteur de repli est par isolat**, donc approximatif. C'est un filet de
   sécurité, pas la vraie défense : en production c'est le binding qui agit.
6. **La résidence UE de D1** est un *hint*, pas une garantie contractuelle hors
   offre Entreprise. R2 avec `jurisdiction: eu` l'est. À mentionner tel quel dans
   la politique de confidentialité (phase 8).
7. **La juridiction d'un bucket R2 ne se change pas après création** : ne pas se
   tromper au §4.1.
8. **`/[slug]` est en `force-dynamic`** : aucune mise en cache pour l'instant. Le
   cache KV (`CACHE`), invalidé à la publication, viendra en phase 5.
9. **Pas encore de `sitemap.xml` ni de `robots.txt`** : les invitations et les
   démos sont marquées `noindex` par leurs métadonnées, mais le fichier
   `robots.txt` reste à écrire (phase 8).
10. **La table `themes` est vide.** Une invitation publiée est jointe à
    `themes.slug` pour savoir quel module charger : il faudra y insérer la ligne
    `mariage-noir-ivoire` (seed à écrire en phase 4, avec l'activation).
11. **Better Auth ne vérifie pas encore que l'e-mail vient d'une activation.**
    `/login` crée un compte pour toute adresse. Le verrou (activation Etsy
    validée) arrive en phase 7.
12. **`node:sqlite` est marqué expérimental** par Node 22 : les tests affichent
    un avertissement. Sans conséquence, mais à re-vérifier à chaque montée de
    version de Node.
