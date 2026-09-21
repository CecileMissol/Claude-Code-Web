# Kit de mise en vente Etsy — mode d'emploi

Ce dossier contient tout le nécessaire pour ouvrir la boutique Etsy et publier
les 3 fiches du thème mariage (voir `docs/strategie-produit.md` pour le
raisonnement complet : règles Etsy, benchmark, prix). Les textes utilisent les
placeholders `{{BRAND_NAME}}`, `{{BRAND_URL}}`, `{{SHOP_NAME}}` — voir
`marketing/brand-variables.md` avant toute publication réelle.

## 1. Contenu du dossier

| Fichier / dossier                 | Contenu                                                                                                           |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `listings/<theme-slug>.md`        | Fiche produit complète (EN) des 3 thèmes                                                                          |
| `listings/fr/<theme-slug>.md`     | Version FR de la description, pour un futur canal francophone                                                     |
| `listings/options/*.md`           | Fiches courtes des options (upsells)                                                                              |
| `delivery/<theme-slug>-guide.pdf` | Le fichier numérique à joindre à chaque fiche (généré par `pnpm etsy:pdf`, voir `scripts/build-delivery-pdf.mjs`) |
| `messages.md`                     | Message auto post-achat, réponses types, relance J+7, demande d'avis                                              |
| `../launch-plan.md`               | Calendrier de lancement sur 4 semaines                                                                            |
| `../brand-variables.md`           | Placeholders et commande de remplacement                                                                          |

Thèmes couverts (noms tirés de `src/themes/*/manifest.ts`) :
`mariage-noir-ivoire` (Black & ivory / Noir & ivoire),
`mariage-terracotta-bloom` (Terracotta Bloom),
`mariage-riviera-postcard` (Riviera Postcard / Carte postale Riviera).

## 2. Avant de publier — remplacer les placeholders

