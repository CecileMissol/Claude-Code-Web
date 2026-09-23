# Mise en production — guide pas à pas

Ce document est le **mode d'emploi complet** du premier déploiement, écrit pour
être suivi ligne à ligne. Il suppose seulement : un compte Cloudflare, un
terminal avec **Node 22** et **pnpm 10**, et le dépôt cloné.

Tout ce qui est entre chevrons (`<…>`) est à remplacer. Les commandes se lancent
depuis la racine du dépôt. Aucune étape n'exige le tableau de bord Cloudflare,
sauf celles qui le disent explicitement (Workers Builds, domaine personnalisé).

Ordre recommandé : 1 → 12, sans sauter d'étape. Compter **une demi-journée** la
première fois, dont l'essentiel en attente de propagation DNS (étape 4) et de
validation du domaine.

| Étape | Ce qu'on fait                                | Durée   |
| ----- | -------------------------------------------- | ------- |
| 1     | Créer les ressources Cloudflare              | 15 min  |
| 2     | Jeton API et variables du terminal           | 10 min  |
| 3     | Pousser les secrets                          | 10 min  |
| 4     | Resend : domaine d'envoi et DNS              | 30 min + attente |
| 5     | Migrations et seed à distance                | 5 min   |
| 6     | Premier déploiement et vérifications         | 20 min  |
| 7     | Prévisualisations par branche (Workers Builds) | 10 min |
| 8     | Domaine personnalisé et `APP_URL`            | 20 min  |
| 9     | Tâche planifiée (cron RGPD)                  | 10 min  |
| 10    | Checklist avant ouverture de la boutique     | 1 h     |
| 11    | Coûts mensuels estimés                       | lecture |
| 12    | Ce qui reste à produire hors code            | lecture |

---

## 0. Avant de commencer

```bash
pnpm install
pnpm cf-typegen          # génère cloudflare-env.d.ts (non versionné)
pnpm lint && pnpm typecheck && pnpm test
```

`wrangler` est déjà une dépendance du projet : il s'appelle toujours par
`pnpm exec wrangler …`, jamais par un wrangler installé globalement (la version
compte).

Connexion : en local, `pnpm exec wrangler login` ouvre un navigateur. Sur une
machine sans navigateur (serveur, CI, agent), utiliser le jeton API de
l'étape 2 — c'est le cas d'usage prévu ici.

---

## 1. Créer les ressources Cloudflare

Cinq ressources, une seule fois. Les commandes affichent des identifiants :
**les garder sous les yeux**, l'étape suivante consiste à les recopier dans
`wrangler.jsonc`.

```bash
# 1. Base de données D1 (hébergée en Europe de l'Ouest)
pnpm exec wrangler d1 create invitations-db --location weur

# 2. Bucket R2 pour les photos (juridiction Union européenne)
pnpm exec wrangler r2 bucket create invitations-photos --jurisdiction eu

# 3. Cache incrémental de Next.js
pnpm exec wrangler kv namespace create NEXT_INC_CACHE_KV

# 4. Cache applicatif (invitations publiées)
pnpm exec wrangler kv namespace create CACHE
```

> `--location weur` est une **indication** de placement (Cloudflare choisit la
> région primaire la plus proche) ; `--jurisdiction eu` sur R2 est une
> **garantie** contractuelle : les objets ne quittent pas l'UE. Si votre
> version de wrangler refuse `--location`, utiliser `--location-hint weur`.

La cinquième ressource, le **rate limiter**, ne se crée pas : elle est native
au Worker. `wrangler.jsonc` la déclare déjà (`RATE_LIMITER`, 20 requêtes par
60 s) ; `namespace_id` est un simple entier libre, unique à l'intérieur de ce
Worker, il n'y a rien à obtenir dans le tableau de bord.

### 1.1 Reporter les identifiants dans `wrangler.jsonc`

Ouvrir `wrangler.jsonc` et remplacer les placeholders (`0000…`, `1111…`) :

