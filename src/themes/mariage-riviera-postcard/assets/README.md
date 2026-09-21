# Assets — thème « Carte postale Riviera » (_Riviera Postcard_)

Ce dossier contient les **placeholders** du thème (`illustrations.tsx`, SVG
inline colorisables) et décrit les **assets définitifs** attendus de
l'illustratrice.

> **Aucun élément ne doit être repris d'un produit concurrent.** Tout est
> dessiné ou généré puis détouré pour nous (BRIEF §2.2).

Direction visuelle : `docs/strategie-produit.md` §3.3 — Côte d'Azur / Amalfi,
blanc éclatant, bleu cobalt, citron, vert olive, rayures de parasol, bord de
carte postale, enveloppe « par avion ». **Rien n'est noir** : l'encre la plus
sombre du thème est un bleu marine.

---

## 1. Ce qui existe aujourd'hui

`illustrations.tsx` dessine tout en SVG inline, aux bonnes proportions et déjà
colorisable par les variables CSS de la palette.

| Composant                       | Rôle                                                   | viewBox       | Colorisable par                                        |
| ------------------------------- | ------------------------------------------------------ | ------------- | ------------------------------------------------------ |
| `<LemonBranch />`               | branche de citronnier (enveloppe, programme, timbre)   | `0 0 90 200`  | `--stem` (feuilles), `--accent` (fruits)               |
| `<Cypress />`                   | cyprès (chapitre Date, timbre)                         | `0 0 80 200`  | `--stem`                                               |
| `<Bougainvillea />`             | bougainvillier (enveloppe, chapitre Histoire)          | `0 0 120 120` | `--stem` (branche), `--bloom` (bractées)               |
| `<Parasol />`                   | parasol à rayures (chapitre Histoire, timbre)          | `0 0 170 132` | `--seal` (toile), `--stem` (mât), `--accent` (pommeau) |
| `<Shell />`                     | coquille Saint-Jacques (chapitre Lieu, timbre)         | `0 0 120 110` | `--accent`                                             |
| `<Waves />`                     | trois vagues (chapitre Date, chapitre Lieu, signature) | `0 0 200 70`  | `--seal`                                               |
| `<Vespa />`                     | scooter (timbre du chapitre Lieu)                      | `0 0 170 120` | `--seal`, `--accent`                                   |
| `<Postmark date />`             | tampon postal « soleil », date `19·VI·27` injectée     | `0 0 126 60`  | `currentColor`                                         |
| `<Stamp motif value country />` | timbre ; dentelure en `mask` CSS, motif en SVG         | ratio 0.8     | via le motif + `--seal`                                |
| `<PhotoPlaceholder variant />`  | scène Riviera **en couleur** pour un emplacement vide  | `0 0 300 315` | non                                                    |
| `<PostcardPlaceholder />`       | baie en couleur de la carte postale du lieu            | `0 0 300 200` | non                                                    |

L'enveloppe (face, liseré « par avion », doublure rayée, poche, rabat), le
cachet bleu, les carreaux d'azulejos, le store du menu de trattoria, l'étiquette
de valise et le bord de la carte postale sont dessinés en **CSS pur** dans
`styles.css` : dégradés répétés + `clip-path`, entièrement pilotés par `--env`,
`--env-2`, `--liner`, `--seal`, `--accent` et `--terra`.

Deux formes sont **générées** au chargement du module, donc identiques sur le
serveur et dans le navigateur (aucune divergence d'hydratation, aucun remélange
d'un rendu à l'autre) :

- le **bougainvillier**, 46 bractées placées par un générateur de Lehmer à
  graine fixe (graine 11) ;
- le **parasol**, 8 fuseaux d'une demi-ellipse large et basse, plus l'ourlet
  festonné reconstruit comme un seul tracé — c'est cet ourlet dessiné qui
  empêche les fuseaux blancs de se confondre avec le fond.

