# Phase 7 — Activation Etsy V0 et back-office

Statut : **livré** pour le périmètre V0 (validation manuelle). Ce document
décrit ce qui est en place, puis le plan pour la V1 (vérification automatique
via l'API Etsy), volontairement **non implémentée** à ce stade (brief,
section 11, phase 9).

Spécification de référence : `BRIEF.md` §4.1, §4.3, §5, §8 ; cadrage
`docs/phase-1-cadrage.md` §5 ; règles Etsy et structure de fiche
`docs/strategie-produit.md` §1.

---

## 1. Ce qui est fait (V0)

- `/activate` : formulaire numéro de commande Etsy (8 à 12 chiffres) + e-mail +
  thème acheté (liste tirée du registre des thèmes, un seul pour l'instant) +
  case CGV/confidentialité. Limité en débit par IP (5 tentatives / 10 min),
  anti-doublon sur le couple (commande, thème).
- Chaque soumission crée (ou ré-ouvre, si la précédente avait été refusée) une
  ligne `activations` en `pending`, envoie un e-mail de confirmation à
  l'acheteur et un e-mail à chaque adresse de `ADMIN_EMAILS`
  (`emails/Activation*.tsx`, rendus avec `react-dom/server`, aucune nouvelle
  dépendance).
- `/admin` (`requireAdmin()`) : trois onglets — Activations (file d'attente,
  boutons Valider/Refuser en Server Actions), Invitations (propriétaire, slug,
  statut, date de publication, date d'expiration ; actions prolonger de 12
  mois, désactiver/réactiver, ouvrir), Journal (100 dernières entrées de
  `audit_log`).
- Valider une activation : crée le compte s'il n'existe pas (insertion directe
  dans la table `user`, cohérente avec le schéma lu par Better Auth), crée une
  invitation brouillon sur le thème acheté avec le contenu par défaut dans la
  langue choisie par l'admin (`fr` ou `en`, `en` par défaut), envoie le lien
  magique « votre invitation est prête » via l'API interne Better Auth
  (`auth.api.signInMagicLink`, avec `metadata.kind = 'activation-approved'`
  pour que `sendMagicLink` choisisse le bon gabarit d'e-mail), écrit une ligne
  `audit_log`.
- Refuser : e-mail de refus avec motif optionnel, ligne `audit_log`.
- Verrou de connexion (`src/lib/auth.ts`, `isEmailAllowedToSignIn`) : un lien
  magique n'est envoyé que si l'e-mail est administrateur, a déjà un compte,
  ou a une activation `approved`. La réponse de l'API reste toujours neutre
  (« si votre commande est validée, vous recevrez un e-mail »), qu'un e-mail
  ait effectivement été envoyé ou non.
- Table `themes` : seed idempotent (`ensureThemesSeeded()`,
  `src/db/seed-themes.ts`), appelé au premier accès à `/activate` et `/admin`.

## 2. Règle métier : une commande = une invitation par thème

`activations` porte un index unique sur (`etsy_order_id`, `theme_id`) : il ne
peut donc exister qu'**une seule ligne** par couple (commande, thème), quel
que soit son statut. Une nouvelle soumission pendant qu'elle est `pending` ou
`approved` est refusée avec un message adapté ; une nouvelle soumission après
un `rejected` **réutilise la même ligne** et la repasse à `pending` plutôt que
d'en créer une seconde (que l'index refuserait de toute façon). Le cas des
commandes multi-produits (lots) est couvert par construction : chaque
(commande, thème) est indépendant, donc une même commande Etsy contenant
plusieurs thèmes donnerait lieu à une activation par thème — pertinent le jour
où un deuxième thème rejoint le registre.

---

## 3. V1 — vérification automatique (API Etsy Open API v3)

Non implémentée. Plan, pour respecter le principe du brief (§8) : « garder la
validation manuelle en secours ».

### 3.1 Pré-requis côté compte Etsy

1. Créer une application développeur sur le portail Etsy Developers → obtient
   une **API key (keystring)** et un **shared secret**.
2. Déclarer le **domaine et l'URI de callback OAuth** exacts (ex.
   `https://<domaine>/api/etsy/oauth/callback`) — Etsy doit les avoir
   pré-approuvés avant tout échange de jeton.
3. Demander l'**« accès commercial »** (Apps You've Made → Request Access)
   dès que le volume dépasse l'usage personnel/test : révision manuelle par
   Etsy, délai variable. À démarrer tôt (en parallèle d'une phase antérieure),
   la validation manuelle restant le repli en attendant l'approbation.

### 3.2 Flux OAuth (une fois, pour notre propre boutique)

- **Authorization Code Grant + PKCE**, scope **`transactions_r`** (lecture des
  commandes de la boutique).
- Génération d'un `code_verifier`/`code_challenge` (Web Crypto, comme
  `src/lib/r2.ts` le fait déjà pour les tickets HMAC — pas de nouvelle
  dépendance).