| Ce que la commande affiche                         | Où le coller dans `wrangler.jsonc`                  |
| -------------------------------------------------- | --------------------------------------------------- |
| `database_id` de `d1 create`                       | `d1_databases[0].database_id`                        |
| (le nom du bucket ne change pas)                   | `r2_buckets[0].bucket_name` : `invitations-photos`   |
| `id` du namespace `NEXT_INC_CACHE_KV`              | `kv_namespaces[0].id`                                |
| `id` du namespace `CACHE`                          | `kv_namespaces[1].id`                                |

Vérification immédiate, sans rien déployer :

```bash
pnpm cf-typegen                       # doit lister DB, PHOTOS, CACHE, NEXT_INC_CACHE_KV, RATE_LIMITER, ASSETS
pnpm exec wrangler d1 list            # la base apparaît avec son identifiant
pnpm exec wrangler kv namespace list  # les deux namespaces apparaissent
```

Si `pnpm cf-typegen` échoue, c'est presque toujours une virgule oubliée dans
`wrangler.jsonc` : le fichier est du JSONC (commentaires autorisés, virgule
finale tolérée), mais pas du JSON approximatif.

---

## 2. Jeton API et variables du terminal

Tableau de bord Cloudflare → avatar en haut à droite → **My Profile** →
**API Tokens** → **Create Token** → **Create Custom Token**.

