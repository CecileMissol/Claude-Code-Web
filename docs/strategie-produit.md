# Stratégie produit et commerciale — Invitations de mariage web animées

Statut : proposition, document de travail. Sources citées en lien à chaque affirmation factuelle. Rédigé à partir de `BRIEF.md` et de `docs/phase-1-cadrage.md` (sections 1 et 4).

---

## 1. Règles Etsy

### 1.1 Le modèle « téléchargement numérique identique + lien d'activation vers un service hébergé » est-il conforme ?

**Oui, avec des précautions de formulation**, et ce modèle a un précédent direct et à succès sur Etsy : les milliers de boutiques qui vendent des « sites de mariage Canva », dont notre référence RosieCreativeStudio (section 2.1 du brief). Le mécanisme est identique au nôtre : un fichier numérique unique (PDF) contenant un lien vers un service tiers hébergé (Canva), que l'acheteur active et personnalise.

Ce qui rend le modèle conforme :

- **La règle centrale d'Etsy** est que toute fiche doit « offrir un article à vendre », y compris un article livré numériquement — ce n'est pas une prestation de service pure comme le coaching ou la réservation, catégories désormais explicitement interdites sauf exceptions limitées (services créatifs numériques avec livrable concret, retouche d'un objet existant). Source : [Seller Policy — Our House Rules](https://www.etsy.com/legal/sellers/), [Services — Our House Rules](https://www.etsy.com/legal/policy/services/242665313101).
- **Le fichier numérique livré doit être identique pour tous les acheteurs** (Etsy ne permet pas d'y insérer un code unique par commande) : c'est exactement notre contrainte de conception (brief, section 8) — un PDF générique renvoyant vers `/activer`, où l'acheteur saisit lui-même son numéro de commande + e-mail. Source : [How to Manage Your Digital Listings](https://help.etsy.com/hc/en-us/articles/115015628347-How-to-Manage-Your-Digital-Listings), pratique confirmée par les boutiques Canva existantes ([exemple de gabarit d'instructions de téléchargement numérique](https://www.etsy.com/listing/1653964598/digital-download-instructions-template)).
- **Les liens externes dans le fichier livré sont tolérés et même une pratique documentée par Etsy** : pour les fichiers volumineux, Etsy recommande explicitement d'héberger le fichier ailleurs (Google Drive, Dropbox) et de mettre le lien dans un PDF téléchargé sur Etsy — le même mécanisme que notre lien d'activation. Source : [Etsy Policies for Digital Download](https://www.etsy.com/market/etsy_policies_for_digital_download), [Digital Downloads on Etsy — guide](https://www.insightagent.app/guides/digital-downloads-on-etsy-complete-guide).

**Le point de vigilance réel n'est pas le lien externe, mais la politique « Off-Platform Transactions » (transactions hors plateforme)** : Etsy interdit strictement qu'**une transaction commencée sur Etsy soit finalisée hors d'Etsy**, ou que le vendeur pousse l'acheteur à payer ailleurs pour le même article (pour éviter les frais Etsy), y compris via un lien externe, un QR code ou un échange de coordonnées en message. Source : [Off-Platform Transactions — Our House Rules](https://www.etsy.com/legal/policy/off-platform-transactions/1254654515806).

Notre modèle est protégé de ce risque **parce que le paiement complet a déjà eu lieu sur Etsy** avant que le lien d'activation ne serve à quoi que ce soit : l'acheteur ne paie rien de plus sur notre plateforme pour obtenir ce qu'il a acheté sur Etsy. Le lien d'activation est une étape de **livraison/activation post-achat**, pas une deuxième transaction. C'est la même mécanique qu'une clé de licence logicielle vendue sur Etsy qui s'active sur le site de l'éditeur, ou qu'un gabarit Canva qui nécessite un compte Canva.

**Risque résiduel à traiter par la formulation de la fiche** :
1. Ne jamais suggérer, même implicitement, que l'acheteur peut/doit payer un supplément **en dehors d'Etsy pour obtenir l'invitation elle-même** (le produit de base doit être intégralement couvert par le prix payé sur Etsy).
2. Pour les **prolongations d'hébergement et autres options** (section 4), qui sont des achats **ultérieurs et distincts**, deux approches possibles :
   - **Recommandée pour le MVP** : vendre aussi les extensions comme des fiches Etsy à part entière (« Prolongation d'hébergement 12 mois — Invitation [marque] ») avec vérification du slug existant à l'activation. Cela reste money-safe vis-à-vis d'Etsy (frais payés dessus) et rassure l'acheteur (même moyen de paiement, avis Etsy).
   - **Alternative à terme** : vente directe sur notre site (Stripe), acceptable **uniquement si elle n'est jamais présentée comme un moyen de compléter ou de débloquer l'achat Etsy initial**, mais comme un service additionnel optionnel proposé bien après la livraison. À formuler avec prudence dans l'UI (« renouvelez votre hébergement — indépendant de votre achat Etsy »).
3. Ne pas collecter ni échanger de coordonnées de paiement via la messagerie Etsy.

**Formulation recommandée pour la fiche (à reprendre en section 5)** :
> « Ce téléchargement numérique contient votre guide de démarrage et le lien d'activation de votre éditeur d'invitation en ligne. Votre invitation est hébergée gratuitement pendant 18 mois, inclus dans le prix de cette fiche. » — en évitant tout vocabulaire d'abonnement (« subscription », « monthly ») pour l'offre de base, réservé aux options futures clairement présentées comme des achats séparés.

### 1.2 Règles sur les produits numériques, services, liens externes, abonnements — synthèse

| Sujet | Règle Etsy | Source |
|---|---|---|
| Article obligatoire | Toute fiche doit vendre un article (physique ou numérique) ; interdiction des fiches sans article réel (dons, cagnottes, petites annonces, codes de parrainage) | [Seller Policy](https://www.etsy.com/legal/sellers/) |
| Fichier numérique | Doit être livré automatiquement à l'achat, identique pour tous les acheteurs ; jusqu'à 5 fichiers par fiche, 20 Mo max par fichier | [How to Manage Your Digital Listings](https://help.etsy.com/hc/en-us/articles/115015628347-How-to-Manage-Your-Digital-Listings) |
| Fichiers volumineux / hébergés ailleurs | Toléré : lien externe dans un PDF téléchargé sur Etsy | [Etsy Policies for Digital Download](https://www.etsy.com/market/etsy_policies_for_digital_download) |
| Services | Interdits en général ; exceptions limitées à des services produisant un livrable concret (design, illustration, montage vidéo livrés en pièce jointe/message Etsy) — le coaching, la réservation, la formation individuelle sont explicitement bannis (mise à jour 2025-2026) | [Services — Our House Rules](https://www.etsy.com/legal/policy/services/242665313101), [CindyLouWho2 — analyse de la mise à jour](https://www.cindylouwho2.com/blog/2025/6/16/etsy-now-allows-shops-to-sell-services-that-the-site-used-to-prohibit) |
| Transactions hors plateforme | Interdit de finaliser hors d'Etsy une transaction commencée sur Etsy, ou d'inciter à payer ailleurs pour le même article (y compris via QR code, lien, coordonnées en message) | [Off-Platform Transactions](https://www.etsy.com/legal/policy/off-platform-transactions/1254654515806) |
| Frais Etsy | Pas d'abonnement obligatoire ; frais de mise en ligne 0,20 $, commission 6,5 % sur le prix (+ livraison), frais de traitement du paiement (Etsy Payments) ~3 % + 0,25 $ selon le pays, frais additionnels si l'achat provient d'une publicité hors Etsy (12-15 %) | [What are the Fees and Taxes for Selling on Etsy?](https://help.etsy.com/hc/en-us/articles/115014483627-What-are-the-Fees-and-Taxes-for-Selling-on-Etsy), [Fees & Payments Policy](https://www.etsy.com/legal/fees/) |
| Abonnements / accès récurrent | Non traité explicitement comme interdit ; le risque est uniquement de facturer une 2ᵉ fois **hors Etsy pour le même achat initial** (voir ci-dessus). Un renouvellement optionnel et distinct, payé plus tard, est une pratique courante (renouvellement de domaine, extension d'hébergement) et n'est pas visée par cette interdiction tant qu'il n'est pas présenté comme complétant l'achat d'origine | Lecture croisée de [Off-Platform Transactions](https://www.etsy.com/legal/policy/off-platform-transactions/1254654515806) et pratique observée (boutiques vendant des gabarits Canva avec renouvellement d'abonnement Canva séparé) |
| Marketplace CE (obligations UE) | Hors périmètre Etsy à proprement parler mais à anticiper : en tant que prestataire du service hébergé (nous), nos propres CGV/mentions légales/RGPD s'appliquent indépendamment des règles Etsy (déjà couvert brief section 9) | — |

**Conclusion section 1.1/1.2** : le modèle est conforme s'il est présenté comme un achat unique donnant droit à un hébergement inclus d'une durée définie, entièrement couvert par le prix Etsy, avec les renouvellements/options vendus séparément et plus tard (idéalement aussi via Etsy). Aucune règle identifiée n'interdit spécifiquement la livraison d'un accès à un service hébergé via un lien dans un téléchargement numérique — c'est une pratique de marché établie et tolérée.

### 1.3 API Etsy Open API v3 : lecture des commandes (receipts) de sa propre boutique

**Oui, c'est possible et c'est exactement le cas d'usage prévu par l'API** (vérifier qu'une commande existe, contient le bon produit, n'a pas déjà été activée — brief section 8, V1).

**Conditions techniques** :

1. **Créer une app développeur Etsy** sur le portail développeur, ce qui donne une **API key (keystring) et un shared secret**. Ces identifiants seuls suffisent pour les points de terminaison publics (fiches, boutiques publiques), mais **pas** pour lire les commandes. Source : [Etsy Open API v3 — Authentication](https://developers.etsy.com/documentation/essentials/authentication/), [discussion GitHub etsy/open-api #1297](https://github.com/etsy/open-api/discussions/1297).
2. **Lire les commandes (`receipts`) nécessite OAuth 2.0 (Authorization Code Grant avec PKCE)**, avec le **scope `transactions_r`** — un jeton propre à notre boutique, obtenu en autorisant notre propre app sur notre propre compte vendeur. Le point de terminaison concerné est `GET /v3/application/shops/{shop_id}/receipts` (avec filtre possible par `receipt_id`, ce qui permet de vérifier un numéro de commande précis saisi par l'acheteur). Source : [Etsy Open API v3 — Authentication](https://developers.etsy.com/documentation/essentials/authentication/), [discussion GitHub etsy/open-api #1297](https://github.com/etsy/open-api/discussions/1297).
3. **Domaine et URI de callback doivent être pré-approuvés par Etsy** avant de pouvoir échanger le code d'autorisation contre un jeton. Source : [Etsy Open API v3 — Authentication](https://developers.etsy.com/documentation/essentials/authentication/).
4. **« Commercial Access »** : pour un usage allant au-delà d'un usage personnel/test (donc pour notre cas, une automatisation en production sur notre propre boutique), il faut demander l'« accès commercial » depuis la page « Apps You've Made », avec **revue manuelle par Etsy** dont le délai varie selon le cas d'usage décrit. Il n'est pas nécessaire d'attendre cette approbation pour lire les commandes de sa **propre** boutique en usage limité (quota par défaut plus bas), mais l'accès commercial est recommandé/requis pour un service en production avec un volume soutenu. Source : [Etsy Open API v3 — Authentication](https://developers.etsy.com/documentation/essentials/authentication/), [Etsy Developer API Guide — Insight Agent](https://www.insightagent.app/guides/etsy-api-integration-guide).

**Conséquence pour le projet** : la vérification manuelle en V0 (admin, brief section 8) reste indispensable au lancement — le temps de créer l'app, faire approuver le domaine/callback et, si besoin, demander l'accès commercial. La V1 automatique (scope `transactions_r`, requête par `receipt_id`) est réalisable techniquement telle que décrite dans le brief, à condition d'anticiper le délai d'approbation Etsy (à démarrer tôt, en parallèle des phases 2-6) et de garder la validation manuelle en secours comme prévu.

---

## 2. Benchmark concurrentiel

| Produit | Canal | Prix constaté | Inclus | Durée d'hébergement | Limites |
|---|---|---|---|---|---|
| **RosieCreativeStudio** (référence brief) | Etsy | ~30 € (souvent promo ~20 €), -40 % en lot avec site assorti | Site Canva 4 pages, formulaire RSVP Canva, guide PDF, bonus imprimable 5x5" | Tant que le compte Canva existe (pas de limite propre au produit) | Édition Canva fragile sur mobile, couleurs des éléments graphiques non modifiables, pas de vrai tableau de bord RSVP, pas de musique auto |
| **Boutiques Etsy génériques « Canva wedding website »** | Etsy | 1,40 $ à 29 $ (souvent affichées en promo -25 à -50 % depuis un prix barré jusqu'à ~29 $) | Gabarit Canva, RSVP intégré basique, compte à rebours | Idem (dépend de Canva) | Mêmes limites que ci-dessus ; qualité très hétérogène d'une boutique à l'autre | 
| **Zola** | Site direct (US) | Site + RSVP + registre gratuits ; domaine personnalisé dès 17,99 $/an | Site, RSVP, registre, outils de planification | Illimité tant que le compte existe | Modèle gratuit financé par la commission sur le registre-cadeaux ; peu de personnalisation visuelle avancée, pas de narration animée au défilement | 
| **Joy / WithJoy** | Site direct (US) | Gratuit ; domaine personnalisé 19,99 $/an | Site (600+ gabarits), RSVP, registre sans frais, appli mobile, cartes numériques (designs premium payants) | Illimité | Design générique de type « constructeur de site », pas d'ouverture d'enveloppe ni de scrollytelling collage |
| **Minted** | Site direct (US) | Gratuit ; URL personnalisée 15 $ (unique) ; crédit de 50 $ vers la papeterie | Site, RSVP, galerie photo en option payante | Illimité | Financé par la vente de papeterie (faire-part imprimés) ; site web très accessoire à l'offre principale |
| **Greenvelope** | Site direct (US) | 19 $ (≤20 invités), 99 $ (≤100), 249 $ (≤250) par envoi, ou abonnement annuel envois illimités | Invitations animées (ouverture d'enveloppe), suivi RSVP, sans publicité | Le temps de l'événement (envoi ponctuel) | Prix qui grimpe vite avec le nombre d'invités ; pas d'éditeur de récit au défilement, format « carte », pas de site multi-chapitres |
| **Paperless Post** | Site direct (US) | Système de « coins » : Free à 0 $, Premium ~1,05 $/invité, ~46-135 $ pour un mariage de 100+ invités | Designs de marque (Rifle Paper Co., Kate Spade…), RSVP en ligne | Le temps de l'événement | Coût élevé à grande échelle, système de coins peu lisible, pas de narration scrollytelling, orienté « carte » plus que « site » |
| **Bliss & Bone** | Site direct (US) | Site web : 15 $/mois (Standard) à 21 $/mois (Premium), essai 7 jours ; invitations en ligne 0,90 $/invité en plus | Site, invitations, monogrammes (40 $+), registre gratuit | Tant que l'abonnement mensuel est payé | Modèle par abonnement récurrent (frein pour un achat unique côté acheteur), écosystème modulaire complexe |
| **Wedvite** | Site direct (concurrent le plus proche du positionnement produit) | 89 $ prix fixe, invités illimités ; jusqu'à 139 $ avec options (musique, cachet de cire personnalisé, croquis du lieu, 2ᵉ langue) | Ouverture d'enveloppe animée avec cachet de cire, 30+ designs, suivi RSVP, éditeur sans compte requis | Non précisé publiquement | Achat unique au prix élevé pour le marché Etsy (frein pour un impulse-buy Etsy), pas de tableau de bord détaillé mis en avant, distribution hors Etsy (marketing à charge du vendeur) |
| **InviteDrop** | Site direct (US) | Gratuit (5 invités), puis « Event Pass » unique : 15,99 $ (≤25), 29,99 $ (≤50), 44,99 $ (≤100), 74,99 $ (illimité) | Ouverture d'enveloppe animée, suivi RSVP, bibliothèque de gabarits, sans marque « propulsé par » | Non précisé (probablement le temps de l'événement) | Positionnement « carte d'invitation » plus que « site narratif » multi-chapitres |

**Enseignements pour le positionnement** :
- Sur Etsy, le marché est habitué à un **achat unique bas de gamme perçu (15-30 €)** pour un produit Canva limité.
- Hors Etsy, les acteurs sérieux (Wedvite, InviteDrop, Greenvelope) vendent entre **19 $ et 139 $** en achat unique ou par palier, ce qui valide qu'un **prix nettement supérieur au marché Canva d'Etsy (mais inférieur au marché SaaS direct) est défendable**, à condition de communiquer clairement la valeur ajoutée (pas de Canva, vrai tableau de bord, narration animée).
- **Aucun concurrent identifié ne combine** : narration scrollytelling façon collage papier + éditeur propriétaire sans Canva + distribution Etsy. C'est un angle différenciant réel.

Sources : [Greenvelope pricing](https://www.greenvelope.com/resources/how-much-does-greenvelope-cost), [Paperless Post pricing analysis](https://www.womangettingmarried.com/paperless-post/), [Bliss & Bone pricing](https://blissandbone.com/wedding-website/features-and-pricing), [Zola wedding website cost](https://www.zola.com/expert-advice/how-much-does-it-cost-to-create-a-wedding-website), [Joy pricing](https://withjoy.com/pricing/), [Minted wedding websites](https://www.minted.com/wedding-websites), [Wedvite pricing (via recherche)](https://wedvite.net/), [InviteDrop pricing](https://www.invitedrop.com/blog/best-digital-invitation-platforms-compared), [Etsy — market Canva save the date](https://www.etsy.com/market/save_the_date_canva_template).

---

## 3. Feuille de route des thèmes

### 3.1 Thème 1 — « Noir & Ivoire » (déjà cadré, référence)
Noir profond, ivoire, vert olive ; polaroïds noir et blanc ; Didone + script calligraphique (Pinyon Script, Mrs Saint Delafield, Allura) — voir `docs/phase-1-cadrage.md`.

### 3.2 Thème 2 — « Terracotta Bloom » (mariage bohème / désert)

- **Nom commercial (EN)** : *Terracotta Bloom*
- **Ambiance** : mariage bohème chaleureux, esprit désert/Provence, linge naturel, fleurs séchées, cire d'abeille — l'opposé chromatique et texturé du noir profond du thème 1.
- **Palette principale (hex)** : sable `#F1E4D3` (fond), terracotta `#C1653A` (accent), rouille profonde `#7A3B2E` (contraste), sauge `#9CAA7C` (feuillage), encre brune `#3B2A22` (texte).
- **Typographies (Google Fonts, licence libre OFL)** : titraille **Fraunces** (serif chaleureux à empattements marqués, alternative douce au Didone), texte courant **Jost** (sans-serif géométrique discret).
- **Écritures script (3)** : **Beau Rivage**, **WindSong**, **Miss Fajardose**.
- **Éléments graphiques** : pampas séchés, ranunculus, brins de lin noué, cachet de cire motif soleil, timbres terracotta, étiquette kraft, aquarelle délavée en fond de scène.
- **Type de photos** : traitement ton chaud/sépia doux (pas de noir et blanc), effet « polaroïd surexposé ».
- **3 palettes alternatives** :
  1. *Sienna Dust* (palette principale ci-dessus).
  2. *Desert Rose* : rose poussiéreux `#D9A79C`, crème `#F7EFE6`, argile `#B5651D`, eucalyptus `#7C8B6F`.
  3. *Amber Dune* : moutarde `#D9A441`, sable `#EFE3CE`, expresso `#4A342A`, sauge `#93A187`.
- **3 écritures script** : Beau Rivage / WindSong / Miss Fajardose (listées ci-dessus).

### 3.3 Thème 3 — « Riviera Postcard » (mariage méditerranéen / carte postale)

- **Nom commercial (EN)** : *Riviera Postcard*
- **Ambiance** : Côte d'Azur / Amalfi, carte postale de voyage, rayures de store, citronnier — très graphique et coloré, à l'opposé des deux autres thèmes (ni noir profond, ni tons terreux).
- **Palette principale (hex)** : cobalt `#1E3A5F` (accent fort), blanc cassé `#FDF8F0` (fond), jaune citron `#E8B923` (accent secondaire), terracotta toit `#C8553D` (ponctuation), vert feuille `#4C7A5E`.
- **Typographies (Google Fonts, licence libre OFL)** : titraille **Bodoni Moda** (Didone graphique et contrasté, esprit affiche de voyage), texte courant **Outfit** (sans-serif contemporain et lisible).
- **Écritures script (3)** : **Playball**, **Alex Brush**, **Yellowtail**.
- **Éléments graphiques** : bords de carte postale dentelés, branches de citronnier, ruban à rayures façon store de plage, timbres à motifs méditerranéens, cachet postal en forme de soleil, tissu vichy en fond de scène, coquillage.
- **Type de photos** : couleur vive, grain pellicule légèrement délavé au soleil (pas de noir et blanc), cadrage façon carte postale (bordure blanche dentelée plutôt que polaroïd carré).
- **3 palettes alternatives** :
  1. *Côte d'Azur* (palette principale ci-dessus).
  2. *Positano Sunset* : corail `#E8735C`, blanc `#FFF8EE`, turquoise `#3E8E8E`, or `#D8A83B`.
  3. *Capri Citrus* : citron `#F4C430`, azur `#2F6690`, blanc `#FCFBF6`, olive `#6E7F4B`.
- **3 écritures script** : Playball / Alex Brush / Yellowtail (listées ci-dessus).

Les deux thèmes réutilisent exactement la mécanique validée (enveloppe → scrollytelling collage, `sticky` + seuils, personnalisation palette/script) : seuls les visuels, couleurs et polices changent, conformément à l'architecture de thèmes du brief (section 7.2).

### 3.4 Feuille de route à 12 variantes/thèmes futurs (priorisée)

| # | Thème | Ambiance en une ligne | Potentiel commercial US |
|---|---|---|---|
| 1 | Rustic Barn Wedding | Bois brut, toile de jute, fleurs des champs, kraft — le grand classique du mariage américain champêtre | **Fort** |
| 2 | Vintage Botanical Garden Wedding | Sauge et rose poudré, botanique pressée, jardin anglais, ruban de soie | **Fort** |
| 3 | Baby Shower « Coming Soon » | Pastel doux, nuages, échographie encadrée façon polaroïd, cigogne graphique | **Fort** |
| 4 | Quinceañera Fiesta | Rose fuchsia et or, papier découpé façon piñata, couronne, confettis | **Fort** |
| 5 | Black Tie Art Deco Wedding | Noir, or, émeraude, motifs géométriques, ambiance gala new-yorkais | **Moyen-fort** |
| 6 | Tropical Destination Wedding | Palmier, hibiscus, corail, ambiance mariage à l'étranger / mini-moon | **Moyen** |
| 7 | Modern Minimalist « Quiet Luxury » Wedding | Beige, ivoire, ligne fine, arche minimaliste, typographie éditoriale | **Moyen** |
| 8 | Bar/Bat Mitzvah Collage | Photo-collage énergique, néon doux, étoile de David graphique, ambiance ado | **Moyen** |
| 9 | Milestone Anniversary / Vow Renewal | Chronologie photo du couple dans le temps, ton doré nostalgique | **Moyen** |
| 10 | Christening / Baptism | Blanc et bleu poudré ou blanc et vert sauge, colombe, croix discrète, dentelle | **Moyen** |
| 11 | Corporate Gala Save-the-Date | Sobre, logo-friendly, ambiance soirée d'entreprise/lancement produit | **Niche** (vente B2B hors Etsy) |
| 12 | Retirement Party « Cheers to the Next Chapter » | Collage photo carrière, ton chaleureux, humour léger | **Niche** |

Logique de priorisation : les thèmes 1-4 ciblent des marchés Etsy déjà prouvés à très fort volume de recherche (mariage champêtre et bohème-jardin, baby shower, quinceañera — marché latino-américain aux États-Unis particulièrement dépensier sur ce type d'événement). Les thèmes 5-10 adressent des niches solides mais plus étroites. Les thèmes 11-12 sortent du cœur de cible Etsy grand public (achat impulsif, budget particulier) et demanderaient un canal de vente B2B ou une clientèle plus ciblée — à ne considérer qu'après consolidation du cœur mariage/événements familiaux.

---

## 4. Options payantes (upsells)

| Option | Prix suggéré | Effort de développement | Dépendances techniques |
|---|---|---|---|
| Prolongation d'hébergement (+12 mois) | 12 $ / 12 € | **Faible** | Job planifié de renouvellement, facturation associée au `slug` existant |
| Domaine personnalisé | 15 $/an / 15 €/an | **Moyen** | Hostnames personnalisés + SSL automatique (ex. Cloudflare for SaaS), coût variable par domaine actif à répercuter |
| Invitations nominatives par foyer (jusqu'à N foyers) | 12 $ / 12 € (pack) | **Moyen-fort** | Modèle de données multi-liens par invitation (déjà identifié « hors MVP » dans le brief, section 5), génération de liens et suivi par foyer |
| Musique de fond (lecture au toucher) | 6 $ / 6 € | **Faible-moyen** | Licence de bibliothèque musicale libre de droits commerciale (coût récurrent mutualisé), lecteur audio conforme `prefers-reduced-motion` |
| Langue supplémentaire (au-delà de FR/EN, ex. ES/DE) | 8 $ / 8 € par langue | **Moyen** | Extension du schéma i18n déjà prévu (next-intl), traduction des textes d'interface du thème |
| Imprimables assortis (PDF faire-part + QR) | 10 $ / 10 € | **Moyen** | Génération PDF côté serveur à partir du contenu existant (mise en page dérivée du thème) |
| Thème assorti « site de mariage complet » (pages détails, programme étendu, hébergements, FAQ, cortège) | 19 $ / 18 € | **Fort** | Nouvelles sections de contenu (schéma étendu), nouvelles vues du thème, navigation multi-pages |
| Retrait du bandeau « propulsé par » | 5 $ / 5 € | **Faible** | Simple bascule d'affichage conditionnée à l'option achetée |
| Export des réponses avancé (tableur formaté, filtre régime, vue imprimable) | 6 $ / 6 € | **Faible-moyen** | Génération de export enrichi (XLSX/PDF) côté tableau de bord |
| Envoi d'e-mails aux invités depuis la plateforme | 12 $ / 12 € | **Fort** | Liste d'invités avec e-mails, infrastructure d'envoi en masse conforme (délivrabilité, désinscription, RGPD/CAN-SPAM) |
| Rappels automatiques avant la date limite RSVP | 5 $ / 5 € | **Moyen** | Suppose la liste d'invités avec e-mail (dépend en partie de l'option précédente ou d'une saisie manuelle), tâche planifiée + Resend |
| Galerie photo partagée après le mariage | 9 $ / 9 € | **Moyen** | Upload invité (stockage R2 additionnel), modération basique, lien d'accès dédié |
| Cagnotte / liste de mariage (agrégateur de liens vers services tiers) | Inclus gratuitement, ou 4 $ / 4 € si mise en page dédiée | **Faible** | Simples champs de lien vers des services externes existants (pas de collecte de paiement propre — évite toute complexité PCI/DSP2) |
| Plan de table interactif | 15 $ / 15 € | **Fort** | Interface glisser-déposer, modèle de données tables/places, lié aux réponses RSVP |

**Recommandation de packaging** : proposer un **lot « Essentiel + »** (musique + retrait du bandeau + export avancé, ~15 $/15 €) et un **lot « Prestige »** (domaine personnalisé + prolongation 12 mois + imprimables, ~35 $/33 €), à l'image du lot -40 % pratiqué par RosieCreativeStudio (brief section 2.1) — les lots augmentent le panier moyen sans multiplier les décisions d'achat.

---

## 5. Structure d'une fiche Etsy — Thème 1 « Noir & Ivoire »

### 5.1 Titre optimisé (130/140 caractères)

> **Black & Ivory Wedding Website Template No Canva Needed | Animated Digital Invitation Envelope Opening RSVP | Save the Date Website**

(130 caractères — respecte la limite de 140 caractères, source : [Etsy Character Limits](https://www.listing-forge.com/blog/etsy-character-limits)).

### 5.2 13 tags (≤ 20 caractères chacun)

| # | Tag | Caractères |
|---|---|---|
| 1 | wedding website | 15 |
| 2 | save the date | 13 |
| 3 | digital invitation | 18 |
| 4 | animated invite | 15 |
| 5 | wedding rsvp site | 17 |
| 6 | no canva needed | 15 |
| 7 | black wedding invite | 20 |
| 8 | editable website | 16 |
| 9 | wedding invite link | 19 |
| 10 | save the date site | 18 |
| 11 | wedding envelope | 16 |
| 12 | boho wedding site | 17 |
| 13 | interactive invite | 18 |

(Limite de 13 tags de 20 caractères max chacun, source : [Etsy Character Limits](https://www.listing-forge.com/blog/etsy-character-limits)).

### 5.3 Description complète (EN)

> **Black & Ivory — An Animated Wedding Website That Opens Like a Real Letter**
>
> No Canva account. No broken layouts on mobile. Just a beautiful, guided editor and a real RSVP dashboard.
>
> Your guests tap a black envelope — it flips, the wax seal cracks, the flap opens, and your save-the-date ticket and photos slide out. Then they scroll through your story, your date, your program and your venue, laid out like a paper collage: black-and-white polaroids, torn paper notes, postage stamps, and white flowers on deep black and warm ivory.
>
> **What you get**
> - Lifetime access to our guided editor (no design software, no Canva account)
> - The "Black & Ivory" animated wedding website theme, with 3 color palettes and 3 signature scripts
> - Your own unique link (yoursite.com/your-names) to share by text, email, WhatsApp or QR code
> - A downloadable QR code (PNG/SVG) and ready-to-send invite messages in English and French
> - A built-in RSVP form with a live response dashboard, guest counts, and CSV export
> - Automatic email notification each time a guest RSVPs
> - Add-to-calendar (.ics) for your guests
> - 18 months of hosting included from the day you publish
> - Bilingual guests page (English/French) if you need it
>
> **How it works — 4 steps**
> 1. **Buy this listing.** Your instant download contains your activation link and a quick-start guide.
> 2. **Activate.** Enter your Etsy order number and email on our activation page — you'll get a secure magic-link sign-in, no password needed.
> 3. **Customize.** Add your names, date, photos, story, program and venue in our step-by-step editor, with a live preview next to every field. Pick your palette and script.
> 4. **Publish & share.** Choose your link, publish, and share it however you like. Come back anytime to edit — changes appear instantly for your guests.
>
> **Hosting & timing**
> Your invitation stays live for **18 months** after you publish it — more than enough for engagement, wedding day, and photo sharing afterward. Need more time? Hosting extensions are available separately whenever you need them.
>
> **No Canva needed — ever**
> Unlike Canva-based wedding website templates, nothing can break when you resize a photo or move a text box. Every layout is guided and tested on real phones. Colors — including on illustrations like the envelope, wax seal and stamps — are genuinely customizable, not fixed images.
>
> **FAQ**
> - *Do I need a Canva account?* No — everything happens in our own editor, no third-party software or account required beyond your own login.
> - *Will it work on my guests' phones?* Yes — the experience is built mobile-first and tested on iOS and Android.
> - *Can I edit after publishing?* Yes, anytime, and changes go live immediately on your existing link.
> - *How long is my invitation hosted?* 18 months from publication, included in this listing. Extensions available separately.
> - *Can I add real photos?* Yes — upload your own engagement or couple photos; we handle the black-and-white treatment.
> - *Is there really an RSVP dashboard?* Yes — a real dashboard with guest names, headcounts, dietary notes, CSV export, and email alerts, not a basic form.
> - *What if I need help?* Message us anytime through Etsy — we're happy to help with activation or customization questions.

### 5.4 Prix de lancement et prix barré

Voir raisonnement détaillé en section 6. Résumé pour la fiche :
- **Prix de lancement** : 29 $ USD (prix barré 49 $ USD) — soit une remise affichée de 41 %, cohérente avec les codes du marché Canva observés en benchmark (section 2).
- **Prix cible après phase de lancement** : 39 $ USD (prix barré 59 $ USD).

### 5.5 Contenu du PDF de livraison — plan en 1 page

1. **En-tête** : logo/nom de marque, titre « Bienvenue — votre invitation Black & Ivory vous attend », visuel discret assorti au thème.
2. **Bloc « 3 étapes pour commencer »** : (1) note votre numéro de commande Etsy, (2) rendez-vous sur `[marque].com/activer`, (3) saisis commande + e-mail, reçois ton lien magique.
3. **Bouton/lien d'activation** bien visible (texte du lien en clair, cliquable dans le PDF).
4. **Encart réassurance** : « 18 mois d'hébergement inclus », « aucun compte Canva requis », « support via message Etsy ».
5. **Bas de page** : lien vers la FAQ complète, lien vers la messagerie Etsy pour toute question, mentions légales minimales (marque, contact).

---

## 6. Prix et durée d'hébergement — recommandation

### 6.1 Recommandation

| Paramètre | Recommandation |
|---|---|
| Prix de lancement | **29 $ USD** (≈ 27 €) |
| Prix barré au lancement | 49 $ USD |
| Prix cible en régime établi | **39 $ USD** (≈ 36 €), prix barré 59 $ USD |
| Durée d'hébergement incluse | **18 mois** à compter de la publication (repris tel quel du brief) |
| Prolongation | 12 $ USD / 12 € pour +12 mois (voir section 4) |

### 6.2 Justification

- **Ancrage vs Etsy** : le marché Etsy des sites Canva se situe entre 1,40 $ et 30 $, avec le best-seller de référence à ~30 € (souvent en promo ~20 €). Se positionner à **29 $** place le produit **au niveau haut du marché Etsy Canva actuel**, ce qui est cohérent avec une offre objectivement supérieure (vrai éditeur, vrai tableau de bord RSVP, couleurs des illustrations personnalisables) sans pour autant sortir de la zone de prix « achat impulsif » propre à Etsy — au-delà de ~40-50 $, le taux de conversion sur Etsy chute fortement pour ce type de produit numérique.
- **Ancrage vs marché direct** : les concurrents SaaS les plus proches (Wedvite à 89 $, InviteDrop jusqu'à 74,99 $, Greenvelope jusqu'à 249 $) valident qu'un produit de cette qualité vaut largement plus que 29-39 $ en valeur perçue — ce qui laisse une marge de progression de prix confortable une fois la preuve sociale (avis Etsy) installée, et justifie le prix barré élevé (n'est pas un artifice : un produit équivalent hors Etsy coûterait objectivement plus cher).
- **Logique de prix barré** : la quasi-totalité des fiches concurrentes sur Etsy (RosieCreativeStudio et les boutiques génériques) affichent une réduction de 25 à 50 % par rapport à un prix « catalogue » — reproduire ce code (prix barré à 49 $ / 59 $, soit -41 % / -34 %) est un signal de marché attendu par l'acheteur Etsy et augmente le taux de clic.
- **Phasage** : démarrer à 29 $ pendant les 2-3 premiers mois (phase d'acquisition des premiers avis, priorité au volume de ventes et à la preuve sociale plutôt qu'à la marge), puis remonter à 39 $ une fois un socle d'avis constitué (recommandation usuelle de croissance progressive des prix sur Etsy après les 30-50 premières ventes).
- **Durée de 18 mois** : cohérente avec le cycle réel d'usage observé chez les concurrents à durée limitée dans le temps (Greenvelope, Paperless Post : le temps de l'événement uniquement) tout en étant **plus généreuse qu'eux**, ce qui devient un argument de vente (« vos invités peuvent revoir votre histoire après le mariage »italique, photos de repas compris) — 18 mois couvre typiquement la période fiançailles → mariage (souvent 12-14 mois aux US) + plusieurs mois après pour la nostalgie/partage de photos, sans faire porter indéfiniment le coût d'hébergement par nous.
- **Prolongation à 12 $/12 mois** : prix volontairement bas pour maximiser le taux d'attachement (upsell à faible friction) plutôt que la marge unitaire, cohérent avec un coût d'hébergement Cloudflare marginal très faible par invitation (D1/R2/Workers, brief section 6).

---

*Sources générales consultées : pages officielles d'aide et de règles Etsy ([Seller Policy](https://www.etsy.com/legal/sellers/), [Services](https://www.etsy.com/legal/policy/services/242665313101), [Off-Platform Transactions](https://www.etsy.com/legal/policy/off-platform-transactions/1254654515806), [Fees & Payments Policy](https://www.etsy.com/legal/fees/), [Digital Listings](https://help.etsy.com/hc/en-us/articles/115015628347-How-to-Manage-Your-Digital-Listings)), documentation développeur ([Etsy Open API v3 — Authentication](https://developers.etsy.com/documentation/essentials/authentication/)), et sites publics des concurrents cités en section 2.*
