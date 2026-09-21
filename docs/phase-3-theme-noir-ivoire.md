# Phase 3 — Thème « Noir & ivoire » animé

Statut : **livré**. Le rendu statique de la phase 2 est remplacé par la version
animée, fidèle à `reference/invitation-mariage-demo.html` et alimentée
uniquement par `content` (`InvitationContent`), plus aucun texte en dur.

Spécifications : `BRIEF.md` §2.4, §6, §7.2, §7.4 ; `docs/phase-1-cadrage.md` §1.

---

## 1. Ce qui est fait

| Bloc                     | État                                                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| Intro enveloppe (GSAP)   | ✅ retournement → cachet qui saute → rabat → ticket + 2 polaroïds → fleurs → déverrouillage du défilement |
| Défilement bloqué        | ✅ jusqu'à la dernière image de la timeline ; jamais en `preview`, jamais en mouvement réduit             |
| 4 chapitres ScrollTrigger| ✅ Histoire, Date, Programme, Lieu — scène collante, progression 0→1, pièces aux seuils, phrases une à une |
| Compte à rebours         | ✅ calé sur le fuseau de l'événement, libellés localisés                                                   |
| Infos pratiques          | ✅ étiquettes qui glissent (ScrollTrigger `once`)                                                          |
| RSVP                     | ✅ piloté par `content.rsvp`, honeypot, `submitRsvp` en `public` seulement, cachet + remerciement          |
| Signature                | ✅                                                                                                          |
| Photos                   | ✅ `publicPhotoUrl`, N&B + grain, placeholders SVG gravés, `loading` adapté, `alt` depuis le contenu       |
| Illustrations            | ✅ SVG inline colorisables (`--stem`, `--accent`, `--seal`, `--env`, `--liner`)                            |
| i18n FR/EN               | ✅ depuis `content.locale`, jamais depuis le cookie ; date longue et heures localisées                     |
| Mode sombre              | ✅ désactivé (`prefers-color-scheme` n'est jamais consulté)                                                |
| `prefers-reduced-motion` | ✅ pas de blocage, enveloppe ouverte, chapitres en flux normal, toutes les phrases lisibles                |
| Rejouer l'intro          | ✅ `replayIntro()` / événement `invitation:replay`                                                          |
| Mode `preview`           | ✅ bouton « Ouvrir » permanent, pas de blocage, nettoyage complet des timelines                            |

---

## 2. Arborescence

```
src/themes/mariage-noir-ivoire/
├── Invitation.tsx          composant serveur : URLs de photos, palette, valeurs dérivées, extras
├── InvitationClient.tsx    'use client' — racine animée
├── animations/
│   ├── thresholds.ts       seuils et maths de défilement (pur, testé)
│   ├── intro.ts            timeline GSAP de l'enveloppe (pur, GSAP injecté)
│   ├── time.ts             instant de l'événement dans son fuseau, date limite RSVP
│   ├── format.ts           heures localisées (« 14h30 » / « 2:30 pm »)
│   └── useInvitationMotion.ts   effet unique : intro + ScrollTriggers + verrou + nettoyage
├── sections/
│   ├── Intro.tsx  Story.tsx  DateChapter.tsx  Program.tsx  Place.tsx
│   ├── Info.tsx   Rsvp.tsx   Signature.tsx    Countdown.tsx
│   ├── pieces.tsx          polaroïd, carte postale, phrases, pièce du collage
│   └── rsvp-logic.ts       décisions du formulaire (pur, testé)
├── assets/
│   ├── illustrations.tsx   arum, hortensia, amarante, timbre, tampon, placeholders
│   └── README.md           liste des assets attendus de l'illustratrice
├── messages/{en,fr}.json + index.ts
├── manifest.ts  schema.ts  fonts.ts  styles.css  demo.json  index.ts
```

---

## 3. Choix d'implémentation

### 3.1 GSAP pour l'intro, une seule timeline rejouable

La maquette enchaîne sept `setTimeout` qui ajoutent des classes. On les remplace
par **une timeline GSAP unique et en pause** (`animations/intro.ts`), aux mêmes
temps à la milliseconde près : `0 / 0,8 / 1,05 / 1,5 / 1,55 / 2,3 / 2,7 s`.

Pourquoi : une timeline se tue, se rejoue, se pousse à la fin (mouvement réduit)
et se nettoie — ce qu'une chaîne de minuteurs ne sait pas faire proprement dans
un effet React qui peut se relancer à chaque frappe dans l'éditeur.

Le retournement est un `scaleX` de la face avant puis de la face arrière, comme
dans la maquette, et non un `rotateY` 3D : les contextes 3D imbriqués
scintillent sur iOS Safari.

### 3.2 Sticky CSS + ScrollTrigger sans `pin`

**Décision : `position: sticky` en CSS pour tenir la scène, ScrollTrigger
uniquement comme source de progression.**

- `pin` enveloppe la scène dans un conteneur transformé et recalcule sa position
  à chaque redimensionnement : sur iOS Safari, la barre d'adresse qui se replie
  provoque exactement ce redimensionnement, plusieurs fois par geste.
- `position: sticky` est natif, ne crée aucun élément, et le navigateur le gère
  sur le thread compositeur.
- ScrollTrigger apporte ce qui manque à la maquette : une progression
  `scrub: true` (`start: 'top top'`, `end: 'bottom bottom'`) qui ne dépend pas de
  `innerHeight`, donc insensible au même repli de barre d'adresse (point relevé
  en phase 1, §1.3.4).

