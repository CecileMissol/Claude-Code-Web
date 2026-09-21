# Phases 5 et 6 — Publication, partage, RSVP et tableau de bord

Statut : **livré**. Ce document décrit ce qui est réellement dans le dépôt, les
choix faits en cours de route, et les limites connues.

Spécifications de référence : `BRIEF.md` §4, §5, §7.1, §9 ;
`docs/phase-1-cadrage.md` §4 et §5 ; état du socle : `docs/phase-2-socle.md`.

---

## 1. Ce qui est fait

| Domaine                                                                 | État |
| ----------------------------------------------------------------------- | ---- |
| Page `/app/[id]/share` : choix du lien, publication, partage            | ✅   |
| Slug : `suggestSlug`, vérification de disponibilité en direct, réservés | ✅   |
| Publication / dépublication, expiration à + `HOSTING_MONTHS` (18 mois)  | ✅   |
| QR code SVG (serveur) et PNG (canvas navigateur)                        | ✅   |
| Modèles SMS / e-mail / WhatsApp, FR et EN, boutons copier + liens        | ✅   |
| Fichier `.ics` (`/api/ics/[slug]`), fuseau du contenu, `UID` stable     | ✅   |
| API RSVP publique `/api/rsvp` (honeypot, débit, échéance, options)      | ✅   |
| Notification e-mail au couple, non bloquante (`waitUntil`)              | ✅   |
| Tableau de bord `/app/[id]/responses` : compteurs, tableau, recherche, tri | ✅ |
| Export CSV `/api/rsvps/[id]/export.csv` (BOM, `;` en fr)                | ✅   |
| Suppression d'une réponse, bascule de la notification                    | ✅   |
| Page publique : Open Graph, `noindex`, pages `expired` / `disabled`     | ✅   |
| Rétention RGPD : `purgeExpiredRsvps()`, `/api/cron/retention`, cron      | ✅   |
| i18n `share.json` et `responses.json` (en + fr)                         | ✅   |
| Tests : 48 tests unitaires ajoutés + `tests/e2e/rsvp.spec.ts`           | ✅   |

### Fichiers principaux

```
src/lib/publish.ts                          règles de publication (pures)
src/lib/ics.ts                              générateur iCalendar maison
src/lib/qr.ts                               rendu SVG du QR code
src/lib/share-messages.ts                   modèles SMS / e-mail / WhatsApp
src/lib/csv.ts                              CSV (BOM, séparateur par locale)
src/lib/retention.ts                        purge RGPD
src/lib/rsvp-client.ts                      submitRsvp() (appelé par le thème)
src/db/queries/publish.ts                   slug, publication, expiration
src/db/queries/rsvps.ts                     + compteurs, suppression, purge
src/app/(app)/app/[id]/share/               page, actions serveur, 4 composants
src/app/(app)/app/[id]/responses/           page, actions serveur
src/app/api/rsvp/route.ts                   POST public
src/app/api/ics/[slug]/route.ts             fichier calendrier
src/app/api/qr/[slug]/route.ts              QR code SVG
src/app/api/rsvps/[id]/export.csv/route.ts  export CSV (propriétaire)
src/app/api/cron/retention/route.ts         purge RGPD (secret)
src/app/[slug]/{page,Unavailable}.tsx       invitation publique
emails/RsvpNotification.tsx                 gabarit de notification
```

---

## 2. Publication

### Lien

`src/lib/slugs.ts` (phase 2) définit la forme d'un slug et la liste des mots
réservés ; `src/lib/publish.ts` ajoute `checkSlugShape()`, qui **nomme** le
problème (`empty`, `too_short`, `too_long`, `invalid_characters`, `reserved`)
pour que l'interface affiche un message utile plutôt qu'un « invalide ».

