# Phase 9 — Thème n°2 « Terracotta Bloom »

Statut : **livré**. Deuxième thème du catalogue, obtenu en dupliquant le dossier
du thème 1 puis en remplaçant visuels, couleurs, typographies et mises en page —
sans toucher au reste de l'application (BRIEF §7.2).

Spécifications : `docs/strategie-produit.md` §3.2 ; `BRIEF.md` §2.2, §6, §7.2,
§7.4 ; mécanique validée en `docs/phase-3-theme-noir-ivoire.md`.

Démo : `/demo/mariage-terracotta-bloom` (contenu `demo.json`, en **anglais** —
le marché américain est prioritaire).

---

## 1. Ce qui change par rapport au thème 1

| Bloc              | « Noir & ivoire »                          | **« Terracotta Bloom »**                                                      |
| ----------------- | ------------------------------------------ | ------------------------------------------------------------------------------- |
| Ambiance          | noir profond, ivoire, olive, Didone        | bohème désert : terre cuite, sable, sauge, arches, soleil bas                     |
| Palettes          | noir / olivier / encre                     | **sienna** (défaut) / **desert-rose** / **amber-dune**                            |
| Typographies      | Cormorant + Bodoni Moda                    | **Fraunces** (titraille) + **Jost** (texte), variables, auto-hébergées            |
| Écritures script  | Pinyon / Mrs Saint Delafield / Allura      | **Beau Rivage** (défaut) / **WindSong** / **Miss Fajardose**                      |
| Photos            | noir et blanc, grain, polaroïd             | **sépia chaud** (`sepia(.42) saturate(1.2)`), cadre arrondi « snap » ou **arche** |
| Enveloppe         | noire, doublure à pois                     | terre cuite texturée, **doublure à motif d'arches** sauge/terre cuite             |
| Cachet            | cire olive                                 | cire **sauge**, bord irrégulier                                                   |
| Pièce de l'intro  | ticket avec talon détachable               | **carte arche** (« save the date », date, ligne script)                           |
| Chapitre Histoire | 2 polaroïds scotchés + billet de train     | **arche + snap + carte de bar** (« The Cactus Bar / Table 4 »), note kraft washi  |
| Chapitre Date     | 3 papiers déchirés alignés                 | **arche terre cuite (jour)** + slips sable/sauge + **soleil dans une arche** + **tuiles arquées** pour le compte à rebours |
| Programme         | notes déchirées                            | papiers **découpés** + **pastille horaire** ronde, 4 tons (papier/argile/sable/sauge) |
| Lieu              | carte postale N&B                          | **carte souvenir vintage** sépia, filet double, nom du lieu en capitales espacées |
| Infos pratiques   | étiquettes crantées                        | **étiquettes kraft à œillet** (luggage tags)                                      |
| RSVP              | carte blanche                              | carte **à tête arquée**, filet intérieur, cachet sauge à l'envoi                  |
| Illustrations     | arum, hortensia, amarante                  | **pampa, eucalyptus, renoncules séchées, soleil/arche**                           |

