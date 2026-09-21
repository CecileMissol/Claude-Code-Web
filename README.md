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
| `pnpm test:e2e`                     | tests Playwright (démarre `next start` sur le port 3100)                              |
| `pnpm cf-typegen`                   | régénère `cloudflare-env.d.ts`                                                        |
| `pnpm db:generate`                  | génère une migration SQL dans `drizzle/`                                              |
| `pnpm db:migrate:local` / `:remote` | applique les migrations à D1                                                          |

## 3. Variables d'environnement

Voir [`.env.example`](.env.example) pour la liste commentée.

| Variable             | Rôle                                                         | Où la mettre                       |
| -------------------- | ------------------------------------------------------------ | ---------------------------------- |
| `APP_URL`            | URL publique, utilisée par Better Auth et les liens magiques | `vars` de `wrangler.jsonc`         |
| `BETTER_AUTH_SECRET` | signature des sessions et des tickets d'upload R2            | **secret** (`wrangler secret put`) |
| `MAIL_DRIVER`        | `console` (dev) ou `resend` (prod)                           | `vars`                             |
| `MAIL_FROM`          | expéditeur des e-mails                                       | `vars`                             |
| `RESEND_API_KEY`     | clé Resend                                                   | **secret**                         |
| `R2_PUBLIC_BASE_URL` | domaine ou route servant les photos                          | `vars`                             |
| `ADMIN_EMAILS`       | e-mails autorisés sur `/admin`, séparés par des virgules     | `vars`                             |

Les _bindings_ (D1 `DB`, R2 `PHOTOS`, KV `CACHE` et `NEXT_INC_CACHE_KV`, rate
limiter `RATE_LIMITER`) ne sont pas des variables d'environnement : ils sont
déclarés dans `wrangler.jsonc` et lus par `getCloudflareContext()`.

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

## 8. Créer un nouveau thème

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
6. Insérer une ligne dans la table `themes` de D1.

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
```