La disponibilité se vérifie **par une action serveur** (`checkSlugAction`),
appelée depuis le champ avec un anti-rebond de 350 ms — pas par une route
`/api/slug-check`. Une route publique de moins à protéger, et le contrôle de
propriété (`requireUser` + lecture filtrée par `ownerId`) est au même endroit
que pour les autres actions.

Le champ reste un `<input>` dans un `<form>` : sans JavaScript, la validation se
fait au retour du serveur.

### Publication et hébergement

- `HOSTING_MONTHS = 18` (`src/lib/publish.ts`), constante unique.
- `hostingExpiry(publishedAt)` ajoute 18 mois en UTC, avec écrêtage du jour
  (31 janvier + 1 mois = 28 ou 29 février).
- `publishedAt` n'est écrit **qu'à la première publication** (`coalesce` en SQL) :
  remettre en ligne une invitation dépubliée ne redémarre pas le compteur.
- Dépublier passe le statut à `disabled` et **conserve le slug**.
- Le lien est verrouillé tant que l'invitation est en ligne (il faut la mettre
  hors ligne pour le changer) : un lien déjà envoyé à cent personnes ne doit pas
  pouvoir être changé d'un clic.

### Statut effectif

`effectiveStatus()` relit `expiresAt` à chaque lecture : une ligne peut encore
porter `published` en base alors que la fenêtre d'hébergement est fermée (la
tâche de rétention ne passe qu'une fois par jour). La page publique, l'API RSVP,
le `.ics` et le QR code utilisent tous `isPubliclyVisible()`.

### Modifications visibles immédiatement

`/[slug]` est en `force-dynamic` et lit la base à chaque requête : une
modification faite dans l'éditeur apparaît sur le lien public sans délai, sans
invalidation à gérer.

**Cache KV : documenté, pas branché.** Le binding `CACHE` existe dans
`wrangler.jsonc` et un cache d'invitation publiée ferait gagner un aller-retour
D1 par visite. Mais l'invalidation doit se faire **à chaque sauvegarde de
l'éditeur**, c'est-à-dire dans le chemin d'écriture de la phase 4, qui
n'appartient pas à cette phase. Mettre un cache sans invalidation fiable
casserait la promesse « les modifications sont visibles immédiatement »
(BRIEF §4.1.8), qui est un argument de vente. À faire en phase 8, en trois
morceaux : (a) `cacheKey = invitation:${slug}`, (b) écriture du JSON de contenu
+ `themeSlug` à la publication, (c) `CACHE.delete(cacheKey)` dans l'action de
sauvegarde **et** dans les actions de publication/dépublication.

---

## 3. Partage

- **Lien copiable** : `CopyButton` utilise `navigator.clipboard` et retombe sur
  `<textarea>` + `execCommand` (contexte non sécurisé, vieux navigateurs mobiles).
- **QR code** : le SVG est rendu côté serveur par `qrcode` (`toString`), à
  `/api/qr/[slug]` (taille bornée 128–2048, `?download=1` pour forcer le
  téléchargement). Le **PNG** est produit dans le navigateur : le même SVG est
  dessiné dans un `<canvas>` puis exporté par `toBlob` (1024 px). Aucun encodeur
  d'image ne tourne dans le Worker — ni `sharp`, ni `node-canvas`, qui n'y
  existent pas.
- **Modèles de messages** : `src/lib/share-messages.ts`, trois canaux × deux
  langues. Les deux langues sont rendues côté serveur et passées au composant :
  basculer est instantané, et le couple peut envoyer un message en anglais à
  propos d'une invitation en français. Chaque modèle porte son lien
  (`sms:?body=`, `mailto:?subject=&body=`, `https://wa.me/?text=`).
  `sms:?body=` sans destinataire est la forme acceptée par iOS **et** Android.
- **.ics** : générateur maison dans `src/lib/ics.ts` (aucune dépendance).

### Fuseau horaire du `.ics`

