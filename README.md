# Invitations web animées

Application Next.js (App Router) déployée sur **Cloudflare Workers** via
`@opennextjs/cloudflare`. Elle permet à un couple de personnaliser une
invitation de mariage animée, de la publier sur un lien unique et de suivre les
réponses de ses invités.

**Pour déployer : [`docs/MISE-EN-PRODUCTION.md`](docs/MISE-EN-PRODUCTION.md)** —
guide pas à pas, de la création des ressources Cloudflare à la checklist
d'ouverture de la boutique.

Documentation du projet : [`BRIEF.md`](BRIEF.md) (cahier des charges),
[`docs/README.md`](docs/README.md) (index des documents de phase, une ligne par
document), [`docs/phase-1-cadrage.md`](docs/phase-1-cadrage.md)
(spécification), [`docs/phase-2-socle.md`](docs/phase-2-socle.md) (ce qui est
réellement en place),
[`docs/phase-8-reconciliation.md`](docs/phase-8-reconciliation.md) §9 (points
encore ouverts).

## Sommaire

| §   | Section                                                                           |
| --- | --------------------------------------------------------------------------------- |
| 0   | [État du projet](#0-état-du-projet)                                               |
| 1   | [Installation](#1-installation)                                                   |
| 2   | [Scripts](#2-scripts)                                                             |
| 3   | [Variables d'environnement](#3-variables-denvironnement)                          |
| 4   | [Développement local avec les bindings](#4-développement-local-avec-les-bindings) |
| 5   | [Migrations D1](#5-migrations-d1)                                                 |
| 6   | [Déploiement Cloudflare](#6-déploiement-cloudflare)                               |
| 7   | [Prévisualisations (Workers Builds)](#7-prévisualisations-workers-builds)         |
| 8   | [Thèmes](#8-thèmes)                                                               |
| 9   | [Structure](#9-structure)                                                         |
| 10  | [Tâche planifiée (rétention RGPD)](#10-tâche-planifiée-rétention-rgpd)            |
| 11  | [Tests de bout en bout](#11-tests-de-bout-en-bout)                                |
| 12  | [Référencement (robots, sitemap)](#12-référencement-robots-sitemap)               |

---

## 0. État du projet

Le logiciel est **complet et vérifié en intégration continue** ; ce qui manque
pour vendre n'est pas du code (voir §12 du guide de mise en production : nom de
marque, logo, illustrations définitives, visuels Etsy, photos de démonstration).

| Domaine                   | État                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| Vitrine `/`               | livrée, bilingue FR/EN, marque configurable par `BRAND_ID` (3 identités)                    |
| Thèmes d'invitation       | 3 thèmes animés livrés : noir & ivoire, terracotta bloom, riviera postcard                  |
| Éditeur `/app`            | livré : contenu par chapitre, aperçu en iframe, photos vers R2                              |
| Publication et partage    | livrés : slug public, QR code, `.ics`, fenêtre d'hébergement de 18 mois                     |
| RSVP                      | livré : formulaire, anti-spam, export CSV, rétention RGPD automatique                       |
| Activation et back-office | livrés en V0 (validation manuelle des commandes Etsy) ; la V1 par API Etsy reste à faire    |
| Budget JS (BRIEF §6)      | tenu : 150 kB gzip sur `/`, 161 à 164 kB sur les démos, GSAP chargé dynamiquement           |
| Référencement             | `robots.txt` et `sitemap.xml` en place ; **image Open Graph à produire**                    |
| Déploiement               | jamais exécuté de bout en bout (aucune ressource Cloudflare créée) — c'est l'objet du guide |

Vérifications qui tournent en intégration continue (`.github/workflows/ci.yml`) :
`pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test` (566 tests
unitaires), `pnpm test:e2e` (63 tests Playwright sur 3 viewports), `pnpm build`
et `pnpm build:cf`.

---

## 1. Installation

Prérequis : **Node 22** et **pnpm 10**.

```bash
pnpm install
pnpm cf-typegen        # génère cloudflare-env.d.ts à partir de wrangler.jsonc
cp .env.example .env.local
cp .dev.vars.example .dev.vars
pnpm dev               # http://localhost:3000
```

`cloudflare-env.d.ts` n'est pas versionné : il faut le régénérer après chaque
`pnpm install` et après chaque modification de `wrangler.jsonc`.

## 2. Scripts

| Commande                            | Effet                                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------------------- |
| `pnpm dev`                          | serveur de développement Next.js (bindings locaux via `initOpenNextCloudflareForDev`) |
| `pnpm build`                        | build Next.js                                                                         |
| `pnpm build:cf`                     | build Next.js **puis** bundle Worker dans `.open-next/`                               |
| `pnpm preview`                      | build + exécution du Worker en local (workerd)                                        |
| `pnpm deploy`                       | build + déploiement sur Cloudflare                                                    |
| `pnpm typecheck`                    | `tsc --noEmit`                                                                        |
| `pnpm lint` / `pnpm lint:fix`       | ESLint                                                                                |
| `pnpm format` / `pnpm format:check` | Prettier                                                                              |
| `pnpm test`                         | tests unitaires Vitest                                                                |
| `pnpm test:e2e`                     | tests Playwright (migrations + seed, puis `next dev` sur `localhost:3110`)            |
| `pnpm cf-typegen`                   | régénère `cloudflare-env.d.ts`                                                        |
| `pnpm db:generate`                  | génère une migration SQL dans `drizzle/`                                              |
| `pnpm db:migrate:local` / `:remote` | applique les migrations à D1                                                          |
| `pnpm db:seed:local` / `:remote`    | insère les thèmes du registre dans la base locale ou distante (idempotent)            |
| `pnpm etsy:pdf`                     | régénère les PDF de livraison Etsy dans `marketing/etsy/delivery/`                    |

## 3. Variables d'environnement

Toutes les variables sont lues **au même endroit**, `src/lib/env.ts`, qui les
valide avec Zod au premier accès (`getEnv()`). Aucun autre module ne lit
`process.env`. Voir [`.env.example`](.env.example) pour la liste commentée.

| Variable              | Rôle                                                                                                                                                                                            | Où la mettre                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `APP_URL`             | URL publique, utilisée par Better Auth et les liens magiques                                                                                                                                    | `vars` de `wrangler.jsonc`         |
| `BETTER_AUTH_SECRET`  | signature des sessions et des tickets d'upload R2                                                                                                                                               | **secret** (`wrangler secret put`) |
| `MAIL_DRIVER`         | `console` (dev) ou `resend` (prod)                                                                                                                                                              | `vars`                             |
| `MAIL_FROM`           | expéditeur des e-mails                                                                                                                                                                          | `vars`                             |
| `RESEND_API_KEY`      | clé Resend                                                                                                                                                                                      | **secret**                         |
| `R2_PUBLIC_BASE_URL`  | domaine ou route servant les photos                                                                                                                                                             | `vars`                             |
| `ADMIN_EMAILS`        | e-mails autorisés sur `/admin`, séparés par des virgules                                                                                                                                        | `vars`                             |
| `RSVP_IP_SALT`        | sel de hachage des IP des invités ; à défaut, `BETTER_AUTH_SECRET`                                                                                                                              | **secret**, facultatif             |
| `CRON_SECRET`         | protège `POST /api/cron/retention` ; moins de 16 caractères = non configuré, la route refuse tout                                                                                               | **secret**                         |
| `ALLOW_FREE_DRAFTS`   | `true` autorise tout compte connecté à créer un brouillon depuis `/app` (dev). Faux par défaut : un acheteur reçoit son brouillon par l'activation, un administrateur peut toujours en créer un | `vars`, facultatif                 |
| `LEGAL_*`             | identité de l'éditeur affichée sur `/legal/*` (8 variables) ; une variable absente laisse son placeholder `[[…]]` visible                                                                       | `vars`, facultatif                 |
| `BRAND_ID`            | identité de marque active : `unfurl` (défaut), `kraft-and-bloom`, `petal-post`                                                                                                                  | `vars`, facultatif                 |
| `BRAND_ETSY_SHOP_URL` | URL de la boutique Etsy affichée sur la vitrine                                                                                                                                                 | `vars`, facultatif                 |
| `BRAND_SUPPORT_EMAIL` | adresse de contact affichée sur le site ; à défaut, `LEGAL_CONTACT_EMAIL`                                                                                                                       | `vars`, facultatif                 |

Les _bindings_ (D1 `DB`, R2 `PHOTOS`, KV `CACHE` et `NEXT_INC_CACHE_KV`, rate
limiter `RATE_LIMITER`) ne sont pas des variables d'environnement : ils sont
déclarés dans `wrangler.jsonc` et lus par `getCloudflareContext()` — sauf dans
le handler `scheduled()`, qui les reçoit directement (voir §10).

## 4. Développement local avec les bindings

`next.config.ts` appelle `initOpenNextCloudflareForDev()` : en mode
développement, `getCloudflareContext()` renvoie les bindings locaux simulés par
Miniflare à partir de `wrangler.jsonc`. Les données locales (D1, R2, KV) sont
stockées dans `.wrangler/` et ne sont jamais versionnées.

Les secrets locaux se mettent dans `.dev.vars` (lu par wrangler/workerd) et dans
`.env.local` (lu par `next dev`).

## 5. Migrations D1

Le schéma Drizzle vit dans `src/db/schema.ts`. Le SQL est généré par
drizzle-kit et appliqué par wrangler — jamais l'inverse.

```bash
pnpm db:generate --name ma_migration   # écrit drizzle/00XX_ma_migration.sql
pnpm db:migrate:local                  # applique sur la base locale
pnpm db:migrate:remote                 # applique sur la base Cloudflare
```

`wrangler.jsonc` déclare `"migrations_dir": "drizzle"`, donc les deux outils
lisent bien le même dossier.

### Seed des thèmes

La table `themes` est alimentée depuis le registre (`src/themes/registry.ts`),
jamais à la main. Un seul mécanisme, `src/db/seed.ts` :

```bash
pnpm db:seed:local     # écrit les trois thèmes dans la base locale
```

L'identifiant est déterministe (`theme-<slug>`), l'écriture est idempotente par
`slug`, et `name` / `version` sont rafraîchis quand le manifeste bouge (le
`status` n'est écrit qu'à l'insertion : un thème mis en brouillon ou archivé en
base le reste). L'application appelle les mêmes fonctions —
`ensureThemesSeeded()` sur `/admin` et `/activate`, `ensureThemeSeeded(slug)`
dans l'éditeur — donc une base fraîche n'est jamais vide.

## 6. Déploiement Cloudflare

Le mode d'emploi complet, pas à pas, est
**[`docs/MISE-EN-PRODUCTION.md`](docs/MISE-EN-PRODUCTION.md)** : ressources,
jeton API et ses permissions minimales, secrets, Resend, migrations et seed
distants, premier déploiement, domaine personnalisé, cron, checklist avant
ouverture, coûts. Résumé :

1. Créer les ressources (une seule fois) :

   ```bash
   pnpm exec wrangler d1 create invitations-db --location weur
   pnpm exec wrangler r2 bucket create invitations-photos --jurisdiction eu
   pnpm exec wrangler kv namespace create NEXT_INC_CACHE_KV
   pnpm exec wrangler kv namespace create CACHE
   ```

2. Reporter les identifiants renvoyés dans `wrangler.jsonc` (ils y sont
   actuellement des placeholders `0000…`), puis `pnpm cf-typegen`.
3. Pousser les secrets :

   ```bash
   pnpm exec wrangler secret put BETTER_AUTH_SECRET
   pnpm exec wrangler secret put RESEND_API_KEY
   pnpm exec wrangler secret put CRON_SECRET
   ```

4. Appliquer les migrations et le seed : `pnpm db:migrate:remote` puis
   `pnpm db:seed:remote`.
5. Déployer : `pnpm deploy`.

Points de vigilance techniques :
[`docs/phase-2-socle.md`](docs/phase-2-socle.md).

## 7. Prévisualisations (Workers Builds)

Dans le tableau de bord Cloudflare → _Workers & Pages_ → le Worker →
_Settings_ → _Builds_, connecter le dépôt GitHub :

- commande de build : `pnpm build:cf`
- commande de déploiement : `pnpm exec opennextjs-cloudflare deploy`
- branche de production : `main`
- _Non-production branch builds_ : activé → chaque branche obtient une URL de
  prévisualisation, que l'on peut partager pour valider une phase.

## 8. Thèmes

Trois thèmes sont enregistrés dans `src/themes/registry.ts` :
`mariage-noir-ivoire`, `mariage-terracotta-bloom`, `mariage-riviera-postcard`.
Le seed (§5) insère les trois.

### Créer un nouveau thème

Un thème est un dossier autonome dans `src/themes/`. Pour en créer un :

1. Copier `src/themes/mariage-noir-ivoire/` sous un nouveau slug.
2. Adapter `manifest.ts` : `slug`, `name`, palettes (les six variables CSS
   `--env`, `--env-2`, `--seal`, `--accent`, `--stem`, `--liner`), écritures,
   emplacements photo, sections et bornes (`limits`).
3. Adapter `schema.ts` (bloc `extras` propre au thème), `styles.css`,
   `messages/{en,fr}.json`, `demo.json` et `assets/README.md`.
4. Réécrire `Invitation.tsx` (et son dossier `sections/`).
5. Enregistrer le slug dans `src/themes/registry.ts` (`THEME_SLUGS`, `LOADERS`,
   `MESSAGE_LOADERS`).
6. Lancer `pnpm db:seed:local` : la ligne de la table `themes` est dérivée du
   manifeste, il n'y a rien à écrire à la main.

Le fuseau horaire ne se traite **pas** dans le thème : la conversion « date +
heure + fuseau IANA → instant UTC » est faite une seule fois par
`eventInstant()` (`src/content/derived.ts`), dont dépendent le compte à rebours
des thèmes (`animations/time.ts`) et le fichier `.ics`.

Le reste de l'application n'a pas à être modifié : l'éditeur ne connaît que le
manifeste, et le contenu suit le schéma commun `src/content/schema.ts`.

## 9. Structure

```
src/
  app/            routes (App Router, sans préfixe de langue)
    (app)/        vitrine, /login, /activate, /app, /admin, /legal
    [slug]/       invitation publiée
    demo/<slug>/  une route par thème (voir demo/demoPage.tsx)
    api/          Better Auth, RSVP, photos, QR, .ics, export CSV, cron
    robots.ts     /robots.txt
    sitemap.ts    /sitemap.xml
  brand/          identités de marque (presets sélectionnés par BRAND_ID)
  content/        schéma Zod commun, valeurs par défaut, migrations, dérivés
  db/             schéma Drizzle, accès D1, requêtes filtrées par owner_id, seed
  i18n/           locales, cookie, chargement des messages
  lib/            auth, mail, r2, rate-limit, slugs, env, publication, rétention
  messages/       i18n de l'application (un fichier par espace)
  themes/         contrat, manifests.ts (sans composant client), registre, thèmes
drizzle/          migrations SQL générées
docs/             documents de phase (index : docs/README.md)
marketing/        kit Etsy (fiches, messages, PDF de livraison)
scripts/          build-delivery-pdf.mjs (pnpm etsy:pdf)
tests/unit/       Vitest
tests/e2e/        Playwright (captures 390 / 768 / 1440 px)
worker/           point d'entrée Worker (fetch généré + scheduled)
```

Deux imports à ne pas confondre : `src/themes/manifests.ts` ne porte **aucun
composant client** (slugs et manifestes seulement) et c'est lui qu'importent la
vitrine, `/app`, `/activate`, `/admin` et le seed ; `src/themes/registry.ts`
peut atteindre les trois thèmes et n'est importé que par les routes qui
**rendent** une invitation. Confondre les deux fait descendre les trois
invitations animées sur une page qui n'en affiche aucune
(`docs/phase-9-theme-riviera-postcard.md` §7).

## 10. Tâche planifiée (rétention RGPD)

`@opennextjs/cloudflare` régénère `.open-next/worker.js` à chaque build et ce
module n'exporte que `fetch` : un Cron Trigger n'aurait rien à appeler. Le point
d'entrée du Worker est donc `worker/index.ts` (`"main"` dans `wrangler.jsonc`) :
il délègue `fetch` au worker généré — importé sous le nom `open-next-worker`,
un alias déclaré dans `wrangler.jsonc` pour que `pnpm typecheck` passe sur un
dépôt fraîchement cloné — et ajoute `scheduled()`.

`scheduled()` lit le binding `DB` dans l'`env` que lui passe le runtime
(`getCloudflareContext()` n'existe que dans une requête) et exécute
`purgeExpiredRsvps()` : suppression des réponses dont l'événement a plus de six
mois, et passage en `expired` des publications dont la fenêtre d'hébergement est
close. Déclencheur : `triggers.crons`, tous les jours à 03:15 UTC.

`POST /api/cron/retention` (aussi accepté en `GET`) reste disponible en secours
— pour un planificateur externe ou un lancement manuel — et exige `CRON_SECRET`
en `Authorization: Bearer …` ou `?key=…`.

## 11. Tests de bout en bout

```bash
pnpm test:e2e                      # les trois viewports
pnpm test:e2e --project=mobile-390 # un seul
```

`pretest:e2e` applique les migrations et le seed, puis Playwright démarre
**`next dev`** (et non `next start`) sur `http://localhost:3110` : seul le
serveur de développement passe par `initOpenNextCloudflareForDev()`, donc seul
lui a les bindings D1/R2/KV dont l'éditeur, le RSVP et l'activation ont besoin.
Trois contraintes à ne pas défaire : `localhost` (et non `127.0.0.1`, Better
Auth compare l'origine à `APP_URL`), `workers: 1` (la base D1 locale casse en
écriture concurrente) et `PORT` si le port 3110 est déjà pris.

`PLAYWRIGHT_BASE_URL` continue de pointer la suite vers un serveur déjà lancé.
Le navigateur est celui de l'image (`/opt/pw-browsers/chromium`) ; à défaut,
celui que Playwright gère lui-même — c'est ce que fait la CI, seul endroit où
`playwright install` est lancé.

## 12. Référencement (robots, sitemap)

`src/app/robots.ts` et `src/app/sitemap.ts` sont dérivés d'`APP_URL`
(`appOrigin()`) et du registre des thèmes : un quatrième thème est crawlé et
listé le jour où il est enregistré, sans toucher à ces fichiers.

- `/robots.txt` autorise `/`, `/demo/<slug>` et `/legal/*` ; il interdit
  `/app`, `/admin`, `/api`, `/activate` et `/login`, et publie l'adresse du
  sitemap.
- `/sitemap.xml` liste sept URL : l'accueil, les trois démos, les trois pages
  légales. Les invitations publiées n'y sont **pas** : elles appartiennent aux
  couples et expirent avec leur fenêtre d'hébergement.
- Les démos portent en plus `robots: { index: false }` dans leurs métadonnées :
  les explorer est bienvenu, indexer un faux mariage ne l'est pas.

`tests/unit/seo/robots-sitemap.test.ts` verrouille les deux listes.

**Reste à produire : l'image Open Graph** — la vitrine déclare `openGraph` et
`twitter:card` sans `images`, donc un partage sur les réseaux sociaux n'affiche
aucune vignette.
