# Identité de marque Unfurl

> Planche visuelle à ouvrir sur téléphone : `identite-unfurl.html` (fichier HTML autonome, republiée à la même adresse ; la version du tour 1 reste dans son historique). Ce document en reprend la substance ; les SVG des logos sont en annexe de chaque tour.

**Décisions fixées** : nom **Unfurl** · domaine **unfurlme.love** · lien invité type `unfurlme.love/zoe-and-dylan` · marché US d'abord, puis francophone.

---

## Tour 2 : le courrier (septembre 2026)

**Retour sur le tour 1** : les trois directions (Le Pli, La Crosse, Unfurl me) sont intéressantes, sans coup de cœur. Le concept doit tourner autour de la lettre qu'on reçoit puis qu'on ouvre : le plaisir, un peu rétro et devenu rare, de trouver un courrier personnel dans sa boîte aux lettres, qu'Unfurl reproduit en digital sans prétendre l'égaler. Ce ton rétro est repris par le « collage digital » du produit, à creuser pour l'identité.

**Principe** : ce tour suit une lettre dans l'ordre où on la vit. Elle **arrive** (A), on l'**ouvre** (B), on **déplie** ce qu'elle contient (C). Chaque direction prend un moment et en tire une identité.

**Règles communes** :

- La marque est l'enveloppe, les thèmes sont les lettres : l'identité encadre (casier, doublure, planche), elle ne décore jamais le contenu.
- Des couleurs de vrai courrier (bleu émail, rouge d'oblitération, doublure vert d'eau, violet de tampon, vert de timbre) ; ni kraft, ni crème, ni terracotta.
- Rétro mais pas vieillot : des références précises (signalétique postale, papeterie gravée, fanzine), exécutées au net.

### Direction A — Le Drapeau levé (*Flag Up*) · moment 1 : Arriver

**Concept** : Unfurl est une petite poste privée qui ne distribue que des bonnes nouvelles. Son signe : le drapeau rouge levé sur la boîte aux lettres, qui dit « il y a du courrier pour vous ». Et un drapeau, en anglais, ça se déploie : to unfurl.

**Logotype : `unfurl`** — « unfurl » seul, en capitales d'enseigne condensées : le « l » devient la hampe, le drapeau se déploie au bout. Le domaine vit dans l'oblitération « UNFURLME.LOVE · GOOD NEWS DEPT. », tamponnée sur chaque PDF, chaque emballage, chaque story.

#### Logo

- **Logotype** : « unfur » en Big Shoulders Display 900 vectorisé, approche ouverte ; le « l » redessiné en hampe, plus haute que les ascendantes, porte un drapeau rouge au bord flottant. Au survol, le drapeau se déploie.
- **Symbole** : Une boîte aux lettres de face, en trois formes : l'arche de la porte, le poteau, le drapeau levé.
- **Micro-animation d'ouverture** : La porte bascule vers l'avant, une lettre apparaît, le drapeau ondule (0,9 s). CSS seul, déclenchée au survol ou au toucher (focus), désactivée si `prefers-reduced-motion`.
- **Favicon 32 et 16 px** : Arche et drapeau réduits à deux aplats, sans poignée ni ondulation : net à 16 px.
- **Tampon** : Oblitération ronde « UNFURLME.LOVE · GOOD NEWS DEPT. » avec la date et une flamme ondulée.

#### Palette

| Nom | Hex | Rôle |
|---|---|---|
| Blanc guichet | `#F4F5F1` | Fond principal : le blanc froid des formulaires et des guichets |
| Bleu émail | `#1E3F9A` | Couleur de marque : plaques émaillées, casiers, boutons, grands aplats |
| Nuit postale | `#101A33` | Texte, logotype sur fond clair |
| Rouge drapeau | `#D93A26` | Le drapeau et l'encre d'oblitération, rien d'autre |
| Zinc | `#BCC4CC` | Le métal galvanisé de la boîte : filets, casiers (jamais pour du texte) |
| Jaune avis | `#F5C843` | Avis de passage, pastilles « nouveau », toujours avec Nuit postale |

Contrastes de texte vérifiés (WCAG 2.1) :

| Texte | Fond | Ratio | Niveau |
|---|---|---|---|
| Nuit postale | Blanc guichet | 15,8:1 | AAA |
| Bleu émail | Blanc guichet | 8,6:1 | AAA |
| Blanc guichet | Bleu émail | 8,6:1 | AAA |
| Nuit postale | Jaune avis | 10,9:1 | AAA |
| Rouge drapeau | Blanc guichet | 4,2:1 | AA grand texte (≥ 24 px) et graphisme |

#### Typographies (Google Fonts, licence OFL, auto-hébergeables)

| Police | Rôle | Graisses | Pourquoi |
|---|---|---|---|
| Big Shoulders Display | Logotype, titres, oblitérations | 800 · 900 | Grotesque condensée née de la signalétique municipale de Chicago : l'enseigne du bureau de poste, sans nostalgie appuyée. |
| Public Sans | Texte, interface, boutons | 400 · 600 · 700 | Dessinée pour les services publics américains : neutre et très lisible, le ton d'un guichet bien tenu. |
| DM Mono | Champs de formulaire, dates, codes | 400 · 500 | La voix du formulaire et du tampon dateur : codes d'activation, dates, « unfurlme.love/… ». |

Échelle :

| Niveau | Police | Taille / interligne | Graisse | Approche | Exemple |
|---|---|---|---|---|---|
| Display | Big Shoulders Display | 3.5rem / .95 | 900 | 0 | Good news, delivered. |
| Titre 2 | Big Shoulders Display | 2.25rem / 1 | 800 | .01em | Flag's up. Something came for you. |
| Titre 3 | Public Sans | 1.25rem / 1.3 | 600 | 0 | Personnalisée en 10 minutes |
| Texte | Public Sans | 1rem / 1.6 | 400 | 0 | Une invitation qui arrive comme une vraie lettre : un lien, un drapeau levé, puis une enveloppe à ouvrir. |
| Étiquette | DM Mono | .75rem / 1.3 | 500 | .08em | FOR: ZOE & DYLAN · 12 JUN 2027 |

#### Ton de voix

**serviable, net, enjoué**. Le ton d'un guichetier qui aime son métier : phrases courtes, vocabulaire postal (livré, oblitéré, à retirer), un humour sec. Aucun point d'exclamation. On vouvoie.

| Usage | EN | FR |
|---|---|---|
| Tagline | Good news, delivered. | Les bonnes nouvelles, à domicile. |
| Bouton | Send your first letter | Envoyer ma première lettre |
| Après le RSVP | Reply received and postmarked Sept. 23. Zoe & Dylan will have it today. | Réponse reçue, oblitérée le 23 septembre. Zoe et Dylan l'auront aujourd'hui. |

#### Mises en situation (sur la planche)

