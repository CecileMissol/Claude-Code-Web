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

À l'époque de cette phase, `/demo/[theme]` pré-rendait les trois thèmes
(`generateStaticParams`), donc les trois feuilles de style arrivaient dans le
même document. La route a depuis été découpée en trois (`/demo/<slug>`, voir
§7), mais deux feuilles peuvent toujours se croiser — le sélecteur de thème de
l'éditeur, le tableau de bord — et les thèmes partagent volontairement le même
vocabulaire de classes (`.card`, `.stamp`, `.board`, `.postcard`, `.photo`…) :
ce sont les mêmes pièces de papeterie.

**État final (passe de finitions).** Les **trois** feuilles sont désormais
scopées sous `.invitation[data-theme='<slug>']`, y compris celle du thème 1 qui
tenait encore sous `.invitation` seul.
`tests/unit/themes/css-isolation.test.ts` le vérifie règle par règle, pour les
trois thèmes à la fois : chaque sélecteur commence par le scope de son propre
thème (seule exception admise, le verrou de défilement `html.invitation-locked`,
écrit à l'identique partout), aucune feuille ne nomme un autre thème, et aucun
scope n'est réduit au seul attribut. Les neutralisations du tableau ci-dessous
restent en place : elles ne coûtent rien et documentent ce qui avait fui.

Deux règles en découlent.

**3.1 — Scoper sous `.invitation[data-theme='…']`, pas sous l'attribut seul.**
Le thème 1 scopait alors ses règles sous `.invitation` seul (0,2,0 pour
`.invitation .photo`).
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
scope, dans les trois thèmes : l'élément qui défile est le document, et la
déclaration est écrite à l'identique partout, donc ils ne peuvent pas être en
désaccord. C'est la seule exception que le test d'isolation accepte.

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

Mesuré sur un **build de production** (`next build` puis `next start` sur un
port libre), en additionnant les scripts référencés par le document et en les
compressant en gzip niveau 9. Aucun `next dev` ne tournait en parallèle : deux
serveurs sur le même `.next` faussent toute mesure.

### 7.1 Avant le découpage des chunks (état de la phase 9)

| Mesure                                                | Gzip (niveau 9) |
| ----------------------------------------------------- | --------------- |
| `/demo/mariage-riviera-postcard`, scripts du document | **225,7 kB**    |
| `/demo/mariage-noir-ivoire`, même mesure              | 225,7 kB (à l'octet près) |
| `/` (vitrine), même mesure                            | 226,3 kB        |
| **Propre à la route `/demo/[theme]`**                 | **3,6 kB**      |

Deux fuites, toutes deux dues au **graphe de modules**, pas au thème :

1. la route unique `/demo/[theme]` passait par le registre, qui peut atteindre
   les trois thèmes : Next listait les **trois** chunks clients dans le document
   de chaque démo, dont deux qu'elle n'exécutait jamais ;
2. la vitrine `/` importait elle aussi le registre pour *décrire* les thèmes, ce
   qui lui faisait descendre les trois invitations animées **et** le chunk GSAP
   de 43,7 kB, pour une page qui n'anime rien.

### 7.2 Après (passe de finitions)

Trois corrections, aucune ligne de thème réécrite :

- `src/themes/manifests.ts` — la moitié du registre qui ne porte **aucun
  composant client** (slugs et manifestes). La vitrine, `/app`, `/activate`,
  `/admin` et le seed importent celui-là ; seules les routes qui *rendent* une
  invitation importent `registry.ts` ;
- une route par thème (`src/app/demo/<slug>/page.tsx`, corps commun dans
  `demoPage.tsx`) : chaque page importe exactement son thème ;
- GSAP reste chargé par `import()` dans l'effet du composant client (inchangé
  depuis la phase 3), donc hors du document.

| Page                               | Scripts du document | dont polyfills `noModule` | **First Load JS** (navigateur moderne) |
| ---------------------------------- | ------------------- | ------------------------- | -------------------------------------- |
| `/` (vitrine)                      | 189,7 kB            | 39,5 kB                   | **150,2 kB**                           |
| `/demo/mariage-noir-ivoire`        | 201,1 kB            | 39,5 kB                   | **161,6 kB**                           |
| `/demo/mariage-terracotta-bloom`   | 201,6 kB            | 39,5 kB                   | **162,1 kB**                           |
| `/demo/mariage-riviera-postcard`   | 203,0 kB            | 39,5 kB                   | **163,5 kB**                           |

Le chunk de polyfills est servi avec l'attribut `noModule` : aucun navigateur
qui sait lire un module ES ne le télécharge, et Next l'exclut lui-même de son
« First Load JS ». C'est la colonne de droite qui se compare au budget.

**Budget de 200 kB (BRIEF §6) : tenu sur les quatre pages**, même en comptant
les polyfills sur `/`, `/demo/mariage-noir-ivoire` et
`/demo/mariage-terracotta-bloom`.

Le chunk du thème vaut 11,1 kB (noir-ivoire), 11,6 kB (terracotta) et 13,1 kB
(riviera) gzip, et **seul celui de la démo ouverte est référencé**. GSAP +
ScrollTrigger (27,2 + 17,5 = 44,7 kB gzip) arrivent après le montage, par
`import()` : une fois l'animation prête, une démo pèse ~208 kB gzip.

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

1. ~~**Socle JS de l'application à 225,7 kB gzip sur toutes les routes**~~ —
   **réglé** par la passe de finitions : manifestes sans dépendance client, une
   route de démo par thème, GSAP toujours dynamique. 150,2 kB sur `/` et 161 à
   164 kB sur les démos, budget tenu (§7.2). Reste à surveiller : toute page
   qui importerait `src/themes/registry.ts` sans avoir besoin de *rendre* une
   invitation ferait immédiatement revenir les trois chunks.
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
