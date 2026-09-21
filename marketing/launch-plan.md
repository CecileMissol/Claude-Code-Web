# Calendrier de lancement — boutique Etsy {{SHOP_NAME}}

4 semaines avant l'ouverture publique de la boutique Etsy, jusqu'au
lancement. Placeholders `{{BRAND_NAME}}`, `{{BRAND_URL}}`, `{{SHOP_NAME}}` —
voir `marketing/brand-variables.md`. S'appuie sur `marketing/etsy/README.md`
(checklist d'ouverture) et `docs/strategie-produit.md` (prix, benchmark).

---

## Semaine 1 — Visuels et préparation boutique

**Objectif** : avoir la matière visuelle et les fondations de boutique
prêtes avant d'écrire la moindre fiche.

- [ ] Verrouiller nom de marque, domaine, nom de boutique
      (`docs/marque-et-domaines.md` §3, procédure de vérification) et
      appliquer `marketing/brand-variables.md` §3 partout dans le kit.
- [ ] Produire les 10 visuels de fiche du thème 1 « Black & Ivory » selon
      `marketing/etsy/listings/mariage-noir-ivoire.md` (mockups
      téléphone/ordinateur, flatlay, filmstrip d'ouverture d'enveloppe).
- [ ] Produire la vidéo de 15 s du thème 1 (script dans la même fiche).
- [ ] Créer le compte vendeur Etsy, choisir `{{SHOP_NAME}}`, renseigner
      pays/devise (checklist `marketing/etsy/README.md` §3.1).
- [ ] Bannière + photo de boutique + texte « About » (identité Kraft &
      Bloom, `docs/marque-et-domaines.md` §5).
- [ ] Premier rendez-vous comptable : passer en revue
      `marketing/etsy/README.md` §3.4 (TVA/OSS) avant toute vente réelle.
- [ ] Générer les 3 PDF de livraison (`pnpm etsy:pdf`) et les vérifier
      (voir `scripts/build-delivery-pdf.mjs`).

**Indicateur de fin de semaine** : boutique créée (non publiée), 10
visuels + 1 vidéo du thème 1 prêts, PDF de livraison des 3 thèmes générés.

## Semaine 2 — Les 3 fiches produit

**Objectif** : les 3 fiches sont rédigées, illustrées et prêtes à publier.

- [ ] Produire les 10 visuels + la vidéo de 15 s des thèmes 2 (Terracotta
      Bloom) et 3 (Riviera Postcard), mêmes gabarits que le thème 1.
- [ ] Publier les 3 fiches en brouillon dans Etsy Shop Manager : titre,
      tags, catégorie, description (copier depuis
      `marketing/etsy/listings/*.md`), prix de lancement (29 $, barré
      49 $), politiques (délai de traitement, remboursement — README §3.2).
- [ ] Attacher le PDF de livraison correspondant à chaque fiche
      (`marketing/etsy/delivery/<theme-slug>-guide.pdf`).
- [ ] Renseigner les attributs « Digital file type » et vérifier la mention
      « INSTANT DOWNLOAD » visible en tête de chaque fiche.
- [ ] Préparer les réponses automatiques et modèles de `marketing/etsy/messages.md`
      dans Shop Manager.
- [ ] Relecture croisée (une deuxième paire d'yeux) des 3 fiches : prix,
      fautes, promesses tenables, cohérence des visuels avec le thème.

**Indicateur de fin de semaine** : 3 fiches complètes en brouillon, prêtes
à passer en public.

## Semaine 3 — Publication boutique + amorçage promo

**Objectif** : la boutique est publique, la promotion démarre.

- [ ] Publier les 3 fiches (passage en public dans Etsy).
- [ ] Créer les comptes Pinterest, Instagram et TikTok liés à
      `{{SHOP_NAME}}` si pas déjà fait (bio avec lien vers la boutique
      Etsy).
- [ ] Publier les 3-4 premières épingles Pinterest (une par thème + une
      générique) à partir des visuels de fiche déjà produits.
- [ ] Démarrer la liste de 10 idées de contenus courts (ci-dessous) :
      tourner et publier les 3 premières vidéos (l'enveloppe qui s'ouvre,
      cœur du produit).
- [ ] Vérifier le suivi analytics de boutique Etsy (Etsy Stats) est actif.
- [ ] Envoyer un message de lancement à tout contact existant
      (newsletter/réseau personnel) si applicable — hors Etsy, sans lien
      vers un paiement externe pour l'achat de base (`docs/strategie-produit.md`
      §1.1).

**Indicateur de fin de semaine** : boutique publique et achetable, 3
contenus courts publiés, présence Pinterest amorcée.

## Semaine 4 — Accélération promo et premiers retours

**Objectif** : générer les premières ventes, ajuster à chaud.

- [ ] Publier 4 contenus courts supplémentaires (liste ci-dessous),
      répartis entre Instagram Reels et TikTok.
- [ ] Publier 5-6 épingles Pinterest supplémentaires (variations de
      visuels, formats verticaux 1000×1500).
- [ ] Suivre chaque commande : validation d'activation sous 24 h
      (checklist README §3.1), envoi du message de bienvenue
      (`messages.md` §1).
- [ ] Programmer la relance J+7 (`messages.md` §3) pour toute commande non
      activée.
- [ ] Envoyer la demande d'avis (`messages.md` §4) aux premières
      activations suffisamment anciennes.
- [ ] Publier les 2-3 derniers contenus courts de la liste de 10.
- [ ] Revue des indicateurs (section suivante) et premiers ajustements :
      titre, image de couverture, ou prix si le trafic existe sans
      conversion.

**Indicateur de fin de semaine** : au moins 10 contenus courts publiés au
total, premières commandes traitées avec un délai d'activation < 24 h,
premiers avis en cours de collecte.

---

## 10 idées de contenus courts (Pinterest / Instagram / TikTok) — l'enveloppe qui s'ouvre

Format vertical 9:16 pour Reels/TikTok, 1000×1500 ou carré 1080×1080 pour
Pinterest. Toutes tournées avec l'enveloppe physiquement manipulée à la
main (pas d'écran seul) pour maximiser l'effet ASMR/tactile.

1. **« POV : vous ouvrez votre invitation de mariage »** — plan macro d'une
   main qui touche l'enveloppe, elle se retourne, le cachet se fissure, le
   rabat s'ouvre. Son ASMR (froissement de papier), pas de voix. CTA en
   légende : lien en bio.
2. **Avant/après « Canva vs {{BRAND_NAME}} »** — split screen, à gauche un
   gabarit Canva figé/qui déborde sur mobile, à droite l'enveloppe qui
   s'anime. Texte à l'écran : *"We got tired of broken Canva templates."*
3. **Time-lapse de personnalisation** — écran capturé en accéléré : choix
   de la palette, ajout d'une photo, aperçu qui se met à jour en direct.
   Texte : *"Building a wedding website in under 60 seconds."*
4. **« 3 palettes, 3 écritures »** — carrousel/vidéo montrant l'enveloppe se
   recolorer en direct (noir → olive → encre bleue), texte : *"Pick your
   colors. Really pick them."*
5. **Réaction d'un couple (mise en scène ou vraie cliente)** — un couple
   filme sa réaction en découvrant l'animation pour la première fois sur
   son téléphone. Légende : témoignage court.
6. **« Ce que contient le tableau de bord RSVP »** — capture d'écran
   filmée du tableau de bord, une réponse arrive en direct avec la
   notification. Texte : *"A real RSVP dashboard, not a form."*
7. **Comparatif des 3 thèmes** — 3 enveloppes différentes (noire,
   terracotta, cobalt) filmées côte à côte s'ouvrant en même temps. Texte :
   *"Which one is you?"*
8. **Flatlay stop-motion** — les éléments du collage (polaroïds, fleurs,
   papier kraft) qui se posent un par un sur la table en stop-motion,
   révélant la composition finale du thème. Pas de texte, juste le son.
9. **« Le QR code au dos du faire-part physique »** — mise en scène d'un
   téléphone qui scanne un QR code posé sur une enveloppe, ouverture
   immédiate de l'invitation. Texte : *"Guests scan, it opens instantly."*
10. **Behind the scenes / making-of** — courte vidéo « à visage découvert »
    (fondatrice) expliquant en 15 s pourquoi le produit existe (« j'en
    avais marre des sites Canva qui cassent sur mobile »). Format plus
    personnel, utile pour la confiance de marque.

## Indicateurs à suivre

| Indicateur | Où le suivre | Fréquence |
|---|---|---|
| Vues de fiche (par thème) | Etsy Stats | Hebdomadaire |
| Taux de clic depuis Pinterest/Instagram/TikTok | Etsy Stats (source de trafic) + analytics natifs des réseaux | Hebdomadaire |
| Taux de conversion (visites → ventes) par fiche | Etsy Stats | Hebdomadaire |
| Nombre de ventes et chiffre d'affaires | Etsy Shop Manager → Finances | Hebdomadaire |
| Délai moyen de validation d'activation | Suivi manuel (admin) jusqu'à V1 automatique (`BRIEF.md` §8) | Quotidien |
| Taux d'activation sous 7 jours | Suivi manuel des commandes vs activations | Hebdomadaire |
| Note moyenne et nombre d'avis | Etsy Shop Manager | Hebdomadaire |
| Taux d'attachement des options (upsells) | Etsy Shop Manager → Finances, croisé avec les commandes de base | Mensuel |
| Messages reçus nécessitant une réponse manuelle | Boîte de messagerie Etsy | Quotidien |

Revoir les prix après 30-50 ventes ou 2-3 mois (le premier des deux),
conformément à `docs/strategie-produit.md` §6.2.