SMS reçu avec `unfurlme.love/zoe-and-dylan` et aperçu « A letter for Carol » sur plaque bleue · bannière Etsy 3360 × 840 : un casier de tri dont les cinq cases portent cinq thèmes opposés (mariage noir, baby shower pastel, anniversaire bohème, fête méditerranéenne, fête d'enfant) · vignette carrée avec arguments en cases cochées · en-tête de vitrine avec fente à lettres « LETTERS » d'où glissent les thèmes · **élément propre** : le PDF de livraison Etsy en avis de passage jaune (pour, objet, à retirer sur unfurlme.love/activate, code, durée).

#### Clientèle US, forces, risques

**Clientèle** : Le grand public Etsy américain, des mariages de petite ville aux fêtes de famille : ceux qui envoient encore des cartes et aimantent les « save the date » sur le frigo. Chaque Américain reconnaît le drapeau de boîte aux lettres. Couvre aussi naissances, remises de diplôme, fêtes de fin d'année et d'entreprise. Prix cible 29 à 39 $.

**Forces**

- Le nom, le symbole et le geste disent la même chose : a flag unfurls. Rien à expliquer aux anglophones.
- Il prend le seul moment que les thèmes ne racontent pas : l'arrivée. L'ouverture reste aux invitations, donc aucune concurrence avec leur enveloppe.
- Le plus lisible en petit : une arche bleue et un drapeau rouge tiennent à 16 px et dans l'avatar rond d'Etsy.
- Le bleu émail fait un cadre solide (casier, plaque) devant lequel un thème noir, pastel ou enfant reste lui-même.

**Risques**

- Voisinage avec l'imaginaire USPS : jamais d'aigle, ni « U.S. Mail », ni leur bleu exact ; recherche d'antériorité avant dépôt.
- Bleu, rouge et blanc peuvent virer au patriotique : le rouge reste cantonné au drapeau et à l'encre, jamais d'étoiles.
- La boîte à drapeau parle moins aux francophones (boîtes murales) : en français, on s'appuie sur l'oblitération et l'avis de passage.


### Direction B — La Doublure (*The Liner*) · moment 2 : Ouvrir

**Concept** : Quand on ouvre une belle enveloppe, on voit d'abord sa doublure, avant la lettre. Unfurl est cette doublure : un motif discret qui cache le contenu, puis le révèle. L'enveloppe, c'est la marque ; la lettre, c'est le thème.

**Logotype : `unfurl`** — « unfurl » seul, composé comme un en-tête de papier à lettres gravé. L'écriture manuscrite appartient à l'expéditeur, pas à la marque : c'est elle qui écrit « unfurlme.love/zoe-and-dylan » à la main, comme une adresse, sur l'enveloppe de l'aperçu de lien.

#### Logo

- **Logotype** : « unfurl » en Ibarra Real Nova 400 vectorisé, approche légèrement resserrée, sans artifice : la retenue d'un en-tête gravé.
- **Symbole** : Le dos d'une enveloppe à rabat arrondi : le rabat dessine un « u ».
- **Micro-animation d'ouverture** : Le rabat se retourne, la doublure apparaît, la lettre sort de la poche (1 s). CSS seul, déclenchée au survol ou au toucher (focus), désactivée si `prefers-reduced-motion`.
- **Favicon 32 et 16 px** : Enveloppe pleine, rabat en « u » épaissi en blanc, sur fond Nil : lisible à 16 px.
- **Tampon** : Timbre sec : gaufrage blanc sur blanc « UNFURLME.LOVE · CORRESPONDANCE ».

#### Palette

| Nom | Hex | Rôle |
|---|---|---|
| Vélin | `#FAFBF9` | Fond principal : un papier vélin blanc, sans teinte crème |
| Encre | `#15181E` | Texte, logotype, enveloppe |
| Nil | `#C3E2DD` | Le bleu-vert pâle des doublures : fond du motif, surfaces douces |
| Canard | `#1B5A61` | Accent : boutons, liens, motif de sécurité |
| Pelure | `#E9EEEC` | Papier pelure : cartes, champs, zones secondaires |
| Filet | `#92A29F` | Filets et réglures (jamais pour du texte) |

Contrastes de texte vérifiés (WCAG 2.1) :

| Texte | Fond | Ratio | Niveau |
|---|---|---|---|
| Encre | Vélin | 17,1:1 | AAA |
| Canard | Vélin | 7,5:1 | AAA |
| Vélin | Canard | 7,5:1 | AAA |
| Encre | Nil | 12,9:1 | AAA |
| Canard | Nil | 5,7:1 | AA |
| Encre | Pelure | 15,2:1 | AAA |

#### Typographies (Google Fonts, licence OFL, auto-hébergeables)

| Police | Rôle | Graisses | Pourquoi |
|---|---|---|---|
| Ibarra Real Nova | Logotype, titres, italiques | 400 · 600 · 400 italique | Romain espagnol du XVIIIe siècle, redessiné : l'élégance d'un en-tête gravé, des italiques de correspondance. |
| Instrument Sans | Texte, interface, boutons | 400 · 500 · 600 | Grotesque étroite et nette : elle s'efface derrière le serif, comme le papier derrière l'encre. |
| Nothing You Could Do | Adresse manuscrite, prénoms (20 px minimum) | 400 | Une écriture au stylo, penchée mais lisible, réservée à ce que l'expéditeur « écrit » : l'adresse, « for Carol ». |

Échelle :

| Niveau | Police | Taille / interligne | Graisse | Approche | Exemple |
|---|---|---|---|---|---|
| Display | Ibarra Real Nova | 3.5rem / 1 | 400 | -.01em | The envelope is ours. |
| Titre 2 | Ibarra Real Nova | 2.25rem / 1.1 | italic 400 | 0 | The letter is yours. |
| Titre 3 | Instrument Sans | 1.25rem / 1.3 | 600 | 0 | Personnalisée en 10 minutes |
| Texte | Instrument Sans | 1rem / 1.6 | 400 | 0 | Une invitation qui s'ouvre comme une vraie lettre, avec une doublure qui révèle ce qu'elle cache. |
| Manuscrit | Nothing You Could Do | 1.75rem / 1.2 | 400 | 0 | For Aunt Carol |
| Étiquette | Instrument Sans | .75rem / 1.3 | 600 | .16em | CORRESPONDANCE · UNFURLME.LOVE |

#### Ton de voix

**attentionné, sobre, intime**. Le ton d'une lettre bien écrite : on s'adresse à une personne, jamais à « vos invités ». Phrases posées, pas d'exclamation, pas de jargon. On vouvoie.

| Usage | EN | FR |
|---|---|---|
| Tagline | The envelope is ours. The letter is yours. | L'enveloppe est à nous. La lettre est à vous. |
| Bouton | Write your letter | Écrire votre lettre |
| Après le RSVP | Your reply is sealed. It's waiting for Zoe & Dylan. | Votre réponse est cachetée. Elle attend Zoe et Dylan. |

#### Mises en situation (sur la planche)

SMS reçu avec aperçu d'une enveloppe adressée à la main « For Aunt Carol » · bannière Etsy : cinq enveloppes identiques ouvertes, doublure visible, cinq lettres différentes (les mêmes cinq thèmes) · vignette carrée avec enveloppe ouverte et prénom manuscrit · en-tête de vitrine composé comme un papier à en-tête · **élément propre** : le PDF de livraison sur papier à en-tête, posé sur la doublure, avec code et timbre sec.

#### Clientèle US, forces, risques

**Clientèle** : Les couples qui ont l'œil pour la papeterie : mariages urbains et élégants, cérémonies en petit comité, clientèle qui aurait commandé un faire-part gravé. Aussi les organisatrices d'événements d'entreprise haut de gamme. Prix cible 39 à 55 $.

**Forces**

- La plus fidèle à l'idée « la marque est l'enveloppe » : la doublure encadre, la lettre (le thème) passe devant.
- Le cadre le plus neutre : blanc, encre et un motif pâle ; du noir chic à l'enfant, tous les thèmes s'y posent sans conflit.
- Signal de prix élevé ; le timbre sec (gaufrage blanc sur blanc) signe les documents sans ajouter de couleur.
- Le symbole est une lettre : le rabat arrondi de l'enveloppe dessine un « u ».

**Risques**

- Paperless Post a fait des doublures d'enveloppe sa signature : voisinage à surveiller, d'où un motif de sécurité (jamais floral) et le rabat en « u ».
- Discrète : se remarque moins dans une grille de résultats Etsy, et le motif disparaît sous 40 px.
- Une enveloppe évoque l'icône d'e-mail : sans le rabat en « u », le symbole deviendrait générique.


### Direction C — Découpé-collé (*Cut & Paste*) · moment 3 : Déplier

**Concept** : Le courrier d'une amie, celui d'où tombent des choses : une photo, un billet, un mot scotché. Unfurl montre ses coutures (ciseaux, scotch, photocopie, tampon encreur) : le collage fait main, passé à l'écran.

**Logotype : `unfurl me`** — « unfurl me » : les six lettres d'« unfurl » découpées dans quatre papiers, « me » tamponné à l'encre violette. Le domaine devient le tampon : « unfurl me · UNFURLME.LOVE · date ».

#### Logo

- **Logotype** : « unfurl » en Bricolage Grotesque 800 vectorisé, chaque lettre sur sa découpe (violet, blanc, timbre vert, toner), angles de ciseaux irréguliers ; « me » tamponné en violet, avec une texture d'encre.
- **Symbole** : Un « u » découpé dans un timbre violet, scotché par deux coins sur un timbre vert.
- **Micro-animation d'ouverture** : Le scotch de droite se décolle, le « u » pivote sur son coin et découvre « me » (0,7 s). CSS seul, déclenchée au survol ou au toucher (focus), désactivée si `prefers-reduced-motion`.
- **Favicon 32 et 16 px** : Le « u » blanc sur timbre violet ; à 16 px, les dents du timbre laissent place à un carré plein.
- **Tampon** : Tampon encreur rectangulaire « unfurl me · UNFURLME.LOVE · date », encre violette texturée.

#### Palette

| Nom | Hex | Rôle |
|---|---|---|
| Photocopie | `#EDEDE9` | Fond principal : le gris léger d'une photocopie |
| Blanc découpe | `#FFFFFF` | Papiers découpés, cartes |
| Toner | `#141414` | Texte, lettres découpées |
| Violet tampon | `#5436B8` | L'encre du tampon encreur : accent, boutons, « me » |
| Vert timbre | `#1F7A4D` | Le vert des timbres anciens : timbres, étiquettes |
| Scotch | `#F1E39A` | Ruban adhésif translucide (à 80 % d'opacité), surlignage |

Contrastes de texte vérifiés (WCAG 2.1) :

| Texte | Fond | Ratio | Niveau |
|---|---|---|---|
| Toner | Photocopie | 15,7:1 | AAA |
| Violet tampon | Photocopie | 6,9:1 | AA |
| Blanc découpe | Violet tampon | 8,1:1 | AAA |
| Blanc découpe | Vert timbre | 5,3:1 | AA |
| Toner | Scotch | 14,2:1 | AAA |

#### Typographies (Google Fonts, licence OFL, auto-hébergeables)

| Police | Rôle | Graisses | Pourquoi |
|---|---|---|---|
| Bricolage Grotesque | Logotype, titres, texte | 400 · 600 · 800 | Grotesque aux formes un peu irrégulières, avec corps optiques : assez de caractère pour les lettres découpées, assez sage pour le texte. |
| Courier Prime | Légendes, étiquettes, dates | 400 · 700 | La machine à écrire du fanzine et de l'étiquette collée, redessinée pour rester lisible à l'écran. |

Échelle :

| Niveau | Police | Taille / interligne | Graisse | Approche | Exemple |
|---|---|---|---|---|---|
| Display | Bricolage Grotesque | 3.5rem / .95 | 800 | -.03em | Cut, paste, send love. |
| Titre 2 | Bricolage Grotesque | 2.25rem / 1.05 | 800 | -.02em | Your news, handmade. |
| Titre 3 | Bricolage Grotesque | 1.25rem / 1.3 | 600 | 0 | Personnalisée en 10 minutes |
| Texte | Bricolage Grotesque | 1rem / 1.6 | 400 | 0 | Une invitation assemblée comme un collage : photos, papiers, tampons, et un lien pour l'envoyer. |
| Étiquette | Courier Prime | .8125rem / 1.3 | 700 | .02em | RSVP by May 1 · unfurlme.love |

#### Ton de voix

**complice, fait main, joyeux**. Le ton d'un mot glissé entre deux photos : complice, spontané, un point d'exclamation par écran au maximum. On tutoie en français.

| Usage | EN | FR |
|---|---|---|
| Tagline | Cut, paste, send love. | Découpe, colle, envoie de l'amour. |
| Bouton | Start my collage | Je commence mon collage |
| Après le RSVP | Stuck on their fridge! Zoe & Dylan have your reply. | Collée sur leur frigo ! Zoe et Dylan ont ta réponse. |

#### Mises en situation (sur la planche)

SMS reçu avec aperçu en lettres découpées « made you something » et thème scotché · bannière Etsy : les cinq mêmes thèmes scotchés sur une photocopie, un coup de tampon · vignette carrée titre découpé, téléphone scotché, tampon · en-tête de vitrine « Cut, paste, send love. » · **élément propre** : planche de stickers (logotype, timbre SAVE THE DATE, tampon RSVP'd, scotch OPEN ME, pastille unfurlme.love).

#### Clientèle US, forces, risques

**Clientèle** : Millennials et Gen Z créatifs, le public du scrapbooking et du junk journal (très présent sur Etsy et TikTok) : anniversaires, baby showers, EVJF, mariages décontractés ou maximalistes. Découverte par TikTok, Instagram et Pinterest. Prix cible 19 à 29 $.

**Forces**

- Prolonge directement le « collage digital » du produit : marque et invitations parlent la même langue.
- La plus partageable : stickers, tampons et lettres découpées se déclinent seuls en stories et en Reels.
- « unfurl me » : l'injonction et le domaine forment un tampon qu'on retient.

**Risques**

- Elle joue dans le même registre que les thèmes (papiers, scotch, timbres) : risque réel de concurrence avec les invitations, surtout les thèmes collage.
- Moins crédible pour un thème sombre chic, un mariage formel ou une fête d'entreprise ; signal de prix plus bas.
- Les lettres découpées frôlent la lettre anonyme si la discipline se relâche (une police, quatre papiers, alignement tenu).
- Le scrapbook est une tendance : elle datera plus vite que A ou B.


### Recommandation : lancer avec A, Le Drapeau levé

1. **Il occupe la place laissée libre.** L'invitation sait déjà s'ouvrir : enveloppe, cachet de cire, collage, c'est le produit. Ce qu'elle ne raconte pas, c'est l'arrivée. Le drapeau levé dit « il y a du courrier pour vous », exactement le rôle du SMS. La marque prend le moment d'avant, les thèmes gardent l'ouverture : aucune concurrence, c'est le piège que C ne peut pas éviter.
2. **Le nom s'explique tout seul.** En anglais, un drapeau *unfurls*. Nom, symbole et animation disent la même chose.
3. **La boîte aux lettres, c'est l'Amérique.** Le marché visé d'abord est américain, où le drapeau de boîte est une image que tout le monde connaît. Le rétro vient de la signalétique postale et des plaques émaillées, pas du papier vieilli.
4. **Les petites tailles.** Arche bleue et drapeau rouge tiennent à 16 px et dans l'avatar Etsy ; B et C perdent leur détail (doublure, dents du timbre) sous 40 px.
5. **Tous les événements.** On reçoit du courrier pour un mariage comme pour une naissance ou une fête d'entreprise : A ne prend parti pour aucun.

| Critère | A · Drapeau levé | B · Doublure | C · Découpé-collé |
|---|---|---|---|
| Moment de la lettre | L'arrivée (le SMS) | L'ouverture | Le dépliage |
| Concurrence avec les thèmes | **Aucune** | Faible | Forte (même vocabulaire collage) |
| Neutralité devant 5 thèmes | Bonne | **La meilleure** | Moyenne |
| Lisibilité à 16 px, avatar Etsy | **La meilleure** | Bonne | Bonne |
| Évident pour un Américain | **Oui** | Oui, mais discret | Oui, public plus jeune |
| Signal de prix | Moyen (29–39 $) | **Haut (39–55 $)** | Bas (19–29 $) |

**Si la boutique vise le haut de gamme** (mariages élégants, 45 $ et plus) : B est la plus juste ; elle demande une recherche d'antériorité soignée face à Paperless Post.

**Si l'acquisition passe par TikTok** : C est la plus partageable ; à réserver à une campagne ou à une ligne « party », pas à la marque mère.

**Ce qu'on garde du tour 1** : « unfurl me » en tampon, jamais dans le logo (devenu l'oblitération « UNFURLME.LOVE » de A) ; le test des cinq thèmes opposés sur la bannière ; un logotype dessiné plutôt que composé ; le ton sans point d'exclamation de Le Pli. On abandonne le cobalt sur gris calque, la crosse et le sticker rose.

**Prochaines étapes** :

- Montrer les trois aperçus SMS à 5 à 10 acheteuses cibles : lequel donne le plus envie d'ouvrir ?
- Recherche d'antériorité (USPTO, classes 9, 16, 42) sur le logotype et la boîte à drapeau ; vérifier l'écart avec l'identité USPS.
- Animer le drapeau sur l'écran de chargement de l'invitation, juste avant que le thème ne s'ouvre.
- Poser les tokens et auto-héberger les polices dans le site.

### Annexe tour 2 — SVG des logos

Logotypes vectorisés depuis Big Shoulders Display, Ibarra Real Nova et Bricolage Grotesque (licence OFL, qui autorise la vectorisation dans un logo) ; le « l » en hampe de A, les symboles et favicons sont dessinés. Les couleurs passent par des variables CSS avec valeur par défaut. Les tampons A, B et C utilisent du texte SVG (polices de la marque requises) ; les animations d'ouverture sont dans la planche.

#### A — logotype `unfurl` (drapeau)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -98 283.4 100" aria-hidden="true" width="283.4" height="100"><path d="M17.4 1.0Q11.2 1.0 7.5 -2.9Q3.7 -6.9 3.7 -15.9V-60.0H18.7V-14.6Q18.7 -12.2 19.9 -11.1Q21.0 -9.9 23.3 -9.9Q25.4 -9.9 27.6 -11.1Q29.9 -12.2 30.8 -14.2V-60.0H45.8V0.0H30.8V-6.5H28.8Q26.5 -2.5 23.8 -0.7Q21.2 1.0 17.4 1.0ZM55.6 0.0V-60.0H70.6V-53.5H73.2Q75.3 -57.1 77.6 -59.0Q79.9 -61.0 84.6 -61.0Q90.9 -61.0 94.4 -57.1Q97.9 -53.2 97.9 -44.1V0.0H82.9V-45.4Q82.9 -47.8 81.7 -49.0Q80.5 -50.1 78.1 -50.1Q76.1 -50.1 73.8 -48.9Q71.5 -47.8 70.6 -45.8V0.0ZM110.2 0.0V-48.7H103.4V-60.0H110.2V-63.3Q110.2 -72.9 115.2 -77.0Q120.2 -81.1 130.6 -81.1Q132.4 -81.1 134.2 -80.9Q136.1 -80.7 137.9 -80.4V-69.5Q136.1 -69.5 134.2 -69.5Q132.4 -69.5 130.6 -69.5Q128.1 -69.5 126.6 -68.2Q125.2 -66.9 125.2 -64.5V-60.0H135.4V-48.7H125.2V0.0ZM155.9 1.0Q149.7 1.0 145.9 -2.9Q142.2 -6.9 142.2 -15.9V-60.0H157.2V-14.6Q157.2 -12.2 158.3 -11.1Q159.5 -9.9 161.8 -9.9Q163.8 -9.9 166.1 -11.1Q168.4 -12.2 169.3 -14.2V-60.0H184.3V0.0H169.3V-6.5H167.3Q165.0 -2.5 162.3 -0.7Q159.7 1.0 155.9 1.0ZM194.1 0.0V-60.0H209.1V-52.5H211.7Q212.2 -57.0 214.3 -58.7Q216.4 -60.4 219.8 -60.4Q221.1 -60.4 222.3 -60.3Q223.5 -60.2 224.1 -60.1V-48.7H220.0Q214.2 -48.7 211.9 -47.0Q209.7 -45.2 209.1 -42.2V0.0ZM232.4 0V-92H247.4V0Z" style="fill:var(--lt,currentColor)"/><path class="a-flag" d="M247 -92C257.3 -95 267.7 -89 278 -92V-70C267.7 -67 257.3 -73 247 -70Z" style="fill:var(--lf,#D93A26)"/></svg>
```

#### A — symbole (boîte à drapeau)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" width="64" height="64"><path d="M8 46V27A19 19 0 0 1 46 27V46ZM23 46H31V62H23Z" style="fill:var(--sb,#1E3F9A)"/><path d="M24.5 13H29.5V19H24.5Z" style="fill:var(--sl,#F4F5F1)"/><path d="M49 44V9" stroke-width="3" style="stroke:var(--sb,#1E3F9A)"/><path d="M50.5 7C54.7 4 58.8 10 63 7V18C58.8 21 54.7 15 50.5 18Z" style="fill:var(--sf,#D93A26)"/></svg>
```

#### A — favicon

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" width="64" height="64"><rect width="64" height="64" rx="12" fill="#F4F5F1"/><path d="M9 50V29A18 18 0 0 1 45 29V50H33V62H21V50Z" fill="#1E3F9A"/><path d="M46 50V8H62V22H50V50Z" fill="#D93A26"/></svg>
```

#### A — oblitération

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 222 120" aria-hidden="true" width="222" height="120"><defs><path id="pmt" d="M17 60A43 43 0 0 1 103 60" fill="none"/><path id="pmb" d="M17 60A43 43 0 0 0 103 60" fill="none"/><path id="pmit" d="M8 60A52 52 0 0 1 112 60" fill="none"/><path id="pmib" d="M8 60A52 52 0 0 0 112 60" fill="none"/></defs><g fill="none" stroke-width="2.4" style="stroke:var(--pk,#D93A26)"><circle cx="60" cy="60" r="56"/><circle cx="60" cy="60" r="36"/><path d="M122 38c8-5 16 5 24 0s16 5 24 0 16 5 24 0 16 5 24 0 16 5 24 0"/><path d="M122 50c8-5 16 5 24 0s16 5 24 0 16 5 24 0 16 5 24 0 16 5 24 0"/><path d="M122 62c8-5 16 5 24 0s16 5 24 0 16 5 24 0 16 5 24 0 16 5 24 0"/><path d="M122 74c8-5 16 5 24 0s16 5 24 0 16 5 24 0 16 5 24 0 16 5 24 0"/><path d="M122 86c8-5 16 5 24 0s16 5 24 0 16 5 24 0 16 5 24 0 16 5 24 0"/></g><g style="fill:var(--pk,#D93A26)" font-family="'Big Shoulders Display','Arial Narrow',sans-serif" font-weight="800" text-anchor="middle"><text font-size="13.5" letter-spacing="2.2"><textPath href="#pmt" startOffset="50%">UNFURLME.LOVE</textPath></text><text font-size="11" letter-spacing="2.6" dy="9"><textPath href="#pmb" startOffset="50%">GOOD NEWS DEPT.</textPath></text><text x="60" y="54" font-size="20">23 SEP</text><text x="60" y="74" font-size="15" letter-spacing="1.5">2026</text><path d="M36 60H26M94 60H84" stroke-width="2.4" style="stroke:var(--pk,#D93A26)"/></g></svg>
```

#### B — logotype `unfurl`

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -76 252.1 80" aria-hidden="true" width="252.1" height="80"><path d="M22.4 0.7Q16.0 0.7 12.1 -2.4Q8.2 -5.5 8.2 -13.2V-35.5Q8.2 -37.5 7.7 -38.2Q7.1 -39.0 5.8 -39.5L1.5 -41.2V-42.2Q4.0 -42.2 6.3 -42.4Q8.6 -42.5 10.9 -42.8Q13.1 -43.1 15.2 -43.4L16.1 -42.8Q15.6 -41.5 15.2 -40.0Q14.9 -38.4 14.9 -37.0V-14.5Q14.9 -9.7 17.6 -7.2Q20.2 -4.6 24.9 -4.6Q29.3 -4.6 32.1 -7.8Q35.0 -11.0 35.0 -15.4L37.7 -5.5H35.2Q32.9 -4.5 29.6 -2.9Q26.3 -1.2 24.0 0.2Q23.0 0.7 22.4 0.7ZM37.3 0.8 36.5 0.4 35.8 -5.6 35.0 -7.9V-35.5Q35.0 -37.5 34.5 -38.2Q33.9 -39.0 32.6 -39.5L28.3 -41.2V-42.2Q30.8 -42.2 33.1 -42.4Q35.4 -42.5 37.7 -42.8Q39.9 -43.1 42.0 -43.4L42.9 -42.8Q42.4 -41.5 42.1 -40.0Q41.7 -38.4 41.7 -37.0V-7.3Q41.7 -4.4 43.9 -3.3Q46.0 -2.2 50.1 -2.4V-0.5Q46.9 -0.4 43.7 0.0Q40.5 0.4 37.3 0.8ZM83.7 0.0V-1.5L87.9 -2.6Q89.4 -3.0 90.0 -3.7Q90.5 -4.4 90.5 -5.8V-28.2Q90.5 -33.0 87.8 -35.5Q85.2 -38.1 80.2 -38.1Q75.3 -38.1 72.2 -34.9Q69.2 -31.6 69.2 -27.2L66.5 -37.1H69.0Q71.4 -38.1 74.8 -39.9Q78.2 -41.6 80.7 -42.9Q81.7 -43.4 82.3 -43.4Q89.4 -43.4 93.3 -39.9Q97.2 -36.3 97.2 -29.5V-5.8Q97.2 -4.4 97.8 -3.7Q98.3 -3.0 99.8 -2.6L104.0 -1.5V0.0ZM55.7 0.0V-1.5L59.9 -2.6Q61.4 -3.0 62.0 -3.7Q62.5 -4.4 62.5 -5.8V-33.1Q62.5 -35.1 62.0 -35.9Q61.5 -36.7 60.1 -37.1L55.8 -38.3V-39.3Q58.1 -39.8 60.4 -40.4Q62.6 -41.0 64.8 -41.8Q66.9 -42.6 68.9 -43.7L69.8 -43.1Q69.3 -41.8 69.0 -40.2Q68.6 -38.7 68.6 -37.3V-36.3L69.2 -34.8V-5.8Q69.2 -4.4 69.8 -3.7Q70.3 -3.0 71.8 -2.6L76.0 -1.5V0.0ZM108.6 0.0V-1.5L112.8 -2.6Q114.3 -3.0 114.9 -3.7Q115.4 -4.4 115.4 -5.8V-39.8H108.7V-42.6H115.4V-49.8Q115.4 -55.8 117.5 -60.6Q119.5 -65.4 123.6 -68.2Q127.7 -71.1 133.6 -71.1Q138.3 -71.1 141.5 -69.1Q144.6 -67.1 144.6 -64.1Q144.6 -62.2 143.5 -61.0Q142.3 -59.7 140.3 -59.7Q138.1 -59.7 136.9 -60.8Q135.7 -61.9 135.7 -63.5Q135.7 -63.9 135.8 -64.2Q135.9 -64.5 136.0 -64.8Q136.1 -65.1 136.2 -65.4Q136.3 -65.7 136.3 -66.1Q136.3 -67.2 135.4 -67.8Q134.4 -68.5 133.0 -68.5Q128.7 -68.5 126.3 -65.8Q123.9 -63.2 123.0 -58.9Q122.1 -54.5 122.1 -49.2V-42.6H135.5L134.5 -39.8H122.1V-5.8Q122.1 -4.4 122.7 -3.7Q123.2 -3.0 124.7 -2.6L130.0 -1.5V0.0ZM159.1 0.7Q152.7 0.7 148.8 -2.4Q144.9 -5.5 144.9 -13.2V-35.5Q144.9 -37.5 144.4 -38.2Q143.8 -39.0 142.5 -39.5L138.2 -41.2V-42.2Q140.7 -42.2 143.0 -42.4Q145.3 -42.5 147.6 -42.8Q149.8 -43.1 151.9 -43.4L152.8 -42.8Q152.3 -41.5 152.0 -40.0Q151.6 -38.4 151.6 -37.0V-14.5Q151.6 -9.7 154.3 -7.2Q156.9 -4.6 161.6 -4.6Q166.0 -4.6 168.9 -7.8Q171.7 -11.0 171.7 -15.4L174.4 -5.5H171.9Q169.6 -4.5 166.3 -2.9Q163.0 -1.2 160.7 0.2Q159.7 0.7 159.1 0.7ZM174.0 0.8 173.2 0.4 172.5 -5.6 171.7 -7.9V-35.5Q171.7 -37.5 171.2 -38.2Q170.6 -39.0 169.3 -39.5L165.0 -41.2V-42.2Q167.5 -42.2 169.8 -42.4Q172.1 -42.5 174.4 -42.8Q176.6 -43.1 178.7 -43.4L179.6 -42.8Q179.1 -41.5 178.8 -40.0Q178.4 -38.4 178.4 -37.0V-7.3Q178.4 -4.4 180.6 -3.3Q182.7 -2.2 186.8 -2.4V-0.5Q183.6 -0.4 180.4 0.0Q177.2 0.4 174.0 0.8ZM192.4 0.0V-1.5L196.6 -2.6Q198.1 -3.0 198.7 -3.7Q199.2 -4.4 199.2 -5.8V-33.1Q199.2 -35.1 198.7 -35.9Q198.2 -36.7 196.8 -37.1L192.5 -38.3V-39.3Q194.8 -39.8 197.1 -40.4Q199.3 -41.0 201.5 -41.8Q203.6 -42.6 205.6 -43.7L206.5 -43.1Q206.0 -41.8 205.7 -40.2Q205.3 -38.7 205.3 -37.3V-36.3L205.9 -34.8V-5.8Q205.9 -4.4 206.5 -3.7Q207.0 -3.0 208.5 -2.6L213.3 -1.5V0.0ZM205.9 -28.2 204.1 -36.3 215.7 -42.9Q216.3 -43.2 217.0 -43.4Q217.6 -43.5 218.2 -43.5Q220.0 -43.5 221.4 -42.3Q222.8 -41.1 222.8 -38.8Q222.8 -37.0 221.5 -35.6Q220.2 -34.2 217.9 -34.2Q216.5 -34.2 215.6 -34.8Q214.7 -35.4 214.0 -36.1Q213.5 -36.7 213.0 -37.2Q212.4 -37.7 211.7 -37.7Q211.0 -37.7 209.6 -36.9Q208.2 -36.0 207.1 -33.9Q205.9 -31.8 205.9 -28.2ZM226.9 0.0V-1.5L231.1 -2.6Q232.6 -3.0 233.2 -3.7Q233.7 -4.4 233.7 -5.8L233.9 -60.6Q233.9 -62.6 233.4 -63.4Q232.9 -64.2 231.5 -64.6L226.9 -65.8V-66.8Q230.5 -67.6 234.1 -68.6Q237.6 -69.5 240.9 -71.2L241.8 -70.6Q241.0 -68.4 240.8 -66.1Q240.6 -63.7 240.6 -60.2L240.4 -5.8Q240.4 -4.4 241.0 -3.7Q241.5 -3.0 243.0 -2.6L247.2 -1.5V0.0Z" style="fill:var(--lt,currentColor)"/></svg>
```

#### B — symbole (enveloppe à rabat en « u »)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" width="64" height="64"><path d="M4 16H60V56H4Z" style="fill:var(--sb,#15181E)"/><path d="M5.5 17.5C8 25 15 42 32 42S56 25 58.5 17.5" fill="none" stroke-width="2.6" stroke-linecap="round" style="stroke:var(--sl,#FAFBF9)"/></svg>
```

#### B — favicon

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" width="64" height="64"><rect width="64" height="64" rx="12" fill="#C3E2DD"/><path d="M6 14H58V54H6Z" fill="#15181E"/><path d="M8 16C11 26 18 40 32 40S53 26 56 16" fill="none" stroke="#FAFBF9" stroke-width="4.5" stroke-linecap="round"/></svg>
```

#### B — timbre sec

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" aria-hidden="true" width="120" height="120"><defs><path id="bst" d="M16 60A44 44 0 0 1 104 60" fill="none"/><path id="bsb" d="M16 60A44 44 0 0 0 104 60" fill="none"/></defs><g transform="translate(.9 .9)" opacity=".9"><circle cx="60" cy="60" r="54" fill="none" stroke="#FFFFFF" stroke-width="1.6"/><circle cx="60" cy="60" r="36" fill="none" stroke="#FFFFFF" stroke-width="1"/><g fill="#FFFFFF" font-family="'Ibarra Real Nova',Georgia,serif" font-size="9.5" letter-spacing="1.8" text-anchor="middle"><text><textPath href="#bst" startOffset="50%">UNFURLME.LOVE</textPath></text><text dy="7"><textPath href="#bsb" startOffset="50%">CORRESPONDANCE</textPath></text></g><g transform="translate(35 37) scale(.78)"><path d="M4 16H60V56H4Z" fill="none" stroke="#FFFFFF" stroke-width="1.8"/><path d="M5.5 17.5C8 25 15 42 32 42S56 25 58.5 17.5" fill="none" stroke="#FFFFFF" stroke-width="1.8"/></g></g><g transform="translate(-.7 -.7)" opacity=".55"><circle cx="60" cy="60" r="54" fill="none" stroke="#7E8C89" stroke-width="1.6"/><circle cx="60" cy="60" r="36" fill="none" stroke="#7E8C89" stroke-width="1"/><g fill="#7E8C89" font-family="'Ibarra Real Nova',Georgia,serif" font-size="9.5" letter-spacing="1.8" text-anchor="middle"><text><textPath href="#bst" startOffset="50%">UNFURLME.LOVE</textPath></text><text dy="7"><textPath href="#bsb" startOffset="50%">CORRESPONDANCE</textPath></text></g><g transform="translate(35 37) scale(.78)"><path d="M4 16H60V56H4Z" fill="none" stroke="#7E8C89" stroke-width="1.8"/><path d="M5.5 17.5C8 25 15 42 32 42S56 25 58.5 17.5" fill="none" stroke="#7E8C89" stroke-width="1.8"/></g></g><g opacity=".35"><circle cx="60" cy="60" r="54" fill="none" stroke="#C9D1CE" stroke-width="1.6"/><circle cx="60" cy="60" r="36" fill="none" stroke="#C9D1CE" stroke-width="1"/><g fill="#C9D1CE" font-family="'Ibarra Real Nova',Georgia,serif" font-size="9.5" letter-spacing="1.8" text-anchor="middle"><text><textPath href="#bst" startOffset="50%">UNFURLME.LOVE</textPath></text><text dy="7"><textPath href="#bsb" startOffset="50%">CORRESPONDANCE</textPath></text></g><g transform="translate(35 37) scale(.78)"><path d="M4 16H60V56H4Z" fill="none" stroke="#C9D1CE" stroke-width="1.8"/><path d="M5.5 17.5C8 25 15 42 32 42S56 25 58.5 17.5" fill="none" stroke="#C9D1CE" stroke-width="1.8"/></g></g></svg>
```

#### C — logotype `unfurl me`

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -72 340.4 90" aria-hidden="true" width="340.4" height="90"><defs><filter id="cshadow" x="-10%" y="-10%" width="130%" height="130%"><feDropShadow dx=".8" dy="1.2" stdDeviation=".7" flood-color="#141414" flood-opacity=".28"/></filter><filter id="cink"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.9"/><feComposite in="SourceGraphic" operator="in"/></filter></defs><g transform="rotate(-4 25.9 -25) translate(0 2)"><path d="M3.9 -60.8L49.6 -59.6L47.6 10.7L2.4 8.6Z" style="fill:var(--c1,#5436B8)" filter="url(#cshadow)"/><path d="M20.4 1.0Q14.2 1.0 11.2 -3.3Q8.2 -7.6 8.2 -16.6V-38.0H19.9V-16.7Q19.9 -12.5 21.1 -10.9Q22.3 -9.2 24.5 -9.2Q26.1 -9.2 27.4 -10.0Q28.8 -10.9 29.8 -12.6Q30.8 -14.3 31.3 -16.9Q31.8 -19.6 31.8 -23.3V-38.0H43.5V-17.1V0.0H33.6V-14.8H33.1Q32.6 -9.3 31.1 -5.8Q29.6 -2.3 27.0 -0.6Q24.3 1.0 20.4 1.0Z" style="fill:#FFFFFF"/></g><g transform="rotate(3 72.9 -25) translate(0 -2)"><path d="M49 -59L97.6 -60.5L97.1 9.6L48.9 10.9Z" style="fill:var(--c2,#FFFFFF)" filter="url(#cshadow)"/><path d="M55.1 0.0V-21.5V-38.0H65.0V-22.5H65.5Q66.0 -28.2 67.4 -31.8Q68.9 -35.4 71.5 -37.2Q74.2 -39.0 78.3 -39.0Q84.5 -39.0 87.6 -34.9Q90.7 -30.8 90.7 -22.7V0.0H79.1V-21.2Q79.1 -25.1 77.9 -27.0Q76.7 -28.9 74.1 -28.9Q72.0 -28.9 70.3 -27.4Q68.6 -25.9 67.7 -22.5Q66.8 -19.2 66.8 -13.5V0.0Z" style="fill:var(--c3,#141414)"/></g><g transform="rotate(-2 113.2 -25) translate(0 1)"><path d="M94.5 -62L95.7 -62A1.5 1.5 0 0 0 98.7 -62L101.1 -62A1.5 1.5 0 0 0 104.1 -62L106.4 -62A1.5 1.5 0 0 0 109.4 -62L111.7 -62A1.5 1.5 0 0 0 114.7 -62L117.1 -62A1.5 1.5 0 0 0 120.1 -62L122.4 -62A1.5 1.5 0 0 0 125.4 -62L127.8 -62A1.5 1.5 0 0 0 130.8 -62L132 -62L132 -60.9A1.5 1.5 0 0 0 132 -57.9L132 -55.6A1.5 1.5 0 0 0 132 -52.6L132 -50.3A1.5 1.5 0 0 0 132 -47.3L132 -45A1.5 1.5 0 0 0 132 -42L132 -39.7A1.5 1.5 0 0 0 132 -36.7L132 -34.4A1.5 1.5 0 0 0 132 -31.4L132 -29.1A1.5 1.5 0 0 0 132 -26.1L132 -23.9A1.5 1.5 0 0 0 132 -20.9L132 -18.6A1.5 1.5 0 0 0 132 -15.6L132 -13.3A1.5 1.5 0 0 0 132 -10.3L132 -8A1.5 1.5 0 0 0 132 -5L132 -2.7A1.5 1.5 0 0 0 132 0.3L132 2.6A1.5 1.5 0 0 0 132 5.6L132 7.9A1.5 1.5 0 0 0 132 10.9L132 12L130.8 12A1.5 1.5 0 0 0 127.8 12L125.4 12A1.5 1.5 0 0 0 122.4 12L120.1 12A1.5 1.5 0 0 0 117.1 12L114.7 12A1.5 1.5 0 0 0 111.7 12L109.4 12A1.5 1.5 0 0 0 106.4 12L104.1 12A1.5 1.5 0 0 0 101.1 12L98.7 12A1.5 1.5 0 0 0 95.7 12L94.5 12L94.5 10.9A1.5 1.5 0 0 0 94.5 7.9L94.5 5.6A1.5 1.5 0 0 0 94.5 2.6L94.5 0.3A1.5 1.5 0 0 0 94.5 -2.7L94.5 -5A1.5 1.5 0 0 0 94.5 -8L94.5 -10.3A1.5 1.5 0 0 0 94.5 -13.3L94.5 -15.6A1.5 1.5 0 0 0 94.5 -18.6L94.5 -20.9A1.5 1.5 0 0 0 94.5 -23.9L94.5 -26.1A1.5 1.5 0 0 0 94.5 -29.1L94.5 -31.4A1.5 1.5 0 0 0 94.5 -34.4L94.5 -36.7A1.5 1.5 0 0 0 94.5 -39.7L94.5 -42A1.5 1.5 0 0 0 94.5 -45L94.5 -47.3A1.5 1.5 0 0 0 94.5 -50.3L94.5 -52.6A1.5 1.5 0 0 0 94.5 -55.6L94.5 -57.9A1.5 1.5 0 0 0 94.5 -60.9Z" style="fill:var(--c4,#1F7A4D)" filter="url(#cshadow)"/><path d="M105.8 0.0V-23.3H100.5V-31.6L112.1 -30.8V-31.4Q107.7 -31.9 105.5 -33.5Q103.3 -35.1 102.5 -37.1Q101.8 -39.1 101.8 -40.8Q101.8 -44.0 103.5 -46.4Q105.3 -48.8 108.4 -50.1Q111.6 -51.4 115.5 -51.4Q118.8 -51.4 121.3 -50.5Q123.9 -49.7 126.0 -48.0L125.0 -37.4Q123.1 -38.7 121.3 -39.4Q119.5 -40.1 117.6 -40.1Q115.4 -40.1 114.0 -39.2Q112.6 -38.2 112.6 -36.2Q112.6 -35.1 113.2 -34.2Q113.8 -33.3 115.0 -32.7Q116.3 -32.2 118.5 -32.2H125.7V-23.3H117.3V0.0Z" style="fill:#FFFFFF"/></g><g transform="rotate(4 154.3 -25) translate(0 -1)"><path d="M132.1 -58.8L176.7 -60.6L177 10.5L131.6 9.5Z" style="fill:var(--c2,#FFFFFF)" filter="url(#cshadow)"/><path d="M148.9 1.0Q142.7 1.0 139.7 -3.3Q136.7 -7.6 136.7 -16.6V-38.0H148.3V-16.7Q148.3 -12.5 149.5 -10.9Q150.7 -9.2 153.0 -9.2Q154.5 -9.2 155.9 -10.0Q157.2 -10.9 158.2 -12.6Q159.2 -14.3 159.8 -16.9Q160.3 -19.6 160.3 -23.3V-38.0H172.0V-17.1V0.0H162.0V-14.8H161.5Q161.1 -9.3 159.6 -5.8Q158.1 -2.3 155.4 -0.6Q152.7 1.0 148.9 1.0Z" style="fill:var(--c3,#141414)"/></g><g transform="rotate(-3 196.2 -25) translate(0 2)"><path d="M177.1 -59.6L215.3 -60.2L215.5 9.4L177.6 11.2Z" style="fill:var(--c3,#141414)" filter="url(#cshadow)"/><path d="M183.6 0.0V-20.7V-38.0H193.6V-22.9H194.2Q194.6 -28.9 195.9 -32.4Q197.2 -35.9 199.1 -37.4Q201.0 -38.9 203.4 -38.9Q204.7 -38.9 206.1 -38.5Q207.5 -38.2 208.8 -37.4L208.3 -24.4Q206.7 -25.3 205.2 -25.8Q203.6 -26.3 202.3 -26.3Q200.0 -26.3 198.4 -25.0Q196.8 -23.7 196.0 -21.2Q195.1 -18.6 195.1 -15.0V0.0Z" style="fill:#FFFFFF"/></g><g transform="rotate(2 226.3 -25) translate(0 -2)"><path d="M216.1 -61L236.6 -59.5L236.3 10.4L215.7 9.2Z" style="fill:var(--c2,#FFFFFF)" filter="url(#cshadow)"/><path d="M220.4 0.0V-50.4H232.1V0.0Z" style="fill:var(--c3,#141414)"/></g><path d="M58 -66L96 -58L94 -48L56 -56Z" style="fill:var(--ct,#F1E39A)" opacity=".78"/><g transform="rotate(-6 291.5 -26)" style="fill:var(--cv,#5436B8)" filter="url(#cink)"><path d="M248.6 -52H334.4V2H248.6Z M251.6 -49V-1H331.4V-49Z" fill-rule="evenodd"/><path d="M258.4 -8.0V-22.6V-34.4H265.2V-23.6H265.6Q266.0 -27.9 267.0 -30.4Q268.0 -32.9 269.8 -34.0Q271.5 -35.1 273.9 -35.1Q276.4 -35.1 277.9 -33.9Q279.5 -32.7 280.2 -30.1Q281.0 -27.6 280.9 -23.6H281.3Q281.7 -27.8 282.8 -30.3Q283.9 -32.8 285.7 -34.0Q287.5 -35.1 289.9 -35.1Q292.0 -35.1 293.5 -34.4Q295.0 -33.6 296.0 -32.1Q297.0 -30.6 297.5 -28.3Q298.0 -26.1 298.0 -23.0V-8.0H289.9V-22.3Q289.9 -24.2 289.6 -25.5Q289.3 -26.8 288.6 -27.4Q288.0 -28.0 287.0 -28.0Q285.7 -28.0 284.6 -26.8Q283.5 -25.7 282.8 -23.3Q282.1 -21.0 282.1 -17.4V-8.0H274.2V-22.5Q274.2 -24.4 273.9 -25.6Q273.6 -26.8 272.9 -27.4Q272.2 -28.0 271.2 -28.0Q270.0 -28.0 268.9 -27.0Q267.8 -25.9 267.2 -23.6Q266.5 -21.2 266.5 -17.4V-8.0ZM313.9 -7.3Q310.2 -7.3 307.7 -8.4Q305.1 -9.4 303.6 -11.3Q302.0 -13.2 301.4 -15.6Q300.7 -18.0 300.7 -20.6Q300.7 -23.5 301.4 -26.1Q302.1 -28.7 303.7 -30.7Q305.2 -32.8 307.6 -33.9Q310.0 -35.1 313.4 -35.1Q316.8 -35.1 319.3 -33.9Q321.7 -32.8 323.1 -30.6Q324.6 -28.6 325.0 -25.8Q325.4 -23.1 324.9 -19.9L305.7 -19.6V-24.0L318.7 -24.2L317.6 -21.6Q317.9 -24.0 317.6 -25.5Q317.2 -27.1 316.2 -27.9Q315.2 -28.8 313.4 -28.8Q311.6 -28.8 310.5 -27.8Q309.4 -26.9 308.9 -25.1Q308.5 -23.4 308.5 -21.1Q308.5 -17.0 309.8 -15.2Q311.2 -13.3 314.0 -13.3Q315.2 -13.3 316.0 -13.6Q316.8 -13.9 317.3 -14.5Q317.8 -15.1 318.0 -15.9Q318.2 -16.7 318.1 -17.8L325.5 -17.4Q325.7 -15.7 325.2 -13.9Q324.7 -12.2 323.4 -10.7Q322.1 -9.2 319.8 -8.2Q317.5 -7.3 313.9 -7.3Z"/></g></svg>
```

#### C — symbole (u scotché sur me)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" width="64" height="64"><g transform="translate(4 3) rotate(9 32 33)"><path d="M12 12L13 12A1.5 1.5 0 0 0 16 12L18 12A1.5 1.5 0 0 0 21 12L23 12A1.5 1.5 0 0 0 26 12L28 12A1.5 1.5 0 0 0 31 12L33 12A1.5 1.5 0 0 0 36 12L38 12A1.5 1.5 0 0 0 41 12L43 12A1.5 1.5 0 0 0 46 12L48 12A1.5 1.5 0 0 0 51 12L52 12L52 12.8A1.5 1.5 0 0 0 52 15.8L52 17.5A1.5 1.5 0 0 0 52 20.5L52 22.2A1.5 1.5 0 0 0 52 25.2L52 26.8A1.5 1.5 0 0 0 52 29.8L52 31.5A1.5 1.5 0 0 0 52 34.5L52 36.2A1.5 1.5 0 0 0 52 39.2L52 40.8A1.5 1.5 0 0 0 52 43.8L52 45.5A1.5 1.5 0 0 0 52 48.5L52 50.2A1.5 1.5 0 0 0 52 53.2L52 54L51 54A1.5 1.5 0 0 0 48 54L46 54A1.5 1.5 0 0 0 43 54L41 54A1.5 1.5 0 0 0 38 54L36 54A1.5 1.5 0 0 0 33 54L31 54A1.5 1.5 0 0 0 28 54L26 54A1.5 1.5 0 0 0 23 54L21 54A1.5 1.5 0 0 0 18 54L16 54A1.5 1.5 0 0 0 13 54L12 54L12 53.2A1.5 1.5 0 0 0 12 50.2L12 48.5A1.5 1.5 0 0 0 12 45.5L12 43.8A1.5 1.5 0 0 0 12 40.8L12 39.2A1.5 1.5 0 0 0 12 36.2L12 34.5A1.5 1.5 0 0 0 12 31.5L12 29.8A1.5 1.5 0 0 0 12 26.8L12 25.2A1.5 1.5 0 0 0 12 22.2L12 20.5A1.5 1.5 0 0 0 12 17.5L12 15.8A1.5 1.5 0 0 0 12 12.8Z" style="fill:var(--sg,#1F7A4D)"/><path d="M0.6 0.0V-5.3V-9.5H3.1V-5.6H3.3Q3.4 -7.1 3.8 -8.0Q4.1 -8.9 4.7 -9.4Q5.4 -9.8 6.2 -9.8Q7.1 -9.8 7.7 -9.3Q8.2 -8.9 8.5 -8.0Q8.8 -7.1 8.8 -5.6H8.9Q9.0 -7.1 9.4 -8.0Q9.8 -8.9 10.5 -9.3Q11.1 -9.8 12.0 -9.8Q12.7 -9.8 13.3 -9.5Q13.8 -9.2 14.2 -8.7Q14.6 -8.1 14.7 -7.3Q14.9 -6.5 14.9 -5.4V0.0H12.0V-5.1Q12.0 -5.8 11.9 -6.3Q11.8 -6.7 11.5 -7.0Q11.3 -7.2 10.9 -7.2Q10.5 -7.2 10.1 -6.8Q9.7 -6.4 9.4 -5.5Q9.2 -4.7 9.2 -3.4V0.0H6.4V-5.2Q6.4 -5.9 6.2 -6.3Q6.1 -6.8 5.9 -7.0Q5.6 -7.2 5.3 -7.2Q4.8 -7.2 4.4 -6.8Q4.0 -6.5 3.8 -5.6Q3.6 -4.8 3.6 -3.4V0.0ZM20.6 0.3Q19.3 0.3 18.4 -0.1Q17.5 -0.5 16.9 -1.2Q16.4 -1.9 16.1 -2.7Q15.9 -3.6 15.9 -4.6Q15.9 -5.6 16.1 -6.5Q16.4 -7.5 16.9 -8.2Q17.5 -8.9 18.4 -9.3Q19.2 -9.8 20.5 -9.8Q21.7 -9.8 22.6 -9.3Q23.4 -8.9 24.0 -8.2Q24.5 -7.4 24.6 -6.4Q24.8 -5.4 24.6 -4.3L17.7 -4.2V-5.7L22.4 -5.8L22.0 -4.9Q22.1 -5.7 22.0 -6.3Q21.8 -6.9 21.5 -7.2Q21.1 -7.5 20.5 -7.5Q19.8 -7.5 19.4 -7.1Q19.0 -6.8 18.8 -6.2Q18.7 -5.5 18.7 -4.7Q18.7 -3.2 19.2 -2.6Q19.7 -1.9 20.7 -1.9Q21.1 -1.9 21.4 -2.0Q21.7 -2.1 21.9 -2.3Q22.0 -2.5 22.1 -2.8Q22.2 -3.1 22.2 -3.5L24.8 -3.4Q24.9 -2.8 24.7 -2.1Q24.5 -1.5 24.1 -1.0Q23.6 -0.4 22.8 -0.1Q21.9 0.3 20.6 0.3Z" transform="translate(19.3 44.8)" fill="#FFFFFF"/></g><g class="c-chip"><path d="M12 12L13 12A1.5 1.5 0 0 0 16 12L18 12A1.5 1.5 0 0 0 21 12L23 12A1.5 1.5 0 0 0 26 12L28 12A1.5 1.5 0 0 0 31 12L33 12A1.5 1.5 0 0 0 36 12L38 12A1.5 1.5 0 0 0 41 12L43 12A1.5 1.5 0 0 0 46 12L48 12A1.5 1.5 0 0 0 51 12L52 12L52 12.8A1.5 1.5 0 0 0 52 15.8L52 17.5A1.5 1.5 0 0 0 52 20.5L52 22.2A1.5 1.5 0 0 0 52 25.2L52 26.8A1.5 1.5 0 0 0 52 29.8L52 31.5A1.5 1.5 0 0 0 52 34.5L52 36.2A1.5 1.5 0 0 0 52 39.2L52 40.8A1.5 1.5 0 0 0 52 43.8L52 45.5A1.5 1.5 0 0 0 52 48.5L52 50.2A1.5 1.5 0 0 0 52 53.2L52 54L51 54A1.5 1.5 0 0 0 48 54L46 54A1.5 1.5 0 0 0 43 54L41 54A1.5 1.5 0 0 0 38 54L36 54A1.5 1.5 0 0 0 33 54L31 54A1.5 1.5 0 0 0 28 54L26 54A1.5 1.5 0 0 0 23 54L21 54A1.5 1.5 0 0 0 18 54L16 54A1.5 1.5 0 0 0 13 54L12 54L12 53.2A1.5 1.5 0 0 0 12 50.2L12 48.5A1.5 1.5 0 0 0 12 45.5L12 43.8A1.5 1.5 0 0 0 12 40.8L12 39.2A1.5 1.5 0 0 0 12 36.2L12 34.5A1.5 1.5 0 0 0 12 31.5L12 29.8A1.5 1.5 0 0 0 12 26.8L12 25.2A1.5 1.5 0 0 0 12 22.2L12 20.5A1.5 1.5 0 0 0 12 17.5L12 15.8A1.5 1.5 0 0 0 12 12.8Z" style="fill:var(--sv,#5436B8)"/><path d="M8.0 0.6Q4.6 0.6 2.9 -1.8Q1.2 -4.2 1.2 -9.2V-21.1H7.7V-9.3Q7.7 -7.0 8.4 -6.0Q9.0 -5.1 10.3 -5.1Q11.2 -5.1 11.9 -5.6Q12.6 -6.0 13.2 -7.0Q13.8 -7.9 14.1 -9.4Q14.4 -10.9 14.4 -13.0V-21.1H20.8V-9.5V0.0H15.3V-8.2H15.0Q14.8 -5.2 14.0 -3.2Q13.1 -1.3 11.6 -0.4Q10.2 0.6 8.0 0.6Z" transform="translate(20 44.3)" fill="#FFFFFF"/></g><path class="c-tape1" d="M6 16L22 4L27 11L11 23Z" style="fill:var(--st,#F1E39A)" opacity=".85"/><path class="c-tape2" d="M42 5L58 17L53 24L37 12Z" style="fill:var(--st,#F1E39A)" opacity=".85"/></svg>
```

#### C — favicon 32 px

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" width="64" height="64"><rect width="64" height="64" rx="12" fill="#EDEDE9"/><path d="M6 6L7 6A2.2 2.2 0 0 0 11.4 6L13.6 6A2.2 2.2 0 0 0 17.9 6L20.1 6A2.2 2.2 0 0 0 24.4 6L26.6 6A2.2 2.2 0 0 0 30.9 6L33 6A2.2 2.2 0 0 0 37.5 6L39.5 6A2.2 2.2 0 0 0 44 6L46 6A2.2 2.2 0 0 0 50.5 6L52.5 6A2.2 2.2 0 0 0 57 6L58 6L58 7A2.2 2.2 0 0 0 58 11.4L58 13.6A2.2 2.2 0 0 0 58 17.9L58 20.1A2.2 2.2 0 0 0 58 24.4L58 26.6A2.2 2.2 0 0 0 58 30.9L58 33A2.2 2.2 0 0 0 58 37.5L58 39.5A2.2 2.2 0 0 0 58 44L58 46A2.2 2.2 0 0 0 58 50.5L58 52.5A2.2 2.2 0 0 0 58 57L58 58L57 58A2.2 2.2 0 0 0 52.5 58L50.5 58A2.2 2.2 0 0 0 46 58L44 58A2.2 2.2 0 0 0 39.5 58L37.5 58A2.2 2.2 0 0 0 33 58L30.9 58A2.2 2.2 0 0 0 26.6 58L24.5 58A2.2 2.2 0 0 0 20 58L18 58A2.2 2.2 0 0 0 13.5 58L11.5 58A2.2 2.2 0 0 0 7 58L6 58L6 57A2.2 2.2 0 0 0 6 52.5L6 50.5A2.2 2.2 0 0 0 6 46L6 44A2.2 2.2 0 0 0 6 39.5L6 37.5A2.2 2.2 0 0 0 6 33L6 30.9A2.2 2.2 0 0 0 6 26.6L6 24.5A2.2 2.2 0 0 0 6 20L6 18A2.2 2.2 0 0 0 6 13.5L6 11.5A2.2 2.2 0 0 0 6 7Z" fill="#5436B8"/><path d="M8.0 0.6Q4.6 0.6 2.9 -1.8Q1.2 -4.2 1.2 -9.2V-21.1H7.7V-9.3Q7.7 -7.0 8.4 -6.0Q9.0 -5.1 10.3 -5.1Q11.2 -5.1 11.9 -5.6Q12.6 -6.0 13.2 -7.0Q13.8 -7.9 14.1 -9.4Q14.4 -10.9 14.4 -13.0V-21.1H20.8V-9.5V0.0H15.3V-8.2H15.0Q14.8 -5.2 14.0 -3.2Q13.1 -1.3 11.6 -0.4Q10.2 0.6 8.0 0.6Z" transform="translate(21 43.3)" fill="#FFFFFF"/></svg>
```

#### C — favicon 16 px

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" width="64" height="64"><path d="M6 6H58V58H6Z" fill="#5436B8"/><path d="M8.8 0.6Q5.0 0.6 3.2 -2.0Q1.4 -4.7 1.4 -10.1V-23.2H8.5V-10.2Q8.5 -7.7 9.2 -6.6Q9.9 -5.6 11.3 -5.6Q12.3 -5.6 13.1 -6.1Q13.9 -6.6 14.5 -7.7Q15.1 -8.7 15.5 -10.3Q15.8 -12.0 15.8 -14.3V-23.2H22.9V-10.5V0.0H16.9V-9.1H16.5Q16.3 -5.7 15.4 -3.5Q14.4 -1.4 12.8 -0.4Q11.2 0.6 8.8 0.6Z" transform="translate(19.9 44.3)" fill="#FFFFFF"/></svg>
```

#### C — tampon encreur

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 110" aria-hidden="true" width="240" height="110"><defs><filter id="cink2"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="9"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.9"/><feComposite in="SourceGraphic" operator="in"/></filter></defs><g style="fill:var(--cv,#5436B8)" filter="url(#cink2)" transform="rotate(-4 120 55)"><path d="M8 8H232V102H8Z M13 13V97H227V13Z" fill-rule="evenodd"/><path d="M20 70H220V72H20Z"/><text x="120" y="58" text-anchor="middle" font-family="'Bricolage Grotesque','Arial Black',sans-serif" font-weight="800" font-size="44" letter-spacing="-1">unfurl me</text><text x="120" y="90" text-anchor="middle" font-family="'Courier Prime','Courier New',monospace" font-weight="700" font-size="11.5" letter-spacing=".4">UNFURLME.LOVE · 23 SEP 2026</text></g></svg>
```

---

## Tour 1 (historique) — 3 directions

> Premier tour, conservé pour mémoire. Retour : intéressant, sans coup de cœur ; voir le tour 2 ci-dessus.

> Planche visuelle à ouvrir sur téléphone : `identite-unfurl.html` (fichier HTML autonome). Ce document en reprend la substance ; les SVG des logos sont en annexe.

**Décisions fixées** : nom **Unfurl** · domaine **unfurlme.love** (« unfurl me » = « déplie-moi ») · lien invité type `unfurlme.love/zoe-and-dylan` · marché US d'abord, puis francophone.

**Contraintes** : ne pas reprendre l'ambiance du premier thème (noir / ivoire / olive) ; rester neutre pour présenter des invitations de tous styles (sombre, pastel, bohème, méditerranéen, enfant) et tous les événements (mariage, fiançailles, naissance, anniversaire, baptême, fête d'entreprise) ; éviter les clichés (crème + serif + terracotta, noir + vert acide, dégradé violet-bleu, Inter / Space Grotesk par défaut).

Ces trois directions remplacent les identités A/B/C de `marque-et-domaines.md` §5, liées à d'anciens noms.

---

### Direction A — Le Pli (*The Crease*)

**Concept** : Une feuille, un pli, une ouverture. La marque se construit sur la ligne de pli à 45° : c'est elle qui coupe le haut des lettres, elle qui dessine le symbole.

**Logotype : `unfurl`** — « unfurl » seul. Le mot court tient dans un favicon et un avatar Etsy ; « unfurl me » vit dans l'adresse et sur les étiquettes, pas dans le logo.

#### Logo

- **Logotype** : « unfurl » dessiné au trait monoline géométrique ; le haut de chaque fût est coupé à 45°, comme un coin de papier replié.
- **Symbole** : Une feuille carrée pliée en diagonale : la moitié basse (cobalt) reste à plat, le rabat (buvard) se soulève et s'ouvre. Un mince jour sépare les deux : c'est la ligne de pli.
- **Favicon 32 px** : Le symbole seul, sur fond Feuille : deux triangles, lisible à 16 px.

#### Palette

| Nom | Hex | Rôle |
|---|---|---|
| Calque | `#EEF0F4` | Fond principal, papier calque froid : laisse passer tous les thèmes |
| Feuille | `#FFFFFF` | Surfaces, cartes, fiches |
| Graphite bleu | `#1D2233` | Texte, logotype, fonds sombres |
| Cobalt | `#2E44C8` | Accent unique : boutons, liens, symbole |
| Buvard | `#F3CFC6` | Le rose du papier buvard : rabat du symbole, surfaces chaudes |
| Ligne de pli | `#9AA1B4` | Filets, repères de pli (jamais pour du texte) |

Contrastes vérifiés (WCAG 2.1) :

| Texte | Fond | Ratio | Niveau |
|---|---|---|---|
| Graphite bleu | Calque | 13,9:1 | AAA |
| Cobalt | Calque | 6,6:1 | AA |
| Feuille | Cobalt | 7,6:1 | AAA |
| Graphite bleu | Buvard | 11,0:1 | AAA |
| Cobalt | Buvard | 5,2:1 | AA |

#### Typographies (Google Fonts, licence OFL, auto-hébergeables)

| Police | Rôle | Graisses | Pourquoi |
|---|---|---|---|
| Schibsted Grotesk | Titres, interface, boutons | 500 · 700 | Grotesque de presse robuste, chiffres nets, excellent support des accents. |
| Newsreader | Texte courant, italiques éditoriales | 400 · 400 italique | Serif à corps optiques : chaleur de lettre écrite dans une structure très construite. |
| Fragment Mono | Étiquettes, dates, URL | 400 | Pour les repères techniques : dates, coordonnées, « unfurlme.love/… ». |

Échelle :

| Niveau | Police | Taille / interligne | Graisse | Approche | Exemple |
|---|---|---|---|---|---|
| Display | Schibsted Grotesk | 3rem / 1 | 700 | -0.03em | Opens like a letter. |
| Titre 2 | Schibsted Grotesk | 2rem / 1.1 | 700 | -0.02em | Save the date, folded. |
| Titre 3 | Schibsted Grotesk | 1.375rem / 1.2 | 500 | -0.01em | Personnalisée en 10 minutes |
| Texte | Newsreader | 1.0625rem / 1.55 | 400 | 0 | Une invitation qui s'ouvre comme une vraie lettre, puis se lit comme une histoire. |
| Étiquette | Fragment Mono | 0.75rem / 1.3 | 400 | 0.08em | SAVE THE DATE · 06.12.27 |

#### Ton de voix

**précis, calme, attentionné**. Phrases courtes, aucun point d'exclamation, des faits plutôt que des adjectifs. On vouvoie en français.

| Usage | EN | FR |
|---|---|---|
| Tagline | Opens like a letter. Reads like a story. | S'ouvre comme une lettre. Se lit comme une histoire. |
| Bouton | Start your invitation | Commencer votre invitation |
| Après le RSVP | Your reply is with Zoe & Dylan. See you on June 12. | Votre réponse est entre les mains de Zoe et Dylan. À samedi 12 juin. |

#### Mises en situation (sur la planche)

SMS reçu avec `unfurlme.love/zoe-and-dylan` et aperçu de lien · bannière Etsy 3360 × 840 portant les 5 mêmes thèmes (test de neutralité) · vignette carrée de fiche produit · en-tête de la vitrine · étiquette carrée « unfurl me — open along the fold » avec pli en pointillé.

#### Clientèle US, forces, risques

**Clientèle** : Couples urbains sensibles au design (New York, Chicago, Austin, Seattle), mariages civils ou « city hall », invités nombreux en ligne ; prêts à payer 35-45 $ pour un rendu qui ne fait pas « template ». Porte d'entrée naturelle vers la fête d'entreprise.

**Forces**

- Le cadre le plus neutre des trois : le gris calque et le cobalt s'effacent devant un thème noir, pastel, bohème ou enfant (voir la bannière).
- Tout le système découle d'une seule règle (le pli à 45°) : facile à décliner sans designer.
- Symbole lisible à 16 px et en une couleur ; logotype dessiné, donc déposable.

**Risques**

- Peut sembler « appli » ou froid sur Etsy, où l'on achète une émotion : il faudra de la chaleur dans les photos et le ton.
- Le cobalt n'est pas une couleur « mariage » pour une partie du public : il doit rester rare (boutons, symbole).

---

### Direction B — La Crosse (*Fiddlehead*)

**Concept** : « Unfurl » est d'abord le verbe des fougères : la crosse qui se déroule en grandissant. Le « l » final devient cette crosse, promesse d'une histoire qui se déploie, quel que soit l'événement.

**Logotype : `unfurl`** — « unfurl » seul. La crosse remplace le « l » ; ajouter « me » casserait la chute de la spirale. « unfurl me » reste la signature du domaine.

#### Logo

- **Logotype** : « unfur » composé en Gloock (tracé vectorisé, approche resserrée), suivi d'un « l » redessiné en crosse qui s'enroule vers la droite.
- **Symbole** : La crosse de fougère seule : un fût droit qui s'enroule en spirale logarithmique, avec le contraste épais/fin de Gloock et une goutte au cœur.
- **Favicon 32 px** : Une crosse simplifiée et épaissie (1,5 tour au lieu de 2) pour rester lisible en 16 et 32 px.

#### Palette

| Nom | Hex | Rôle |
|---|---|---|
| Brume | `#F3EEF5` | Fond principal, un blanc teinté de lilas |
| Nacre | `#FCFAFD` | Surfaces, cartes |
| Aubergine | `#2E1A34` | Texte, logotype, fonds sombres |
| Pivoine | `#9E2554` | Accent : boutons, liens, crosse |
| Lilas | `#D9C9E6` | Surfaces douces, fonds de visuels |
| Mimosa | `#F2C14E` | Éclat ponctuel (pastilles, soulignés), jamais pour du texte sur clair |

Contrastes vérifiés (WCAG 2.1) :

| Texte | Fond | Ratio | Niveau |
|---|---|---|---|
| Aubergine | Brume | 14,0:1 | AAA |
| Pivoine | Brume | 6,4:1 | AA |
| Nacre | Pivoine | 7,1:1 | AAA |
| Pivoine | Lilas | 4,7:1 | AA |
| Aubergine | Mimosa | 9,5:1 | AAA |

#### Typographies (Google Fonts, licence OFL, auto-hébergeables)

| Police | Rôle | Graisses | Pourquoi |
|---|---|---|---|
| Gloock | Logotype, titres | 400 | Didone contemporaine à fort contraste et gouttes : l'élégance du faire-part sans la raideur. |
| Albert Sans | Texte, interface, boutons | 400 · 500 · 600 | Grotesque nordique douce et lisible, bonne tenue en petit sur mobile. |

Échelle :

| Niveau | Police | Taille / interligne | Graisse | Approche | Exemple |
|---|---|---|---|---|---|
| Display | Gloock | 3.25rem / 1 | 400 | -0.01em | Let it unfurl. |
| Titre 2 | Gloock | 2.125rem / 1.1 | 400 | 0 | Some news deserves to unfold slowly. |
| Titre 3 | Albert Sans | 1.25rem / 1.3 | 600 | 0 | Personnalisée en 10 minutes |
| Texte | Albert Sans | 1rem / 1.6 | 400 | 0 | Une invitation qui s'ouvre comme une vraie lettre, puis se déroule au fil du défilement. |
| Étiquette | Albert Sans | 0.75rem / 1.3 | 600 | 0.14em | SAVE THE DATE · JUNE 12 |

#### Ton de voix

**tendre, lumineux, généreux**. Des images simples (ouvrir, grandir, déplier), de la chaleur sans mièvrerie. On vouvoie en français, avec douceur.

| Usage | EN | FR |
|---|---|---|
| Tagline | Some news deserves to unfold slowly. | Certaines nouvelles méritent de se déplier lentement. |
| Bouton | Begin your story | Commencer votre histoire |
| Après le RSVP | Your yes is on its way to Zoe & Dylan. They're going to love this. | Votre « oui » est en route vers Zoe et Dylan. Ils vont être ravis. |

#### Mises en situation (sur la planche)

SMS reçu avec `unfurlme.love/zoe-and-dylan` et aperçu de lien · bannière Etsy 3360 × 840 portant les 5 mêmes thèmes (test de neutralité) · vignette carrée de fiche produit · en-tête de la vitrine · tampon rond « let it unfurl · unfurlme.love » autour de la crosse.

#### Clientèle US, forces, risques

**Clientèle** : Le cœur de cible Etsy : mariages de jardin, de grange ou de vignoble, fiancées qui préparent aussi bridal shower et baby shower ; recherches « romantic », « garden », « elegant ». La crosse parle aussi naturellement de naissance et de baptême.

**Forces**

- Le nom et le symbole racontent la même chose : pas besoin d'expliquer « unfurl » aux anglophones, la crosse le montre.
- La plus émotionnelle des trois, proche des attentes des acheteuses Etsy sans tomber dans la fleur clip-art.
- Couvre naturellement naissance, baptême, anniversaire : « ce qui grandit ».

**Risques**

- La palette lilas/prune est typée : elle peut concurrencer un thème pastel violet ou jurer avec un thème méditerranéen.
- Le « l » en crosse perd en lisibilité sous 24 px : prévoir le favicon simplifié et ne jamais réduire le logotype sous 96 px de large.
- Le registre botanique est très occupé sur Etsy ; la différence tient à l'exécution.

---

### Direction C — Unfurl me (*Open here*)

**Concept** : La mention qu'on écrit sur un colis : « à ouvrir ». La marque parle comme une étiquette qu'on décolle, et le domaine unfurlme.love devient le logo.

**Logotype : `unfurl me`** — « unfurl me ». L'injonction est la marque : même phrase dans le logo, dans l'adresse et sur les stickers. Le symbole reprend le geste de décoller.

#### Logo

- **Logotype** : « unfurl me » en Shrikhand vectorisé, approche resserrée ; « me » passe en Tomate pour se lire comme l'instruction.
- **Symbole** : Un sticker rond dont le bord se décolle : le segment replié est le reflet exact du morceau manquant, et laisse voir l'envers blanc. Un « u » Shrikhand au centre.
- **Favicon 32 px** : Le sticker sans lettre : un disque tomate au bord relevé, lisible à 16 px.

#### Palette

| Nom | Hex | Rôle |
|---|---|---|
| Rose papier | `#FCE3DC` | Fond principal |
| Blanc | `#FFFFFF` | Surfaces, envers du sticker |
| Cacao | `#3A1E17` | Texte, contours, ombres portées |
| Tomate | `#BD321C` | Accent : boutons, « me », sticker |
| Menthe | `#A6DCC4` | Pastilles, surfaces secondaires |
| Beurre | `#FFE19C` | Étiquettes, surlignage |

Contrastes vérifiés (WCAG 2.1) :

| Texte | Fond | Ratio | Niveau |
|---|---|---|---|
| Cacao | Rose papier | 12,5:1 | AAA |
| Tomate | Rose papier | 4,7:1 | AA |
| Blanc | Tomate | 5,8:1 | AA |
| Cacao | Menthe | 9,9:1 | AAA |
| Tomate | Beurre | 4,5:1 | AA |

#### Typographies (Google Fonts, licence OFL, auto-hébergeables)

| Police | Rôle | Graisses | Pourquoi |
|---|---|---|---|
| Shrikhand | Logotype, accroches courtes | 400 | Display italique très gras, esprit enseigne des années 70 : à doser, jamais plus d'une ligne. |
| Figtree | Texte, interface, titres courants | 400 · 600 · 800 | Géométrique amicale et très lisible ; son 800 porte les titres quand Shrikhand serait trop. |

Échelle :

| Niveau | Police | Taille / interligne | Graisse | Approche | Exemple |
|---|---|---|---|---|---|
| Display | Shrikhand | 3rem / 1.05 | 400 | -0.01em | Open me. Good news inside. |
| Titre 2 | Figtree | 2rem / 1.1 | 800 | -0.02em | Tap. Unfold. Say yes. |
| Titre 3 | Figtree | 1.25rem / 1.3 | 600 | 0 | Personnalisée en 10 minutes |
| Texte | Figtree | 1rem / 1.55 | 400 | 0 | Une invitation qui s'ouvre comme une vraie lettre. Tes invités touchent, ça s'ouvre, ils répondent. |
| Étiquette | Figtree | 0.75rem / 1.3 | 800 | 0.1em | OPEN HERE · À OUVRIR |

#### Ton de voix

**espiègle, direct, chaleureux**. On parle à la première et à la deuxième personne, verbes d'action, un point d'exclamation par écran au maximum. On tutoie en français.

| Usage | EN | FR |
|---|---|---|
| Tagline | Open me. It's good news. | Ouvre-moi, c'est une bonne nouvelle. |
| Bouton | Make mine | Je crée la mienne |
| Après le RSVP | Sealed and sent! Zoe & Dylan just got a little happier. | C'est envoyé ! Zoe et Dylan viennent de sourire. |

#### Mises en situation (sur la planche)

SMS reçu avec `unfurlme.love/zoe-and-dylan` et aperçu de lien · bannière Etsy 3360 × 840 portant les 5 mêmes thèmes (test de neutralité) · vignette carrée de fiche produit · en-tête de la vitrine · sticker rond « unfurl me! · open here · à ouvrir ».

#### Clientèle US, forces, risques

**Clientèle** : Couples plus jeunes (25-32 ans), mariages décontractés ou « backyard », anniversaires, baby showers non genrés, EVJF ; découverte par TikTok, Instagram et Pinterest plus que par la recherche Etsy.

**Forces**

- La plus mémorable : le domaine, le logo et l'appel à l'action disent la même phrase.
- Culture sticker : se décline tout seul en autocollants, emballages, réactions Instagram.
- Le « me » rend le lien reçu personnel et donne envie de toucher.

**Risques**

- Le fond rose et la graisse de Shrikhand entrent en concurrence avec un thème sombre ou très chic.
- Moins crédible pour une fête d'entreprise ; signal de prix plus bas.
- Le rétro 70s est une tendance : risque de dater d'ici trois ou quatre ans.

---

### Recommandation : lancer avec A, Le Pli, et garder « unfurl me » en tampon

1. **La vitrine est une galerie.** Unfurl vendra des dizaines de thèmes aux styles opposés. Sur les trois bannières, les cinq mêmes thèmes : sur le calque froid de A, chacun reste lui-même ; le lilas de B et le rose de C prennent déjà parti.
2. **Tous les événements.** Un pli n'appartient ni au mariage ni à l'enfance : A tient pour un baptême comme pour une fête d'entreprise, là où la fougère (B) et le sticker (C) orientent le propos.
3. **Les petites tailles.** Le symbole reste net à 16 px et dans l'avatar rond d'Etsy (affiché autour de 40 px dans les résultats). Le logotype est dessiné, pas composé dans une police libre : il se protège mieux.
4. **Le prix.** Face à des modèles Canva vendus 20 à 30 $, A affiche une finition de studio qui justifie un prix plus élevé et prépare la vente directe sur unfurlme.love.
5. **La chaleur s'emprunte.** Le point faible de A (un peu froid) se corrige sans toucher au système : rose buvard, italiques Newsreader, ton attentionné, et la phrase « unfurl me » de C en étiquette sur les emballages, les stories et la fin des Reels, jamais dans le logo.

**Si la boutique vise d'abord le mariage romantique** : B est le meilleur choix émotionnel. Même si A l'emporte, la crosse ferait une excellente collection de thèmes (« Fiddlehead » : naissance, baptême, jardin).

**Si l'acquisition passe surtout par TikTok et Instagram** : C est la plus mémorable et la plus partageable ; à réserver à une campagne ou à une ligne « party » (anniversaires, EVJF).

**Prochaines étapes** :

- Montrer le mock SMS de A et de C à 5-10 acheteuses cibles : lequel donne le plus envie de toucher le lien ?
- Vérifier l'avatar et la bannière dans l'aperçu mobile d'une vraie boutique Etsy.
- Recherche d'antériorité sur le logotype et le symbole (USPTO, classes 9, 16, 42) avant dépôt.
- Poser les tokens (couleurs, polices auto-hébergées) dans le site.

---

### Annexe — SVG des logos

Tous les tracés sont vectorisés (aucune police requise). Les logotypes B et C partent des glyphes Gloock et Shrikhand (licence OFL, qui autorise la vectorisation dans un logo) ; le « l » en crosse de B et tout le logotype A sont dessinés. Couleurs par défaut sur fond clair.

#### A — logotype `unfurl`

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -4 262 68" width="262" height="68"><path d="M4 26.4V40A20 20 0 0 0 44 40M44 26.4V60M60 26.4V60M60 40A20 20 0 0 1 100 40V60M124 60V14A14 14 0 0 1 138 0H146M113 20H141M158 26.4V40A20 20 0 0 0 198 40M198 26.4V60M216 26.4V60M216 40A20 20 0 0 1 236 20H241M254 6.4V60" fill="none" stroke="currentColor" stroke-width="7"/><path d="M0.5 27H7.5V20ZM40.5 27H47.5V20ZM56.5 27H63.5V20ZM154.5 27H161.5V20ZM194.5 27H201.5V20ZM212.5 27H219.5V20ZM250.5 7H257.5V0Z" fill="#1D2233"/></svg>
```

#### A — symbole (le pli) et favicon

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><path d="M64 0V64H0Z" fill="#2E44C8"/><path d="M59.5 0L17 17L0 59.5Z" fill="#F3CFC6"/></svg>
```

#### B — logotype `unfurl` (crosse)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -84 332 90" width="332" height="90"><g fill="#2E1A34"><path d="M40.8 2.8 40.7 -10.1Q38.1 -5.0 32.8 -1.8Q27.5 1.4 21.6 1.4Q14.9 1.4 10.9 -3.0Q6.8 -7.4 6.8 -14.6V-41.8Q6.8 -45.6 5.3 -47.7Q3.8 -49.8 -1.3 -49.8V-50.8H8.8Q13.9 -50.8 16.6 -51.9Q19.1 -53.0 20.1 -54.6H21.1V-13.6Q21.1 -8.6 23.1 -5.6Q25.1 -2.6 28.3 -2.6Q31.4 -2.6 34.7 -5.2Q38.0 -7.9 40.5 -12.4V-41.8Q40.5 -45.4 38.7 -47.6Q36.9 -49.8 32.5 -49.8V-50.8H42.6Q47.7 -50.8 50.4 -51.9Q53.0 -53.0 54.0 -54.6H55.0L54.9 -9.0Q54.9 -5.4 57.1 -3.2Q59.3 -0.9 62.9 -0.9V0.0H53.0Q50.4 0.0 48.4 0.2Q46.4 0.3 45.1 0.5Q42.4 1.1 41.3 2.8ZM62.4 0.0V-1.0H62.5Q66.1 -1.0 68.3 -3.2Q70.5 -5.4 70.5 -9.0V-41.8Q70.5 -45.6 69.0 -47.7Q67.4 -49.8 62.4 -49.8V-50.8H72.3Q77.4 -50.8 80.1 -51.9Q82.6 -53.0 83.6 -54.6H84.6L84.7 -40.6Q87.3 -45.8 92.6 -49.0Q97.9 -52.2 103.8 -52.2Q110.5 -52.2 114.6 -47.8Q118.6 -43.4 118.6 -36.2V-9.0Q118.6 -5.4 120.8 -3.2Q123.0 -1.0 126.6 -1.0H126.7V0.0H96.2V-1.0H96.3Q99.9 -1.0 102.1 -3.2Q104.3 -5.4 104.3 -9.0V-37.2Q104.3 -42.2 102.4 -45.2Q100.4 -48.2 97.2 -48.2Q94.1 -48.2 90.8 -45.6Q87.4 -42.9 84.9 -38.4V-9.0Q84.9 -5.4 87.1 -3.2Q89.3 -1.0 92.9 -1.0H93.0V0.0ZM126.0 0.0V-1.0Q129.6 -1.0 131.8 -3.2Q134.1 -5.4 134.1 -9.0V-49.0H125.6L126.6 -50.8H134.1V-53.1Q134.1 -60.7 136.6 -66.2Q139.2 -71.8 143.9 -74.9Q148.6 -78.0 155.0 -78.0Q159.4 -78.0 163.4 -76.7Q167.3 -75.3 170.2 -73.0Q173.0 -70.6 174.2 -67.5L162.2 -60.7Q162.1 -64.3 161.6 -67.2Q161.2 -70.1 160.2 -72.3Q158.2 -76.7 155.1 -76.7Q151.9 -76.7 150.3 -71.8Q148.5 -66.9 148.5 -58.4V-50.8H162.0L161.0 -49.0H148.5V-9.0Q148.5 -5.4 151.2 -3.2Q154.0 -1.0 158.5 -1.0H158.6V0.0ZM198.6 2.8 198.5 -10.1Q195.9 -5.0 190.6 -1.8Q185.3 1.4 179.4 1.4Q172.7 1.4 168.7 -3.0Q164.6 -7.4 164.6 -14.6V-41.8Q164.6 -45.6 163.1 -47.7Q161.6 -49.8 156.5 -49.8V-50.8H166.6Q171.7 -50.8 174.4 -51.9Q176.9 -53.0 177.9 -54.6H178.9V-13.6Q178.9 -8.6 180.9 -5.6Q182.9 -2.6 186.1 -2.6Q189.2 -2.6 192.5 -5.2Q195.8 -7.9 198.3 -12.4V-41.8Q198.3 -45.4 196.5 -47.6Q194.7 -49.8 190.3 -49.8V-50.8H200.4Q205.5 -50.8 208.2 -51.9Q210.8 -53.0 211.8 -54.6H212.8L212.7 -9.0Q212.7 -5.4 214.9 -3.2Q217.1 -0.9 220.7 -0.9V0.0H210.8Q208.2 0.0 206.2 0.2Q204.2 0.3 202.9 0.5Q200.2 1.1 199.1 2.8ZM220.2 0.0V-1.0H220.3Q223.9 -1.0 226.1 -3.2Q228.3 -5.4 228.3 -9.0V-41.8Q228.3 -45.6 226.8 -47.7Q225.2 -49.8 220.2 -49.8V-50.8H230.1Q235.4 -50.8 238.1 -51.9Q240.8 -52.9 241.9 -54.6H242.4L242.5 -38.2Q243.8 -41.2 245.9 -44.5Q247.9 -47.8 251.1 -50.1Q254.2 -52.3 258.6 -52.3Q260.1 -52.3 261.8 -52.0Q263.5 -51.7 265.4 -50.9L261.5 -39.2Q257.9 -41.2 255.3 -42.0Q252.6 -42.8 250.6 -42.8Q247.2 -42.8 245.6 -40.7Q243.9 -38.6 242.7 -35.7V-9.0Q242.7 -5.4 244.9 -3.2Q247.1 -1.0 250.7 -1.0H250.8V0.0Z"/><path d="M265.9 0V-1Q273.7 -1 274 -9V-58L274.8 -60.4L275.6 -61.7L276.5 -62.9L277.3 -64.1L278.3 -65.1L279.2 -66.1L280.2 -67.1L281.2 -67.9L282.2 -68.7L283.2 -69.4L284.2 -70.1L285.2 -70.7L286.2 -71.3L287.2 -71.8L288.2 -72.2L289.2 -72.6L290.2 -72.9L291.3 -73.2L292.2 -73.5L293.2 -73.7L294.2 -73.8L295.2 -73.9L296.2 -74L297.1 -74L298.1 -74L299 -73.9L300 -73.8L300.9 -73.7L301.8 -73.5L302.7 -73.2L303.5 -72.9L304.4 -72.6L305.2 -72.2L306 -71.8L306.8 -71.3L307.5 -70.8L308.2 -70.3L308.9 -69.7L309.5 -69.1L310.1 -68.5L310.6 -67.8L311.1 -67.1L311.6 -66.3L312 -65.6L312.4 -64.8L312.7 -64L312.9 -63.2L313.1 -62.4L313.2 -61.6L313.3 -60.8L313.4 -59.9L313.4 -59.1L313.3 -58.3L313.2 -57.5L313 -56.8L312.8 -56L312.5 -55.3L312.2 -54.6L311.9 -53.9L311.5 -53.2L311.1 -52.6L310.6 -52L310.2 -51.5L309.7 -50.9L309.1 -50.4L308.6 -50L308 -49.6L307.4 -49.2L306.8 -48.8L306.2 -48.5L305.6 -48.3L305 -48L304.3 -47.9L303.7 -47.7L303.1 -47.6L302.4 -47.5L301.8 -47.4L301.2 -47.4L300.5 -47.4L299.9 -47.5L299.3 -47.6L298.7 -47.7L298.1 -47.9L297.5 -48L297 -48.3L296.4 -48.5L295.9 -48.8L295.4 -49.1L294.9 -49.4L294.4 -49.7L294 -50.1L293.6 -50.5L293.2 -50.9L292.9 -51.4L292.5 -51.8L292.2 -52.3L292 -52.8L291.7 -53.3L291.5 -53.8L291.4 -54.3L291.2 -54.8L291.1 -55.3L291 -55.9L291 -56.4L291 -56.9L291 -57.4L291.1 -57.9L291.2 -58.4L291.3 -58.9L291.4 -59.4L291.6 -59.9L291.8 -60.3L292 -60.8L292.2 -61.2L292.5 -61.6L292.8 -62L293.1 -62.3L293.4 -62.7L293.7 -63L294.1 -63.3L294.4 -63.5L294.8 -63.8L295.2 -64L295.6 -64.2L296 -64.4L296.4 -64.6L296.8 -64.7L297.2 -64.8L297.6 -64.9L298.1 -64.9L298.5 -65L298.9 -65L299.3 -64.9L299.7 -64.9L300.1 -64.8L300.5 -64.7L300.9 -64.6L301.3 -64.5L301.6 -64.3L302 -64.2L302.3 -64L302.6 -63.8L302.9 -63.5L303.2 -63.3L303.5 -63L303.7 -62.8L304 -62.5L304.2 -62.2L304.4 -61.9L304.6 -61.6L304.7 -61.3L304.9 -60.9L305 -60.6L305.1 -60.3L305.1 -59.9L305.2 -59.6L305.2 -59.3L305.3 -58.9L305.2 -58.6L305.2 -58.3L305.2 -58L305.1 -57.6L305.1 -57.3L305 -57L304.9 -56.7L304.7 -56.4L304.6 -56.2L304.4 -55.9L304.3 -55.6L304.1 -55.4L303.9 -55.2L303.7 -54.9L303.5 -54.7L303.3 -54.5L303 -54.4L302.8 -54.2L302.5 -54L302.3 -53.9L302 -53.8L301.8 -53.7L301.5 -53.6L301.2 -53.6L301 -53.5L300.7 -53.5L300.4 -53.5L300.1 -53.5L299.9 -53.5L299.6 -53.5L299.3 -53.6L299.1 -53.6L298.8 -53.7L298.6 -53.8L298.4 -53.9L298.2 -54L297.9 -54.2L297.7 -54.3L297.5 -54.5L297.4 -54.6L297.2 -54.8L297 -55L296.9 -55.2L296.8 -55.4L296.7 -55.6L296.5 -55.8L296.5 -56L296.4 -56.2L296.3 -56.4L296.3 -56.6L296.2 -56.8L296.2 -57L296.2 -57.3L296.2 -57.5L296.2 -57.7L296.2 -57.9L296.2 -58.1L296.3 -58.3L296.3 -58.5L296.4 -58.7L296.4 -58.9L296.5 -59L296.7 -59L296.6 -58.8L296.6 -58.6L296.5 -58.4L296.5 -58.2L296.4 -58.1L296.4 -57.9L296.4 -57.7L296.4 -57.5L296.4 -57.3L296.4 -57.1L296.5 -56.9L296.5 -56.7L296.6 -56.5L296.7 -56.3L296.8 -56.1L296.9 -55.9L297 -55.8L297.1 -55.6L297.2 -55.4L297.4 -55.3L297.5 -55.1L297.7 -55L297.9 -54.8L298 -54.7L298.2 -54.6L298.4 -54.5L298.6 -54.4L298.8 -54.3L299 -54.3L299.2 -54.2L299.5 -54.2L299.7 -54.1L299.9 -54.1L300.2 -54.1L300.4 -54.1L300.6 -54.1L300.9 -54.1L301.1 -54.2L301.3 -54.2L301.6 -54.3L301.8 -54.4L302 -54.5L302.3 -54.6L302.5 -54.7L302.7 -54.8L302.9 -55L303.1 -55.2L303.3 -55.3L303.5 -55.5L303.6 -55.7L303.8 -56L303.9 -56.2L304.1 -56.4L304.2 -56.7L304.3 -56.9L304.4 -57.2L304.5 -57.5L304.5 -57.8L304.6 -58L304.6 -58.3L304.6 -58.6L304.6 -58.9L304.6 -59.2L304.5 -59.5L304.5 -59.8L304.4 -60.1L304.3 -60.4L304.2 -60.6L304 -60.9L303.9 -61.2L303.7 -61.5L303.5 -61.7L303.3 -62L303.1 -62.2L302.9 -62.4L302.6 -62.6L302.4 -62.8L302.1 -63L301.8 -63.2L301.5 -63.4L301.2 -63.5L300.9 -63.6L300.6 -63.7L300.3 -63.8L299.9 -63.9L299.6 -63.9L299.2 -64L298.9 -64L298.5 -64L298.2 -63.9L297.8 -63.9L297.4 -63.8L297.1 -63.7L296.7 -63.6L296.4 -63.4L296 -63.3L295.7 -63.1L295.4 -62.9L295.1 -62.7L294.8 -62.4L294.5 -62.2L294.2 -61.9L294 -61.6L293.7 -61.2L293.5 -60.9L293.3 -60.6L293.1 -60.2L292.9 -59.8L292.8 -59.4L292.7 -59L292.6 -58.6L292.5 -58.2L292.4 -57.8L292.4 -57.3L292.4 -56.9L292.4 -56.5L292.5 -56L292.6 -55.6L292.6 -55.2L292.8 -54.7L292.9 -54.3L293.1 -53.9L293.3 -53.5L293.5 -53L293.8 -52.6L294 -52.3L294.3 -51.9L294.6 -51.5L295 -51.2L295.3 -50.8L295.7 -50.5L296.1 -50.2L296.6 -50L297 -49.7L297.5 -49.5L298 -49.3L298.5 -49.2L299 -49L299.5 -48.9L300.1 -48.8L300.6 -48.8L301.1 -48.8L301.7 -48.8L302.2 -48.9L302.8 -49L303.3 -49.2L303.9 -49.3L304.4 -49.5L304.9 -49.8L305.4 -50.1L305.9 -50.4L306.4 -50.7L306.9 -51.1L307.3 -51.5L307.7 -51.9L308.1 -52.4L308.4 -52.9L308.8 -53.4L309.1 -53.9L309.4 -54.4L309.6 -55L309.8 -55.6L310 -56.1L310.2 -56.7L310.3 -57.4L310.4 -58L310.4 -58.6L310.5 -59.2L310.5 -59.9L310.4 -60.5L310.3 -61.2L310.2 -61.8L310.1 -62.5L309.9 -63.1L309.7 -63.8L309.5 -64.4L309.2 -65.1L308.9 -65.7L308.5 -66.3L308.1 -66.9L307.7 -67.5L307.2 -68L306.7 -68.6L306.1 -69.1L305.5 -69.6L304.9 -70L304.3 -70.5L303.6 -70.8L302.9 -71.2L302.1 -71.5L301.3 -71.7L300.5 -71.9L299.7 -72.1L298.9 -72.2L298.1 -72.2L297.2 -72.2L296.4 -72.1L295.5 -71.9L294.7 -71.7L293.9 -71.4L293.1 -71.1L292.3 -70.7L291.5 -70.2L290.8 -69.7L290.2 -69.1L289.6 -68.4L289 -67.8L288.5 -67L288.1 -66.3L287.7 -65.4L287.5 -64.6L287.2 -63.8L287.1 -62.9L287.1 -62L287.1 -61.1L287.2 -60.3L287.4 -59.4L287.6 -58.6L287.9 -57.8L288.4 -58V-9Q288.7 -1 296.5 -1V0Z"/><circle cx="296.6" cy="-59" r="3.3"/></g></svg>
```

#### B — symbole (la crosse)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><g fill="#9E2554"><path d="M15.8 58V30L16.1 28.4L16.5 27.3L16.9 26.2L17.4 25.2L18 24.2L18.6 23.3L19.2 22.4L19.9 21.5L20.7 20.8L21.4 20L22.3 19.4L23.1 18.8L23.9 18.2L24.8 17.7L25.7 17.3L26.6 16.9L27.5 16.6L28.3 16.3L29.2 16L30.1 15.8L31 15.7L31.9 15.6L32.8 15.5L33.7 15.5L34.5 15.5L35.4 15.6L36.2 15.7L37 15.8L37.9 16L38.7 16.2L39.5 16.5L40.2 16.8L41 17.1L41.7 17.5L42.4 17.9L43.1 18.4L43.7 18.8L44.3 19.3L44.9 19.9L45.5 20.5L46 21.1L46.4 21.7L46.9 22.4L47.2 23.1L47.6 23.8L47.9 24.5L48.1 25.2L48.3 26L48.4 26.7L48.5 27.5L48.6 28.2L48.5 29L48.5 29.7L48.4 30.4L48.2 31.1L48 31.8L47.8 32.5L47.5 33.2L47.2 33.8L46.8 34.4L46.4 34.9L46 35.5L45.6 36L45.1 36.5L44.6 36.9L44.1 37.3L43.6 37.7L43.1 38L42.5 38.3L41.9 38.6L41.4 38.8L40.8 39L40.2 39.2L39.6 39.3L39.1 39.4L38.5 39.5L37.9 39.5L37.3 39.5L36.8 39.5L36.2 39.5L35.7 39.4L35.1 39.3L34.6 39.2L34.1 39L33.6 38.8L33.1 38.6L32.6 38.4L32.1 38.1L31.7 37.8L31.2 37.5L30.8 37.2L30.5 36.8L30.1 36.4L29.8 36L29.5 35.6L29.2 35.2L28.9 34.8L28.7 34.3L28.5 33.9L28.4 33.4L28.2 32.9L28.1 32.4L28 32L28 31.5L28 31L28 30.5L28.1 30.1L28.1 29.6L28.2 29.1L28.4 28.7L28.5 28.3L28.7 27.9L28.9 27.5L29.1 27.1L29.4 26.7L29.6 26.4L29.9 26.1L30.2 25.7L30.5 25.5L30.9 25.2L31.2 25L31.5 24.7L31.9 24.5L32.3 24.4L32.6 24.2L33 24.1L33.4 24L33.7 23.9L34.1 23.8L34.5 23.8L34.9 23.7L35.3 23.7L35.6 23.7L36 23.8L36.4 23.8L36.7 23.9L37.1 24L37.4 24.1L37.7 24.3L38 24.4L38.3 24.6L38.6 24.8L38.9 25L39.2 25.2L39.4 25.4L39.7 25.7L39.9 25.9L40.1 26.2L40.3 26.4L40.4 26.7L40.6 27L40.7 27.3L40.8 27.6L40.9 27.9L41 28.2L41.1 28.5L41.1 28.8L41.1 29.1L41.1 29.4L41.1 29.7L41.1 30L41 30.3L40.9 30.6L40.8 30.9L40.7 31.2L40.6 31.4L40.5 31.7L40.4 31.9L40.2 32.2L40 32.4L39.9 32.6L39.7 32.8L39.5 33L39.3 33.2L39 33.3L38.8 33.5L38.6 33.6L38.4 33.7L38.1 33.8L37.9 33.9L37.6 34L37.4 34L37.1 34.1L36.9 34.1L36.7 34.1L36.4 34.1L36.2 34.1L35.9 34.1L35.7 34L35.5 34L35.2 33.9L35 33.8L34.8 33.7L34.6 33.6L34.4 33.5L34.2 33.4L34 33.2L33.9 33.1L33.7 32.9L33.6 32.8L33.4 32.6L33.3 32.4L33.2 32.2L33.1 32L33 31.9L32.9 31.7L32.9 31.5L32.8 31.3L32.8 31.1L32.8 30.9L32.7 30.7L32.7 30.5L32.7 30.3L32.8 30.1L32.8 29.9L32.8 29.7L32.9 29.5L32.9 29.4L33 29.2L33.1 29L33.3 29.1L33.2 29.3L33.1 29.4L33.1 29.6L33 29.8L33 30L33 30.1L33 30.3L33 30.5L33 30.7L33 30.8L33 31L33.1 31.2L33.1 31.4L33.2 31.6L33.3 31.7L33.4 31.9L33.5 32.1L33.6 32.2L33.7 32.4L33.8 32.5L34 32.7L34.1 32.8L34.3 32.9L34.4 33.1L34.6 33.2L34.8 33.3L35 33.3L35.2 33.4L35.4 33.5L35.6 33.6L35.8 33.6L36 33.6L36.2 33.7L36.4 33.7L36.6 33.7L36.9 33.7L37.1 33.6L37.3 33.6L37.5 33.5L37.7 33.5L38 33.4L38.2 33.3L38.4 33.2L38.6 33.1L38.8 32.9L39 32.8L39.1 32.6L39.3 32.5L39.5 32.3L39.6 32.1L39.8 31.9L39.9 31.7L40 31.4L40.1 31.2L40.2 31L40.3 30.7L40.4 30.5L40.4 30.2L40.5 30L40.5 29.7L40.5 29.4L40.5 29.2L40.5 28.9L40.4 28.6L40.4 28.4L40.3 28.1L40.2 27.8L40.1 27.6L40 27.3L39.9 27L39.7 26.8L39.6 26.6L39.4 26.3L39.2 26.1L39 25.9L38.8 25.7L38.5 25.5L38.3 25.3L38 25.1L37.7 25L37.5 24.9L37.2 24.7L36.9 24.6L36.6 24.5L36.2 24.5L35.9 24.4L35.6 24.4L35.2 24.4L34.9 24.4L34.6 24.4L34.2 24.5L33.9 24.6L33.6 24.7L33.2 24.8L32.9 24.9L32.6 25.1L32.3 25.2L32 25.4L31.7 25.7L31.4 25.9L31.2 26.2L30.9 26.4L30.7 26.7L30.5 27L30.3 27.3L30.1 27.6L29.9 28L29.8 28.3L29.7 28.7L29.6 29.1L29.5 29.4L29.4 29.8L29.3 30.2L29.3 30.6L29.3 31L29.3 31.4L29.4 31.8L29.4 32.2L29.5 32.6L29.6 33L29.7 33.4L29.9 33.8L30.1 34.2L30.3 34.6L30.5 35L30.7 35.3L31 35.7L31.3 36L31.6 36.4L31.9 36.7L32.3 37L32.7 37.3L33.1 37.5L33.5 37.7L33.9 38L34.4 38.1L34.8 38.3L35.3 38.4L35.8 38.5L36.3 38.6L36.8 38.6L37.3 38.6L37.8 38.6L38.4 38.5L38.9 38.4L39.4 38.3L39.9 38.1L40.4 37.9L40.9 37.7L41.3 37.4L41.8 37.1L42.2 36.8L42.6 36.4L43 36L43.4 35.6L43.7 35.2L44.1 34.8L44.4 34.3L44.6 33.8L44.9 33.3L45.1 32.8L45.3 32.3L45.5 31.7L45.6 31.2L45.7 30.6L45.8 30L45.9 29.4L45.9 28.9L45.9 28.3L45.9 27.7L45.8 27.1L45.7 26.5L45.6 25.9L45.4 25.3L45.3 24.7L45 24.1L44.8 23.5L44.5 22.9L44.2 22.3L43.8 21.8L43.4 21.2L43 20.7L42.5 20.2L42 19.7L41.5 19.2L40.9 18.8L40.3 18.4L39.7 18L39 17.7L38.3 17.4L37.6 17.2L36.8 17L36.1 16.8L35.3 16.8L34.5 16.7L33.7 16.7L32.9 16.8L32.1 17L31.3 17.2L30.6 17.4L29.8 17.7L29.1 18.1L28.4 18.5L27.7 19L27 19.5L26.4 20L25.9 20.6L25.3 21.2L24.8 21.9L24.4 22.6L24 23.3L23.6 24.1L23.3 24.8L23 25.6L22.8 26.4L22.6 27.2L22.4 28L22.3 28.8L22.2 29.6L22.2 30V58Z"/><circle cx="33.2" cy="29.1" r="2.5"/></g></svg>
```

#### B — favicon (crosse simplifiée)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><g fill="#9E2554"><path d="M18 57V29L18.4 27.3L18.8 26.5L19.2 25.7L19.7 24.9L20.1 24.2L20.6 23.5L21.1 22.8L21.6 22.2L22.2 21.6L22.7 21L23.3 20.4L23.8 19.9L24.4 19.4L25 18.9L25.6 18.5L26.2 18.1L26.8 17.7L27.5 17.3L28.1 17L28.7 16.6L29.3 16.4L30 16.1L30.6 15.9L31.2 15.6L31.9 15.4L32.5 15.3L33.1 15.1L33.8 15L34.4 14.9L35 14.8L35.6 14.8L36.3 14.8L36.9 14.8L37.5 14.8L38.1 14.8L38.7 14.9L39.3 15L39.8 15.1L40.4 15.2L41 15.4L41.5 15.5L42.1 15.7L42.6 15.9L43.1 16.2L43.6 16.4L44.1 16.7L44.5 17L45 17.3L45.4 17.6L45.9 18L46.3 18.3L46.6 18.7L47 19.1L47.3 19.5L47.7 19.9L48 20.3L48.2 20.7L48.5 21.2L48.7 21.6L48.9 22.1L49.1 22.5L49.3 23L49.5 23.4L49.6 23.9L49.7 24.4L49.8 24.8L49.9 25.3L49.9 25.7L50 26.2L50 26.7L50 27.1L49.9 27.6L49.9 28L49.8 28.4L49.8 28.9L49.7 29.3L49.6 29.7L49.4 30.1L49.3 30.5L49.2 30.9L49 31.3L48.8 31.6L48.6 32L48.4 32.3L48.2 32.7L48 33L47.8 33.3L47.5 33.6L47.3 33.9L47 34.2L46.7 34.5L46.4 34.8L46.2 35L45.9 35.2L45.6 35.5L45.2 35.7L44.9 35.9L44.6 36L44.3 36.2L43.9 36.4L43.6 36.5L43.3 36.6L42.9 36.7L42.6 36.8L42.2 36.9L41.9 36.9L41.6 37L41.2 37L40.9 37L40.5 37L40.2 37L39.8 37L39.5 36.9L39.2 36.9L38.9 36.8L38.5 36.7L38.2 36.6L37.9 36.5L37.6 36.3L37.4 36.2L37.1 36L36.8 35.9L36.6 35.7L36.3 35.5L36.1 35.3L35.9 35.1L35.7 34.9L35.5 34.6L35.3 34.4L35.1 34.2L35 33.9L34.8 33.7L34.7 33.4L34.6 33.2L34.5 32.9L34.4 32.7L34.3 32.4L34.2 32.2L34.2 31.9L34.1 31.7L34.1 31.4L34 31.2L34 30.9L34 30.7L34 30.5L34 30.2L34 30L34 29.7L34.1 29.5L34.1 29.3L34.1 29.1L34.2 28.8L34.2 28.6L34.3 28.4L34.4 28.2L34.4 28L34.5 27.8L34.6 27.6L34.7 27.4L34.8 27.2L34.9 27L35 26.8L35.1 26.7L35.2 26.5L35.4 26.3L35.5 26.2L35.6 26L35.8 25.8L35.9 25.7L36.1 25.6L36.2 25.4L36.4 25.3L36.5 25.2L36.7 25L36.9 24.9L37.1 24.8L37.2 24.8L37.4 24.7L37.6 24.6L37.8 24.5L38 24.5L38.2 24.4L38.4 24.4L38.6 24.4L38.8 24.4L39 24.4L39.2 24.4L39.4 24.4L39.6 24.4L39.8 24.5L40 24.5L40.1 24.6L40.3 24.6L40.5 24.7L40.6 24.8L40.8 24.9L40.9 25L41.1 25.1L41.2 25.2L41.4 25.3L41.5 25.5L41.6 25.6L41.7 25.7L41.8 25.9L41.9 26L42 26.1L42 26.3L42.1 26.4L42.2 26.6L42.2 26.7L42.3 26.9L42.3 27L42.3 27.2L42.4 27.3L42.4 27.4L42.4 27.6L42.4 27.7L42.4 27.9L42.4 28L42.4 28.1L41.8 28.2L41.8 28.1L41.7 28L41.7 27.9L41.6 27.8L41.6 27.7L41.5 27.6L41.5 27.5L41.4 27.5L41.3 27.4L41.2 27.3L41.2 27.2L41.1 27.2L41 27.1L40.9 27L40.8 27L40.7 26.9L40.6 26.9L40.5 26.8L40.4 26.8L40.3 26.8L40.2 26.7L40.1 26.7L40 26.7L39.9 26.6L39.8 26.6L39.7 26.6L39.6 26.5L39.5 26.5L39.4 26.5L39.3 26.5L39.2 26.5L39.1 26.4L39 26.4L38.9 26.4L38.8 26.4L38.7 26.4L38.6 26.4L38.4 26.4L38.3 26.4L38.2 26.4L38.1 26.4L38 26.4L37.8 26.5L37.7 26.5L37.6 26.5L37.4 26.5L37.3 26.6L37.2 26.6L37 26.7L36.9 26.7L36.8 26.8L36.6 26.9L36.5 27L36.4 27.1L36.3 27.2L36.1 27.3L36 27.4L35.9 27.5L35.8 27.6L35.7 27.8L35.6 27.9L35.5 28L35.4 28.2L35.4 28.4L35.3 28.5L35.2 28.7L35.2 28.9L35.2 29L35.1 29.2L35.1 29.4L35.1 29.6L35.1 29.8L35.1 30L35.1 30.2L35.2 30.4L35.2 30.5L35.2 30.7L35.3 30.9L35.4 31.1L35.5 31.3L35.5 31.5L35.6 31.6L35.7 31.8L35.8 32L36 32.1L36.1 32.3L36.2 32.5L36.4 32.6L36.5 32.8L36.7 32.9L36.8 33L37 33.2L37.1 33.3L37.3 33.4L37.5 33.5L37.7 33.6L37.9 33.7L38 33.8L38.2 33.9L38.4 34L38.6 34.1L38.8 34.1L39.1 34.2L39.3 34.3L39.5 34.3L39.7 34.4L39.9 34.4L40.2 34.4L40.4 34.5L40.6 34.5L40.9 34.5L41.1 34.5L41.3 34.5L41.6 34.5L41.8 34.4L42.1 34.4L42.3 34.3L42.6 34.3L42.8 34.2L43.1 34.1L43.3 34L43.6 33.9L43.8 33.8L44.1 33.7L44.3 33.6L44.6 33.4L44.8 33.3L45 33.1L45.2 32.9L45.5 32.7L45.7 32.5L45.9 32.3L46.1 32L46.2 31.8L46.4 31.5L46.6 31.3L46.7 31L46.9 30.7L47 30.4L47.1 30.1L47.2 29.8L47.3 29.5L47.4 29.2L47.4 28.8L47.5 28.5L47.5 28.2L47.6 27.8L47.6 27.5L47.5 27.1L47.5 26.8L47.5 26.4L47.4 26.1L47.4 25.7L47.3 25.4L47.2 25L47 24.7L46.9 24.3L46.8 24L46.6 23.6L46.4 23.3L46.2 23L46 22.6L45.8 22.3L45.6 22L45.3 21.7L45.1 21.4L44.8 21.1L44.5 20.8L44.2 20.6L43.9 20.3L43.6 20L43.3 19.8L42.9 19.6L42.5 19.3L42.2 19.1L41.8 18.9L41.4 18.8L41 18.6L40.5 18.4L40.1 18.3L39.7 18.2L39.2 18.1L38.8 18L38.3 18L37.8 17.9L37.4 17.9L36.9 17.9L36.4 17.9L35.9 18L35.4 18.1L34.9 18.2L34.5 18.3L34 18.4L33.5 18.6L33 18.8L32.6 19L32.1 19.3L31.7 19.5L31.2 19.8L30.8 20.1L30.4 20.5L30 20.8L29.6 21.2L29.3 21.6L29 22L28.6 22.5L28.4 23L28.1 23.4L27.9 23.9L27.6 24.4L27.4 24.9L27.3 25.5L27.1 26L27 26.6L26.9 27.1L26.9 27.7L26.9 28.2L26.9 28.8L26.9 29.3L27 29V57Z"/><circle cx="42.1" cy="28.2" r="4.2"/></g></svg>
```

#### C — logotype `unfurl me`

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -80 521.7 86" width="521.7" height="86"><path d="M59.4 -13.8Q59.2 -13.0 59.2 -12.6Q59.2 -11.9 59.6 -11.5Q59.9 -11.1 60.5 -11.1Q61.7 -11.1 62.6 -12.2Q63.4 -13.2 63.7 -13.2Q64.2 -13.2 64.6 -12.6Q64.9 -11.9 64.9 -11.0Q65.0 -8.2 62.9 -5.5Q60.8 -2.7 57.0 -0.9Q53.2 0.9 48.5 0.9Q42.6 0.9 39.1 -1.5Q35.6 -3.9 34.6 -7.8Q31.0 -3.8 26.6 -1.8Q22.3 0.3 17.8 0.3Q10.8 0.3 6.1 -3.2Q1.3 -6.6 1.3 -12.8Q1.3 -15.6 2.3 -18.6L8.7 -39.5Q9.0 -40.4 9.0 -41.0Q9.0 -42.1 8.5 -42.8Q8.0 -43.4 7.0 -44.1Q6.0 -44.9 5.6 -45.5Q5.2 -46.1 5.5 -47.1Q6.1 -49.4 11.8 -51.2Q17.5 -52.9 23.7 -52.9Q29.5 -52.9 32.2 -50.7Q34.9 -48.5 34.9 -44.7Q34.9 -42.4 34.2 -40.3L27.9 -19.5Q27.5 -18.4 27.5 -17.4Q27.5 -16.0 28.3 -15.3Q29.1 -14.6 30.4 -14.6Q32.3 -14.6 33.5 -15.7Q34.7 -16.8 35.9 -19.4L42.0 -39.5Q42.3 -40.4 42.3 -41.0Q42.3 -42.1 41.8 -42.8Q41.3 -43.4 40.4 -44.1Q39.4 -44.9 39.0 -45.5Q38.6 -46.1 38.9 -47.1Q39.4 -49.4 45.1 -51.2Q50.8 -52.9 57.0 -52.9Q62.8 -52.9 65.5 -50.7Q68.3 -48.5 68.3 -44.8Q68.3 -42.9 67.5 -40.3ZM129.0 -13.8Q128.8 -13.4 128.8 -12.6Q128.8 -11.9 129.2 -11.5Q129.5 -11.1 130.1 -11.1Q131.3 -11.1 132.2 -12.2Q133.0 -13.2 133.3 -13.2Q133.8 -13.2 134.1 -12.6Q134.4 -11.9 134.4 -11.0Q134.5 -8.1 132.5 -5.3Q130.5 -2.6 126.7 -0.9Q122.8 0.9 117.4 0.9Q110.8 0.9 106.9 -2.1Q103.0 -5.2 102.9 -10.3Q102.9 -14.0 104.7 -18.6L110.2 -33.0Q110.7 -34.3 110.7 -35.1Q110.7 -36.4 109.9 -37.1Q109.0 -37.9 107.8 -37.9Q105.6 -37.9 103.6 -35.9Q101.6 -33.8 100.7 -30.8L94.5 -10.4Q94.1 -9.3 94.1 -8.3Q94.1 -7.1 94.6 -6.4Q95.1 -5.6 96.0 -4.8Q96.7 -4.2 97.0 -3.7Q97.3 -3.2 97.1 -2.5Q96.7 -1.2 95.2 -0.6Q93.7 0.0 90.5 0.0H67.7Q65.1 0.0 64.0 -0.9Q62.8 -1.7 63.1 -3.1Q63.5 -4.3 65.2 -5.2Q66.7 -6.0 67.7 -7.1Q68.7 -8.2 69.4 -10.6L78.3 -39.5Q78.5 -40.0 78.5 -40.9Q78.5 -42.0 78.1 -42.6Q77.6 -43.2 76.6 -44.1Q75.6 -44.9 75.2 -45.5Q74.8 -46.1 75.1 -47.1Q75.7 -49.4 81.4 -51.2Q87.1 -52.9 93.3 -52.9Q98.3 -52.9 101.2 -50.2Q104.1 -47.4 103.8 -42.5Q107.9 -48.4 112.5 -50.7Q117.1 -52.9 122.5 -52.9Q128.6 -52.9 132.4 -49.2Q136.1 -45.5 136.1 -39.6Q136.1 -36.5 135.1 -33.5ZM199.4 -62.7Q199.4 -58.9 196.3 -56.9Q193.1 -54.8 188.0 -54.8Q183.3 -54.8 180.7 -57.1Q178.1 -59.4 178.1 -62.8Q178.1 -64.9 179.4 -67.2Q176.4 -67.2 174.4 -65.8Q172.4 -64.3 171.3 -60.8Q170.7 -58.6 170.7 -56.7Q170.7 -54.3 171.6 -53.0Q172.4 -51.6 174.0 -51.6H179.9Q185.1 -51.6 185.1 -48.4Q185.1 -48.0 184.9 -47.2Q184.3 -45.0 182.5 -43.9Q180.6 -42.8 176.9 -42.8H173.9L164.0 -10.4Q163.7 -9.2 163.7 -8.3Q163.7 -7.0 164.2 -6.2Q164.7 -5.5 165.6 -4.8Q166.3 -4.1 166.6 -3.7Q166.9 -3.2 166.7 -2.5Q166.2 -1.2 164.7 -0.6Q163.2 0.0 160.1 0.0H137.3Q134.7 0.0 133.5 -0.9Q132.3 -1.7 132.7 -3.1Q133.1 -4.3 134.8 -5.2Q136.3 -6.0 137.3 -7.1Q138.3 -8.2 139.0 -10.6L146.8 -36.2Q147.3 -37.7 147.3 -39.3Q147.3 -41.3 146.5 -42.5Q145.6 -43.6 143.9 -45.0Q142.8 -45.9 142.2 -46.6Q141.7 -47.2 141.7 -48.1Q141.6 -50.0 143.1 -50.8Q144.5 -51.6 148.6 -51.6H151.1Q150.4 -54.1 150.4 -56.6Q150.4 -59.1 151.3 -61.8Q153.2 -66.9 159.5 -70.4Q165.7 -73.9 178.0 -73.9Q188.7 -73.9 194.1 -70.7Q199.4 -67.4 199.4 -62.7ZM236.7 -13.8Q236.5 -13.0 236.5 -12.6Q236.5 -11.9 236.9 -11.5Q237.2 -11.1 237.8 -11.1Q239.0 -11.1 239.9 -12.2Q240.7 -13.2 241.0 -13.2Q241.5 -13.2 241.9 -12.6Q242.2 -11.9 242.2 -11.0Q242.3 -8.2 240.2 -5.5Q238.1 -2.7 234.3 -0.9Q230.5 0.9 225.8 0.9Q219.9 0.9 216.4 -1.5Q212.9 -3.9 211.9 -7.8Q208.3 -3.8 204.0 -1.8Q199.6 0.3 195.1 0.3Q188.1 0.3 183.4 -3.2Q178.6 -6.6 178.6 -12.8Q178.6 -15.6 179.6 -18.6L186.0 -39.5Q186.3 -40.4 186.3 -41.0Q186.3 -42.1 185.8 -42.8Q185.3 -43.4 184.3 -44.1Q183.3 -44.9 182.9 -45.5Q182.5 -46.1 182.8 -47.1Q183.4 -49.4 189.1 -51.2Q194.8 -52.9 201.0 -52.9Q206.8 -52.9 209.5 -50.7Q212.2 -48.5 212.2 -44.7Q212.2 -42.4 211.5 -40.3L205.2 -19.5Q204.8 -18.4 204.8 -17.4Q204.8 -16.0 205.6 -15.3Q206.4 -14.6 207.7 -14.6Q209.6 -14.6 210.8 -15.7Q212.0 -16.8 213.2 -19.4L219.3 -39.5Q219.6 -40.4 219.6 -41.0Q219.6 -42.1 219.1 -42.8Q218.6 -43.4 217.7 -44.1Q216.7 -44.9 216.3 -45.5Q215.9 -46.1 216.2 -47.1Q216.7 -49.4 222.4 -51.2Q228.1 -52.9 234.3 -52.9Q240.1 -52.9 242.9 -50.7Q245.6 -48.5 245.6 -44.8Q245.6 -42.9 244.8 -40.3ZM305.8 -41.1Q305.8 -39.2 305.4 -37.6Q304.4 -33.5 301.6 -31.3Q298.8 -29.1 294.9 -29.1Q291.1 -29.1 289.2 -30.9Q287.2 -32.7 285.7 -35.7Q284.9 -37.4 284.2 -38.2Q283.5 -39.0 282.6 -39.0Q281.6 -39.0 280.9 -38.2Q280.1 -37.4 279.5 -35.4L271.8 -10.4Q271.6 -9.9 271.6 -8.9Q271.6 -7.6 272.4 -6.8Q273.1 -5.9 274.4 -5.1Q275.6 -4.3 276.0 -3.8Q276.4 -3.3 276.3 -2.5Q276.1 -1.2 274.9 -0.6Q273.6 0.0 270.6 0.0H245.0Q242.4 0.0 241.3 -0.9Q240.1 -1.7 240.4 -3.1Q240.8 -4.3 242.5 -5.2Q244.0 -6.0 245.0 -7.1Q246.0 -8.2 246.7 -10.6L255.6 -39.5Q255.8 -40.0 255.8 -40.9Q255.8 -42.0 255.4 -42.6Q254.9 -43.2 253.9 -44.1Q252.9 -44.9 252.5 -45.5Q252.1 -46.1 252.4 -47.1Q253.0 -49.4 258.7 -51.2Q264.4 -52.9 270.6 -52.9Q274.7 -52.9 277.4 -51.1Q280.1 -49.2 280.9 -45.8Q285.7 -52.9 293.5 -52.9Q299.1 -52.9 302.5 -49.5Q305.8 -46.1 305.8 -41.1ZM344.0 -65.7Q344.0 -63.5 343.3 -61.4L327.6 -10.4Q327.3 -9.2 327.3 -8.3Q327.3 -7.0 327.8 -6.2Q328.3 -5.5 329.2 -4.8Q329.9 -4.1 330.2 -3.7Q330.5 -3.2 330.3 -2.5Q329.8 -1.2 328.3 -0.6Q326.8 0.0 323.7 0.0H300.9Q298.3 0.0 297.1 -0.9Q295.9 -1.7 296.3 -3.1Q296.7 -4.3 298.4 -5.2Q299.9 -6.0 300.9 -7.1Q301.9 -8.2 302.6 -10.6L317.8 -60.5Q318.1 -61.4 318.1 -62.0Q318.1 -63.1 317.6 -63.8Q317.0 -64.5 316.1 -65.2Q315.1 -66.0 314.7 -66.6Q314.2 -67.2 314.5 -68.2Q315.1 -70.5 320.8 -72.2Q326.5 -73.9 332.7 -73.9Q338.5 -73.9 341.3 -71.7Q344.0 -69.5 344.0 -65.7Z" fill="#3A1E17"/><path d="M453.0 -13.8Q452.8 -13.4 452.8 -12.6Q452.8 -11.9 453.2 -11.5Q453.5 -11.1 454.1 -11.1Q455.3 -11.1 456.2 -12.2Q457.0 -13.2 457.3 -13.2Q457.8 -13.2 458.1 -12.6Q458.4 -11.9 458.4 -11.0Q458.5 -8.1 456.5 -5.3Q454.5 -2.6 450.7 -0.9Q446.8 0.9 441.4 0.9Q434.8 0.9 430.9 -2.1Q427.0 -5.2 426.9 -10.3Q426.9 -14.0 428.7 -18.6L434.2 -33.0Q434.7 -34.3 434.7 -35.1Q434.7 -36.4 433.9 -37.1Q433.0 -37.9 431.8 -37.9Q430.1 -37.9 428.3 -36.4Q426.5 -34.9 425.1 -31.7L419.6 -13.8Q419.4 -13.4 419.4 -12.6Q419.4 -11.9 419.8 -11.5Q420.1 -11.1 420.7 -11.1Q421.9 -11.1 422.8 -12.2Q423.6 -13.2 423.9 -13.2Q424.4 -13.2 424.7 -12.6Q425.0 -11.9 425.0 -11.0Q425.1 -8.1 423.1 -5.3Q421.1 -2.6 417.3 -0.9Q413.4 0.9 408.0 0.9Q401.4 0.9 397.5 -2.1Q393.6 -5.2 393.5 -10.3Q393.5 -14.0 395.3 -18.6L400.8 -33.0Q401.3 -34.3 401.3 -35.1Q401.3 -36.4 400.5 -37.1Q399.6 -37.9 398.4 -37.9Q396.7 -37.9 394.9 -36.5Q393.1 -35.0 391.9 -31.8L385.3 -10.4Q384.9 -9.3 384.9 -8.3Q384.9 -7.1 385.4 -6.4Q385.9 -5.6 386.8 -4.8Q387.5 -4.2 387.8 -3.7Q388.1 -3.2 387.9 -2.5Q387.5 -1.2 386.0 -0.6Q384.5 0.0 381.3 0.0H358.5Q355.9 0.0 354.8 -0.9Q353.6 -1.7 353.9 -3.1Q354.3 -4.3 356.0 -5.2Q357.5 -6.0 358.5 -7.1Q359.5 -8.2 360.2 -10.6L369.1 -39.5Q369.3 -40.0 369.3 -40.9Q369.3 -42.0 368.9 -42.6Q368.4 -43.2 367.4 -44.1Q366.4 -44.9 366.0 -45.5Q365.6 -46.1 365.9 -47.1Q366.5 -49.4 372.2 -51.2Q377.9 -52.9 384.1 -52.9Q389.0 -52.9 391.9 -50.2Q394.7 -47.5 394.6 -42.8Q398.7 -48.5 403.3 -50.7Q407.8 -52.9 413.1 -52.9Q418.9 -52.9 422.6 -49.6Q426.2 -46.2 426.6 -40.8Q430.9 -47.6 435.8 -50.2Q440.7 -52.9 446.5 -52.9Q452.6 -52.9 456.4 -49.2Q460.1 -45.5 460.1 -39.6Q460.1 -36.5 459.1 -33.5ZM519.2 -39.0Q519.2 -37.1 518.8 -35.5Q517.3 -28.9 510.5 -26.1Q503.6 -23.2 494.3 -23.2Q489.6 -23.2 485.5 -23.8Q485.4 -18.6 488.3 -16.5Q491.2 -14.4 496.4 -14.4Q498.8 -14.4 501.0 -14.9Q503.2 -15.5 506.6 -16.6Q509.4 -17.6 510.4 -17.6Q511.5 -17.6 511.5 -16.3Q511.6 -12.8 508.9 -9.0Q506.2 -5.1 500.9 -2.4Q495.6 0.3 488.1 0.3Q477.0 0.3 469.9 -5.3Q462.8 -10.9 462.8 -21.6Q462.8 -24.6 463.6 -28.6Q466.1 -40.9 474.6 -47.2Q483.0 -53.4 495.1 -53.4Q507.8 -53.4 513.5 -49.4Q519.2 -45.3 519.2 -39.0ZM487.3 -29.7Q491.5 -29.7 493.7 -33.6Q495.9 -37.5 495.8 -42.3Q495.7 -45.1 494.2 -45.1Q493.1 -45.1 491.6 -43.4Q490.1 -41.6 488.7 -38.1Q487.2 -34.6 486.2 -29.8Q486.6 -29.7 487.3 -29.7Z" fill="#BD321C"/></svg>
```

#### C — symbole (sticker qui se décolle)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><path d="M23.1 5.4A28 28 0 1 0 58.6 40.9Z" fill="#BD321C"/><path d="M31.9 47.1Q31.8 47.4 31.8 47.6Q31.8 47.8 31.9 47.9Q32.0 48.1 32.2 48.1Q32.6 48.1 32.9 47.7Q33.2 47.4 33.3 47.4Q33.5 47.4 33.6 47.6Q33.7 47.8 33.7 48.1Q33.8 49.1 33.1 50.0Q32.3 50.9 31.0 51.5Q29.8 52.1 28.2 52.1Q26.2 52.1 25.0 51.3Q23.8 50.5 23.4 49.2Q22.2 50.5 20.7 51.2Q19.2 51.9 17.7 51.9Q15.3 51.9 13.7 50.8Q12.1 49.6 12.1 47.5Q12.1 46.5 12.4 45.5L14.6 38.4Q14.7 38.1 14.7 37.9Q14.7 37.5 14.6 37.3Q14.4 37.1 14.0 36.8Q13.7 36.6 13.6 36.4Q13.4 36.2 13.5 35.8Q13.7 35.0 15.7 34.4Q17.6 33.9 19.7 33.9Q21.7 33.9 22.6 34.6Q23.5 35.4 23.5 36.6Q23.5 37.4 23.3 38.1L21.2 45.2Q21.0 45.6 21.0 45.9Q21.0 46.4 21.3 46.6Q21.6 46.9 22.0 46.9Q22.6 46.9 23.1 46.5Q23.5 46.1 23.9 45.2L25.9 38.4Q26.1 38.1 26.1 37.9Q26.1 37.5 25.9 37.3Q25.7 37.1 25.4 36.8Q25.1 36.6 24.9 36.4Q24.8 36.2 24.9 35.8Q25.1 35.0 27.0 34.4Q28.9 33.9 31.0 33.9Q33.0 33.9 34.0 34.6Q34.9 35.4 34.9 36.6Q34.9 37.3 34.6 38.1Z" fill="#FFFFFF"/><path d="M21.9 6.6A28 28 0 0 0 57.4 42.1Z" fill="#3A1E17" opacity=".18"/><path d="M23.1 5.4A28 28 0 0 0 58.6 40.9Z" fill="#FFFFFF"/></svg>
```

#### C — favicon (sticker sans lettre)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><path d="M23.1 5.4A28 28 0 1 0 58.6 40.9Z" fill="#BD321C"/><path d="M21.9 6.6A28 28 0 0 0 57.4 42.1Z" fill="#3A1E17" opacity=".18"/><path d="M23.1 5.4A28 28 0 0 0 58.6 40.9Z" fill="#FFFFFF"/></svg>
```