Les motifs réutilisés sont déclarés **une seule fois** dans
`<IllustrationDefs />` puis appelés par `<use>` : un chapitre qui montre deux
cyprès n'embarque les tracés qu'une fois.

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
| Tampon postal         | **ne pas figer la date** : le composant injecte `19·VI·27` dans un `<text>`.                                      |
| Noir                  | **interdit.** Le plus sombre autorisé est `#1B2A3A` (l'encre du thème).                                           |

Variables CSS disponibles : `--env`, `--env-2`, `--seal`, `--accent`, `--stem`,
`--liner`, plus `--bloom` (bractées) et `--terra` (rouge « par avion », toits),
que la feuille de style dérive de la palette choisie.

---

## 3. Liste des assets à produire

### 3.1 Végétation et objets de plage (priorité 1 — ce sont eux qu'on voit le plus)

| Fichier             | viewBox       | Transparence | Colorisable                              | Notes                                                                                                     |
| ------------------- | ------------- | ------------ | ---------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `lemon-branch.svg`  | `0 0 90 200`  | oui          | `--stem` (feuilles), `--accent` (fruits) | Branche courbe, 4 feuilles lancéolées, 2 citrons avec le petit mamelon. Reflet blanc sur chaque fruit.    |
| `cypress.svg`       | `0 0 80 200`  | oui          | `--stem`                                 | Silhouette conique **irrégulière** (3 à 4 touffes qui dépassent), tronc `#7A5B3A`, ombré à droite.        |
| `bougainvillea.svg` | `0 0 120 120` | oui          | `--stem` (branche), `--bloom`            | 40 à 50 bractées **papier**, anguleuses à 3 pointes, 4 nuances, petit cœur crème `#FCF6E4`.               |
| `parasol.svg`       | `0 0 170 132` | oui          | `--seal`, `--stem`, `--accent`           | Dôme **large et bas** (demi-ellipse 82 × 46), 8 fuseaux alternés, ourlet festonné tracé, mât court.       |
| `shell.svg`         | `0 0 120 110` | oui          | `--accent`                               | Coquille Saint-Jacques, 7 côtes rayonnantes, charnière en bas.                                            |
| `waves.svg`         | `0 0 200 70`  | oui          | `--seal`                                 | Trois vagues d'opacités décroissantes (.9 / .65 / .4), bouts arrondis.                                    |
| `vespa.svg`         | `0 0 170 120` | oui          | `--seal`, `--accent`                     | Scooter de profil : tablier, plancher, selle noire, guidon, rétroviseur, phare. Lisible à 90 px de large. |
| `olive-branch.svg`  | `0 0 160 60`  | oui          | `--stem`                                 | _Optionnel._ Rameau d'olivier, utile surtout pour la palette `capri`.                                     |

### 3.2 Enveloppe et papeterie

| Fichier               | viewBox / taille           | Transparence | Colorisable                                   | Notes                                                                                                                                                                                            |
| --------------------- | -------------------------- | ------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `envelope-front.svg`  | `0 0 580 400` (ratio 1.45) | oui          | `--env` (papier), `--seal`/`--terra` (liseré) | Face adresse **blanche**, liseré « par avion » bleu/rouge à 135°. Zones libres : timbres en haut à droite (34 %), étiquette PAR AVION en haut à gauche, adresse en bas à gauche.                 |
| `envelope-liner.svg`  | `0 0 580 400`              | oui          | `--liner`                                     | Doublure intérieure, **rayures à 45°**, une bande colorée pour une bande blanche.                                                                                                                |
| `envelope-pocket.svg` | `0 0 580 400`              | oui          | `--env`, `--seal`/`--terra` (ourlet)          | Poche avant, **bouche en trapèze large** (arêtes de 15 % / 85 %, fond à 40 % de la hauteur) — surtout pas un V : c'est ce qui rend la date lisible une fois la carte sortie. Ourlet rayé en bas. |
| `envelope-flap.svg`   | `0 0 580 216`              | oui          | `--env-2`                                     | Rabat triangulaire, pivot sur le bord supérieur.                                                                                                                                                 |
| `postal-seal.svg`     | `0 0 120 120`, carré       | oui          | `--seal`                                      | Cachet **bleu** rond, anneau clair puis anneau sombre. **Les initiales sont du texte HTML par-dessus.**                                                                                          |
| `stamp-lemon.svg`     | `0 0 160 200` (ratio 0.8)  | oui          | `--stem`, `--accent`                          | Timbre « citron ». Sans dentelure (voir §2).                                                                                                                                                     |
| `stamp-cypress.svg`   | `0 0 160 200`              | oui          | `--stem`                                      | Timbre « cyprès ».                                                                                                                                                                               |
| `stamp-vespa.svg`     | `0 0 160 200`              | oui          | `--seal`, `--accent`                          | Timbre « vespa » — c'est le grand timbre du chapitre Lieu, il doit tenir à 200 px de large.                                                                                                      |
| `stamp-parasol.svg`   | `0 0 160 200`              | oui          | `--seal`, `--accent`                          | Timbre « parasol ».                                                                                                                                                                              |
| `stamp-shell.svg`     | `0 0 160 200`              | oui          | `--accent`                                    | Timbre « coquillage ».                                                                                                                                                                           |
| `postmark.svg`        | `0 0 126 60`               | oui          | `currentColor`                                | Cercle + anneau pointillé + 16 rayons de soleil + 4 ondes d'oblitération. Date injectée en `<text>`.                                                                                             |

### 3.3 Papiers, textures et accessoires

| Fichier                       | Format / taille     | Transparence | Colorisable | Notes                                                                                                                                  |
| ----------------------------- | ------------------- | ------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `azulejo-frame.svg`           | `0 0 200 200`       | oui          | `--seal`    | Cadre de carreau de céramique : double filet + 4 motifs d'angle. Le chiffre reste du texte HTML au centre.                             |
| `awning-scallop.svg`          | `0 0 400 40`        | oui          | `--seal`    | Feston du store de la trattoria (demi-cercles), à répéter horizontalement.                                                             |
| `luggage-tag.svg`             | `0 0 400 220`       | oui          | non         | Étiquette de valise : pointe à gauche, œillet, carton crème. Remplace le `clip-path` générique du CSS.                                 |
| `paper-torn-a.svg` … `-c.svg` | `0 0 400 300`       | oui          | non         | Trois masques de papier déchiré (`clip-path`), pour la serviette de café et les notes.                                                 |
| `tape-a.webp`, `tape-b.webp`  | 320 × 90 px @2x     | oui          | non         | Morceaux de scotch translucides **rayés jaune/blanc**, légèrement froissés, bords irréguliers.                                         |
| `grain.png`                   | 220 × 220 px, tuile | oui          | non         | _Optionnel._ Remplacerait le `feTurbulence` en data-URI. **Doit rester très léger** : les photos du thème sont en couleur, pas en N&B. |

### 3.4 Variantes de couleur

Chaque asset colorisable doit rendre correctement avec les **trois palettes** du
manifeste (`azur`, `positano`, `capri`). À vérifier en particulier :

- le **parasol** en palette `positano`, où la toile (`--seal`) est corail : les
  fuseaux blancs doivent rester lisibles, d'où l'ourlet tracé ;
- le **timbre citron** en palette `capri`, où `--accent` (citron) et le fond du
  timbre sont tous deux jaunes ;
- le **bougainvillier** : `--bloom` est dérivé de la palette dans `styles.css`
  (`[data-palette='positano']`, `[data-palette='capri']`), il ne vient pas du
  manifeste — penser à ajouter la ligne si une quatrième palette apparaît.

---

## 4. Comment remplacer un placeholder

1. Déposer le fichier dans ce dossier.
2. Dans `illustrations.tsx`, remplacer le corps du `<symbol>` concerné par le
   contenu du SVG (ou par un `import` si l'on préfère un fichier séparé).
3. Ne pas changer la signature du composant ni le `viewBox` : les positions et
   les tailles des pièces (`sections/*.tsx`, `styles.css`) en dépendent.
4. Relancer `pnpm test` puis l'e2e `theme-riviera-postcard.spec.ts` et
   **regarder les captures** de `tests/e2e/screenshots/riviera-postcard/`.

Pour l'enveloppe, le cachet et les azulejos, dessinés en CSS : importer le SVG,
le placer à la place du `<span>` correspondant dans `sections/`, puis supprimer
le bloc CSS devenu inutile dans `styles.css`.

> **Attention en supprimant du CSS** : ce thème partage ses noms de classes avec
> les autres thèmes mariage, qui, eux, sont encore cantonnés à `.invitation`.
> Une propriété que cette feuille cesse de déclarer redevient celle du thème 1 —
> c'est comme cela que la carte postale du lieu est passée en noir et blanc une
> première fois. Voir l'en-tête de `styles.css`.