- Redirection vers `https://www.etsy.com/oauth/connect` avec `client_id`,
  `redirect_uri`, `scope=transactions_r`, `state`, `code_challenge`.
- Callback (`GET /api/etsy/oauth/callback`) : échange le `code` contre un
  **jeton d'accès + jeton de rafraîchissement** via
  `POST https://api.etsy.com/v3/public/oauth/token`.
- Étape effectuée **une seule fois**, manuellement par l'administratrice (pas
  par un acheteur) : ce n'est pas un flux OAuth par utilisateur final.

### 3.3 Stockage des jetons

- Nouvelle table (hors périmètre de ce document, à ajouter en phase 9) :
  `etsy_oauth_tokens` — `access_token`, `refresh_token`, `expires_at`,
  `scope`, `updated_at`. Une seule ligne (une seule boutique).
- Jetons **chiffrés au repos** si la table les stocke tels quels n'est pas
  jugée suffisante ; au minimum, jamais exposés côté client, jamais journalisés.
- Rafraîchissement automatique : le jeton d'accès Etsy expire (environ 1 h) ;
  un job (Cron Trigger Workers, comme la purge RSVP à 6 mois) rafraîchit le
  jeton avant expiration via `refresh_token`, et alerte l'admin par e-mail si
  le `refresh_token` lui-même est révoqué (nécessite une ré-autorisation
  manuelle).

### 3.4 Vérification d'une commande à l'activation

En complément du formulaire `/activate` actuel (inchangé côté acheteur) :

1. À la soumission, si un jeton Etsy valide existe, appeler
   `GET /v3/application/shops/{shop_id}/receipts/{receipt_id}` (ou le filtre
   par `receipt_id` sur l'endpoint liste) avec le jeton d'accès.
2. Vérifier : la commande existe, appartient bien à notre boutique, contient
   une *transaction* dont le `listing_id` correspond au produit du thème
   sélectionné, et n'a pas déjà servi à une activation `approved` (déjà
   garanti par l'unicité (commande, thème) ci-dessus).
3. Si tout correspond : passer l'activation directement en `approved` (mêmes
   effets que la validation manuelle — création de compte, invitation
   brouillon, e-mail avec lien magique, ligne `audit_log` avec
   `actorEmail: 'etsy-api'`), **sans attendre l'admin**.
4. Si l'appel échoue (jeton expiré et rafraîchissement impossible, commande
   introuvable, réseau indisponible, quota API dépassé) : **ne jamais
   bloquer l'acheteur** — l'activation reste `pending` et retombe dans la file
   `/admin` comme aujourd'hui. La V1 est un raccourci, jamais un point de
   défaillance unique.

### 3.5 Repli manuel — toujours actif

Le bouton Valider/Refuser de `/admin` reste utilisable en toutes
circonstances, y compris après le passage en V1 : jeton révoqué, commande
ambiguë (lot multi-produits, remboursement partiel), ou simple désaccord avec
la réponse de l'API. La V1 réduit le nombre de validations manuelles, elle ne
supprime pas l'outil.

### 3.6 Commandes multi-produits (lots)

Le brief demande d'anticiper le cas où une commande Etsy contient plusieurs
produits. Le modèle (commande, thème) → une ligne le permet déjà : si un lot
« Save the Date + faire-part assorti » existe un jour, chaque élément du lot
correspond à un thème (ou une variante de thème) distinct, donc à une ligne
`activations` distincte pour la même `etsy_order_id`. Côté API v3, la réponse
`receipts/{receipt_id}` inclut la liste des `transactions` de la commande : la
V1 devra choisir la transaction dont le `listing_id` correspond au thème que
l'acheteur a sélectionné dans le formulaire, plutôt que de supposer une seule
transaction par commande.

### 3.7 Points de vigilance Etsy déjà identifiés

Voir `docs/strategie-produit.md` §1.3 pour le détail sourcé. En résumé : la
lecture des commandes de sa propre boutique est le cas d'usage prévu par
l'API Etsy v3 (scope `transactions_r`), mais nécessite OAuth (pas seulement la
clé API), un domaine/callback pré-approuvés, et — pour un usage en production
soutenu — l'accès commercial. Rien n'interdit le modèle « paiement intégral
sur Etsy + activation post-achat sur un service tiers » tant que le lien
d'activation ne sert jamais à faire payer l'acheteur une seconde fois pour le
même produit de base (politique *Off-Platform Transactions*).