Permissions **minimales** (ne rien ajouter d'autre) :

| Ressource | Permission             | Niveau | Pourquoi                                             |
| --------- | ---------------------- | ------ | ---------------------------------------------------- |
| Account   | **Workers Scripts**    | Edit   | déployer le Worker                                   |
| Account   | **Workers KV Storage** | Edit   | créer et écrire les deux namespaces KV               |
| Account   | **Workers R2 Storage** | Edit   | créer le bucket et y écrire les photos               |
| Account   | **D1**                 | Edit   | créer la base, appliquer les migrations              |
| Account   | **Account Settings**   | Read   | `wrangler whoami`, résolution de l'`account_id`      |
| Zone      | **Workers Routes**     | Edit   | **uniquement** si un domaine personnalisé est branché (étape 8) |

- *Account Resources* : **Include → ce compte uniquement**.
- *Zone Resources* : *All zones from an account* seulement si l'étape 8 est
  prévue ; sinon, laisser vide.
- *Client IP Address Filtering* : à renseigner si l'IP de déploiement est fixe.
- *TTL* : mettre une date de fin (par exemple 12 mois) et noter le
  renouvellement dans un agenda.

Aucune permission DNS, Cache, Firewall ou Analytics n'est nécessaire.

Ensuite, dans le terminal qui déploiera (les deux variables sont lues
automatiquement par wrangler) :

```bash
export CLOUDFLARE_API_TOKEN="<le jeton affiché une seule fois>"
export CLOUDFLARE_ACCOUNT_ID="<Account ID, visible dans le tableau de bord>"

pnpm exec wrangler whoami   # doit afficher le compte et la liste des permissions
```

Pour que ces variables survivent à la fermeture du terminal, les mettre dans le
gestionnaire de secrets de la machine ou dans un `~/.config/…` non versionné —
**jamais dans le dépôt**. Pour un déploiement depuis GitHub Actions, les
déclarer en *repository secrets* du même nom.

---

## 3. Pousser les secrets

Les secrets ne vivent **ni** dans `wrangler.jsonc` **ni** dans le dépôt. Ils
sont poussés un par un ; la commande demande la valeur en interactif (elle ne
s'affiche pas) :

```bash
pnpm exec wrangler secret put BETTER_AUTH_SECRET
pnpm exec wrangler secret put CRON_SECRET
pnpm exec wrangler secret put RSVP_IP_SALT       # facultatif (voir tableau)
pnpm exec wrangler secret put RESEND_API_KEY     # après l'étape 4
```

| Secret               | Obligatoire | Comment générer la valeur                             | Ce qui casse sans lui                                          |
| -------------------- | ----------- | ----------------------------------------------------- | -------------------------------------------------------------- |
| `BETTER_AUTH_SECRET` | **oui**     | `openssl rand -base64 32`                             | l'application refuse de démarrer (validation Zod)              |
| `RESEND_API_KEY`     | oui en prod | fournie par Resend (étape 4)                          | `MAIL_DRIVER=resend` lève une erreur au premier envoi          |
| `CRON_SECRET`        | recommandé  | `openssl rand -base64 32` (≥ 16 caractères)           | `POST /api/cron/retention` refuse tout appel (la tâche planifiée, elle, continue de tourner) |
| `RSVP_IP_SALT`       | facultatif  | `openssl rand -base64 32`                             | rien : `BETTER_AUTH_SECRET` sert de repli                      |

> Changer `BETTER_AUTH_SECRET` **déconnecte tout le monde** et invalide les
> tickets d'upload de photos en cours. À faire seulement en cas de fuite.

Les variables **non secrètes** vont dans la section `vars` de `wrangler.jsonc`
et sont déployées avec le Worker. Liste complète (source unique :
`src/lib/env.ts`, documentée dans `.env.example`) :

| Variable                       | Valeur de production                                        | Obligatoire |
| ------------------------------ | ----------------------------------------------------------- | ----------- |
| `APP_URL`                      | `https://unfurlme.love` (sans barre oblique finale)          | **oui**     |
| `MAIL_DRIVER`                  | `resend`                                                     | **oui**     |
| `MAIL_FROM`                    | `Unfurl <hello@unfurlme.love>`                                | **oui**     |
| `R2_PUBLIC_BASE_URL`           | `https://unfurlme.love/api/photos`                            | **oui**     |
| `ADMIN_EMAILS`                 | vos adresses, séparées par des virgules                      | **oui**     |
| `ALLOW_FREE_DRAFTS`            | **absente** ou `false` en production                         | non         |
| `BRAND_ID`                     | `unfurl` (défaut) \| `kraft-and-bloom` \| `petal-post`        | non         |
| `BRAND_ETSY_SHOP_URL`          | URL de la boutique Etsy                                      | non         |
| `BRAND_SUPPORT_EMAIL`          | adresse de contact affichée sur le site                      | non         |
| `LEGAL_COMPANY_NAME`           | raison sociale                                               | avant ouverture |
| `LEGAL_COMPANY_FORM`           | forme juridique (ex. « EI », « SASU »)                       | avant ouverture |
| `LEGAL_COMPANY_ADDRESS`        | adresse postale complète                                     | avant ouverture |
| `LEGAL_SIREN`                  | numéro SIREN                                                 | avant ouverture |
| `LEGAL_VAT_NUMBER`             | numéro de TVA intracommunautaire (ou « non applicable »)     | avant ouverture |
| `LEGAL_PUBLICATION_DIRECTOR`   | directeur ou directrice de la publication                    | avant ouverture |
| `LEGAL_CONTACT_EMAIL`          | e-mail de contact                                            | avant ouverture |
| `LEGAL_DPO_EMAIL`              | e-mail du délégué à la protection des données                | avant ouverture |

Toute variable `LEGAL_*` absente laisse son placeholder `[[…]]` **visible** sur
les pages `/legal/*` : c'est voulu, on voit immédiatement ce qui manque.

Après édition de `wrangler.jsonc`, les `vars` ne sont poussées qu'au prochain
déploiement (étape 6) ; les secrets, eux, sont actifs immédiatement.

---

## 4. Resend : domaine d'envoi, DNS, région UE

L'application n'envoie que des e-mails transactionnels : confirmation
d'activation, notification aux administrateurs, refus, lien magique de
connexion, « votre invitation est prête ».

1. Créer un compte sur [resend.com](https://resend.com).
2. **Domains → Add Domain** : saisir `unfurlme.love` (ou un sous-domaine dédié,
   `mail.unfurlme.love` — recommandé : une éventuelle réputation dégradée
   n'affecte pas le domaine principal).
3. **Region : `eu-west-1` (Ireland)** — à choisir *à la création du domaine*, ce
   n'est pas modifiable ensuite. C'est ce qui garde les e-mails et leurs
   métadonnées dans l'UE, cohérent avec D1 `weur` et R2 `jurisdiction eu`, et
   avec ce que promet la politique de confidentialité `/legal/privacy`.
4. Resend affiche 3 à 4 enregistrements DNS à créer chez le registrar (ou chez
   Cloudflare si le domaine y est déjà) : un `MX` et un `TXT` (SPF) sur
   `send.unfurlme.love`, un `TXT` (DKIM) sur
   `resend._domainkey.unfurlme.love`, et un `TXT` DMARC recommandé sur
   `_dmarc.unfurlme.love` (`v=DMARC1; p=none; rua=mailto:<votre e-mail>`).
   Chez Cloudflare DNS, mettre ces enregistrements en **DNS only** (nuage gris).
5. Attendre la vérification (quelques minutes à quelques heures), le statut
   passe à **Verified**.
6. **API Keys → Create API Key**, permission **Sending access**, domaine
   restreint à celui qui vient d'être vérifié. Copier la clé (affichée une
   seule fois) et la pousser :

   ```bash
   pnpm exec wrangler secret put RESEND_API_KEY
   ```

7. Dans `wrangler.jsonc` : `"MAIL_DRIVER": "resend"` et
   `"MAIL_FROM": "Unfurl <hello@unfurlme.love>"`. L'adresse **doit** être sur
   le domaine vérifié, sinon Resend refuse l'envoi (erreur 403).

> Tant que `MAIL_DRIVER` vaut `console`, rien n'est envoyé : les messages sont
> écrits dans les logs du Worker. C'est pratique pour une préproduction, mais un
> acheteur ne recevrait jamais son lien magique.

Test d'envoi réel une fois l'étape 6 faite : voir la checklist (étape 10).

---

## 5. Migrations et seed à distance

Le schéma est dans `src/db/schema.ts`, le SQL généré dans `drizzle/`. On
n'applique jamais du SQL à la main.

```bash
pnpm db:migrate:remote        # applique les migrations à la base Cloudflare
pnpm db:seed:remote           # insère les trois thèmes (idempotent)
```

`db:migrate:remote` liste les migrations à appliquer et demande confirmation.
`db:seed:remote` écrit les lignes de la table `themes` à partir des manifestes
(`src/themes/*/manifest.ts`) : identifiants déterministes `theme-<slug>`,
écriture idempotente par `slug`. On peut le relancer après chaque déploiement
qui fait évoluer un manifeste, sans risque.

> Le seed distant n'est pas strictement obligatoire : l'application appelle
> `ensureThemesSeeded()` au premier affichage de `/activate` et de `/admin`. Il
> évite simplement que la toute première visite écrive en base.

Vérification :

```bash
pnpm exec wrangler d1 execute invitations-db --remote \
  --command "select slug, name, version, status from themes order by slug;"
```

Trois lignes attendues : `mariage-noir-ivoire`, `mariage-riviera-postcard`,
`mariage-terracotta-bloom`.

---

## 6. Premier déploiement et vérifications

```bash
pnpm build:cf                          # build Next.js + bundle Worker dans .open-next/
pnpm exec wrangler deploy --dry-run    # répétition générale : rien n'est envoyé
pnpm deploy                            # déploiement réel
```

Le `--dry-run` affiche la taille du bundle (`Total Upload … / gzip: …`) et la
liste des bindings résolus : c'est le moment de vérifier qu'aucun identifiant
n'est resté à `0000…`.

`wrangler.jsonc` déclare un environnement `preview` en plus de l'environnement
principal, donc wrangler prévient qu'aucun environnement n'a été précisé. Pour
lever l'avertissement et viser explicitement la production :
`pnpm exec wrangler deploy --env=""`.

La sortie de `pnpm deploy` donne l'URL `https://invitations-web.<compte>.workers.dev`.
Tant que le domaine personnalisé (étape 8) n'est pas branché, c'est l'URL de
production : mettre **cette** valeur dans `APP_URL` et `R2_PUBLIC_BASE_URL`,
puis redéployer, sinon les liens magiques pointeront vers `localhost`.

Vérifications, dans cet ordre :

| # | À ouvrir                                | Attendu                                                                 |
| - | --------------------------------------- | ----------------------------------------------------------------------- |
| 1 | `/`                                      | la vitrine, les trois thèmes, le sélecteur de langue FR/EN              |
| 2 | `/demo/mariage-noir-ivoire`              | l'enveloppe s'ouvre au clic, le défilement se verrouille, les chapitres s'animent |
| 3 | `/demo/mariage-terracotta-bloom`         | idem, palette terracotta                                                |
| 4 | `/demo/mariage-riviera-postcard`         | idem, carte postale en **couleur** (si elle est en noir et blanc, une feuille de style fuit : voir `tests/unit/themes/css-isolation.test.ts`) |
| 5 | `/robots.txt` et `/sitemap.xml`          | l'origine affichée est `APP_URL`, `/app` et `/admin` sont en `Disallow` |
| 6 | `/legal/notice`, `/legal/privacy`, `/legal/terms` | plus aucun `[[PLACEHOLDER]]` visible                           |
| 7 | `/login` avec une adresse de `ADMIN_EMAILS` | un e-mail de lien magique arrive (vérifier aussi les indésirables)   |
| 8 | `/admin`                                 | les trois onglets Activations / Invitations / Journal s'affichent       |
| 9 | `/activate`                              | le formulaire s'affiche et liste les trois thèmes                       |

En cas d'erreur 500, les journaux en direct :

```bash
pnpm exec wrangler tail
```

Les deux causes habituelles : une variable manquante (le message Zod nomme
précisément la variable) et un `database_id` resté à `0000…`.

---

## 7. Prévisualisations par branche (Workers Builds)

Pour qu'une branche poussée sur GitHub obtienne automatiquement son URL de
prévisualisation :

Tableau de bord → **Workers & Pages** → le Worker `invitations-web` →
**Settings** → **Builds** → *Connect to Git* :

- dépôt : celui du projet ;
- branche de production : `main` ;
- **Build command** : `pnpm build:cf` ;
- **Deploy command** : `pnpm exec opennextjs-cloudflare deploy` ;
- **Root directory** : `/` ;
- activer **Non-production branch builds**.

Chaque branche obtient alors une URL de prévisualisation à partager. La CI
GitHub (`.github/workflows/ci.yml`) continue de tourner en parallèle : lint,
types, tests unitaires, tests de bout en bout, build. Workers Builds ne la
remplace pas.

> L'environnement `preview` déclaré dans `wrangler.jsonc` (Worker
> `invitations-web-preview`) est une **seconde** possibilité, manuelle :
> `pnpm exec wrangler deploy --env preview`. Il partage pour l'instant les
> mêmes bindings : avant de s'en servir pour de vrai, lui créer sa propre base
> D1 et son propre bucket, sinon une préproduction écrirait dans les données
> réelles.

---

## 8. Domaine personnalisé et `APP_URL`

1. Ajouter le domaine à Cloudflare (**Websites → Add a site**) et suivre la
   procédure de changement de serveurs de noms chez le registrar. Attendre que
   la zone soit *Active*.
2. Worker `invitations-web` → **Settings** → **Domains & Routes** → *Add* →
   **Custom domain** → `unfurlme.love` (et `www.unfurlme.love`, avec une
   redirection `www` → apex). Cloudflare crée l'enregistrement DNS et le
   certificat.
3. Mettre à jour `wrangler.jsonc` :

   ```jsonc
   "vars": {
     "APP_URL": "https://unfurlme.love",
     "R2_PUBLIC_BASE_URL": "https://unfurlme.love/api/photos",
     // …
   }
   ```

4. Redéployer : `pnpm deploy`.
5. Vérifier `/robots.txt` et `/sitemap.xml` : les URL doivent porter le nouveau
   domaine (elles sont dérivées d'`APP_URL`).

`APP_URL` n'est pas cosmétique : Better Auth compare l'origine de la requête à
cette valeur. Une URL fausse, et la connexion par lien magique échoue
silencieusement. Même remarque pour `R2_PUBLIC_BASE_URL`, qui préfixe les URL
des photos servies par `/api/photos`.

Si le domaine a été ajouté après la création du jeton, ajouter la permission
Zone · Workers Routes · Edit (étape 2) ou recréer le jeton.

---

## 9. Tâche planifiée (rétention RGPD)

`wrangler.jsonc` déclare déjà `"triggers": { "crons": ["15 3 * * *"] }` : tous
les jours à 03 h 15 UTC, `scheduled()` (`worker/index.ts`) supprime les réponses
RSVP des événements vieux de plus de six mois et fait passer en `expired` les
invitations dont la fenêtre d'hébergement est close.

Vérifier que le déclencheur est bien actif après le premier déploiement :

- tableau de bord → le Worker → **Settings** → **Trigger Events** : la ligne
  `15 3 * * *` doit apparaître ;
- ou dans la sortie de `pnpm deploy`, qui liste les *schedules* publiés.

Test **en local**, sans attendre 03 h 15 :

```bash
pnpm build:cf
pnpm exec wrangler dev --test-scheduled --local
# dans un autre terminal :
curl "http://localhost:8787/__scheduled?cron=15+3+*+*+*"
```

Le terminal de `wrangler dev` affiche l'exécution de la tâche. Sans
`--test-scheduled`, cette route n'existe pas.

Déclenchement manuel en production, en secours (planificateur externe, reprise
après incident) :

```bash
curl -X POST https://unfurlme.love/api/cron/retention \
  -H "Authorization: Bearer $CRON_SECRET"
```

Sans `CRON_SECRET` poussé (étape 3), cette route refuse **tout** appel — la
tâche planifiée, elle, n'en a pas besoin.

---

## 10. Checklist avant d'ouvrir la boutique

**Configuration**

- [ ] `wrangler.jsonc` : plus aucun identifiant `0000…` / `1111…`.
- [ ] Les huit variables `LEGAL_*` sont renseignées → plus aucun `[[…]]` sur
      `/legal/notice`, `/legal/privacy`, `/legal/terms`.
- [ ] `ADMIN_EMAILS` contient vos adresses, et **seulement** les vôtres.
- [ ] `ALLOW_FREE_DRAFTS` est absente ou `false` (sinon n'importe quel compte
      connecté crée des invitations gratuitement).
- [ ] `BRAND_ID`, `BRAND_ETSY_SHOP_URL`, `BRAND_SUPPORT_EMAIL` pointent sur la
      marque et la boutique réelles.
- [ ] `MAIL_DRIVER=resend`, `MAIL_FROM` sur le domaine vérifié.
- [ ] `APP_URL` = le domaine public final.
- [ ] Les constantes `BRAND_NAME` et `BRAND_URL` de
      `scripts/build-delivery-pdf.mjs` sont à jour, puis `pnpm etsy:pdf`
      relancé : les PDF de `marketing/etsy/delivery/` portent le bon nom et le
      bon QR code d'activation.

**Achat fictif de bout en bout** (le seul test qui prouve que la chaîne
fonctionne ; compter 20 minutes, avec deux adresses e-mail : une
« administratrice », une « acheteuse »)

- [ ] 1. `/activate` avec un numéro de commande à 8–12 chiffres, l'adresse
      « acheteuse », un thème, la case CGV cochée → message de confirmation.
- [ ] 2. L'acheteuse reçoit l'e-mail de confirmation ; chaque adresse de
      `ADMIN_EMAILS` reçoit la notification.
- [ ] 3. `/admin` → onglet **Activations** → la demande est en attente →
      **Valider** (choisir la langue du contenu).
- [ ] 4. L'acheteuse reçoit « votre invitation est prête » avec un lien magique
      → le lien ouvre `/app`, un brouillon existe sur le bon thème.
- [ ] 5. Éditer : prénoms, date, lieu, une photo (l'upload passe par R2),
      enregistrer → l'aperçu reflète les modifications.
- [ ] 6. Publier : choisir un slug, l'invitation est visible sur
      `https://unfurlme.love/<slug>` en navigation privée.
- [ ] 7. Répondre au RSVP depuis un autre appareil ou en navigation privée →
      la réponse apparaît dans `/app/<id>/responses`.
- [ ] 8. Exporter le CSV des réponses → le fichier s'ouvre dans un tableur,
      accents corrects.
- [ ] 9. Vérifier le `.ics` et le QR code de la page de partage.
- [ ] 10. Refuser une seconde activation de test → l'e-mail de refus arrive
      avec le motif.
- [ ] 11. Supprimer les données de test : activations et invitations de test
      retirées depuis `/admin` (onglet Invitations → désactiver), ou en SQL via
      `wrangler d1 execute --remote`.

**Exploitation**

- [ ] `pnpm exec wrangler tail` reste propre pendant le parcours (aucune erreur).
- [ ] Le Cron Trigger apparaît dans *Trigger Events* (étape 9).
- [ ] Un plan de sauvegarde D1 existe : `pnpm exec wrangler d1 export
      invitations-db --remote --output backup-$(date +%F).sql`, à lancer avant
      chaque migration et une fois par semaine.
- [ ] Une alerte de dépassement de budget est configurée (Cloudflare →
      **Notifications**).

---

## 11. Coûts mensuels estimés

Hypothèse de départ : boutique qui démarre, ~50 invitations vendues par mois,
chacune vue quelques centaines de fois, photos comprises.

| Poste                        | Offre                     | Coût mensuel |
| ---------------------------- | ------------------------- | ------------ |
| Cloudflare **Workers Paid**  | 10 M requêtes incluses    | **5 $** (0 $ si l'offre gratuite suffit, voir ci-dessous) |
| **D1**                       | inclus dans Workers Paid (25 Md lignes lues, 50 M écrites) | 0 $ |
| **R2** (photos)              | 10 Go de stockage gratuits, aucun frais de sortie ; ~2 Go utilisés | 0 $ |
| **KV**                       | inclus dans Workers Paid  | 0 $          |
| **Resend**                   | 3 000 e-mails/mois, 100/jour en offre gratuite | 0 $ (20 $ si dépassement) |
| Nom de domaine               | `.com` ou `.fr` au prix coûtant chez Cloudflare Registrar | ~1 $ (≈ 10–12 $/an) |
| Frais Etsy                   | 0,20 $ par mise en ligne + ~6,5 % + frais de paiement par vente | proportionnel aux ventes |
| **Total hors Etsy**          |                           | **≈ 1 $/mois** au démarrage (offre Workers gratuite), **≈ 6 $/mois** avec Workers Paid |

Remarques :

- L'offre **Workers Free** (100 000 requêtes/jour) suffit largement au trafic
  de départ, et le bundle produit par OpenNext tient dans sa limite de 3 Mo
  compressés : `pnpm exec wrangler deploy --dry-run` annonce **2,7 Mo gzip**
  (13,9 Mo non compressés) au moment où ce guide est écrit. On peut donc
  démarrer à **0 $**. La marge est mince (300 ko) : le jour où elle est
  consommée, l'offre payante à 5 $/mois monte la limite à 10 Mo — c'est le
  premier poste à prévoir. Surveiller la ligne `Total Upload` du `--dry-run` à
  chaque déploiement.
- Le poste qui grossit le premier est **Resend** : 50 ventes = ~150 e-mails,
  très loin des 3 000 inclus. Le passage à 20 $/mois n'arrive qu'à partir de
  ~1 000 ventes mensuelles.
- R2 ne facture **jamais** la bande passante sortante : c'est ce qui rend le
  coût quasi indépendant du nombre d'invités.
- Prévoir en plus, hors infrastructure : l'illustration (étape 12) et, si
  besoin, une relecture juridique des CGV.

---

## 12. Ce qui reste à produire, hors code

Le logiciel est complet ; ces éléments-là ne peuvent pas être écrits par le
dépôt et conditionnent l'ouverture de la boutique.

1. **Nom de boutique Etsy.** La marque et le domaine sont tranchés (Unfurl /
   `unfurlme.love`, voir la décision en tête de
   `docs/marque-et-domaines.md`) ; les deux autres identités du code
   (`BRAND_ID` : `kraft-and-bloom`, `petal-post`) restent disponibles mais ne
   sont plus recommandées. Il reste à vérifier la disponibilité du nom de
   boutique Etsy (`Unfurl`, sinon `UnfurlMe`) et à le réserver.
2. **Identité visuelle définitive.** Le logo et la palette actuels
   (`src/brand/presets/*`) sont provisoires. L'identité visuelle définitive de
   la marque Unfurl est en cours de conception séparément et sera documentée
   dans un futur `docs/identite-unfurl.md` ; prévoir ensuite version
   horizontale, version carrée (avatar Etsy), favicon, version monochrome.
3. **Illustrations des trois thèmes.** Tout est aujourd'hui en SVG inline
   généré. Chaque thème a un cahier des charges précis, fichier par fichier,
   avec les `viewBox` à ne pas changer :
   `src/themes/mariage-noir-ivoire/assets/README.md`,
   `src/themes/mariage-terracotta-bloom/assets/README.md`,
   `src/themes/mariage-riviera-postcard/assets/README.md`.
   Règle absolue : rien ne doit être repris d'un produit concurrent.
4. **Visuels des fiches Etsy.** Dix images par fiche (format carré 2000 ×
   2000 px) : mise en situation sur téléphone, vue des trois palettes, extraits
   animés en GIF, tableau des étapes. Gabarits et textes :
   `marketing/etsy/README.md` et `marketing/etsy/listings/`.
5. **Photos de démonstration.** Les `demo.json` des trois thèmes n'ont
   aujourd'hui **aucune photo** (`photos: {}`), donc les démos montrent les
   placeholders SVG. Il faut 5 photos par thème (emplacements `envelope-1`,
   `envelope-2`, `story-1`, `story-2`, `venue`), libres de droits et cohérentes
   avec l'ambiance, en 1600 px de large.
6. **Textes juridiques relus.** Les pages `/legal/*` sont rédigées, mais les
   mentions, CGV et politique de confidentialité doivent être complétées avec
   l'identité réelle de l'éditeur (variables `LEGAL_*`) et, idéalement, relues.
7. **Compte Etsy et fiches en ligne.** Création de la boutique, mise en ligne
   des trois fiches, des trois options (thème assorti, invitations nominatives,
   extension d'hébergement) et des PDF de livraison générés par `pnpm etsy:pdf`.

---

## Annexe — aide-mémoire des commandes

```bash
# Ressources
pnpm exec wrangler d1 create invitations-db --location weur
pnpm exec wrangler r2 bucket create invitations-photos --jurisdiction eu
pnpm exec wrangler kv namespace create NEXT_INC_CACHE_KV
pnpm exec wrangler kv namespace create CACHE

# Secrets
pnpm exec wrangler secret put BETTER_AUTH_SECRET
pnpm exec wrangler secret put RESEND_API_KEY
pnpm exec wrangler secret put CRON_SECRET
pnpm exec wrangler secret list

# Base de données
pnpm db:migrate:remote
pnpm db:seed:remote
pnpm exec wrangler d1 execute invitations-db --remote --command "select count(*) from invitations;"
pnpm exec wrangler d1 export invitations-db --remote --output backup-$(date +%F).sql

# Déploiement
pnpm build:cf
pnpm exec wrangler deploy --dry-run
pnpm deploy
pnpm exec wrangler tail

# Cron
pnpm exec wrangler dev --test-scheduled --local
curl "http://localhost:8787/__scheduled?cron=15+3+*+*+*"
```
