# Assets — thème « Terracotta Bloom »

Ce dossier contient les **placeholders** du thème (`illustrations.tsx`, SVG
inline colorisables) et décrit les **assets définitifs** attendus de
l'illustratrice.

Ambiance : mariage bohème / désert — terre cuite, sable, sauge, fleurs séchées,
arches, soleil bas (voir `docs/strategie-produit.md` §3.2).

> **Aucun élément ne doit être repris d'un produit concurrent.** Tout est
> dessiné ou généré puis détouré pour nous (BRIEF §2.2).

---

## 1. Ce qui existe aujourd'hui

`illustrations.tsx` dessine tout en SVG inline, aux bonnes proportions et déjà
colorisable par les variables CSS de la palette.

| Composant                 | Rôle                                                                     | viewBox       | Colorisable par                       |
| ------------------------- | ------------------------------------------------------------------------ | ------------- | ------------------------------------- |
| `<Pampas />`              | pampa séchée (enveloppe, chapitres 1 à 3, timbre)                        | `0 0 70 220`  | `--stem` (tige, feuille)              |
| `<Eucalyptus />`          | branche d'eucalyptus (enveloppe, chapitres 1, 2 et 4)                    | `0 0 90 210`  | `--stem` (intégral)                   |
| `<DriedBloom />`          | bouquet de renoncules séchées (chapitres 1, 3 et 4)                      | `0 0 110 120` | `--stem` (tiges), `--accent` (cœurs)  |
| `<SunArch />`             | soleil levant au-dessus d'une arche (chapitre 2, timbre)                 | `0 0 120 120` | `--accent` (soleil), `--stem` (arche) |
| `<Postmark date />`       | tampon postal à rayons, date `09·X·27` injectée                          | `0 0 120 60`  | `currentColor`                        |
| `<Stamp variant value />` | timbre ; dentelure en `mask` CSS, motif en SVG                           | ratio 0.8     | `--accent`, `--seal`, `--stem`        |
| `<PhotoPlaceholder />`    | scène désertique (dunes / arche / cactus) pour un emplacement photo vide | `0 0 300 315` | non                                   |
| `<PostcardPlaceholder />` | paysage désertique de la carte du lieu                                   | `0 0 300 200` | non                                   |

L'enveloppe (face, doublure à motif, poche, rabat), le cachet de cire sauge, les
arches (carte de l'enveloppe, chiffre du jour, tuiles du compte à rebours, tête
de la carte RSVP), le scotch washi et les bords déchirés sont dessinés en **CSS
pur** dans `styles.css` (`.tb-front`, `.tb-liner`, `.tb-pocket`, `.tb-flap`,
`.tb-seal`, `.tb-card`, `.tb-arch-card`, `.tb-tile`, `.tb-tape`, `.tb-torn`,
`.tb-torn-b`, `.tb-cut`), entièrement pilotés par `--env`, `--env-2`, `--liner`,
`--seal` et `--accent`.

Les formes générées (barbes de la pampa, feuilles d'eucalyptus, corolles des
renoncules) viennent d'un **générateur pseudo-aléatoire à graine fixe** (Lehmer)
: le serveur et le navigateur produisent le même balisage, donc aucune
divergence d'hydratation et un bouquet stable d'un rendu à l'autre.

Les symboles réutilisés sont déclarés **une seule fois** dans
`<IllustrationDefs />` puis appelés par `<use>` : un chapitre qui montre quatre
pampas n'embarque les tracés qu'une fois.

---

## 2. Règles communes aux assets définitifs

| Règle                 | Valeur                                                                                                               |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Format vectoriel      | SVG optimisé (SVGO), sans `<style>` interne, sans identifiant dupliqué                                               |
| Format bitmap         | WebP (qualité 82) **avec canal alpha**, plus un PNG de secours                                                       |
| Espace colorimétrique | sRGB                                                                                                                 |
| Fond                  | transparent, aucun cadre ni ombre incrustée (les ombres sont en CSS)                                                 |
| Nommage               | `kebab-case`, suffixe de variante : `-a`, `-b`, `-c`                                                                 |
| Poids cible           | ≤ 25 Ko par SVG, ≤ 90 Ko par WebP                                                                                    |
| Colorisation          | les tracés colorisables utilisent `fill="currentColor"` ou `style="fill:var(--stem)"` — jamais une couleur en dur    |
| Dentelure des timbres | **ne pas la dessiner** : elle est produite par le `mask` CSS. Le SVG ne porte que le motif intérieur.                |
| Tampon postal         | **ne pas figer la date** : le composant injecte `09·X·27` dans un `<text>`.                                          |
| Température           | tout reste chaud : sable `#F1E4D3`, terre cuite `#C1653A`, rouille `#7A3B2E`, sauge `#9CAA7C`, encre brune `#3B2A22` |

Variables CSS disponibles : `--env`, `--env-2`, `--seal`, `--accent`, `--stem`,
`--liner`.

---

## 3. Liste des assets à produire

### 3.1 Botanique séchée (priorité 1 — c'est elle qu'on voit le plus)

