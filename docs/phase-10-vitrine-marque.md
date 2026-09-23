# Phase 10 — Vitrine et habillage de marque

Statut : **livré**. Ce document décrit le système de marque configurable, la
page vitrine `/`, et ce qui reste à produire (visuels réels).

Spécification de référence : `BRIEF.md` §1, §3, §7.3 ; `docs/marque-et-domaines.md`
§5 (les 3 identités) et §6 (nommage des thèmes) ; `docs/strategie-produit.md`
§3 (feuille de route des thèmes) et §5 (fiche Etsy du thème 1, réutilisée pour
le ton du « Comment ça marche » et de la FAQ).

---

## 1. Changer de marque

Toute la marque part d'une seule variable d'environnement :

```bash
BRAND_ID="unfurl"   # ou "kraft-and-bloom" | "petal-post"
```

- Absente ou inconnue → repli silencieux sur `unfurl`, la marque validée
  (voir la décision en tête de `docs/marque-et-domaines.md`).
- À définir dans `.env.local` en développement, ou dans `vars` de
  `wrangler.jsonc` en production (ce n'est pas un secret).
- Deux variables optionnelles complètent la marque, lues par `src/brand.ts` :
  `BRAND_ETSY_SHOP_URL` (URL de la boutique Etsy, un placeholder visible tant
  que la boutique n'est pas créée) et `BRAND_SUPPORT_EMAIL` (à défaut,
  `LEGAL_CONTACT_EMAIL` est réutilisé, puis un placeholder `[[SUPPORT_EMAIL]]`).

Changer `BRAND_ID` et redéployer suffit : nom, tagline, palette, polices,
logo et favicon changent partout où la marque est affichée (en-tête, pied de
page, page vitrine, 404). **Aucune page d'invitation n'est concernée** :
`/[slug]` et `/demo/<slug>` ont leur propre système de thème
(`src/themes/`, voir `README.md` §8) et ne lisent jamais `src/brand.ts`.

## 2. Où sont les presets

```
src/
  brand.ts                        # résout BRAND_ID → objet `brand` exporté
  brand/
    types.ts                      # BrandPreset, BrandPalette, BrandFonts, BrandLogoComponent
    presets/
      unfurl.tsx                  # A — chic & épurée (défaut, marque validée)
      kraft-and-bloom.tsx         # B — chaleureuse & artisanale (réserve)
      petal-post.tsx              # C — moderne & joueuse (réserve : sous-marque plus jeune)
```

Chaque preset exporte un objet `preset: BrandPreset` complet et autonome :
nom, `tagline`/`taglineLong` FR+EN, une note de ton (`voiceNote`, pour la
relecture des textes, jamais affichée), une palette de tokens neutres
(`bg`, `bgAlt`, `fg`, `muted`, `accent`, `accent2?`, `onAccent`), des piles de
polices (`heading`, `body`, `script?`), un SVG de favicon autonome
(`faviconSvg`, sans dépendance à une police web) et un composant `Logo`
(`variant="mark"` = monogramme seul, `variant="full"` = monogramme + logotype).

`src/brand.ts` importe les trois presets, résout `BRAND_ID` et exporte
l'objet `brand` unique consommé par le reste de l'app, ainsi que
`brandStyleVars(preset)` qui transforme une palette/police en variables CSS
`--brand-*`.

### Application des tokens

`src/app/(app)/layout.tsx` pose `brandStyleVars(brand)` en `style` inline sur
un wrapper `.brand-shell` qui enveloppe tout le shell applicatif (en-tête,
contenu, pied de page). `src/app/globals.css` mappe ensuite ces variables sur
des tokens Tailwind v4 (`@theme { --color-brand-accent: var(--brand-accent); … }`),
ce qui donne des classes utilitaires (`bg-brand-accent`, `text-brand-fg`,
`border-brand-muted/30`…) qui repeignent automatiquement au changement de
marque. Le projet n'a pas de `tailwind.config.*` (Tailwind v4, configuration
CSS-first) : rien à modifier de ce côté pour ajouter une marque.

Comme `/[slug]` et `/demo/<slug>` ne passent jamais par ce layout, ils
n'héritent jamais de `.brand-shell` ni des variables `--brand-*` — c'est ce
qui garantit l'isolation demandée par le brief.

### Favicon

`src/app/icon.tsx` sert dynamiquement `brand.faviconSvg` (convention de
fichier Next.js, aucune modification du layout racine nécessaire). Une copie
statique de chaque preset vit aussi dans `public/brand/<id>/favicon.svg`,
réutilisable telle quelle pour les visuels Etsy ou le PDF d'activation
(`BRIEF.md` §8, plan du PDF dans `docs/strategie-produit.md` §5.5).

## 3. Textes marketing

`src/messages/{en,fr}/marketing.json` porte tout le texte de `/` : SEO
(`seo.*`), héros, « Comment ça marche » (4 étapes), galerie des 3 thèmes
(`themesGallery.items.<slug>.mood`, une phrase d'ambiance par thème — le nom
et les pastilles de palette viennent du manifeste du thème, pas du JSON),
arguments vs Canva (5 points, brief §3), FAQ (6 questions) et bandeau final.

Le ton suit la préconisation du brief (« si simple, une variante par
preset pour le héros et la tagline, sinon un seul jeu de textes neutre + la
tagline du preset ») : un seul jeu de textes FR/EN, assez chaleureux pour
convenir aux trois presets, et **une seule variante réellement liée au
preset** — l'accroche au-dessus du titre (`brand.tagline[locale]`), qui vient
directement du preset actif et change donc avec `BRAND_ID`.

## 4. Ce qui reste à produire

- **Logos définitifs** : les `Logo` actuels sont des SVG dessinés à la main
  (monogramme + logotype), fonctionnels et colorisables, mais pas un travail
  de direction artistique finalisé — à remplacer si une identité graphique
  professionnelle est commandée, sans changer l'interface (`BrandLogoComponent`).
- **Visuels de fiche Etsy** (mockups, bannière de boutique) : `marketing/` et
  `scripts/` sont hors périmètre de cette phase (kit Etsy, voir
  `docs/phase-11-kit-etsy.md`).
- **Photos de mockup** pour le héros de `/` : la maquette téléphone de la page
  d'accueil est actuellement un dessin CSS/SVG minimal qui pointe vers
  `/demo/mariage-noir-ivoire` (choisi plutôt qu'un `<iframe>`, pour ne pas
  recharger toute la démo GSAP dans la page vitrine) — à remplacer par une
  vraie capture ou photo composée une fois disponible.
- **Choix de marque** : tranché — Unfurl (voir la décision en tête de
  `docs/marque-et-domaines.md`). Ce document garde les trois presets
  utilisables en parallèle (`BRAND_ID`) ; la section 5 de
  `docs/marque-et-domaines.md` documente, à titre d'historique, le
  raisonnement qui a mené à ce choix.

## 5. Point de vigilance technique

Les trois presets sont importés statiquement par `src/brand.ts` (pour
construire la table `BRAND_PRESETS`), donc les polices `@fontsource/*` des
trois identités sont actuellement bundlées ensemble plutôt que chargées à la
demande selon `BRAND_ID` (seules les règles `@font-face` sont dupliquées ;
un fichier de police n'est téléchargé par le navigateur que si son
`font-family` est réellement utilisé dans la page). Un futur passage en
import dynamique par identité (à la manière de `src/themes/registry.ts`)
réduirait encore ce poids si besoin.
