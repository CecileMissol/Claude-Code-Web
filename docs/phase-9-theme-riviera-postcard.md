# Phase 9 — Thème 3 « Riviera Postcard » / « Carte postale Riviera »

Statut : **livré**. Troisième thème mariage, obtenu en partant d'une copie du
thème 1 (« Noir & ivoire ») et en n'en gardant que le **moteur** : enveloppe qui
s'ouvre au toucher, chapitres au défilement façon collage, infos, RSVP,
signature. Tout ce qui se voit a été refait.

Spécifications : `docs/strategie-produit.md` §3.3 (palettes, typographies,
éléments graphiques), `BRIEF.md` §2.2, §6, §7.2, §7.4.
Référence d'implémentation du moteur : `docs/phase-3-theme-noir-ivoire.md`.

---

## 1. Ce qui change par rapport au thème 1

| Bloc               | Thème 1 « Noir & ivoire »                        | Thème 3 « Riviera Postcard »                                                        |
| ------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Fond               | ivoire `#EDE8E0`, grain papier                   | blanc solaire `#FDFAF3`, lumière chaude en haut, bleu de mer en bas, trame de nappe tissée |
| Encre              | noir `#1C1C1A`                                   | bleu marine `#1B2A3A` — **rien n'est noir dans ce thème**                             |
| Enveloppe          | noire, cachet de cire vert                       | **blanche, liseré « par avion » bleu/rouge**, cachet postal bleu, étiquette PAR AVION  |
| Bouche de la poche | encoche en V (sommet à 53 %)                     | **trapèze large** (15 % / 85 %, fond à 40 %) — voir §4                                 |
| Pièce qui sort     | ticket « Save the date » à talon                 | **carte postale** à bandeau par avion                                                   |
| Photos             | noir et blanc, cadre polaroïd                    | **couleur délavée au soleil** (`saturate .9 / sepia .14`), cadre carte postale, filet pointillé bleu/rouge en tête |
| Souvenir (Histoire)| billet de train déchiré                          | **étiquette de valise** pointue, œillet poinçonné                                      |
| Date               | jour/mois/année sur trois papiers éparpillés     | **trois carreaux d'azulejos** alignés, filets et motifs d'angle bleus                  |
| Programme          | pile de notes déchirées volant des deux côtés    | **un menu de trattoria** sous son store rayé, les heures s'écrivent une à une          |
| Lieu               | carte postale N&B, timbre, tampon                | carte postale **en couleur**, bord rayé par avion, adresse tapée, timbre vespa, tampon soleil |
| Infos pratiques    | étiquettes à encoche                             | **étiquettes de valise** en carton crème, œillet, piqûre                               |
| Illustrations      | arum, hortensia, amarante                        | **citronnier, cyprès, bougainvillier, parasol, coquillage, vagues, vespa**             |
| Typographies       | Cormorant Garamond + Bodoni Moda + scripts calligraphiques | **Bodoni Moda** (titraille) + **Outfit** (texte) + Playball / Alex Brush / Yellowtail |

