# Invitations web animées

Application Next.js (App Router) déployée sur **Cloudflare Workers** via
`@opennextjs/cloudflare`. Elle permet à un couple de personnaliser une
invitation de mariage animée, de la publier sur un lien unique et de suivre les
réponses de ses invités.

Documentation du projet : [`BRIEF.md`](BRIEF.md),
[`docs/phase-1-cadrage.md`](docs/phase-1-cadrage.md) (spécification),
[`docs/phase-2-socle.md`](docs/phase-2-socle.md) (ce qui est réellement en
place).

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
| `pnpm test:e2e`                     | tests Playwright (migrations + seed, puis `next dev` sur `localhost:3110`)             |
| `pnpm cf-typegen`                   | régénère `cloudflare-env.d.ts`                                                        |
| `pnpm db:generate`                  | génère une migration SQL dans `drizzle/`                                              |
| `pnpm db:migrate:local` / `:remote` | applique les migrations à D1                                                          |
| `pnpm db:seed:local`                | insère les thèmes du registre dans la base locale (idempotent)                         |

## 3. Variables d'environnement

Toutes les variables sont lues **au même endroit**, `src/lib/env.ts`, qui les
valide avec Zod au premier accès (`getEnv()`). Aucun autre module ne lit
`process.env`. Voir [`.env.example`](.env.example) pour la liste commentée.

| Variable | Rôle | Où la mettre |
| -------- | ---- | ------------ |
| `APP_URL` | URL publique, utilisée par Better Auth et les liens magiques | `vars` de `wrangler.jsonc` |
| `BETTER_AUTH_SECRET` | signature des sessions et des tickets d'upload R2 | **secret** (`wrangler secret put`) |
| `MAIL_DRIVER` | `console` (dev) ou `resend` (prod) | `vars` |
| `MAIL_FROM` | expéditeur des e-mails | `vars` |
| `RESEND_API_KEY` | clé Resend | **secret** |
| `R2_PUBLIC_BASE_URL` | domaine ou route servant les photos | `vars` |
| `ADMIN_EMAILS` | e-mails autorisés sur `/admin`, séparés par des virgules | `vars` |
| `RSVP_IP_SALT` | sel de hachage des IP des invités ; à défaut, `BETTER_AUTH_SECRET` | **secret**, facultatif |
| `CRON_SECRET` | protège `POST /api/cron/retention` ; moins de 16 caractères = non configuré, la route refuse tout | **secret** |
| `ALLOW_FREE_DRAFTS` | `true` autorise tout compte connecté à créer un brouillon depuis `/app` (dev). Faux par défaut : un acheteur reçoit son brouillon par l'activation, un administrateur peut toujours en créer un | `vars`, facultatif |
| `LEGAL_*` | identité de l'éditeur affichée sur `/legal/*` (8 variables) ; une variable absente laisse son placeholder `[[…]]` visible | `vars`, facultatif |

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

1. Créer les ressources (une seule fois) :

   ```bash
   wrangler d1 create invitations-db --location-hint weur
   wrangler r2 bucket create invitations-photos --jurisdiction eu
   wrangler kv namespace create NEXT_INC_CACHE_KV
   wrangler kv namespace create CACHE
   ```

2. Reporter les identifiants renvoyés dans `wrangler.jsonc` (ils y sont
   actuellement des placeholders `0000…`).
3. Pousser les secrets :

   ```bash
   wrangler secret put BETTER_AUTH_SECRET
   wrangler secret put RESEND_API_KEY
   ```

4. Appliquer les migrations : `pnpm db:migrate:remote`.
5. Déployer : `pnpm deploy`.

Détail des permissions du jeton API et des points de vigilance :
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
    demo/[theme]/ démo publique d'un thème
    api/auth/     Better Auth
  content/        schéma Zod commun, valeurs par défaut, migrations, dérivés
  db/             schéma Drizzle, accès D1, requêtes filtrées par owner_id
  i18n/           locales, cookie, chargement des messages
  lib/            auth, mail, r2, rate-limit, slugs, env
  messages/       i18n de l'application (un fichier par espace)
  themes/         contrat, registre, thèmes
drizzle/          migrations SQL générées
tests/unit/       Vitest
tests/e2e/        Playwright (captures 390 / 768 / 1440 px)
worker/           point d'entrée Worker (fetch généré + scheduled)
```

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
