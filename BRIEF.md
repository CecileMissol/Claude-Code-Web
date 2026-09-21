# BRIEF PROJET — Invitations web animées personnalisables

> Brief destiné à Claude Code. Lis-le en entier avant d'écrire la moindre ligne de code.
> Travaille **phase par phase** (section 11) : à la fin de chaque phase, résume ce qui est fait, liste ce qui reste à valider, et **attends ma confirmation** avant de passer à la suivante.
> Si un point est ambigu ou manquant, pose la question plutôt que de supposer.

---

## 1. Contexte et vision

Sur Etsy, les modèles Canva de « Save the Date » et de sites de mariage interactifs se vendent très bien : une enveloppe qu'on touche, qui s'ouvre, des photos qui en sortent, un compte à rebours, un formulaire RSVP. Le client achète un template, le modifie dans Canva, le publie sur un sous-domaine `*.my.canva.site`.

**Le projet** : proposer le même type de produit, mais **sans Canva**. Une application web à nous, où l'acheteur :

1. active son achat,
2. personnalise son invitation dans un éditeur simple et agréable (textes, photos, couleurs, typographies, sections),
3. publie et obtient un **lien unique** à partager à ses invités (SMS, e-mail, WhatsApp, QR code),
4. consulte les réponses de ses invités dans un tableau de bord.

L'invité, lui, vit une **expérience animée, narrative et responsive** : ouverture de l'enveloppe, puis défilement façon « scrollytelling » avec un style collage (papiers déchirés, polaroïds, timbres, fleurs).