Les **deux chapitres refaits en profondeur** (exigence du cahier des charges) sont
**la Date** (carreaux de céramique alignés au lieu d'un éparpillement) et **le
Programme** (un seul panneau de menu au lieu de cartes volantes) : à l'œil, on ne
reconnaît pas le thème 1.

---

## 2. Arborescence

Identique à celle du thème 1 (`docs/phase-3-theme-noir-ivoire.md` §2), aux
renommages près :

- `animations/thresholds.ts` : `programLayout()` → **`programRows()`**, qui ne
  renvoie plus des positions de cartes mais des seuils de lignes de menu ;
- `assets/illustrations.tsx` : `Calla/Hydrangea/Amaranth` → **`LemonBranch`,
  `Cypress`, `Bougainvillea`, `Parasol`, `Shell`, `Waves`, `Vespa`** ;
- `sections/pieces.tsx` : `Polaroid` → **`Snapshot`** ;
- poignées GSAP : `data-env-ticket` → `data-env-card`, `data-env-polaroid` →
  `data-env-snap`.

`schema.ts` **ne change pas de forme** : `extras.memento` garde `kind: 'ticket'`
et ses quatre champs, `extras.note` et `extras.envelope.kicker` sont inchangés.
Changer de thème ne doit pas perdre le contenu (BRIEF §7.2) ; seul le **dessin**
du souvenir change (étiquette de valise au lieu de billet de train). Les cinq
emplacements photo (`envelope-1`, `envelope-2`, `story-1`, `story-2`, `venue`)
sont eux aussi identiques d'un thème à l'autre.

---

## 3. Le piège des feuilles de style qui se croisent

**C'est le point le plus important de cette phase pour les thèmes suivants.**

`/demo/[theme]` pré-rend les trois thèmes (`generateStaticParams`), donc les
trois feuilles de style arrivent dans le même document. Or les thèmes partagent
volontairement le même vocabulaire de classes (`.card`, `.stamp`, `.board`,
`.postcard`, `.photo`…) : ce sont les mêmes pièces de papeterie.

Deux règles en découlent.

**3.1 — Scoper sous `.invitation[data-theme='…']`, pas sous l'attribut seul.**
Le thème 1 scope ses règles sous `.invitation` (0,2,0 pour `.invitation .photo`).
Un scope par attribut seul (`[data-theme='…'] .photo`) pèse exactement pareil :
à égalité de spécificité, c'est l'ordre dans le bundle qui tranche, et il n'est
pas de notre côté. La classe **plus** l'attribut met chaque règle de ce thème un
cran au-dessus, quel que soit l'ordre choisi par le bundler.

**3.2 — Déclarer aussi les propriétés dont on ne veut pas.**
La spécificité n'arbitre qu'entre déclarations **de la même propriété**. Une
propriété que cette feuille ne mentionne pas reste celle du thème 1. C'est comme
cela que la carte postale du lieu est sortie **en noir et blanc** à la première
série de captures : `.invitation .postcard .img { filter: grayscale(1) }` n'avait
aucun adversaire ici. Même histoire pour :

| Propriété héritée du thème 1     | Sélecteur                             | Neutralisée par                      |
| -------------------------------- | ------------------------------------- | ------------------------------------ |
| `filter: grayscale(1)`           | `.postcard .img`                      | le filtre pellicule du thème         |
| `box-shadow: inset 0 0 30px …`   | `.photo`                              | `box-shadow: none`                   |
| grain en `mix-blend-mode: screen`| `.front::after`                       | `content: none`                      |
| `opacity: .55`                   | `.photo-wrap::after`                  | `opacity: 1`                         |
| `font-style: italic`             | `.hint`, `.cue`, `.closed`, `.error`, `.thanks`, `.sign p`, `.count small` | `font-style: normal` |

La règle du verrou de défilement (`html.invitation-locked`) reste **hors** de ce
scope, comme dans le thème 1 : l'élément qui défile est le document, et la
déclaration est identique dans les deux thèmes, donc ils ne peuvent pas être en
désaccord.

---

## 4. Choix d'implémentation propres au thème

### 4.1 La bouche de la poche est un trapèze, pas un V

Le défaut n°1 connu du thème 1 (`phase-3` §8.1) : le ticket est lu **à travers**
l'encoche en V de la poche, qui à la hauteur du texte ne fait plus que ~43 % de
la largeur de l'enveloppe — la date y reste rentrée.

Ici la poche est découpée en `polygon(0 0, 15% 40%, 85% 40%, 100% 0, 100% 100%,
0 100%)` : une ouverture **à fond plat**, 70 % de la largeur, à 40 % de la
hauteur. La carte fait 56 % de haut, part de 41 % et monte de `yPercent: -60`,
ce qui place son bord haut à ~1 % : les trois lignes (« Save the date », la date
en Bodoni, la ligne script) tiennent entièrement dans l'ouverture. Ces quatre
nombres vont ensemble — en changer un rogne la date.

Corollaire : les prénoms ne sont **pas** repris sur la carte. Ils tiendraient
sous la ligne script, mais seulement pour des prénoms courts, et ils sont déjà
en gros sur la face avant de l'enveloppe juste avant l'ouverture.

### 4.2 Le programme est un panneau, pas un tas

`programRows(n)` ne renvoie plus qu'un seuil et une inclinaison par ligne. Le
panneau arrive en premier (seuil `.04`), puis les heures s'écrivent une à une de
`.14` à `.70`. Les lignes sont des `.it` en `position: static` dans une `<ul>` —
le moteur (`useInvitationMotion`) les trouve par `[data-at]` sans rien savoir de
leur mise en page.

Pourquoi : à six étapes, la pile de cartes du thème 1 doit rétrécir les cartes à
45 % de la largeur et les empiler ; sur 390 px, c'est illisible. Une liste
descend, ne se recouvre jamais, et `--rows` (posé par la section, lu par la
feuille) réduit un peu le corps quand les étapes se multiplient.

### 4.3 Deux formes générées, à graine fixe

Comme l'hortensia du thème 1, pour que le serveur et le navigateur produisent le
même balisage :

- **bougainvillier** : 46 bractées anguleuses placées par un générateur de
  Lehmer (graine 11) ;
- **parasol** : 8 fuseaux d'une demi-ellipse **large et basse** (82 × 46), plus
  **l'ourlet festonné reconstruit comme un tracé unique**. C'est cet ourlet qui
  fait la différence : sans lui, les fuseaux blancs se confondent avec le fond
  crème et le parasol se lit comme un éventail (c'est ce que montraient les deux
  premières séries de captures).

### 4.4 Les timbres restent l'argument de vente

Cinq motifs (`lemon`, `cypress`, `vespa`, `parasol`, `shell`), dentelure en
`mask` CSS, fond bicolore propre à chaque motif, tous repeints par la palette.
Le tampon postal est placé **à gauche** des timbres : ses ondes d'oblitération
partent vers la droite et, posé plus à droite, il barrait les deux timbres.

### 4.5 Fond de page

Deux voiles fixes et inertes : une lumière méditerranéenne (chaude en haut, bleu
de mer dans le coin bas) et une trame de nappe. La trame est dessinée en **fils**
(1,4 px tous les 24 px) et non en carreaux pleins : un vichy à 50 % de remplissage,
même à 3 % d'opacité, se lit comme le damier de transparence d'un éditeur
d'images — ce que les premières captures montraient sans ambiguïté.

---

## 5. Seuils

| Chapitre  | Longueur | Phrases (bande) |
| --------- | -------- | --------------- |
| Histoire  | 400 vh   | 0,04 → 0,78     |
| Date      | 340 vh   | 0,04 → 0,68     |
| Programme | 360 vh   | 0,04 → 0,72     |
| Lieu      | 320 vh   | 0,04 → 0,66     |

| Chapitre  | Pièce → seuil                                                                                          |
| --------- | -------------------------------------------------------------------------------------------------------- |
| Histoire  | photo 1 `.05` · étiquette `.23` · photo 2 `.41` · parasol `.56` · serviette `.62` · bougainvillier `.80`   |
| Date      | jour `.06` · mois `.20` · année `.34` · cyprès `.44`/`.47` · « le grand jour » `.54` · vagues `.62` · rebours `.72` |
| Programme | panneau `.04` · lignes réparties `.14 → .70` · citronnier `.82`                                            |
| Lieu      | carte postale `.06` · timbre `.30` · tampon `.40` · coquillage `.60` · vagues `.74` · itinéraire `.66`     |

Intro (secondes) : inchangée — `flip 0` · `crack 0,8` · `open 1,05` ·
`under 1,5` · `rise 1,55` · `bloom 2,3` · `ready 2,7`.

---

## 6. Polices

Auto-hébergées via `@fontsource/*`, jamais depuis le CDN Google (phase 1 §1.3.1).
Quatre paquets ajoutés, tous sous OFL :

| Paquet                            | Usage                    |
| --------------------------------- | ------------------------ |
| `@fontsource-variable/outfit@5.3.0` | texte courant (`--sans`, `wght.css`) |
| `@fontsource/playball@5.3.0`        | écriture script 1 (défaut) |
| `@fontsource/alex-brush@5.3.0`      | écriture script 2        |
| `@fontsource/yellowtail@5.3.0`      | écriture script 3        |

`@fontsource/bodoni-moda` était déjà installé pour le thème 1 ; la titraille le
réutilise. Rien d'autre n'a été ajouté à `package.json`.

---

## 7. Poids JS mesuré

Mesuré sur un **build de production dans une copie isolée du dépôt** (`next build`
puis `next start`) : un autre agent faisait tourner `next dev` sur le dépôt de
travail, ce qui écrase `.next` et fausse toute mesure.

| Mesure                                             | Gzip (niveau 9) |
| -------------------------------------------------- | --------------- |
| `/demo/mariage-riviera-postcard`, scripts du document | **225,7 kB**    |
| `/demo/mariage-noir-ivoire`, même mesure             | 225,7 kB (à l'octet près) |
| `/` (vitrine), même mesure                           | 226,3 kB        |
| **Propre à la route `/demo/[theme]`**                | **3,6 kB**      |

Lecture : **le thème n'ajoute que 3,6 kB gzip** au-dessus du socle commun. Les
225 kB sont le socle de l'application, identique sur la page d'accueil, qui
embarque désormais jusqu'au chunk de 43,7 kB correspondant à GSAP. Le budget de
200 kB (BRIEF §6), tenu en phase 3 à 157,3 kB, est donc dépassé **au niveau de
l'application**, pas par ce thème : voir §9.

---

## 8. Accessibilité

Mêmes garanties que le thème 1, vérifiées par l'e2e :

- enveloppe en `role="button"`, `tabindex="0"`, `aria-label` traduit, ouverture à
  Entrée **et** Espace ;
- `aria-label` sur chaque section, `role="timer"` sur le compte à rebours,
  `role="status"` sur la confirmation RSVP, `role="alert"` sur les erreurs ;
- honeypot hors écran, `aria-hidden`, `tabindex="-1"` ;
- **mode sombre désactivé** : `prefers-color-scheme` n'est jamais consulté ;
- `prefers-reduced-motion` : aucun blocage du défilement, enveloppe déjà ouverte,
  chapitres en flux normal, toutes les phrases lisibles d'un coup ;
- contrastes : l'encre est un bleu marine `#1B2A3A` sur blanc (≈ 14:1), les
  libellés secondaires `#6D7E8C` sur blanc (≈ 4,6:1).

---

## 9. Limites connues et points à surveiller

1. **Socle JS de l'application à 225,7 kB gzip sur toutes les routes**, page
   d'accueil comprise, alors que la phase 3 mesurait 157,3 kB sur la démo. Le
   chunk de 43,7 kB (la taille exacte de GSAP + ScrollTrigger) est désormais
   référencé par un `<script>` du document, y compris sur `/`. Ce n'est pas
   imputable à ce thème (chiffre identique à l'octet près pour
   `mariage-noir-ivoire`) mais **le budget de BRIEF §6 est dépassé** : à
   instruire au niveau du découpage des chunks, pas du thème.
2. **`animations/time.ts` n'a pas été touché** (un agent de réconciliation y
   travaillait). Le fichier ne fait plus que réexporter `eventInstant()` et
   `zoneOffsetMs()` de `src/content/derived.ts` ; rien à y changer pour ce thème.
3. **Aucune photo réelle** : `demo.json` a `photos: {}`, la démo montre donc les
   placeholders SVG. Les légendes manuscrites des photos viennent de
   `Photo.caption` et n'apparaissent qu'avec une vraie photo.
4. **Aucun asset définitif** : tout est en SVG inline. `assets/README.md` liste
   ce qui est attendu, fichier par fichier, avec les `viewBox` à ne pas changer.
5. **Mode `preview` dans un conteneur** : comme le thème 1, la scène utilise
   `position: sticky` et `100svh` ; l'aperçu de l'éditeur doit être un **iframe**.
6. **iOS Safari n'a pas pu être testé ici** (pas de WebKit dans l'image). Les
   choix du moteur (sticky plutôt que `pin`, `scaleX` plutôt que `rotateY`,
   `svh`, `touch-action`) sont repris tels quels du thème 1.
