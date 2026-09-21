# Assets attendus — thème « Noir & ivoire »

Ce dossier accueillera les illustrations originales du thème. **Aucun élément ne
doit être repris d'un produit concurrent** : tout est dessiné ou généré puis
détouré pour nous.

Tant que les visuels réels ne sont pas livrés, le composant `Invitation.tsx`
affiche des aplats et des dégradés CSS aux bonnes proportions.

## Règles communes

| Règle                 | Valeur                                                                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Format vectoriel      | SVG optimisé (SVGO), sans `<style>` interne, sans identifiant dupliqué                                            |
| Format bitmap         | WebP (qualité 82) **avec canal alpha**, plus un PNG de secours                                                    |
| Espace colorimétrique | sRGB                                                                                                              |
| Fond                  | transparent, aucun cadre ni ombre incrustée (les ombres sont en CSS)                                              |
| Nommage               | `kebab-case`, suffixe de variante : `-a`, `-b`, `-c`                                                              |
| Poids cible           | ≤ 25 Ko par SVG, ≤ 90 Ko par WebP                                                                                 |
| Colorisation          | les tracés colorisables utilisent `fill="currentColor"` ou `style="fill:var(--stem)"` — jamais une couleur en dur |

Variables CSS colorisables disponibles : `--env`, `--env-2`, `--seal`,
`--accent`, `--stem`, `--liner`.

## Liste des assets

| Fichier                       | Type | Dimensions / viewBox               | Transparence | Colorisable                                   | Notes                                                                                                                   |
| ----------------------------- | ---- | ---------------------------------- | ------------ | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `envelope-front.svg`          | SVG  | viewBox `0 0 580 400` (ratio 1.45) | oui          | `var(--env)` (corps), `var(--env-2)` (ombres) | Face adresse. Zones réservées : timbres en haut à droite, adresse en bas à gauche.                                      |
| `envelope-back.svg`           | SVG  | viewBox `0 0 580 400`              | oui          | `var(--liner)`                                | Intérieur de l'enveloppe, motif de doublure en pointillés.                                                              |
| `envelope-flap.svg`           | SVG  | viewBox `0 0 580 224`              | oui          | `var(--env-2)`                                | Rabat triangulaire, pivot sur le bord supérieur. Doit se superposer pile à `envelope-back`.                             |
| `wax-seal.svg`                | SVG  | viewBox `0 0 120 120`, carré       | oui          | `var(--seal)`                                 | Cachet de cire. Les initiales sont du texte HTML par-dessus, pas dans le SVG.                                           |
| `stamp-1.svg`                 | SVG  | viewBox `0 0 160 200` (ratio 0.8)  | oui          | `var(--accent)` (fond), `var(--stem)` (motif) | Timbre « arum ». Dentelure produite en CSS (`mask`), le SVG ne contient que le motif intérieur.                         |
| `stamp-2.svg`                 | SVG  | viewBox `0 0 160 200`              | oui          | `var(--stem)`                                 | Timbre « hortensia », fond neutre `#B9B39F`.                                                                            |
| `postmark.svg`                | SVG  | viewBox `0 0 120 60`               | oui          | `currentColor`                                | Tampon postal : cercles concentriques + ondes. La date `12·VI·27` est injectée en `<text>` par le composant, pas figée. |
| `calla.svg`                   | SVG  | viewBox `0 0 60 200`               | oui          | `var(--stem)` (tige, feuille)                 | Arum. Fleur blanche `#FDFCF8`, pistil `#E0C255`.                                                                        |
| `hydrangea.svg`               | SVG  | viewBox `0 0 100 110`              | oui          | `var(--stem)` (tiges)                         | Hortensia : grappe de petites corolles, 4 à 5 blancs cassés différents.                                                 |
| `amaranth.svg`                | SVG  | viewBox `0 0 80 220`               | oui          | `var(--stem)`                                 | Amarante retombante, à placer en bordure de composition.                                                                |
| `paper-torn-a.svg` … `-c.svg` | SVG  | viewBox `0 0 400 300`              | oui          | non                                           | Trois masques de papier déchiré (`clip-path` ou `mask`) réutilisables sur les notes, billets et étiquettes.             |
| `tape-a.webp`, `tape-b.webp`  | WebP | 320 × 90 px @2x                    | oui          | non                                           | Morceaux de scotch translucides (opacité ~0,78), légèrement froissés.                                                   |

## Variantes de couleur

Chaque asset colorisable doit rendre correctement avec les trois palettes du
manifeste (`noir`, `olivier`, `encre`). Vérifier en particulier le contraste
du cachet (`--seal`) sur le rabat (`--env-2`) dans la palette `olivier`, où les
deux sont sombres.

## Placeholders actuels

`Invitation.tsx` dessine l'enveloppe, le cachet et le tampon en CSS pur, aux
dimensions ci-dessus. Remplacer un placeholder = importer le SVG correspondant
et supprimer le bloc CSS associé dans `styles.css`.
