# Assets — thème « Noir & ivoire »

Ce dossier contient les **placeholders** du thème (`illustrations.tsx`, SVG
inline colorisables) et décrit les **assets définitifs** attendus de
l'illustratrice.

> **Aucun élément ne doit être repris d'un produit concurrent.** Tout est
> dessiné ou généré puis détouré pour nous (BRIEF §2.2).

---

## 1. Ce qui existe aujourd'hui

`illustrations.tsx` dessine tout en SVG inline, aux bonnes proportions et déjà
colorisable par les variables CSS de la palette. Le rendu est propre et
cohérent ; ce ne sont pas des rectangles gris.

| Composant                 | Rôle                                               | viewBox       | Colorisable par             |
| ------------------------- | -------------------------------------------------- | ------------- | --------------------------- |
| `<Calla />`               | arum (enveloppe, chapitres 1 et 2, timbre)         | `0 0 60 200`  | `--stem`                    |
| `<Hydrangea />`           | hortensia (enveloppe, chapitres 1, 3 et 4, timbre) | `0 0 100 110` | `--stem`                    |
| `<Amaranth />`            | amarante retombante (chapitre 4)                   | `0 0 80 220`  | `--stem`                    |
| `<Postmark date />`       | tampon postal, date `12·VI·27` injectée            | `0 0 120 60`  | `currentColor`              |
| `<Stamp variant value />` | timbre ; dentelure en `mask` CSS, motif en SVG     | ratio 0.8     | `--accent` (fond), `--stem` |
| `<PhotoPlaceholder />`    | scène gravée N&B pour un emplacement photo vide    | `0 0 300 315` | non                         |
| `<PostcardPlaceholder />` | paysage gravé de la carte postale du lieu          | `0 0 300 200` | non                         |

L'enveloppe (face, doublure, poche, rabat) et le cachet de cire sont dessinés en
**CSS pur** dans `styles.css` (`.front`, `.liner`, `.pocket`, `.flap`, `.seal`),
comme dans la maquette validée : dégradés + `clip-path`, entièrement pilotés par
`--env`, `--env-2`, `--liner` et `--seal`.

L'hortensia est généré par un **générateur pseudo-aléatoire à graine fixe**
(Lehmer, graine 7, 62 corolles) : le serveur et le navigateur produisent le même
balisage, donc aucune divergence d'hydratation et un bouquet stable d'un rendu à
l'autre.

Les symboles réutilisés (arum, hortensia, amarante) sont déclarés **une seule
fois** dans `<IllustrationDefs />` puis appelés par `<use>` : un chapitre qui
montre quatre arums n'embarque les tracés qu'une fois.

---

## 2. Règles communes aux assets définitifs

| Règle                 | Valeur                                                                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Format vectoriel      | SVG optimisé (SVGO), sans `<style>` interne, sans identifiant dupliqué                                            |
| Format bitmap         | WebP (qualité 82) **avec canal alpha**, plus un PNG de secours                                                    |
| Espace colorimétrique | sRGB                                                                                                              |
| Fond                  | transparent, aucun cadre ni ombre incrustée (les ombres sont en CSS)                                              |
| Nommage               | `kebab-case`, suffixe de variante : `-a`, `-b`, `-c`                                                              |
| Poids cible           | ≤ 25 Ko par SVG, ≤ 90 Ko par WebP                                                                                 |
| Colorisation          | les tracés colorisables utilisent `fill="currentColor"` ou `style="fill:var(--stem)"` — jamais une couleur en dur |
| Dentelure des timbres | **ne pas la dessiner** : elle est produite par le `mask` CSS. Le SVG ne porte que le motif intérieur.             |
| Tampon postal         | **ne pas figer la date** : le composant injecte `12·VI·27` dans un `<text>`.                                      |

Variables CSS disponibles : `--env`, `--env-2`, `--seal`, `--accent`, `--stem`,
`--liner`.

---

## 3. Liste des assets à produire

### 3.1 Fleurs et feuillages (priorité 1 — ce sont eux qu'on voit le plus)