| Fichier           | viewBox       | Transparence | Colorisable                           | Notes                                                                                                 |
| ----------------- | ------------- | ------------ | ------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `pampas.svg`      | `0 0 70 220`  | oui          | `--stem` (tige, feuille)              | Plume duveteuse, 50 à 60 barbes, camaïeu sable `#EFDCC2` → `#DDBE9B`. Tige longue, légèrement courbe. |
| `eucalyptus.svg`  | `0 0 90 210`  | oui          | `--stem` (intégral)                   | Branche en S, 20 à 24 feuilles rondes alternées, nervure centrale claire.                             |
| `dried-bloom.svg` | `0 0 110 120` | oui          | `--stem` (tiges), `--accent` (cœurs)  | Grappe de 8 à 10 renoncules séchées, pétales en anneaux, tons `#F0D9C6` → `#DDAF97`.                  |
| `sun-arch.svg`    | `0 0 120 120` | oui          | `--accent` (disque), `--stem` (arche) | Soleil à 12 rayons au-dessus d'une arche pleine. Sert aussi de motif de timbre.                       |
| `linen-knot.svg`  | `0 0 140 90`  | oui          | `--stem`                              | _Optionnel._ Brin de lin noué, à poser sur la carte souvenir ou l'étiquette kraft.                    |
| `ranunculus.svg`  | `0 0 120 120` | oui          | `--accent`                            | _Optionnel._ Renoncule isolée en gros plan, pour densifier l'enveloppe.                               |

### 3.2 Enveloppe et papeterie

| Fichier                | viewBox / taille           | Transparence | Colorisable                         | Notes                                                                                                                 |
| ---------------------- | -------------------------- | ------------ | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `envelope-front.svg`   | `0 0 580 400` (ratio 1.45) | oui          | `--env` (corps), `--env-2` (ombres) | Face adresse, papier texturé chaud. Zones libres : timbres en haut à droite (34 % de large), adresse en bas à gauche. |
| `envelope-liner.svg`   | `0 0 580 400`              | oui          | `--liner`, `--env`, `--stem`        | Doublure à motif : petites arches alternées terre cuite / sauge sur crème, pas de 18 px.                              |
| `envelope-pocket.svg`  | `0 0 580 400`              | oui          | `--env`                             | Poche avant, bord supérieur en V (sommet à 53 % de la hauteur).                                                       |
| `envelope-flap.svg`    | `0 0 580 224`              | oui          | `--env-2`                           | Rabat triangulaire, pivot sur le bord supérieur. Doit se superposer pile à la doublure.                               |
| `wax-seal.svg`         | `0 0 120 120`, carré       | oui          | `--seal`                            | Cachet de cire sauge, bord irrégulier, motif soleil pressé. **Les initiales sont du texte HTML par-dessus.**          |
| `stamp-pampas.svg`     | `0 0 160 200` (ratio 0.8)  | oui          | `--accent` (fond), `--stem` (motif) | Timbre « pampa ». Sans dentelure (voir §2).                                                                           |
| `stamp-eucalyptus.svg` | `0 0 160 200`              | oui          | `--stem` (motif)                    | Timbre « eucalyptus », fond sable `#E3D3B6`.                                                                          |
| `stamp-sun.svg`        | `0 0 160 200`              | oui          | `--seal` (fond), `--accent` (motif) | Timbre « soleil / arche ».                                                                                            |
| `postmark.svg`         | `0 0 120 60`               | oui          | `currentColor`                      | Cercle à 16 rayons + 3 ondes d'oblitération. Date injectée en `<text>`.                                               |

### 3.3 Papiers, textures et accessoires

| Fichier                        | Format / taille | Transparence | Colorisable | Notes                                                                                                                                                                             |
| ------------------------------ | --------------- | ------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `paper-torn-a.svg` … `-c.svg`  | `0 0 400 300`   | oui          | non         | Trois masques de papier déchiré (`clip-path`), à faire tourner sur les slips de date, la note kraft et les cartes du programme. Remplacent `.tb-torn`, `.tb-torn-b` et `.tb-cut`. |
| `washi-a.webp`, `washi-b.webp` | 320 × 90 px @2x | oui          | non         | Scotch washi translucide à rayures terre cuite / crème, bords irréguliers (opacité ~0,8).                                                                                         |
| `paper-sand.webp`              | 1200 × 900 px   | non          | non         | Fond papier sable texturé, pour remplacer les dégradés `--fiber` si l'on veut un grain photographique.                                                                            |
| `paper-kraft.webp`             | 1200 × 900 px   | non          | non         | Papier kraft des étiquettes « bon à savoir ».                                                                                                                                     |
| `watercolor-wash.webp`         | 1600 × 1200 px  | oui          | non         | _Optionnel._ Lavis aquarelle délavé (terre cuite / sauge) en fond de scène, opacité ≤ 0,15.                                                                                       |

### 3.4 Variantes de couleur

Chaque asset colorisable doit rendre correctement avec les **trois palettes** du
manifeste (`sienna`, `desert-rose`, `amber-dune`). À vérifier en particulier :

- l'encre de l'adresse sur l'enveloppe : elle passe au brun foncé
  (`--env-ink`) sur les palettes claires `desert-rose` et `amber-dune` ;
- le cachet sauge (`--seal`) sur le rabat (`--env-2`) en palette `desert-rose`,
  où les deux sont désaturés ;
- le motif du timbre (`--stem`, sauge) sur le fond du timbre (`--accent`,
  expresso) en palette `amber-dune`, où le contraste est le plus faible.

---

## 4. Comment remplacer un placeholder

1. Déposer le fichier dans ce dossier.
2. Dans `illustrations.tsx`, remplacer le corps du symbole concerné par le
   contenu du SVG (ou par un `import` si l'on préfère un fichier séparé).
3. Ne pas changer la signature du composant ni le `viewBox` : les positions et
   les tailles des pièces (`sections/*.tsx`, `styles.css`) en dépendent.
4. Relancer `pnpm test` puis l'e2e `theme-terracotta-bloom.spec.ts` et
   **regarder les captures** de `tests/e2e/screenshots/terracotta-bloom/`.

Pour l'enveloppe, le cachet et les arches, dessinés en CSS : importer le SVG, le
placer à la place du `<span>` correspondant dans `sections/Intro.tsx`, puis
supprimer le bloc CSS devenu inutile dans `styles.css`.
