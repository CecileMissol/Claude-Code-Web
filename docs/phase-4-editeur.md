# Phase 4 — Éditeur d'invitation

Statut : **livré**. Ce document décrit ce qui est en place, comment l'éditeur est
architecturé (aperçu, sauvegarde, upload), comment le vérifier, et ce qui reste
hors périmètre.

Spécifications de référence : `BRIEF.md` (§4.1, 5, 6, 7.2),
`docs/phase-1-cadrage.md` (§3 et 4), `docs/phase-2-socle.md`.

---

## 1. Ce qui est fait

| Domaine | État |
|---|---|
| Tableau de bord `/app` : prénoms, thème, statut, dernière modification, « Modifier / Partager / Réponses » | ✅ |
| Bouton « Créer une invitation » (brouillon sur `mariage-noir-ivoire`, contenu par défaut dans la locale de l'interface) | ✅ provisoire, jusqu'à l'activation Etsy |
| Seed des thèmes (`src/db/seed.ts` + `pnpm db:seed:local`), idempotent, upsert par `slug` | ✅ |
| Éditeur `/app/[id]/edit` : 10 étapes, champs **générés depuis le manifeste du thème** | ✅ |
| Aperçu en direct `/app/[id]/preview` dans une iframe (téléphone / tablette / ordinateur) | ✅ |
| Sauvegarde automatique (debounce 800 ms) + indicateur + avertissement à la sortie | ✅ |
| Validation Zod côté serveur (schéma commun + bornes du manifeste + `Extras` du thème) | ✅ |
| Validation côté client, messages traduits, étapes en erreur signalées | ✅ |
| Photos : recadrage, redimensionnement et compression WebP dans le navigateur, envoi par ticket HMAC, lecture publique | ✅ |
| Contrôle d'accès (`requireUser()` + propriétaire) sur chaque page, action et route | ✅ + tests |
| Textes FR/EN complets (`editor.json`, `dashboard.json`) | ✅ |

Hors périmètre de cette phase (autres agents) : la page de partage
`/app/[id]/share`, les réponses `/app/[id]/responses`, l'activation Etsy, les
animations du thème.

---

## 2. Fichiers

```
src/app/(app)/app/page.tsx                 tableau de bord
src/app/(app)/app/[id]/edit/page.tsx       éditeur (serveur : charge thème + contenu)
src/app/(app)/app/[id]/preview/page.tsx    aperçu rendu par le thème, pour l'iframe
src/app/api/photos/ticket/route.ts         POST  → ticket d'upload signé
src/app/api/photos/upload/route.ts         PUT   → écriture dans R2
src/app/api/photos/[...key]/route.ts       GET   → lecture publique (cache long)
src/db/seed.ts                             thèmes → table `themes` (+ ensureThemeSeeded)
src/db/seed-cli.mjs                        `pnpm db:seed:local`
src/editor/
  types.ts          descripteurs de champs (données simples, sérialisables)
  manifest.ts       buildEditorSteps(manifest) : les étapes et leurs bornes
  extras.ts         lecture du schéma `Extras` du thème → blocs souvenirs
  validation.ts     validation client (mêmes descripteurs) + messages traduits
  content-schema.ts schéma Zod serveur = schéma commun + bornes + Extras
  paths.ts          lecture/écriture immuable par chemin (`couple.partner1.firstName`)
  image.ts          géométrie du recadrage + encodage WebP sur canvas
  upload.ts         ticket puis PUT ; URL d'affichage des photos
  actions.ts        Server Actions : créer un brouillon, enregistrer
  EditorShell.tsx   état, sauvegarde auto, navigation par étapes, mise en page
  StepPanel.tsx     aiguillage descripteur → contrôle
  fields.tsx        contrôles génériques (texte, date, nombre, case, choix, listes)
  PhotoField.tsx    upload par emplacement (glisser-déposer, appareil photo, recadrage)
  ExtrasField.tsx   blocs souvenirs du thème
  PreviewPane.tsx   iframe + bascule d'appareil + rafraîchissement
  PreviewBridge.tsx dans l'iframe : écoute le message et rafraîchit
  useAutosave.ts    debounce 800 ms, états, `flush()`
```

---

## 3. Architecture

### 3.1 Tout vient du manifeste

`buildEditorSteps(manifest)` produit les étapes : les bornes des listes viennent
de `manifest.limits`, les palettes et écritures de `manifest.palettes` /
`manifest.scripts`, les cadres photo de `manifest.photoSlots` (ratio compris), et
une étape disparaît si le thème ne déclare pas la section correspondante.
`extrasGroups(theme.Extras)` **introspecte le schéma Zod du thème** pour en
déduire les blocs souvenirs (billet de train, mot kraft, accroche d'enveloppe) :
une chaîne optionnelle devient un champ, un objet optionnel devient un bloc avec
sa case « afficher » ; les littéraux (`kind: 'ticket'`) sont remplis tout seuls.
Rien de spécifique au thème « Noir & ivoire » n'existe dans `src/editor/`.

Conséquence : un nouveau thème obtient son formulaire sans toucher à l'éditeur.
`tests/unit/editor/manifest.test.ts` le vérifie en modifiant le manifeste.

### 3.2 Aperçu en direct

**Choix retenu : route serveur dans une `<iframe>`, rafraîchie par `postMessage`.**

Le composant `Invitation` d'un thème peut être un composant serveur asynchrone
(il charge ses propres messages), importe son CSS et, en phase 3, anime le
défilement du document. Le rendre dans le bundle client de l'éditeur imposerait
l'inverse. La route `/app/[id]/preview` le rend donc côté serveur, et l'éditeur
l'affiche dans une iframe à la largeur réelle d'un appareil (390 / 768 / 1280 px,
mise à l'échelle pour tenir dans le panneau).

Après chaque sauvegarde réussie, `PreviewPane` envoie
`invitation-preview:refresh` à l'iframe ; `PreviewBridge`, monté dans la page
d'aperçu, appelle `router.refresh()` : le serveur re-rend, React remplace le
contenu **sans recharger le document**, donc sans rejouer l'ouverture de
l'enveloppe ni perdre la position de défilement. Si l'iframe n'a jamais annoncé
sa présence (`invitation-preview:ready`), l'éditeur retombe sur un rechargement
de `src` avec un paramètre anti-cache. Les deux côtés vérifient `event.origin`.

L'aperçu montre **ce qui est enregistré** (il relit la base), pas la frappe en
cours : avec une sauvegarde à 800 ms, l'écart est imperceptible, et cela garantit
que l'on voit exactement ce que verra un invité.

La page d'aperçu vit sous le groupe `(app)` et hérite donc de l'en-tête, du pied
de page et du bandeau d'information ; elle les neutralise par une feuille de
style locale, qui ne s'applique que dans l'iframe. C'est le seul couplage avec
`src/app/(app)/layout.tsx` : si sa structure change, revérifier l'aperçu.
Volontairement **pas** de superposition `position: fixed` : l'invitation doit
continuer à faire défiler le document, ce qu'écoutent ses animations.

### 3.3 Sauvegarde automatique

`useAutosave` : 800 ms après la dernière frappe, le brouillon part dans la Server
Action `saveInvitationContentAction`. États affichés : « Tout est enregistré »,
« Modifications non enregistrées », « Enregistrement… », « Enregistré »,
« Enregistrement impossible », « Corrigez les champs signalés ». Une sauvegarde
en vol ne bloque pas la frappe : la dernière valeur est renvoyée dès le retour.

- Le brouillon ne vit **qu'en mémoire React et en base** : aucun `localStorage`,
  aucun `sessionStorage` (contrainte du brief §6).
- Sortie de page : `beforeunload` avertit tant qu'il reste des modifications non
  enregistrées ; passer l'onglet en arrière-plan ou cliquer « Mes invitations »
  déclenche un `flush()` immédiat.
- Si la validation client échoue, rien n'est envoyé : l'étape fautive est
  marquée d'un point rouge et le message est traduit.

Côté serveur, la Server Action ne fait confiance à rien : `requireUser()`, la
requête est filtrée par `ownerId`, le contenu est re-validé par
`buildContentSchema(manifest, theme.Extras)` puis écrit par
`updateInvitationContentForOwner` (qui filtre de nouveau par propriétaire).

### 3.4 Photos

1. Le fichier choisi (ou déposé, ou pris avec l'appareil photo sur mobile) est lu
   par `createImageBitmap`.
2. `cropRect()` calcule le plus grand rectangle au ratio de l'emplacement
   (`manifest.photoSlots[].aspect`), ajusté par les curseurs zoom / position —
   des curseurs plutôt qu'un glisser, pour rester utilisable au clavier et au
   pouce.
3. `targetSize()` ramène le plus grand côté à **1600 px** (jamais d'agrandis-
   sement), le canvas encode en **WebP** en essayant les qualités 0,82 → 0,5
   jusqu'à passer sous **5 Mo**.
4. `POST /api/photos/ticket` (session + propriétaire vérifiés) renvoie un ticket
   HMAC de 10 minutes lié à une clé `invitations/{id}/photos/{uuid}.webp`.
5. `PUT /api/photos/upload?token=…` revérifie le ticket, la session, le
   propriétaire, le type et la taille, puis écrit dans R2.
6. Le contenu reçoit `{ key, width, height, alt, caption }` ; la sauvegarde
   automatique fait le reste.
7. `GET /api/photos/<clé>` sert l'objet avec un cache immuable d'un an. C'est la
   valeur par défaut de `R2_PUBLIC_BASE_URL`, donc le produit fonctionne avant
   qu'un domaine R2 public soit branché. L'éditeur passe toujours par cette
   route pour ses vignettes (le navigateur ne connaît pas le domaine configuré).

### 3.5 Seed des thèmes

`themes` est vide sur une base neuve, alors que `invitations.theme_id` la
référence. `src/db/seed.ts` dérive les lignes des manifestes du registre :

- `seedThemes(db)` — upsert par `slug`, utilisé par l'application ;
- `ensureThemeSeeded(db, slug)` — appelé par la création de brouillon, pour
  qu'une base fraîche ne renvoie jamais une erreur de clé étrangère ;
- `themeSeedSql(rows)` — SQL idempotent pour `pnpm db:seed:local`.

Le script `src/db/seed-cli.mjs` est du JavaScript simple lancé par `node` : il
importe `registry.ts` et les `manifest.ts` (Node 22 retire les types), construit
le SQL et le passe à `wrangler d1 execute --local`. C'est pourquoi `seed.ts`
n'a que des imports statiques **de types** et des imports dynamiques pour le
reste. L'agent « activation Etsy » réutilise `ensureThemeSeeded` / `seedThemes`.

---

## 4. Sécurité

- `/app`, `/app/[id]/edit`, `/app/[id]/preview` : `requireUser()` puis requête
  filtrée par propriétaire. L'invitation d'un autre couple renvoie un 404,
  exactement comme un identifiant inexistant (aucune fuite d'existence).
- `saveInvitationContentAction` : `requireUser()`, lecture filtrée par
  propriétaire, écriture filtrée par propriétaire.
- `POST /api/photos/ticket` : session obligatoire, propriétaire vérifié, 404
  indifférencié sinon.
- `PUT /api/photos/upload` : ticket HMAC valide **et** session propriétaire
  **et** `image/webp` **et** ≤ 5 Mo. La clé est choisie par le serveur.
- `GET /api/photos/…` : public (une invitation publiée l'est aussi), clés en
  UUID non devinables, format de clé vérifié avant tout accès à R2.
- Tests : `tests/unit/editor/access.test.ts` (Bob ne voit ni ne modifie rien
  d'Alice, sur du vrai SQLite avec les vraies migrations) et le scénario e2e,
  qui ouvre l'éditeur et l'aperçu d'une autre couple et attend un 404.

---

## 5. Vérification

```bash
pnpm lint          # ok
pnpm typecheck     # ok
pnpm test          # ok (Vitest)

pnpm db:migrate:local
pnpm db:seed:local # idempotent
```

Le test e2e a besoin des bindings Cloudflare (D1, R2), que seul `next dev`
fournit : `next start` tourne sans eux (`initOpenNextCloudflareForDev()` n'est
appelé qu'en développement). Il se lance donc contre un serveur de développement,
sur un port dédié :

```bash
APP_URL=http://localhost:3102 PORT=3102 pnpm dev &
PLAYWRIGHT_BASE_URL=http://localhost:3102 \
  pnpm exec playwright test tests/e2e/editor.spec.ts --workers=1
```

`APP_URL` doit correspondre au port : Better Auth refuse les origines qu'il ne
connaît pas. Utiliser `localhost` (et non `127.0.0.1`), que le serveur de
développement de Next considère comme la même origine.

Le scénario : connexion par lien magique (le jeton est lu dans la table
`verification` de la base D1 locale, là où Better Auth l'a écrit, puisqu'en
développement le lien est seulement affiché en console) → création d'un
brouillon → modification d'un prénom → attente de « Enregistré » → vérification
du prénom **dans l'aperçu** → envoi d'une photo (préparée par le navigateur,
relue depuis R2) → rechargement de la page (la valeur revient de la base) →
404 pour un autre couple sur `/edit` et `/preview`. Une capture est écrite dans
`tests/e2e/screenshots/editor-<viewport>.png`.

Vérifié ici : `pnpm lint`, `pnpm typecheck`, `pnpm test` (300 tests),
`next build`, et l'e2e sur les trois viewports (390 / 768 / 1440).

---

## 6. Limites connues et points à surveiller

1. **Une seule taille de photo est stockée** (1600 px max). Le cadrage prévoyait
   480 / 960 / 1600, mais le schéma commun `Photo` ne contient qu'une clé R2 par
   emplacement : ajouter un jeu de tailles demande un champ `sizes` et une
   montée de version du contenu (`src/content/schema.ts` + `migrations.ts`).
   À faire en même temps que l'optimisation des performances (phase 8).
2. **Supprimer une photo la retire du contenu, pas du bucket.** Les objets
   orphelins seront nettoyés avec la tâche de rétention (un `deleteInvitationPhotos`
   existe déjà dans `src/lib/r2.ts`).
3. **L'aperçu montre le dernier état enregistré**, pas la frappe en cours.
4. **Changer la langue de l'invitation ne traduit pas les textes saisis** : elle
   change la langue des libellés du thème et le format des dates. C'est dit dans
   l'aide du champ.
5. **`story.photoSlots` n'est pas éditable** : c'est la liste des emplacements
   utilisés par le chapitre Histoire, dictée par le thème, pas par le couple.
6. **`invitations.locale` n'est pas resynchronisée** quand le couple change la
   langue dans l'éditeur : c'est `content.locale` qui fait foi pour le rendu.
   Si la page de partage a besoin de la colonne, ajouter la mise à jour dans
   `saveInvitationContentAction`.
7. **Le bouton « Créer une invitation » est provisoire** : il ne vérifie aucun
   achat. À remplacer (ou restreindre) quand l'activation Etsy sera en place.
8. **Pas de suppression d'invitation** depuis le tableau de bord (hors périmètre
   de la phase).
9. **L'éditeur sort du conteneur `max-w-3xl`** du groupe `(app)` par une largeur
   calculée (`w-[min(calc(100vw-2rem),80rem)]`), pour offrir deux colonnes sur
   grand écran sans modifier la mise en page partagée.
10. **La feuille de style de l'iframe dépend de la structure de
    `src/app/(app)/layout.tsx`** (voir §3.2).