7. **`color-mix()` et les masques de timbre** sont utilisés sans repli. Les deux
   sont largement supportés depuis 2023, mais un navigateur plus ancien perdrait
   la dentelure des timbres et quelques nuances de cadre — jamais du texte.
8. **Sur grand écran, la colonne de droite est très aérée** : la scène est
   plafonnée à `min(100%, 68svh)` de large (même raison qu'en phase 3 §7.3) et le
   texte tient en trois lignes. Comportement hérité, à arbitrer avec vous.

---

## 10. Tests

**Unitaires (Vitest) — 92 tests, `tests/unit/themes/riviera-*.test.ts`**

| Fichier                        | Couvre                                                                                  |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| `riviera-thresholds.test.ts`   | progression, répartition des seuils, phrase active, lignes du menu (1 à 6), compte à rebours, constantes de composition |
| `riviera-render.test.ts`       | manifeste (3 palettes × 6 variables, 3 scripts, emplacements photo partagés), rendu serveur avec `demo.json`, enveloppe par avion, azulejos, menu, carte postale, extras, photos, i18n FR/EN |
| `riviera-rsvp.test.ts`         | `shouldCallApi` (jamais en preview/demo), payload, honeypot, champs optionnels, deadline, mention RGPD |
| `riviera-format.test.ts`       | heures FR/EN                                                                              |
| `riviera-messages.test.ts`     | parité des clés EN/FR, aucune clé vide, repli de locale                                   |

**E2E (Playwright) — `tests/e2e/theme-riviera-postcard.spec.ts`, 3 × 3 tests**

Parcours complet (ouverture, verrou du défilement à la molette, chaque chapitre,
infos, RSVP envoyé, signature), rejeu de l'intro, mouvement réduit. **33 captures**
dans `tests/e2e/screenshots/riviera-postcard/`, sur les trois viewports.

```bash
pnpm lint && pnpm typecheck && pnpm test
PORT=3122 pnpm test:e2e tests/e2e/theme-riviera-postcard.spec.ts
```

> `playwright.config.ts` démarre désormais **`next dev`**, pas `next start`.
> Deux serveurs de développement sur le même `.next` se marchent dessus : quand
> un autre agent en fait déjà tourner un, travailler dans une copie du dépôt
> (`tar` du dépôt sans `.next`, `cp -al` de `node_modules`) et pointer Playwright
> dessus avec `PLAYWRIGHT_BASE_URL`. C'est ainsi que les 33 captures de cette
> phase ont été produites.