1. Verrouiller nom de marque, domaine et nom de boutique
   (`docs/marque-et-domaines.md` §3 : vérifier disponibilité réelle du
   domaine, marque USPTO/INPI, et que le nom de boutique Etsy est libre —
   rien n'est confirmé disponible dans ce document).
2. Appliquer la commande `sed` de `marketing/brand-variables.md` §3.
3. Régénérer les PDF de livraison : `pnpm etsy:pdf`.

## 3. Checklist d'ouverture de boutique Etsy

### 3.1 Paramètres de boutique

- [ ] Créer le compte vendeur, choisir `{{SHOP_NAME}}` comme nom de boutique
      (vérifier au préalable que le nom est libre sur `etsy.com/shop/...`).
- [ ] Renseigner le pays de résidence (France) et la devise d'affichage
      (USD conseillé, marché prioritaire — voir `docs/strategie-produit.md`
      §2 et §6).
- [ ] Bannière et photo de boutique alignées sur l'identité `{{BRAND_NAME}}`
      (palette et typographies : `docs/marque-et-domaines.md` §5,
      proposition B « Kraft & Bloom »).
- [ ] Description de boutique (« About ») : reprendre le positionnement en
      une phrase et les 3 valeurs de marque (`docs/marque-et-domaines.md`
      §1 et §5).
- [ ] Activer les réponses automatiques aux messages (voir `messages.md`).
- [ ] Paramétrer les notifications e-mail de nouvelle commande vers une
      adresse surveillée quotidiennement (la validation d'activation en V0
      est manuelle, brief §8 — un délai de traitement trop long dégrade
      l'expérience acheteuse).

### 3.2 Politiques de boutique (obligatoires côté Etsy)

- [ ] **Politique de retour/remboursement** : pour un téléchargement
      numérique, Etsy interdit les retours au sens physique mais autorise
      (et il est recommandé) de préciser une politique de remboursement
      claire — reprendre le texte de `listings/<theme-slug>.md` section
      « Refund policy » dans chaque fiche ET dans les politiques de
      boutique (Shop Manager → Finances → Policies, ou Settings →
      Policies selon la version de l'interface).
- [ ] **Délai de traitement** (« processing time ») : fixer explicitement
      dans chaque fiche (même si la livraison du fichier est instantanée,
      Etsy demande cette information) — indiquer 0 jour (téléchargement
      immédiat) pour le fichier, et préciser dans la description que la
      validation d'activation prend jusqu'à 24 h (voir `messages.md`).
- [ ] **Politique de confidentialité boutique** (Etsy en affiche une par
      défaut ; vérifier qu'elle ne contredit pas les mentions RGPD propres
      à l'application, brief §9).
- [ ] Section « FAQ » de la fiche activée avec les questions de
      `listings/<theme-slug>.md`.

### 3.3 Mentions obligatoires pour un produit numérique

- [ ] Dans chaque fiche : préciser clairement **« Digital download »** /
      **« INSTANT DOWNLOAD »** dans le titre ou en tout début de
      description, pour éviter toute confusion avec un produit physique
      (règle Etsy de base pour les téléchargements numériques,
      `docs/strategie-produit.md` §1.2).
- [ ] Mention explicite que **« le fichier téléchargé contient votre lien
      d'activation »** — reprise mot pour mot dans chaque fiche (voir
      `listings/<theme-slug>.md`, section « What you receive ») : c'est la
      formulation qui sécurise le modèle vis-à-vis de la règle Etsy
      « Off-Platform Transactions » (`docs/strategie-produit.md` §1.1) —
      ne jamais suggérer qu'un paiement complémentaire hors Etsy est
      nécessaire pour obtenir l'invitation elle-même.
- [ ] **Aucun fichier envoyé par un autre canal** (pas d'e-mail direct avec
      le PDF) : tout doit passer par le fichier numérique attaché à la
      fiche Etsy, seul mécanisme conforme.
- [ ] Catégorie Etsy correcte (voir la fiche de chaque thème) et attributs
      « digital file type » renseignés dans Shop Manager.

### 3.4 TVA / OSS — vendeuse française vendant aux États-Unis et dans l'UE

**Ceci n'est pas un conseil fiscal définitif — à valider avec un
comptable avant le lancement.** Points à vérifier avec lui, dans l'ordre :

- [ ] **Régime d'activité** : structure actuelle (micro-entreprise, société)
      et seuils de franchise en base de TVA applicables aux ventes
      numériques B2C — un service numérique livré automatiquement
      (téléchargement + accès à une application hébergée) peut avoir un
      traitement TVA différent d'un bien physique ou d'un imprimé.
- [ ] **Ventes à des particuliers dans l'UE (hors France)** : les services
      numériques (SaaS, accès à une plateforme) vendus par voie
      électronique à des consommateurs européens relèvent en principe des
      règles de TVA sur les « services électroniques », taxables dans le
      pays du client — le régime **OSS (One Stop Shop / guichet unique de
      TVA UE)** permet de déclarer et reverser cette TVA via un point
      d'entrée unique en France plutôt que de s'immatriculer dans chaque
      pays client. À confirmer avec le comptable : seuil de 10 000 € de
      ventes intra-UE à distance à partir duquel l'OSS devient obligatoire
      (seuil européen harmonisé, à reconfirmer à la date du lancement), et
      si l'offre (accès hébergé 18 mois, pas seulement un fichier statique)
      est bien qualifiée de « service électronique » au sens de cette
      règle plutôt que de vente de bien numérique simple.
- [ ] **Ventes aux États-Unis** : pas de TVA américaine, mais existence
      possible de « sales tax » selon les États pour des produits/services
      numériques — en pratique, sur Etsy, **c'est Etsy qui collecte et
      reverse la sales tax US** pour le compte du vendeur dans la plupart
      des États (marketplace facilitator laws) : à faire confirmer par le
      comptable que rien de plus n'est dû côté vendeuse pour les ventes US
      via Etsy, et si des obligations déclaratives françaises résiduelles
      existent malgré tout (chiffre d'affaires export à déclarer).
- [ ] **TVA sur les frais Etsy eux-mêmes** (commission, frais de
      traitement de paiement) : Etsy Ireland facture en principe la TVA
      irlandaise sur ses frais aux vendeurs européens (auto-liquidation
      selon le régime de TVA de la vendeuse) — vérifier le traitement
      comptable de ces factures Etsy avec le comptable.
- [ ] **Factures/justificatifs** : mettre en place, dès la première vente,
      un export mensuel des rapports Etsy (ventes, frais, remboursements)
      pour la déclaration de TVA/OSS et la comptabilité — ne pas attendre
      la fin du premier trimestre pour organiser ce suivi.
- [ ] **Vente future des options via un site direct (Stripe)** — voir
      `docs/strategie-produit.md` §4 : si ce canal est activé, il déclenche
      les mêmes questions OSS mais **hors marketplace** (pas de
      collecte automatique par Etsy) : la déclaration de la TVA UE et,
      potentiellement, de sales tax US (au-delà de certains seuils par
      État, régime « economic nexus ») deviendrait alors entièrement à la
      charge de la vendeuse — à anticiper avec le comptable avant
      d'ouvrir ce canal, pas après.

### 3.5 Prix

- [ ] Fiche « Black & ivory » : prix de lancement **29 $ USD**, prix barré
      **49 $ USD** (voir `docs/strategie-produit.md` §5.4 et §6) ; prix
      cible après la phase de lancement (30-50 premières ventes) :
      **39 $ USD**, prix barré **59 $ USD**.
- [ ] Fiches « Terracotta Bloom » et « Riviera Postcard » : mêmes paliers de
      prix, même logique (marché déjà validé par le thème 1) — voir chaque
      fiche pour le détail.
- [ ] Options : prix indiqués dans `listings/options/*.md`, repris de
      `docs/strategie-produit.md` §4.
- [ ] Revoir les prix après les 30-50 premières ventes ou 2-3 mois,
      celui des deux qui arrive en premier (phasage recommandé,
      `docs/strategie-produit.md` §6.2).

## 4. PDF de livraison

Génération : `pnpm etsy:pdf` (voir `scripts/build-delivery-pdf.mjs`). Un PDF
par thème dans `marketing/etsy/delivery/`, 2 pages (A4/Letter), avec le lien
d'activation, son QR code, et le mini-guide en 6 étapes. Les PDF ne sont
**pas** commités par ce kit (aucune opération git n'est faite ici) — ils
restent dans `marketing/etsy/delivery/` pour être attachés manuellement à
chaque fiche Etsy comme fichier numérique.

## 5. Ce que ce kit ne fait pas

- Ne télécharge ni ne produit les 10 visuels de fiche par thème (réseau
  restreint au registre npm) : chaque fiche en donne la description précise
  à réaliser séparément (mockups, captures d'écran, mise en scène).
- Ne configure rien dans le compte Etsy réel : ce sont des textes et
  fichiers prêts à copier-coller ou à attacher.
- Ne remplace pas un avis comptable ou juridique sur la fiscalité ou les
  mentions légales (voir §3.4 ci-dessus).