Le contenu stocke une date + une heure murale + un fuseau IANA.
`zonedTimeToUtc()` convertit en instant absolu avec `Intl.DateTimeFormat`
(deux passes, ce qui suffit à se placer du bon côté d'un changement d'heure),
puis `DTSTART` est émis en UTC (`…Z`). Aucun bloc `VTIMEZONE` n'est nécessaire,
et tous les clients comprennent. `X-WR-TIMEZONE` est ajouté comme indication
d'affichage. `UID` = `invitation-<slug>@<hôte>` : stable d'une génération à
l'autre, donc un invité qui retélécharge le fichier **met à jour** l'événement
au lieu d'en créer un second. Le pliage des lignes compte les **octets**
(75 max), pas les caractères : un accent compte double.

---

## 4. RSVP

`POST /api/rsvp`, seule écriture publique de l'application. Dans l'ordre :

1. **Champ piège** (`website`) : s'il est rempli, la réponse est un `200 {ok:true}`
   identique à un succès, et **rien n'est enregistré**. Le bot ne sait pas qu'il
   a été repéré. Le test vérifie les deux moitiés (code et absence de ligne).
2. **Validation** `RsvpSubmission` (Zod) → `400 {error:'invalid'}`.
3. **Publication** : l'invitation doit exister et être visible → `404 not_found`.
4. **Fenêtre de réponse** : `rsvp.enabled` et `deadline` → `403 closed`.
   L'échéance est comparée à la date **dans le fuseau de l'événement**, pas dans
   celui de l'invité, et le jour de l'échéance est inclus.
5. **Limite de débit** : 5 réponses / 10 min / IP / invitation → `429 rate_limited`.
6. **Enregistrement** : `insertRsvp` avec `ipHash`.
7. **Notification** au couple si `rsvp.notifyByEmail`.

### Limite de débit, en deux couches

`checkRateLimit()` (phase 2) utilise le binding Workers quand il existe, sinon
une fenêtre glissante en mémoire. Le binding `RATE_LIMITER` de `wrangler.jsonc`
est configuré `20 / 60 s` **au niveau du Worker** : ses bornes ne se règlent pas
par appel, et modifier ce bloc sortait du périmètre de cette phase. La règle
« 5 / 10 min / IP / invitation » est donc appliquée **en base**, par
`countRecentRsvpsByIp()` : exacte, propre à l'invitation, et insensible à un
changement d'isolat. Le binding reste la première ligne, bon marché.

Si le volume de spam l'exigeait, ajouter un second limiteur
(`"simple": { "limit": 5, "period": 600 }`) dans `ratelimits` rendrait le compte
en base superflu.

### Hachage de l'IP

`hashIp(ip, sel)` (SHA-256, 16 octets conservés). Le sel est `RSVP_IP_SALT` s'il
est défini, sinon `BETTER_AUTH_SECRET`. **L'adresse brute n'est jamais stockée.**
`RSVP_IP_SALT` n'a pas été ajouté à `src/lib/env.ts` (fichier partagé avec les
autres chantiers en cours) : il est lu directement dans `process.env`, avec un
repli sûr.

### Options du couple

`askEmail` / `askDiet` / `askMessage` : un champ non demandé est **écarté**, pas
enregistré. `maxGuestsPerReply` : le nombre est **écrêté** plutôt que refusé —
abaisser le maximum après quelques réponses ne doit pas se mettre à rejeter des
invités honnêtes. Un refus compte toujours pour une personne.

### Notification

`emails/RsvpNotification.tsx`. Le gabarit est un composant React à styles en
ligne — c'est exactement ce que produit `@react-email/components` — mais le
rendu HTML est écrit à la main par `renderRsvpNotification()`, car
`@react-email/render` n'est pas installé (le brief limite les nouveaux paquets à
`qrcode`) et parce que **importer `react-dom/server` depuis un composant serveur
fait échouer la compilation Next**. Basculer sur le vrai moteur le jour où le
paquet sera installé est une modification d'un seul fichier.