Premier thème : **mariage (Save the Date + invitation complète)**. Ensuite : duplication vers d'autres styles de mariage, puis d'autres événements (anniversaire, baptême, baby shower, fête d'entreprise…).

Canal de vente principal : **boutique Etsy**. Canal secondaire à terme : vente directe sur notre propre site.

---

## 2. Références

### 2.1 Produit concurrent de référence (Etsy)
- Fiche : https://www.etsy.com/fr/listing/4357878160/site-web-reservez-la-date-a-theme-floral
- Vendeuse : RosieCreativeStudio (Nouvelle-Zélande), best-seller, ~10 500 ventes, note 5,0.
- Démo live : https://rosiecreativestudio.my.canva.site/timeless-chic-demo
- Contenu : site Canva de 4 pages (invitation cliquable, compte à rebours, formulaire RSVP intégré, page détails) + guide PDF + bonus imprimable 5x5".
- Prix constaté : ~30 € (souvent en promo autour de 20 €), -40 % en lot avec le site de mariage assorti.
- **Ses limites, qui sont nos arguments** :
  - l'édition passe par Canva : alignements fragiles sur mobile dès qu'on déplace un élément (elle le signale elle-même),
  - les couleurs des éléments graphiques (fleurs, enveloppes, cachets) ne sont pas modifiables,
  - la musique ne se lance pas toute seule, pas d'invitation nominative sans dupliquer le site,
  - le RSVP est un formulaire Canva basique, sans vrai tableau de bord.

### 2.2 Direction visuelle visée
D'après les captures du produit concurrent (je peux te les fournir) :
- palette noir profond, ivoire, blanc cassé et vert chartreuse/olive (tiges, feuillages),
- enveloppe noire, timbres, tampon postal, cachet de cire,
- polaroïds noir et blanc, ticket « Save the date » avec talon détachable,
- fleurs blanches (hortensias, arums, gypsophile) et amarante verte retombante,
- typographies : serif Didone à fort contraste (chiffres, titres) + script calligraphique (prénoms, accents).

**Important** : on s'inspire de l'ambiance générale, on ne reproduit **aucun** élément graphique, texte ou mise en page spécifique de RosieCreativeStudio. Tous nos visuels sont originaux.

### 2.3 Référence d'animation au défilement
- https://pages.flint.media/generation-ia/controle-ia-risque-existentiel/
- Le sujet n'a rien à voir. Ce qui nous intéresse : la narration au défilement, les scènes qui restent fixes pendant que les éléments arrivent un par un, le texte qui change phrase par phrase, le côté « pièces posées sur une table » / collage.

### 2.4 Maquette validée
Le fichier `reference/invitation-mariage-demo.html` (fourni avec ce brief) est la maquette validée : **c'est la référence de comportement et d'ambiance**, pas du code à réutiliser tel quel. Elle contient :
- **Intro** : enveloppe noire (face adresse avec prénoms, timbres, tampon postal, arum) → au toucher elle se retourne → le cachet saute → le rabat s'ouvre → le ticket et deux polaroïds sortent → des fleurs se glissent dans la composition. Le défilement est bloqué tant que l'enveloppe n'est pas ouverte.
- **Chapitres en défilement** (scène collante `position: sticky`, progression 0→1 calculée sur la hauteur du chapitre, éléments déclenchés à des seuils) :
  1. Notre histoire (polaroïds scotchés, billet de train déchiré, fleur, mot sur papier kraft, texte phrase par phrase),
  2. La date (chiffres sur papiers différents, « le grand jour » qui s'écrit, compte à rebours),
  3. Le programme (notes déchirées empilées),
  4. Le lieu (carte postale, timbre qui s'écrase, tampon, bouton itinéraire).
- **Sections classiques** : infos pratiques (étiquettes), RSVP (un cachet se pose à l'envoi), signature.
- **Panneau de personnalisation** : prénoms, date, 3 palettes, 3 écritures script, rejouer l'animation.

Les photos, fleurs et la carte postale y sont dessinées en code faute d'assets : dans le produit, ce seront de **vraies photos** (fournies par le client) et de **vraies illustrations** (à produire, voir 7.4).

---

## 3. Positionnement

- **Promesse** : « Une invitation qui s'ouvre comme une vraie lettre. Personnalisée en 10 minutes, sans Canva, partagée en un lien. »
- **Différenciation** vs templates Canva :
  - éditeur guidé : impossible de « casser » la mise en page, rendu mobile garanti,
  - vraies couleurs personnalisables, y compris sur les éléments graphiques (SVG colorisables quand c'est possible),
  - RSVP avec tableau de bord, export CSV, notifications,
  - aucune dépendance à un compte tiers (ni Canva, ni autre),
  - animations plus riches (narration au défilement).
- **Cible** : couples 25-40 ans, marché anglophone d'abord (majorité des acheteurs Etsy) + francophone. L'application doit être **bilingue FR/EN** dès le départ (interface de l'éditeur ET contenu de l'invitation).
- **Modèle** : achat unique sur Etsy donnant accès à l'éditeur et à l'hébergement de l'invitation pendant une durée limitée (proposition : **18 mois** après publication, prolongeable en option). Options futures : domaine personnalisé, invitation nominative par foyer, version multilingue, thème assorti (Save the Date + faire-part + site).

---

## 4. Parcours utilisateurs

### 4.1 Acheteur (le couple)
1. Achète sur Etsy un « téléchargement numérique » : un PDF élégant (identique pour tous les acheteurs, contrainte Etsy) qui contient le lien d'activation et un mini-guide.
2. Sur la page d'activation, saisit son **numéro de commande Etsy + son e-mail**.
3. Le système vérifie la commande (voir section 8), crée son compte (lien magique par e-mail, sans mot de passe) et une invitation en brouillon sur le thème acheté.
4. Dans l'éditeur : formulaire par étapes à gauche (ou en bas sur mobile), **aperçu en direct** à droite. Étapes : Vous deux → Date et lieu → Votre histoire → Photos → Programme → Infos pratiques → RSVP → Style (palette, typos) → Lien et publication.
5. Choisit son lien (`/zoe-et-dylan`), publie.
6. Récupère : le lien, un QR code téléchargeable (PNG/SVG), des modèles de messages à envoyer (SMS, e-mail, WhatsApp) en FR/EN.
7. Tableau de bord : liste des réponses, compteurs (oui / non / nombre de personnes), export CSV, notification e-mail à chaque réponse (activable).
8. Peut modifier l'invitation après publication (les modifications sont visibles immédiatement sur le même lien).

### 4.2 Invité
1. Ouvre le lien sur son téléphone (cas principal, à optimiser en priorité).
2. Voit l'enveloppe, la touche, l'animation d'ouverture se joue.
3. Fait défiler l'histoire, la date, le programme, le lieu, les infos.
4. Répond au RSVP, voit la confirmation animée.
5. Peut ajouter l'événement à son agenda (fichier .ics).

### 4.3 Moi (administratrice)
- Back-office minimal : liste des commandes / codes / invitations, statut, possibilité de valider manuellement une activation, de prolonger ou désactiver une invitation, de voir les erreurs.

---

## 5. Périmètre

### MVP (à livrer en premier)
- 1 thème mariage complet (celui de la maquette, « Noir & ivoire »), avec 3 palettes et 3 écritures script.
- Activation par numéro de commande (vérification manuelle par moi dans l'admin en V0, automatique via API Etsy en V1).
- Éditeur avec aperçu en direct, upload de photos (redimensionnées et compressées côté client avant envoi).
- Page publique de l'invitation, animée, responsive, FR/EN.
- RSVP + tableau de bord + export CSV + notification e-mail.
- QR code + messages de partage + fichier .ics.
- Pages légales (mentions, confidentialité, CGV) et bandeau d'information données personnelles.

### Hors MVP (prévoir l'architecture, ne pas développer)
- Autres thèmes et types d'événements.
- Musique de fond (lecture au toucher sur l'enveloppe).
- Invitations nominatives par foyer (lien unique par invité avec prénom).
- Domaine personnalisé.
- Vente directe sur notre site (Stripe).
- Imprimables assortis générés automatiquement (PDF faire-part + QR).

---

## 6. Stack technique

À valider avec moi en début de phase 1, mais voici la proposition, alignée sur ma stack habituelle (Next.js, Vercel, GitHub) :

| Besoin | Choix proposé | Pourquoi |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Éditeur interactif + pages publiques rendues côté serveur |
| Styles | **Tailwind CSS** pour l'app (éditeur, dashboard) ; **CSS dédié par thème** (variables CSS) pour les invitations | Les thèmes doivent rester autonomes et très maîtrisés visuellement |
| Animations | **GSAP + ScrollTrigger** (gratuit, y compris pour usage commercial) pour les timelines et le défilement ; CSS pour le reste | Robuste sur iOS Safari, contrôle fin des timelines |
| Validation | **Zod** | Un seul schéma de contenu partagé entre éditeur, API et rendu |
| Base de données + auth + fichiers | **Supabase** (Postgres, Auth par lien magique, Storage, Row Level Security), **région UE** | Tout-en-un, RLS pour isoler les données de chaque couple |
| E-mails | **Resend** (+ React Email pour les gabarits) | Lien magique, notifications RSVP |
| Hébergement | **Vercel** (fonctions en région Europe, ex. `cdg1`) | Déjà dans ma stack. Alternative acceptable : Cloudflare (Workers + D1 + R2) si tu vois un vrai gain, à me proposer avant |
| QR code | librairie `qrcode` | Génération PNG/SVG |
| Tests | **Vitest** (logique), **Playwright** (parcours + captures mobile) | |
| Dépôt | GitHub, déploiements de prévisualisation par branche | |

Contraintes :
- Pas de `localStorage` pour les données importantes : tout est en base.
- Performance : page d'invitation < 200 Ko de JS initial hors photos, polices préchargées, photos en WebP/AVIF avec tailles adaptées, LCP < 2,5 s en 4G.
- Accessibilité : navigation clavier, contrastes, `prefers-reduced-motion` respecté (animations remplacées par des fondus simples), textes alternatifs.
- Compatibilité prioritaire : iOS Safari et Chrome Android récents, puis desktop.

---

## 7. Architecture

### 7.1 Modèle de données (proposition)
- `themes` : id, slug, nom, version, statut (actif / brouillon).
- `activations` : id, etsy_order_id, email, theme_id, statut (en attente / validée / refusée), validée_le.
- `invitations` : id, owner_id, theme_id, slug (unique), locale, **config (JSONB validé par Zod)**, statut (brouillon / publiée / expirée / désactivée), publiée_le, expire_le, créée_le, maj_le.
- `rsvps` : id, invitation_id, nom, email, présence (bool), nb_personnes, régime, message, créé_le.
- Storage : `invitations/{invitation_id}/photos/...`
- RLS : un couple ne voit que ses invitations et ses réponses ; l'insertion de RSVP est publique mais limitée (anti-spam : limite de débit par IP + champ piège).

### 7.2 Système de thèmes (point clé pour la duplication)
Un thème = un dossier autonome :
```
themes/
  mariage-noir-ivoire/
    manifest.ts      # nom, version, palettes, polices autorisées, sections supportées, assets requis
    schema.ts        # extension éventuelle du schéma de contenu commun
    Invitation.tsx   # composant racine du rendu
    sections/        # Intro (enveloppe), Histoire, Date, Programme, Lieu, Infos, RSVP, Signature
    styles.css       # variables CSS de palette + styles du thème
    assets/          # illustrations (SVG / WebP transparents)
```
- Le **contenu** (prénoms, date, lieu, histoire, photos, programme, infos, options RSVP, palette, typos, langue) suit un **schéma commun** versionné. Changer de thème ne doit pas perdre le contenu.
- Le **rendu** est propre à chaque thème.
- L'éditeur lit le `manifest` pour savoir quelles options proposer.
- Objectif : créer un nouveau thème = copier un dossier, changer les visuels et les animations, sans toucher au reste de l'application.

### 7.3 Routes
- `/` vitrine (présentation, démo, lien vers Etsy)
- `/activer` saisie commande + e-mail
- `/app` tableau de bord du couple, `/app/[id]/editer`, `/app/[id]/reponses`
- `/[slug]` invitation publique (ou `/i/[slug]`, à décider avec moi selon le nom de domaine)
- `/demo/[theme]` démo publique de chaque thème (pour les fiches Etsy)
- `/admin` back-office (accès restreint à mon compte)

### 7.4 Assets graphiques
- Les illustrations (enveloppes, timbres, cachets, fleurs, feuillages, papiers déchirés) seront produites séparément (illustration / génération d'images puis détourage). En attendant, utilise des **placeholders propres** avec les bonnes dimensions et un nommage clair, et documente la liste des assets attendus dans `themes/<theme>/assets/README.md` (format, taille, transparence, variantes de couleur).
- Quand c'est possible, préfère des SVG colorisables par variables CSS (enveloppe, cachet, timbres) : c'est un argument de vente.

---

## 8. Livraison via Etsy

Contrainte : sur Etsy, le fichier numérique est **le même pour tous les acheteurs**, on ne peut donc pas y mettre un code unique.

- **V0 (MVP)** : le PDF contient l'URL `/activer`. L'acheteur saisit numéro de commande + e-mail. La demande arrive dans l'admin, je valide en un clic, l'acheteur reçoit son lien magique.
- **V1** : vérification automatique via l'**API Etsy Open API v3** (OAuth, lecture des commandes de la boutique) : la commande existe, contient bien le produit, n'a pas déjà été activée → activation immédiate. Garder la validation manuelle en secours.
- Une commande = une invitation (prévoir le cas des lots : plusieurs produits dans une commande).
- Me signaler si tu identifies une règle Etsy qui pose problème pour ce modèle (produit numérique donnant accès à un service hébergé).

---

## 9. Données personnelles (RGPD)

- Hébergement des données en UE.
- Les réponses RSVP contiennent des données d'invités (nom, e-mail, régime alimentaire) : collecte minimale, mention d'information sous le formulaire, suppression automatique des réponses X mois après la date de l'événement (paramétrable, proposition : 6 mois), export et suppression à la demande du couple.
- Pas de traceurs publicitaires sur les pages d'invitation. Mesure d'audience sans cookie si besoin.
- Pages : mentions légales, politique de confidentialité, CGV (je fournirai les informations de mon entreprise).

---

## 10. Qualité

- Code TypeScript strict, composants documentés, `README.md` à jour (installation, variables d'environnement, déploiement, création d'un nouveau thème).
- Tests Playwright des parcours clés : activation, édition + publication, ouverture de l'invitation sur mobile, envoi RSVP.
- Captures automatiques de l'invitation en 390 px, 768 px et 1440 px à chaque changement de thème, pour que je puisse valider visuellement.
- Aucune clé secrète dans le dépôt ; fichier `.env.example` documenté.

---

## 11. Plan de travail par phases

Chaque phase se termine par : démo (URL de prévisualisation Vercel), récapitulatif, points à valider. **Attends mon feu vert entre chaque phase.**

1. **Cadrage technique** : tu relis le brief et la maquette, tu me poses tes questions, tu confirmes ou ajustes la stack, tu proposes l'arborescence et le schéma de contenu Zod. Aucun code applicatif avant ma validation.
2. **Socle** : initialisation Next.js + Tailwind + Supabase + déploiement Vercel, schéma de base, auth par lien magique, i18n FR/EN.
3. **Moteur de thème + thème 1 en statique** : reproduction fidèle de la maquette (intro enveloppe + chapitres au défilement + sections) alimentée par un fichier de contenu JSON de démo. C'est la phase la plus importante : priorité à la qualité des animations et au rendu mobile. Page `/demo/mariage-noir-ivoire`.
4. **Éditeur** : formulaire par étapes, aperçu en direct, upload photos, choix palette / typos, sauvegarde automatique.
5. **Publication et partage** : slug, publication, QR code, messages de partage, .ics.
6. **RSVP et tableau de bord** : formulaire, stockage, anti-spam, tableau de bord, export CSV, notifications.
7. **Activation Etsy V0 + admin**.
8. **Légal, RGPD, finitions, tests, performance**.
9. **Activation Etsy V1 (API)**.

---

## 12. Décisions encore ouvertes (à me demander au bon moment)

- Nom de marque et nom de domaine.
- Format des liens publics : `domaine.com/zoe-et-dylan` ou sous-domaine `zoe-et-dylan.domaine.com`.
- Durée d'hébergement incluse et prix des options.
- Langues supplémentaires au-delà de FR/EN.
- Choix final Vercel + Supabase vs Cloudflare.