Mécanique **inchangée** (c'est le moteur validé) : enveloppe GSAP → chapitres en
`position: sticky` pilotés par ScrollTrigger, mêmes seuils (`thresholds.ts`),
mêmes longueurs de chapitre (420 / 320 / 380 / 300 vh), mêmes beats d'intro.

---

## 2. Isolation : deux thèmes sur une même page

C'est la nouveauté structurelle de cette phase. Le thème 1 scope tout son CSS
sous `.invitation` ; si les deux feuilles étaient chargées ensemble (tableau de
bord, sélecteur de thème de l'éditeur), il repeindrait les pièces du thème 2.

Deux règles, donc :

1. **Toutes les classes du thème sont préfixées `tb-`** (`tb-snap`, `tb-card`,
   `tb-prog`, `tb-tag`…). Aucun sélecteur du thème 1 (`.invitation .pol`,
   `.invitation .ticket`…) ne peut les atteindre.
2. **Tout le CSS est scopé sous `[data-theme='mariage-terracotta-bloom']`**, et
   la règle de racine s'écrit `.invitation[data-theme='mariage-terracotta-bloom']`
   (spécificité 0-2-0) pour l'emporter sur un `.invitation { … }` d'un autre
   thème quelle que soit l'ordre de chargement.

La racine garde la classe `invitation` (les tests applicatifs et le shell s'y
accrochent) et ajoute `tb-root`. Les attributs de pilotage (`data-chapter`,
`data-at`, `data-line`, `data-observe`, `data-env-*`) sont inchangés : le moteur
d'animation est commun aux deux thèmes.

Un test unitaire vérifie qu'aucune classe non préfixée du thème 1 n'apparaît
dans le balisage rendu.

---

## 3. Palettes et lisibilité

Les six variables imposées par `ThemeManifest` :

| Palette              | `--env`   | `--env-2` | `--seal`  | `--accent` | `--stem`  | `--liner` |
| -------------------- | --------- | --------- | --------- | ---------- | --------- | --------- |
| `sienna` (défaut)    | `#C1653A` | `#AE5631` | `#9CAA7C` | `#7A3B2E`  | `#8FA070` | `#F3E3CD` |
| `desert-rose`        | `#D9A79C` | `#C9948A` | `#7C8B6F` | `#B5651D`  | `#7C8B6F` | `#F7EFE6` |
| `amber-dune`         | `#D9A441` | `#C4902F` | `#93A187` | `#4A342A`  | `#93A187` | `#EFE3CE` |

Le `swatch` de l'éditeur est exactement `--env` dans les trois cas.

Deux des trois enveloppes sont **claires** (rose poussiéreux, moutarde) : l'encre
de l'adresse ne peut donc pas être une constante crème. Le thème expose un jeton
interne `--env-ink`, repeint par palette
(`[data-palette='desert-rose']`, `[data-palette='amber-dune']`) ; il sert
partout où l'on écrit sur `--env` / `--env-2` : adresse, tampon, chiffre du jour,
tuile du compte à rebours, carte « argile » du programme, choix RSVP sélectionné.

Même logique sur les timbres : le timbre « soleil » est sur fond sauge très
clair (`color-mix(--seal 42%, #fff)`) pour que l'arche sauge et le soleil argile
restent visibles, et la valeur faciale passe à l'encre brune sur les deux
timbres clairs.

---

## 4. Polices

`fonts.ts` charge cinq paquets auto-hébergés, jamais le CDN Google :

```
@fontsource-variable/fraunces/wght.css   titraille (chiffres, titres de cartes)
@fontsource-variable/jost/wght.css       texte courant, formulaires, capitales
@fontsource/beau-rivage/latin-400.css    script par défaut
@fontsource/windsong/latin-400.css       script alternatif
@fontsource/miss-fajardose/latin-400.css script alternatif
```

Les deux faces de texte sont **variables** (axe `wght` seul) : un fichier par
sous-ensemble couvre toutes les graisses utilisées. Les trois scripts sont
chargés ensemble parce que le couple peut en changer depuis l'éditeur (~20 kB
chacun).

---

## 5. Poids JS mesuré

Mesure refaite comme en phase 3, **dans une copie isolée du dépôt** (`next build`
puis `next start`), page `/demo/mariage-terracotta-bloom`, gzip niveau 9 :

| Bloc                                                     | Non compressé | **Gzip**    |
| -------------------------------------------------------- | ------------- | ----------- |
| Scripts initiaux hors GSAP                               | 341 kB        | **~113 kB** |
| dont le chunk du thème (`tb-*`)                          | 35,5 kB       | 11,3 kB     |
| dont le chunk du thème 1, préchargé par la route de démo | 34,1 kB       | 10,8 kB     |
| GSAP + ScrollTrigger (chunks dynamiques)                 | 151 kB        | 56 kB       |
| Total une fois l'animation prête                         | 715 kB        | 225 kB      |

**Budget respecté** : le JS initial de la page reste sous les 200 kB gzip du
BRIEF §6 (~158 kB en comptant le chunk du thème 1 que la route précharge, ~113 kB
sans lui). Aucune dépendance ajoutée : seulement cinq paquets `@fontsource/*`
(polices, aucun JS).

> ~~À surveiller : la route `/demo/[theme]` fait descendre le chunk client des
> **deux** thèmes, alors que le registre les importe dynamiquement.~~ **Réglé**
> depuis : une route par thème (`src/app/demo/<slug>/page.tsx`) et un module de
> manifestes sans composant client (`src/themes/manifests.ts`). Chaque démo ne
> référence plus que son propre chunk — mesures dans
> `docs/phase-9-theme-riviera-postcard.md` §7.2.

---

## 6. Accessibilité et exigences reprises du thème 1

- **Mode sombre désactivé** : `prefers-color-scheme` n'est jamais consulté.
- **`prefers-reduced-motion`** : plus de verrou de défilement, enveloppe déjà
  ouverte, chapitres en flux normal, toutes les phrases lisibles d'un coup,
  toutes les pièces visibles, transitions ramenées à 0,01 ms.
- **Clavier** : l'enveloppe est un `role="button"` `tabIndex=0` (Entrée et
  Espace), l'anneau de focus utilise `--accent`, le bouton « itinéraire » et le
  formulaire RSVP vivent dans la colonne de texte.
- **Contrastes** : texte brun `#3B2A22` sur sable `#F1E4D3` (≈ 11:1) ; encre de
  l'enveloppe adaptée par palette (§3) ; libellés secondaires en `--muted`
  `#8C6B56` sur sable (≈ 4,6:1).