L'envoi est non bloquant : `ctx.waitUntil()` de `getCloudflareContext()` quand il
est disponible, `await` sinon (dev, tests). `notifiedAt` est horodaté après
l'envoi, pour qu'un nouvel essai ne double pas l'e-mail.

---

## 5. Tableau de bord des réponses

- **Compteurs** : présents, absents, personnes attendues, réponses. Calculés par
  SQL (`rsvpStatsForOwner`).
  **Pas de compteur « en attente de réponse »** : le produit n'a pas de liste
  d'invités (les invitations nominatives sont hors MVP, BRIEF §5), le nombre de
  personnes qui n'ont pas répondu est donc inconnaissable. Afficher les trois
  compteurs réels vaut mieux qu'un quatrième inventé.
- **Recherche et tri** dans la **chaîne de requête**, pas dans l'état d'un
  composant : la page reste un composant serveur, le résultat est partageable, et
  tout fonctionne sans JavaScript. Le filtrage se fait en mémoire — quelques
  centaines de lignes au maximum pour un mariage.
- **Export CSV** : `/api/rsvps/[id]/export.csv`, propriétaire vérifié.
  **BOM UTF-8** (sans quoi Excel sous Windows massacre les accents) et
  **séparateur `;` en français** (Excel lit le séparateur de liste dans la locale
  système). Une valeur commençant par `=`, `+`, `-` ou `@` est préfixée d'une
  apostrophe : un invité pourrait sinon écrire une formule dans le champ message
  et la voir évaluée à l'ouverture du fichier.
- **Suppression** d'une réponse : action serveur, propriété revérifiée, avec
  confirmation côté client.
- **Notification** : la bascule écrit `content.rsvp.notifyByEmail` via
  `updateInvitationContentForOwner` — la requête de mise à jour existante, pas
  une colonne de plus.

---

## 6. RGPD et rétention

`purgeExpiredRsvps()` (`src/lib/retention.ts`) fait deux choses, de façon
idempotente :

1. supprime les RSVP dont l'événement date de plus de `RSVP_RETENTION_MONTHS`
   (6 mois) — la date de l'événement vit dans le JSON, donc la sélection passe
   par `json_extract(content, '$.event.date')`, les dates ISO se comparant
   correctement comme chaînes ;
2. bascule en `expired` les publications dont la fenêtre d'hébergement est close.

### Pourquoi une route HTTP et pas un handler `scheduled`

`@opennextjs/cloudflare` **régénère `.open-next/worker.js` à chaque build**, et
ce module n'exporte que `fetch` (vérifié dans
`node_modules/@opennextjs/cloudflare/dist/cli/templates/worker.js` : aucune
mention de `scheduled`, aucune option de configuration pour en ajouter un).
Ajouter un handler `scheduled` demanderait de remplacer le point d'entrée du
Worker, donc de changer `"main"` dans `wrangler.jsonc` et de maintenir un
fichier que l'adaptateur écrase.

La tâche est donc exposée à **`POST /api/cron/retention`** (`GET` accepté aussi),
protégée par `CRON_SECRET` en `Authorization: Bearer …` ou `?key=…`.
**Sans `CRON_SECRET` défini (32 caractères aléatoires recommandés), la route
refuse tout appel** : une tâche qui supprime des lignes ne doit jamais être
ouverte par défaut.

`triggers.crons` est déclaré dans `wrangler.jsonc` (`15 3 * * *`, quotidien) : le
jour où l'adaptateur acceptera un handler `scheduled`, il n'y aura rien à ajouter
côté configuration. En attendant, **le déclencheur n'a rien à appeler** ; il faut
soit un planificateur externe qui frappe la route, soit envelopper le point
d'entrée :

```ts
// worker-entry.ts — à écrire le jour où l'on accepte de posséder ce fichier
import worker from './.open-next/worker.js';
export * from './.open-next/worker.js';
export default {
  ...worker,
  async scheduled(event, env, ctx) {
    ctx.waitUntil(purgeExpiredRsvps());
  },
};
```
puis `"main": "worker-entry.ts"`. À trancher en phase 8, avec le reste du RGPD.