| Fichier            | viewBox       | Transparence | Colorisable                | Notes                                                                                     |
| ------------------ | ------------- | ------------ | -------------------------- | ----------------------------------------------------------------------------------------- |
| `calla.svg`        | `0 0 60 200`  | oui          | `--stem` (tige, feuille)   | Arum. Spathe blanc `#FDFCF8`, spadice `#E0C255`. Tige longue, légèrement courbe.          |
| `hydrangea.svg`    | `0 0 100 110` | oui          | `--stem` (tiges, feuilles) | Grappe de 50 à 70 corolles à 4 pétales, 4 à 5 blancs cassés différents, cœur `#C8D08A`.   |
| `amaranth.svg`     | `0 0 80 220`  | oui          | `--stem` (intégral)        | Amarante retombante, 3 épis de longueurs différentes, à placer en bordure de composition. |
| `gypsophile.svg`   | `0 0 120 120` | oui          | `--stem`                   | _Optionnel._ Nuage de très petites fleurs, pour densifier les bouquets de l'enveloppe.    |
| `olive-branch.svg` | `0 0 160 60`  | oui          | `--stem`                   | _Optionnel._ Rameau d'olivier, utile surtout pour la palette `olivier`.                   |

### 3.2 Enveloppe et papeterie

| Fichier               | viewBox / taille           | Transparence | Colorisable                         | Notes                                                                                                     |
| --------------------- | -------------------------- | ------------ | ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `envelope-front.svg`  | `0 0 580 400` (ratio 1.45) | oui          | `--env` (corps), `--env-2` (ombres) | Face adresse. Zones à laisser libres : timbres en haut à droite (33 % de large), adresse en bas à gauche. |
| `envelope-back.svg`   | `0 0 580 400`              | oui          | `--liner`                           | Doublure intérieure, motif de pois régulier.                                                              |
| `envelope-pocket.svg` | `0 0 580 400`              | oui          | `--env`                             | Poche avant, bord supérieur en V (sommet à 53 % de la hauteur).                                           |
| `envelope-flap.svg`   | `0 0 580 224`              | oui          | `--env-2`                           | Rabat triangulaire, pivot sur le bord supérieur. Doit se superposer pile à `envelope-back`.               |
| `wax-seal.svg`        | `0 0 120 120`, carré       | oui          | `--seal`                            | Cachet de cire, bord irrégulier. **Les initiales sont du texte HTML par-dessus**, pas dans le SVG.        |
| `stamp-1.svg`         | `0 0 160 200` (ratio 0.8)  | oui          | `--accent` (fond), `--stem` (motif) | Timbre « arum ». Sans dentelure (voir §2).                                                                |
| `stamp-2.svg`         | `0 0 160 200`              | oui          | `--stem` (motif)                    | Timbre « hortensia », fond neutre `#B9B39F`.                                                              |
| `postmark.svg`        | `0 0 120 60`               | oui          | `currentColor`                      | Cercles concentriques + 4 ondes d'oblitération. Date injectée en `<text>`.                                |

### 3.3 Papiers, textures et accessoires

| Fichier                       | Format / taille     | Transparence | Colorisable | Notes                                                                                                                                        |
| ----------------------------- | ------------------- | ------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `paper-torn-a.svg` … `-c.svg` | `0 0 400 300`       | oui          | non         | Trois masques de papier déchiré (`clip-path`), à faire tourner sur les notes, billets et étiquettes. Remplacent le `.torn` générique du CSS. |
| `tape-a.webp`, `tape-b.webp`  | 320 × 90 px @2x     | oui          | non         | Morceaux de scotch translucides (opacité ~0,78), légèrement froissés, bords irréguliers.                                                     |
| `grain.png`                   | 220 × 220 px, tuile | oui          | non         | _Optionnel._ Remplacerait le `feTurbulence` en data-URI si on veut un grain plus photographique.                                             |

### 3.4 Variantes de couleur

Chaque asset colorisable doit rendre correctement avec les **trois palettes** du
manifeste (`noir`, `olivier`, `encre`). À vérifier en particulier :

- le cachet (`--seal`) sur le rabat (`--env-2`) en palette `olivier`, où les deux
  sont sombres ;
- le motif du timbre (`--stem`) sur le fond du timbre (`--accent`) en palette
  `encre`, où l'accent est bleu foncé et le motif vert.

---

## 4. Comment remplacer un placeholder

1. Déposer le fichier dans ce dossier.
2. Dans `illustrations.tsx`, remplacer le corps du composant concerné par le
   contenu du SVG (ou par un `import` si l'on préfère un fichier séparé).
3. Ne pas changer la signature du composant ni le `viewBox` : les positions et
   les tailles des pièces (`sections/*.tsx`, `styles.css`) en dépendent.
4. Relancer `pnpm test` puis l'e2e `theme-noir-ivoire.spec.ts` et **regarder les
   captures** de `tests/e2e/screenshots/noir-ivoire/`.

Pour l'enveloppe et le cachet, dessinés en CSS : importer le SVG, le placer à la
place du `<span>` correspondant dans `sections/Intro.tsx`, puis supprimer le bloc
CSS devenu inutile dans `styles.css`.