- **Sémantique** : un `aria-label` par chapitre, `role="timer"` sur le compte à
  rebours, `role="status"` sur le remerciement, honeypot hors du flux et hors
  du clavier.
- **Images** : jamais d'image cassée — les emplacements vides tombent sur des
  scènes SVG désertiques (dunes / arche / cactus) ; `alt` venu du contenu.

---

## 7. Compatibilité de contenu entre thèmes

- Mêmes **cinq emplacements photo** (`envelope-1`, `envelope-2`, `story-1`,
  `story-2`, `venue`) et mêmes proportions que le thème 1.
- Même **schéma `extras`** (`memento` `kind: 'ticket'`, `note`,
  `envelope.kicker`) : un couple qui bascule du thème 1 au thème 2 garde son
  souvenir, il est simplement dessiné en **carte de bar** au lieu d'un billet de
  train déchiré.
- Mêmes `limits` et mêmes `sections`.

---

## 8. Tests

| Fichier                                       | Couvre                                                                    |
| --------------------------------------------- | ------------------------------------------------------------------------- |
| `tests/unit/themes/terracotta-render.test.ts` | rendu serveur complet, manifeste (3 palettes / 3 scripts / 5 slots), préfixes de classes, extras, photos, i18n EN/FR |
| `tests/unit/themes/terracotta-rsvp.test.ts`   | formulaire piloté par `content.rsvp`, honeypot, `shouldCallApi`, deadline  |
| `tests/unit/themes/terracotta-time.test.ts`   | fuseau de l'événement (Californie, PDT/PST), compte à rebours, date limite |
| `tests/unit/themes/terracotta-thresholds.test.ts` | maths de défilement (seuils, layout du programme, beats d'intro)       |
| `tests/unit/themes/terracotta-format.test.ts` | heures localisées (« 4:30 pm » / « 16h30 »)                               |
| `tests/e2e/theme-terracotta-bloom.spec.ts`    | parcours complet + captures sur 390 / 768 / 1440 px, rejeu, mouvement réduit |

Captures de référence : `tests/e2e/screenshots/terracotta-bloom/`
(intro fermée, intro ouverte, quatre chapitres, infos, RSVP, RSVP envoyé,
signature, mouvement réduit).

Les serveurs de développement étant uniques par dossier (Next 16 refuse un second
`next dev`), l'e2e de cette phase a tourné avec
`PLAYWRIGHT_BASE_URL=http://localhost:3121` sur un serveur lancé à la main.

---

## 9. Corrections faites en regardant les captures

C'est le critère principal : chaque rendu a été relu à l'écran, pas seulement
testé.

1. **Carte arche coupée par la poche** : la ligne script disparaissait derrière
   le V de l'enveloppe → V approfondi (apex 53 % → 62 %) et carte remontée
   (`yPercent` −54 → −60).
2. **Quatrième tuile du compte à rebours hors cadre** en 390 px : `383` élargit
   sa piste `1fr` → `minmax(0, 1fr)` + `min-width: 0`.
3. **« 10:00 pm » débordait de sa pastille** : pastille 26 % → 30 %, police
   21 → 19 px.
4. **Carte souvenir** : la colonne droite touchait le bord → `minmax(0, auto)`,
   alignement à droite, police réduite.
5. **Soleil/arche illisible** : l'arche passait derrière le disque ; redessiné
   avec le soleil **dans** l'arche, trait plus épais, pièce élargie à 30 %.
6. **Timbre « soleil »** : arche sauge invisible sur fond sauge → fond sauge
   très clair et valeur faciale en encre brune.
7. **Pampa posée sur la photo** du chapitre 1 : pièce retirée, la composition
   respirait déjà.
8. **Respiration des sections simples** ramenée de 18 svh à 12 svh.

---

## 10. Limites connues et points à surveiller

- `animations/time.ts` n'a pas été touché (réconciliation en cours par un autre
  agent) : le thème consomme l'API `zonedEventInstant` / `remainingMs` /
  `isRsvpOpen` telle quelle.
- La date courte reste au format `JJ.MM.AA` (`09.10.27`), ambigu pour un public
  américain alors que le thème vise ce marché. À trancher globalement
  (`src/content/derived.ts`, hors périmètre du thème).
- Les illustrations sont des **placeholders** SVG ; la liste des assets
  définitifs est dans `src/themes/mariage-terracotta-bloom/assets/README.md`.
- Le lavis aquarelle du fond est simulé par trois dégradés radiaux ; un vrai
  lavis WebP est listé dans le README des assets.
- Palettes claires : vérifier les vrais assets colorisés sur `desert-rose` et
  `amber-dune` (contrastes les plus faibles du thème).