---

## 7. Page publique

- **`robots`** : `index: false, follow: false, nocache: true`. Le lien est privé
  entre le couple et ses invités, et il porte leurs noms, leur adresse et leur date.
- **Open Graph** : titre « Prénoms — date longue », description
  « date · ville », `url`, `locale` (`fr_FR` / `en_GB`), carte Twitter. Métadonnées
  construites à partir du contenu, dans la langue de l'invitation.
- **Image OG : non générée.** `next/og` (`ImageResponse`) repose sur satori et un
  module WebAssembly de rendu, dont le comportement sur Workers via OpenNext n'est
  pas acquis, et un visuel statique par thème demande un asset qui n'existe pas
  encore (`assets/README.md` du thème, toujours en attente). Reporté en phase 8,
  avec les illustrations. Les métadonnées textuelles, elles, sont complètes : sur
  WhatsApp et iMessage, l'aperçu affiche déjà les prénoms et la date.
- **`expired` / `disabled`** : `src/app/[slug]/Unavailable.tsx`, page sobre
  « Cette invitation n'est plus disponible », traduite **avec la locale du
  contenu** (dictionnaire local au fichier : cette page vit hors de la coquille
  applicative et ne doit jamais lire le cookie de langue du visiteur).
  Un brouillon, lui, reste un vrai 404 : il n'a aucune existence publique.

---

## 8. i18n

`src/messages/{en,fr}/share.json` et `responses.json` sont remplis. Un test
vérifie la parité des clés entre les deux langues.

Les **modèles de partage** ne sont pas dans `src/messages/` : ce sont des textes
produit, pas des textes d'interface, et le couple choisit leur langue
indépendamment de celle de son interface. Même raisonnement pour la page
« invitation indisponible » et pour le gabarit d'e-mail, qui suivent la langue du
contenu.

---

## 9. Tests

```bash
pnpm test        # 218 tests, dont 48 ajoutés par cette phase
pnpm lint
pnpm typecheck
```

| Fichier                              | Couvre |
| ------------------------------------ | ------ |
| `tests/unit/publish/publish.test.ts` | ajout de mois et écrêtage, expiration à 18 mois, formes de slug et problèmes nommés, statut effectif, échéance selon le fuseau, requêtes de publication (propriété, date de première publication, expiration en lot) |
| `tests/unit/rsvp/rsvp-api.test.ts`   | la route `POST /api/rsvp` de bout en bout, sur du vrai SQLite : réponse valide, piège, schéma, invitation absente, formulaire fermé, échéance, 6ᵉ réponse bloquée, champs non demandés écartés, écrêtage du nombre, notification |
| `tests/unit/rsvp/retention.test.ts`  | compteurs, suppression par le propriétaire uniquement, comptage par IP, purge RGPD, idempotence, comparaison du secret |
| `tests/unit/ics/ics.test.ts`         | décalages horaires, heure d'été, format RFC 5545, pliage en octets, UID stable, locale |
| `tests/unit/share/share.test.ts`     | modèles de messages (contenu, langue de la date, liens encodés), QR code, CSV (BOM, séparateur, échappement, formules), parité des messages |

`tests/e2e/rsvp.spec.ts` couvre le parcours complet : invitation publiée servie,
piège, réponse acceptée, slug inconnu refusé, réponse visible sur
`/app/[id]/responses` après connexion, `.ics` et QR code servis, page de partage
réservée au propriétaire.

**Il ne tourne qu'avec `pnpm dev`** : le binding D1 n'existe que sous
`initOpenNextCloudflareForDev()`, et le serveur Playwright par défaut est
`next start` (build de production), qui n'a pas de binding. Le test le détecte et
se met en `skip` plutôt que d'échouer pour la mauvaise raison.

