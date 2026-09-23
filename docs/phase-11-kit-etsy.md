# Phase 11 — Kit de mise en vente Etsy

Résumé du kit marketing produit dans `marketing/` pour la mise en vente sur
Etsy des 3 thèmes mariage. Détail complet : `marketing/etsy/README.md`.
Raisonnement produit/prix/règles Etsy : `docs/strategie-produit.md`. Marque :
`docs/marque-et-domaines.md`.

## Ce qui a été livré

- `marketing/etsy/README.md` — mode d'emploi, checklist d'ouverture de
  boutique (paramètres, politiques, mentions obligatoires produit
  numérique, TVA/OSS).
- `marketing/etsy/listings/{mariage-noir-ivoire,mariage-terracotta-bloom,mariage-riviera-postcard}.md`
  — fiches produit EN complètes (titre, 13 tags, catégorie, description,
  10 visuels de fiche, script vidéo 15 s) pour les 3 thèmes.
- `marketing/etsy/listings/fr/*.md` — description FR de chaque thème.
- `marketing/etsy/listings/options/{hosting-extension-12-months,matching-theme,named-invitations}.md`
  — 3 fiches d'options (upsells retenus dans `docs/strategie-produit.md` §4).
- `marketing/etsy/messages.md` — message post-achat, FAQ types, relance
  J+7, demande d'avis.
- `marketing/launch-plan.md` — calendrier de lancement sur 4 semaines,
  10 idées de contenus courts, indicateurs à suivre.
- `marketing/brand-variables.md` — placeholders `{{BRAND_NAME}}` /
  `{{BRAND_URL}}` / `{{SHOP_NAME}}`, commande `sed` de remplacement.
- `scripts/build-delivery-pdf.mjs` (+ script `pnpm etsy:pdf`) — génère les
  3 PDF de livraison dans `marketing/etsy/delivery/`.
- `package.json` : ajout de `pdf-lib` en devDependency et du script
  `etsy:pdf`. Aucune autre dépendance ni script modifiés.

## PDF de livraison — vérification

Générés avec `pnpm etsy:pdf` (fonts standard PDF, QR code embarqué via le
paquet `qrcode`). Vérifiés structurellement (comptage de pages via
`pdf-lib`, décompression des flux de contenu pour relire le texte, car
aucun outil de rendu PDF→image n'est disponible dans cet environnement) :

| Fichier | Pages | Taille |
|---|---|---|
| `mariage-noir-ivoire-guide.pdf` | 2 | 15,8 Ko |
| `mariage-terracotta-bloom-guide.pdf` | 2 | 15,8 Ko |
| `mariage-riviera-postcard-guide.pdf` | 2 | 15,9 Ko |

Page 1 : remerciement, nom du thème, lien d'activation
`https://{{BRAND_URL}}/activate` en gros + QR code du même lien, numéro de
commande à préparer, délai de validation 24 h. Page 2 : mini-guide en 6
étapes, FAQ, contact. Format Letter (612×792 pt), marges compatibles A4.

Les PDF ne sont pas commités par cette phase (aucune opération git) : ils
restent dans `marketing/etsy/delivery/`, à régénérer avec `pnpm etsy:pdf`
après tout changement de marque (voir `marketing/brand-variables.md`) ou de
nom de thème.

## Points à vérifier par l'utilisatrice avant publication

1. **Marque et domaine non verrouillés** : `docs/marque-et-domaines.md`
   n'a confirmé la disponibilité d'aucun domaine ni marque — à vérifier
   (Cloudflare Registrar/Namecheap, USPTO TESS, INPI, nom de boutique
   Etsy) avant tout achat ou remplacement des placeholders.
2. **Fiscalité (TVA/OSS, sales tax US)** : points listés dans
   `marketing/etsy/README.md` §3.4 — à valider avec un comptable, ce n'est
   pas un conseil fiscal définitif.
3. **Politiques Etsy** : délai de traitement, politique de remboursement,
   mentions « digital download » à reporter manuellement dans Shop
   Manager (checklist `marketing/etsy/README.md` §3.2-3.3).
4. **Prix** : lancement 29 $ (barré 49 $), cible 39 $ (barré 59 $) après
   30-50 ventes ou 2-3 mois — reprendre la revue de prix planifiée dans
   `marketing/launch-plan.md`.
5. **Visuels de fiche et vidéos** : décrits en détail (10 images + script
   15 s par thème) mais non produits (réseau restreint au registre npm,
   aucun téléchargement d'image possible dans cet environnement) — à
   réaliser séparément avant publication.