Les pièces ne sont pas *tweenées* au défilement : à leur seuil, ScrollTrigger
ajoute une classe `.on` et **la transition CSS** joue à sa propre vitesse. C'est
le comportement de la maquette (une pièce arrive avec son élan propre, quelle que
soit la vitesse de défilement) et cela garde l'animation sur le compositeur.

`chapterProgress()` reste la définition de référence de la formule
(`-top / (hauteur − vh)`) et est figée par les tests.

### 3.3 Frontière serveur / client

`Invitation.tsx` reste un **composant serveur**. Il y fait trois choses qui ne
peuvent pas se faire dans le navigateur : résoudre les clés R2 en URLs publiques
(`publicPhotoUrl` lit l'environnement), résoudre palette et écriture depuis le
manifeste, valider `content.extras` avec Zod.

`InvitationClient.tsx` reçoit tout cela en données simples. **C'est ce qui garde
Zod hors du navigateur** : le parsing des extras côté client coûtait 100 kB
gzip.

### 3.4 Fuseau horaire du compte à rebours

`eventInstant()` (couche partagée) construit `new Date('YYYY-MM-DDTHH:MM')`, lu
dans le fuseau **du visiteur** : un invité à Montréal verrait un décompte décalé
de six heures. `animations/time.ts` reprojette l'heure murale dans
`content.event.timezone` (deux passes, pour tomber du bon côté d'un changement
d'heure) et retombe sur `eventInstant()` si le fuseau est inconnu.

`src/content/derived.ts` est hors de mon périmètre : la correction vit donc dans
le thème. **À remonter dans la couche partagée en phase 5**, avec le `.ics` qui
a exactement le même besoin.

### 3.5 Contenu variable

La maquette fige ses seuils élément par élément. Ici ils sont **dérivés**, pour
qu'un couple avec trois phrases ou six étapes garde une composition équilibrée :

- phrases : réparties sur la bande de la maquette (`spread(début, fin, n)`) ;
- étapes du programme : `programLayout(n)` alterne gauche/droite, répartit les
  cartes sur la même bande verticale (2 % → 68 %) et les rétrécit quand elles se
  multiplient (56 % de large jusqu'à 4, 50 % à 5, 45 % à 6).

Avec les valeurs de `demo.json` (5 phrases, 4 étapes), on retombe sur les
nombres de la maquette — c'est vérifié par les tests.

### 3.6 Verrou de défilement

`overflow: hidden` sur `<html>` **n'empêche pas** `scrollTo()`, seulement la
molette et le doigt. Le verrou ajoute donc aussi `touch-action: none` et
`overscroll-behavior: none` (rubber-banding et pull-to-refresh d'iOS). C'est la
seule règle du thème qui n'est pas portée par `.invitation` : l'élément qui
défile est le document.

---

## 4. Seuils

Chapitres (longueur en `vh`, comme le `--len` de la maquette) :

| Chapitre  | Longueur | Phrases (bande) |
| --------- | -------- | --------------- |
| Histoire  | 420 vh   | 0,04 → 0,78     |
| Date      | 320 vh   | 0,04 → 0,68     |
| Programme | 380 vh   | 0,04 → 0,72     |
| Lieu      | 300 vh   | 0,04 → 0,66     |

Pièces :

| Chapitre  | Pièce → seuil                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------- |
| Histoire  | polaroïd 1 `.05` · billet `.23` · polaroïd 2 `.41` · arum `.58` · mot kraft `.62` · hortensia `.80`   |
| Date      | jour `.06` · mois `.20` · année `.34` · arums `.44`/`.47` · « le grand jour » `.52` · rebours `.70`   |
| Programme | étapes réparties `.08 → .68` · hortensia `.84`                                                        |
| Lieu      | carte postale `.06` · timbre `.30` · tampon `.38` · hortensia `.62` · bouton `.66` · amarante `.74`   |

Intro (secondes) : `flip 0` · `crack 0,8` · `open 1,05` · `under 1,5` ·
`rise 1,55` · `bloom 2,3` · `ready 2,7`.

---

## 5. Poids JS mesuré

Mesuré sur un build de production (`next build` puis `next start`), page
`/demo/mariage-noir-ivoire`, en additionnant les scripts référencés par le
document puis ceux chargés après le montage, gzip niveau 9 :

| Bloc                                             | Non compressé | **Gzip**     |
| ------------------------------------------------ | ------------- | ------------ |
| **First Load JS** (`/demo/[theme]`)              | 525,9 kB      | **157,3 kB** |
| dont le chunk du thème                           | 35,1 kB       | 11,2 kB      |
| GSAP + ScrollTrigger (importés dynamiquement)    | 111,3 kB      | 43,7 kB      |
| Total une fois l'animation prête                 | 637,2 kB      | 200,9 kB     |

**157,3 kB gzip de JS initial, pour un budget de 200 kB** (BRIEF §6). GSAP est
chargé par `import()` dans l'effet du composant client : il vit dans son propre
chunk et n'entre pas dans le JS initial.

Ce qui a fait la différence : sortir Zod du bundle navigateur (le parsing des
extras est passé côté serveur) a retiré **417 kB non compressés / ~100 kB
gzip**. Sans cela on était à 246 kB gzip, hors budget.

Aucune dépendance ajoutée à part `gsap` (3.15.0). Aucune police depuis un CDN :
`fonts.ts` charge les paquets `@fontsource/*` auto-hébergés.

> Mesure faite dans une copie isolée du dépôt : un autre agent faisait tourner
> `next dev` en parallèle, ce qui écrase `.next` avec des artefacts de
> développement (HMR, devtools) et fausse toute mesure.

---

## 6. Accessibilité

- Enveloppe : `role="button"`, `tabindex="0"`, `aria-label` traduit, ouverture à
  Entrée **et** Espace. Ce n'est pas un `<button>` natif parce que l'enveloppe est
  un conteneur de requête (`container-type`) avec des enfants en position
  absolue, et que les contrôles de formulaire ont une disposition interne propre
  au moteur qui casse cette mise en page — la maquette fait le même choix.
- Chaque section porte un `aria-label` issu des messages du thème.
- Compte à rebours en `role="timer"` ; confirmation RSVP en `role="status"` ;
  erreurs en `role="alert"`.
- Honeypot hors écran, `aria-hidden`, `tabindex="-1"` : jamais annoncé, jamais
  atteignable au clavier.
- Formulaire entièrement navigable au clavier, choix « Avec joie / À regret » en
  vrais boutons radio avec `:focus-visible`.
- `prefers-reduced-motion` : aucun blocage du défilement, enveloppe déjà ouverte,
  chapitres en flux normal (plus de scène collante), toutes les phrases lisibles
  d'un coup, pièces simplement présentes.

---

## 7. Différences assumées avec la maquette

1. **Heures localisées.** La maquette écrit « 14h30 » en dur. Le contenu stocke
   `HH:MM` ; le thème l'écrit « 14h30 » en français et « 2:30 pm » en anglais.
2. **Seuils dérivés** plutôt que figés par élément (§3.5) : identiques à la
   maquette pour le contenu de `demo.json`.
3. **Largeur de la scène plafonnée au-delà de 820 px** (`width: min(100%, 68svh)`).
   La maquette donne à la scène toute la colonne de 1,25 fr ; à 1440 px cette
   colonne est plus large que haute, et comme chaque pièce est dimensionnée en
   pourcentage de la **largeur** de la scène, le collage enflait jusqu'à ce que
   les polaroïds recouvrent le billet de train. Le plafond conserve les
   proportions pour lesquelles la composition a été dessinée ; les pièces
   gardent exactement les positions de la maquette.
4. **Bandeau de démonstration** : petite pastille en coin, et non une barre pleine
   largeur, qui se serait posée sur les titres (tous centrés).
5. **Amarante** ajoutée au chapitre « Lieu » : le brief la demande parmi les
   illustrations, la maquette ne l'utilisait pas.
6. **Fleurs de l'enveloppe** : la maquette génère l'hortensia en JS au chargement.
   Ici le même générateur à graine fixe tourne au chargement du module, donc le
   serveur et le navigateur produisent le même balisage (pas de divergence
   d'hydratation) et le bouquet ne se remélange jamais.
7. **Pas de panneau de personnalisation** : il devient l'aperçu en direct de
   l'éditeur (phase 4). Le thème expose `replayIntro()` pour son bouton
   « rejouer ».

---

## 8. Limites connues et points à surveiller

1. **Le ticket « Save the date » est vu à travers l'encoche en V de l'enveloppe**,
   et les deux derniers caractères de la date restent rentrés dedans. C'est la
   géométrie exacte de la maquette : à la hauteur du texte, l'encoche fait ~43 %
   de la largeur de l'enveloppe alors que `12.06.27` en fait ~52 %, et le bloc
   texte est décalé de 6 % par le talon détachable. Rendre la date entièrement
   lisible demande de trancher un arbitrage de design (réduire `.t2` **et**
   remonter le ticket **et** recentrer `.tmain`) : à valider avec vous plutôt
   qu'à décider seul.
2. **`eventInstant()` reste naïf** dans `src/content/derived.ts` ; la correction
   de fuseau vit dans le thème (§3.4). À remonter avec le `.ics` en phase 5.
3. **Aucune photo réelle** : `demo.json` a `photos: {}`, donc la démo montre les
   placeholders gravés. Les légendes manuscrites des polaroïds viennent de
   `Photo.caption`, elles n'apparaissent donc qu'avec une vraie photo.
4. **Mode `preview` dans un conteneur** : la scène utilise `position: sticky` et
   `100svh`, qui se calculent sur la fenêtre. L'aperçu de l'éditeur doit être un
   **iframe** pour que les chapitres se comportent normalement ; dans un simple
   `div`, l'intro et les sections classiques restent correctes mais les scènes
   collantes se réfèrent à la page de l'éditeur.
5. **Aucun asset définitif** : tout est en SVG inline (`assets/illustrations.tsx`).
   `assets/README.md` liste ce qui est attendu, fichier par fichier.
6. **iOS Safari n'a pas pu être testé ici** : pas de WebKit dans l'image. Les
   choix (sticky plutôt que `pin`, `scaleX` plutôt que `rotateY`, `svh`,
   `touch-action`) sont faits pour lui, mais une validation sur appareil réel
   reste à faire.

---

## 9. Tests

**Unitaires (Vitest) — 94 tests, `tests/unit/themes/`**

| Fichier                        | Couvre                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| `noir-ivoire-thresholds.test.ts` | progression, répartition des seuils, phrase active, disposition du programme (1 à 6), compte à rebours, constantes de la maquette |
| `noir-ivoire-time.test.ts`     | fuseau de l'événement (est/ouest, heure d'été), date limite RSVP                     |
| `noir-ivoire-format.test.ts`   | heures FR/EN                                                                         |
| `noir-ivoire-render.test.ts`   | rendu serveur avec `demo.json` : attributs, palette, intro, chapitres, extras absents, photos, i18n, sections |
| `noir-ivoire-rsvp.test.ts`     | `shouldCallApi` (jamais en preview/demo), payload, honeypot, champs optionnels, deadline, mention RGPD |

**E2E (Playwright) — `tests/e2e/theme-noir-ivoire.spec.ts`, 3 × 3 tests**

Parcours complet (ouverture, verrou du défilement à la molette, chaque chapitre,
infos, RSVP envoyé, signature), rejeu de l'intro, mouvement réduit. 33 captures
dans `tests/e2e/screenshots/noir-ivoire/`, sur les trois viewports.

```bash
pnpm lint && pnpm typecheck && pnpm test
pnpm build
PORT=3101 pnpm test:e2e tests/e2e/theme-noir-ivoire.spec.ts --project=mobile-390
PORT=3101 pnpm test:e2e tests/e2e/theme-noir-ivoire.spec.ts --project=tablet-768
PORT=3101 pnpm test:e2e tests/e2e/theme-noir-ivoire.spec.ts --project=desktop-1440
```

> Avant `pnpm build`, vérifier qu'aucun autre build ne tourne
> (`pgrep -f "next build"`) et qu'aucun `next dev` n'est actif : les deux
> écrivent dans `.next`.

---

## 10. Ce que l'éditeur doit savoir (phase 4)

- `<Invitation content mode="preview" />` — composant **serveur** : l'aperçu doit
  passer par une route rendue côté serveur, affichée dans un iframe.
- En `preview` : le défilement n'est jamais bloqué et un bouton « Ouvrir » est
  toujours visible sur l'enveloppe.
- Rejouer l'intro :

  ```ts
  import { replayIntro } from '@/themes/mariage-noir-ivoire';
  replayIntro(iframe.contentWindow);
  ```

  ou, sans importer le thème, `dispatchEvent(new CustomEvent('invitation:replay'))`
  sur la fenêtre de l'aperçu ou sur n'importe quel nœud de l'invitation.
- Le composant supporte les re-rendus : `gsap.context().revert()` tue les
  timelines, les ScrollTriggers et les styles inline à chaque démontage.
- Le RSVP n'appelle jamais l'API hors du mode `public`.
- Aucun champ n'a été ajouté à `src/themes/types.ts` : le contrat de la phase 2
  a suffi.