```bash
PORT=3103 pnpm dev                                    # terminal 1
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3103 pnpm test:e2e tests/e2e/rsvp.spec.ts --workers=1
```

`--workers=1` est nécessaire : les données de test sont écrites par
`wrangler d1 execute --local`, un second processus sur le même fichier SQLite,
et le D1 local de Miniflare renvoie des erreurs internes quand plusieurs workers
y écrivent en même temps. C'est une limite de l'émulateur local, pas de
l'application.

Le parcours passe **entièrement par des formulaires et des actions serveur**,
donc il vérifie aussi que la page de partage fonctionne **sans JavaScript** — ce
qui est exactement son comportement dans un bac à sable où la socket HMR de
Turbopack ne peut pas s'ouvrir et où le client React ne démarre jamais.

Les données de test sont écrites dans la base D1 locale avec
`wrangler d1 execute --local`, préfixées par le projet et l'indice du worker
Playwright, puis supprimées. La session est fabriquée directement : Better Auth
stocke le jeton brut dans `session.token` et signe le cookie
`better-auth.session_token` en `token.base64(HMAC-SHA256(secret, token))`.

Le thème statique de la phase 2 n'a pas de formulaire RSVP fonctionnel (son
`<form>` ne poste nulle part), donc la réponse est envoyée avec
`request.post()` de Playwright — exactement ce que fera le thème animé à travers
`submitRsvp`.

---

## 10. Variables d'environnement ajoutées

| Variable         | Rôle                                                       | Obligatoire |
| ---------------- | ---------------------------------------------------------- | ----------- |
| `RSVP_IP_SALT`   | sel de hachage des IP des invités                          | non (repli sur `BETTER_AUTH_SECRET`) |
| `CRON_SECRET`    | protège `/api/cron/retention` (32 caractères aléatoires)   | oui en production, sinon la route refuse tout |

Les deux sont des **secrets** (`wrangler secret put …`), à mettre dans
`.dev.vars` et `.env.local` en local. Elles ne sont volontairement pas ajoutées à
`src/lib/env.ts` ni à `.env.example`, fichiers partagés avec les autres chantiers
en cours : à intégrer en phase 8, en une ligne chacune.

---

## 11. Limites connues et points à surveiller

1. **Le cache KV n'est pas branché** (§2). C'est un choix, pas un oubli : sans
   invalidation à la sauvegarde, il casserait la visibilité immédiate des
   modifications.
2. **Le déclencheur cron n'a rien à appeler** tant que le point d'entrée du
   Worker n'est pas enveloppé (§6). En production, planifier un appel à
   `/api/cron/retention` en attendant, ou la rétention ne s'exécutera jamais.
3. **Pas d'image Open Graph** (§7).
4. **`@types/qrcode` tire le point d'entrée Node de `qrcode`**, qui embarque le
   rendu PNG (`pngjs`) dont nous ne nous servons pas. Si la taille du bundle
   Worker devenait un problème, importer `qrcode/lib/browser.js` (rendu SVG seul)
   et déclarer son type localement.
5. **Le test e2e ne tourne pas dans la CI** : `next start` n'a pas de binding D1,
   et Playwright n'est de toute façon pas branché dans le workflow (phase 2 §6).
6. **La limite de débit en mémoire est par isolat** (limite connue de la phase 2) ;
   c'est le comptage en base qui fait le vrai travail (§4).
7. **Le lien est verrouillé quand l'invitation est en ligne.** C'est délibéré.
   Si le couple doit absolument le changer, il met hors ligne, change, republie —
   et sa date de publication d'origine est conservée.
8. **La suppression d'une réponse est définitive** : pas de corbeille. Une
   confirmation côté client la protège, mais elle disparaît sans JavaScript.
9. **`sms:` et `wa.me`** ne peuvent pas être testés en automatique : le
   comportement réel dépend du téléphone. Les tests vérifient l'encodage, pas
   l'ouverture de l'application.
