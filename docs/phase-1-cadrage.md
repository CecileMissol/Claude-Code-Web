# Phase 1 — Cadrage technique

Statut : **proposition, en attente de validation**. Aucun code applicatif n'est écrit tant que ce document n'est pas validé.

Sources : `BRIEF.md` et `reference/invitation-mariage-demo.html`.

---

## 1. Lecture de la maquette

### 1.1 Ce qu'elle fait (comportement à reproduire)

| Bloc | Mécanique | Notes pour le produit |
|---|---|---|
| Intro enveloppe | Séquence de classes minutée : `flipped` 0 ms → `crack` 800 → `open` 1050 → `under` 1500 → `risen` 1550 → `bloomed` 2300 → déverrouillage du défilement à 2700 ms. Défilement bloqué (`html.locked`) jusque-là. | Timeline GSAP (une seule, rejouable). Prévoir une sortie clavier et une version `prefers-reduced-motion` (fondu simple, déverrouillage immédiat). |
| Chapitres (×4) | Section de hauteur `--len` (300 à 420 vh) avec scène `sticky` 100 svh. Progression `p = -top / (hauteur - vh)`. Chaque pièce a un seuil `data-at` ; chaque phrase un seuil `data-line` (une seule visible, les précédentes « passées »). | ScrollTrigger avec `scrub` gère iOS (barre d'adresse) mieux que `innerHeight`. Les seuils deviennent des données du thème, pas du contenu. |
| Scène (`.board`) | `container-type: size` : toutes les tailles en `cqw`/`cqh`, positions en %. Bascule 2 colonnes à ≥ 820 px. | À conserver tel quel : c'est ce qui garantit le rendu mobile sans casser la mise en page. |
| Infos pratiques | `IntersectionObserver`, étiquettes qui glissent. | Simple, à garder en CSS. |
| RSVP | Envoi → classe `sent` → cachet de cire qui se pose + remerciement. | Le cachet reprend `--seal` et les initiales. |
| Personnalisation | `data-palette` sur `<html>` (6 variables : `--env`, `--env-2`, `--seal`, `--accent`, `--stem`, `--liner`) + `--script` pour l'écriture. | Exactement le mécanisme du futur `styles.css` de thème. Le panneau devient l'aperçu en direct de l'éditeur. |

### 1.2 Inventaire des contenus personnalisables (→ schéma)

- **Couple** : 2 prénoms, initiales (dérivées).
- **Date** : date, heure (14h30 codée en dur), affichages dérivés : `12.06.27`, `12 · 06 · 27`, « Samedi 12 juin 2027 », `12·VI·27` sur le tampon (actuellement figé dans le SVG), compte à rebours.
- **Photos** : 5 emplacements : enveloppe ×2 (légendes « Porquerolles », « nous deux »), histoire ×2 (« Paris, 2019 », « Porquerolles »), carte postale du lieu (« Lourmarin »). Rendu noir et blanc + grain appliqués par le thème.
- **Histoire** : 5 phrases, un souvenir « billet de train » (trajet, date, voiture, places), un mot sur kraft (« elle a dit oui »).
- **Date (chapitre)** : 3 phrases dont la date longue, mot script « le grand jour ».
- **Programme** : 3 phrases, 4 étapes (heure, titre, lieu en script).
- **Lieu** : 3 phrases, nom du lieu sur la carte postale, lien itinéraire.
- **Infos pratiques** : 3 étiquettes (titre + texte).
- **RSVP** : nom, e-mail, présence, nombre (1-5), régime, message.
- **Signature** : prénoms + « À très vite ».
- **Style** : 3 palettes (`noir`, `olivier`, `encre`), 3 écritures (Pinyon Script, Mrs Saint Delafield, Allura).
- **Textes d'interface de l'invitation** (à traduire FR/EN, non éditables en MVP) : « Une lettre pour vous », « Touchez l'enveloppe », « Faites défiler », « Save the date », « on se marie ! », titres de chapitres, libellés du compte à rebours, formulaire RSVP, « Ouvrir l'itinéraire ».

### 1.3 Points techniques relevés

1. **Polices Google Fonts chargées depuis le CDN** : à proscrire en UE (transfert d'IP, jurisprudence allemande). Les 5 familles sont sous licence OFL → **auto-hébergées** via `next/font/local`, sous-ensembles latin, préchargées.
2. **Fuseau horaire** : `new Date('2027-06-12T14:30:00')` dépend du fuseau de l'invité. Le compte à rebours et le `.ics` doivent utiliser le fuseau de l'événement (stocké, IANA).
3. **Date longue** : `toLocaleDateString('fr-FR')` → dépend de la `locale` de l'invitation.
4. **Progression au défilement** basée sur `innerHeight` : instable sur iOS quand la barre d'adresse se replie. ScrollTrigger corrige.
5. **Blocage du défilement** avant ouverture : ok en tant que parti pris, mais ajouter (a) déverrouillage automatique en `reduced-motion`, (b) ouverture au clavier déjà présente, à conserver.
6. **Fleurs générées en JS** (`#bloom-g`) : à remplacer par les assets SVG/WebP (voir 7.4 du brief) ; en attendant, placeholders SVG statiques colorisables.
7. **Illustrations colorisables** : `calla` et `bloom` utilisent déjà `var(--stem)`. À généraliser (enveloppe, cachet, timbres) : argument de vente confirmé.
8. **Mode sombre** : la maquette suit `prefers-color-scheme`. Proposition : **ne pas** l'activer sur l'invitation publique (le couple choisit une palette, le rendu doit être identique chez tous les invités). À confirmer.
9. **Aucune dépendance JS** : la maquette pèse ~30 Ko. Budget produit : GSAP + ScrollTrigger ≈ 30 Ko gzip, React/Next ≈ 90 Ko. L'objectif « < 200 Ko de JS initial » est tenable.

---

## 2. Stack proposée (hébergement Cloudflare, décision prise)

| Besoin | Proposition | Commentaire |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript strict** | Déployé sur **Cloudflare Workers** via l'adaptateur officiel `@opennextjs/cloudflare`. Prévisualisations par branche via *Workers Builds* (connexion GitHub). |
| Base de données | **Cloudflare D1** (SQLite) + **Drizzle ORM** | Migrations versionnées. Création avec `location_hint = weur` (Europe de l'Ouest). Le JSON de contenu est stocké en colonne `text` validée par Zod (équivalent du JSONB). |
| Fichiers | **Cloudflare R2**, bucket créé avec `jurisdiction = eu` | Garantie de résidence UE. Photos redimensionnées côté client en 3 tailles WebP (480 / 960 / 1600 px) avant envoi, donc pas de traitement d'image côté serveur. |
| Auth | **Better Auth** (plugin *magic link*, adaptateur Drizzle/D1) | Lien magique par e-mail, sessions en base, aucun mot de passe. Alternative si tu préfères moins de dépendances : implémentation maison (~150 lignes), je déconseille pour le MVP. |
| E-mails | **Resend** + React Email | Lien magique, notification RSVP, confirmation d'activation. Resend propose une région d'envoi UE (`eu-west-1`) à activer. |
| Anti-spam RSVP | Champ piège + **Cloudflare Rate Limiting** (binding natif Workers) par IP. **Turnstile** en option si le spam apparaît. | Sans cookie pour le piège et la limite de débit. |
| Cache / verrous | **KV** pour le cache des invitations publiées (invalidé à chaque publication) | Facultatif au départ, gain de latence réel. |
| Styles | Tailwind CSS (app) ; CSS par thème avec variables | Comme le brief. |
| Animations | **GSAP 3 + ScrollTrigger** (licence 100 % gratuite depuis 2024) | Comme le brief. |
| Validation | Zod | Schéma partagé éditeur / API / rendu. |
| i18n | **next-intl** (routage `/fr` `/en` pour l'app ; l'invitation publique lit sa `locale` en base, sans préfixe d'URL) | |
| QR code | `qrcode` (SVG côté serveur, PNG côté client via canvas) | Évite la dépendance à `canvas` Node, absent des Workers. |
| .ics | Génération manuelle (format simple) | Pas de dépendance. |
| Audience | **Cloudflare Web Analytics** (sans cookie) | Optionnel, conforme RGPD. |
| Tests | Vitest + Playwright (captures 390 / 768 / 1440 px) | |
| Outils | pnpm, ESLint, Prettier, GitHub Actions (lint + tests) | |

### Ce qui change par rapport au brief (Vercel + Supabase)

- **RLS Supabase** → remplacé par des contrôles d'accès explicites dans la couche données (chaque requête filtre sur `owner_id`), testés par Vitest. Moins « magique » mais plus lisible.
- **Auth Supabase** → Better Auth (même expérience utilisateur : lien magique).
- **Storage Supabase** → R2 (URL signées pour l'upload, diffusion via un domaine public ou une route Worker).
- **Postgres → SQLite (D1)** : suffisant pour ce volume (quelques milliers d'invitations, quelques centaines de RSVP chacune). Limite à connaître : 10 Go par base, largement suffisant.

### Points d'attention Cloudflare

- La résidence UE de **D1** est un « hint » honoré en pratique mais non garanti contractuellement hors offre Entreprise. R2 avec `jurisdiction = eu` est, lui, garanti. À mentionner tel quel dans la politique de confidentialité.
- Next.js sur Workers via OpenNext est mature mais reste un adaptateur : certaines fonctions très récentes de Next peuvent arriver avec un décalage. Je reste sur les fonctions stables (App Router, Server Actions, `next/font`, `next/image` en mode `custom loader`).
- **Plan payant Workers (5 $/mois)** recommandé dès la mise en production (limites CPU et D1 plus confortables). Gratuit suffisant pour le développement.

---

## 3. Arborescence proposée

```
/
├── BRIEF.md
├── README.md
├── docs/                         # cadrage, décisions, guide « créer un thème »
├── reference/                    # maquette validée (non compilée)
├── src/
│   ├── app/
│   │   ├── [locale]/             # fr | en (next-intl)
│   │   │   ├── page.tsx          # vitrine
│   │   │   ├── activer/
│   │   │   ├── app/              # tableau de bord du couple
│   │   │   │   └── [id]/{editer,reponses}/
│   │   │   ├── admin/
│   │   │   ├── demo/[theme]/
│   │   │   └── (legal)/{mentions,confidentialite,cgv}/
│   │   ├── [slug]/page.tsx       # invitation publique (sans préfixe de langue)
│   │   └── api/                  # upload signé, rsvp, ics, qr, auth
│   ├── content/
│   │   ├── schema.ts             # schéma Zod commun (versionné)
│   │   ├── migrations.ts         # migration de version du JSON de contenu
│   │   └── defaults.ts           # contenu par défaut FR/EN pour un brouillon
│   ├── themes/
│   │   ├── registry.ts           # slug → thème (lazy import)
│   │   ├── types.ts              # contrat ThemeManifest / ThemeComponent
│   │   └── mariage-noir-ivoire/
│   │       ├── manifest.ts
│   │       ├── Invitation.tsx
│   │       ├── sections/{Intro,Histoire,Date,Programme,Lieu,Infos,Rsvp,Signature}.tsx
│   │       ├── animations/       # timelines GSAP, seuils de défilement
│   │       ├── styles.css
│   │       ├── messages/{fr,en}.json   # textes d'interface propres au thème
│   │       ├── assets/ + README.md
│   │       └── demo.json         # contenu de démo (Zoé & Dylan)
│   ├── editor/                   # étapes du formulaire, aperçu, upload
│   ├── db/                       # schema Drizzle, migrations D1, requêtes
│   ├── lib/                      # auth, mail, r2, ics, qr, rate-limit, slug
│   ├── messages/{fr,en}.json     # i18n de l'application
│   └── styles/                   # Tailwind
├── emails/                       # gabarits React Email
├── tests/{unit,e2e}/
├── wrangler.jsonc                # bindings D1, R2, KV, rate limiting
├── open-next.config.ts
└── .env.example
```

Contrat d'un thème (`src/themes/types.ts`) :

```ts
export interface ThemeManifest {
  slug: string;                      // 'mariage-noir-ivoire'
  name: Record<Locale, string>;
  version: number;
  eventTypes: ('wedding')[];         // extensible : 'birthday', 'baptism'…
  palettes: { id: string; label: Record<Locale, string>; swatch: string }[];
  scripts:  { id: string; label: string; fontFamily: string }[];
  photoSlots: { id: string; label: Record<Locale, string>; aspect: number; required: boolean }[];
  sections: SectionId[];             // celles que le thème sait rendre
  limits: { storyLines: [min, max]; programItems: [min, max]; infoItems: [min, max]; … };
}
```

L'éditeur ne connaît **que** le manifest : il génère les champs (emplacements photo, palettes, écritures, bornes) sans savoir comment le thème les dessine.

---

## 4. Schéma de contenu Zod (proposition)

Principes : un seul schéma **commun** à tous les thèmes ; les blocs décoratifs propres à un thème (billet de train, mot sur kraft) sont regroupés dans `extras`, typés par le thème mais optionnels ; le contenu porte un `version` pour migrer sans casser.

```ts
import { z } from 'zod';

export const Locale = z.enum(['fr', 'en']);
export const CONTENT_VERSION = 1;

const Text = (max: number) => z.string().trim().max(max);
const Line = Text(140);

export const Photo = z.object({
  key: z.string(),                          // clé R2 : invitations/{id}/photos/{uuid}
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: Text(160).default(''),
  caption: Text(40).optional(),             // légende écrite sous le polaroïd
});

export const Partner = z.object({
  firstName: Text(30).min(1),
});

export const EventDate = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/).default('14:30'),
  timezone: z.string().default('Europe/Paris'), // IANA
});

export const Venue = z.object({
  name: Text(80).min(1),
  addressLine: Text(120).default(''),
  city: Text(60).min(1),
  country: Text(60).optional(),
  mapsUrl: z.string().url().optional(),     // sinon dérivé de l'adresse
  photoSlot: z.literal('venue').default('venue'),
});

export const ProgramItem = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/),
  title: Text(40).min(1),
  detail: Text(60).optional(),              // « sous le vieux chêne »
});

export const InfoItem = z.object({
  title: Text(40).min(1),
  body: Text(280).min(1),
});

export const RsvpSettings = z.object({
  enabled: z.boolean().default(true),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  maxGuestsPerReply: z.number().int().min(1).max(10).default(5),
  askEmail: z.boolean().default(true),
  askDiet: z.boolean().default(true),
  askMessage: z.boolean().default(true),
  notifyByEmail: z.boolean().default(true), // notification au couple
});

export const Style = z.object({
  paletteId: z.string(),                    // validé contre le manifest du thème
  scriptId: z.string(),
});

export const InvitationContent = z.object({
  version: z.literal(CONTENT_VERSION),
  locale: Locale,
  eventType: z.literal('wedding'),          // extensible plus tard
  couple: z.object({ partner1: Partner, partner2: Partner }),
  event: EventDate,
  venue: Venue,
  photos: z.record(z.string(), Photo),      // clé = photoSlot.id du manifest
  story: z.object({
    lines: z.array(Line).min(1).max(6),
    photoSlots: z.array(z.string()).max(2), // ex. ['story-1', 'story-2']
  }),
  dateChapter: z.object({
    lines: z.array(Line).min(1).max(4),     // une ligne peut contenir {date}
    highlight: Text(30).default('le grand jour'),
  }),
  program: z.object({
    lines: z.array(Line).max(4),
    items: z.array(ProgramItem).min(1).max(6),
  }),
  place: z.object({ lines: z.array(Line).max(4) }),
  info: z.array(InfoItem).max(6),
  rsvp: RsvpSettings,
  signature: z.object({ text: Text(60).default('À très vite') }),
  style: Style,
  extras: z.record(z.string(), z.unknown()).default({}),  // blocs propres au thème
});
export type InvitationContent = z.infer<typeof InvitationContent>;
```

Extension du thème « Noir & ivoire » (`themes/mariage-noir-ivoire/schema.ts`) :

```ts
export const Extras = z.object({
  memento: z.object({                       // le billet de train
    kind: z.literal('ticket'),
    route: Text(30),                        // « Marseille → Paris »
    date: Text(12),
    lineA: Text(20), lineB: Text(20),       // « Voiture 12 » / « Places 45 · 46 »
  }).optional(),
  note: Text(30).optional(),                // « elle a dit oui »
  envelope: z.object({ kicker: Text(40).optional() }).optional(),
});
```

Emplacements photo déclarés par ce thème : `envelope-1`, `envelope-2`, `story-1`, `story-2`, `venue`. Un autre thème qui déclare les mêmes identifiants récupère les photos sans intervention.

Valeurs dérivées (jamais stockées) : initiales, `12.06.27`, `12·VI·27`, date longue localisée, compte à rebours, slug suggéré.

---

## 5. Modèle de données (adapté à D1 / Drizzle)

- `users` (Better Auth) : id, email, created_at.
- `themes` : id, slug, name, version, status.
- `activations` : id, etsy_order_id (unique par produit), email, theme_id, status `pending|approved|rejected`, user_id (nullable), reviewed_at, created_at.
- `invitations` : id, owner_id, theme_id, slug (unique, nullable en brouillon), locale, content (JSON texte validé), content_version, status `draft|published|expired|disabled`, published_at, expires_at, created_at, updated_at.
- `rsvps` : id, invitation_id, name, email (nullable), attending (bool), guests, diet, message, ip_hash, created_at.
- `rsvp_notifications` (option) ou simple colonne `notified_at`.
- `audit_log` minimal pour l'admin : qui a validé quoi, quand.

Rétention : tâche planifiée (Cron Trigger Workers) qui supprime les RSVP `event.date + 6 mois` et bascule les invitations en `expired` à `expires_at`.

Slugs réservés : `app`, `admin`, `activer`, `demo`, `api`, `fr`, `en`, `mentions`, `confidentialite`, `cgv`, `login`, etc.

---

## 6. Questions avant la phase 2

1. **Auth et données** : tout Cloudflare (D1 + R2 + Better Auth), comme proposé ? Ou Cloudflare pour l'hébergement seulement, en gardant Supabase pour base + auth + fichiers ?
2. **Format des liens publics** : `domaine.com/zoe-et-dylan` (recommandé, simple, aucune config DNS) ou `zoe-et-dylan.domaine.com` (joli mais wildcard DNS + certificats, et ça complique la version en marque blanche) ?
3. **Compte Cloudflare** : existe-t-il déjà, avec le dépôt GitHub connectable à *Workers Builds* pour les prévisualisations ? Si oui, je documente la procédure en phase 2 et tu crées les ressources (D1, R2) toi-même ou tu me donnes un jeton API limité.
4. **Mode sombre** sur l'invitation publique : désactivé (rendu identique pour tous les invités) ?
5. **Souvenir du chapitre Histoire** : je le rends personnalisable (billet de train avec 4 champs, ou masqué) plutôt que figé. Ok ?
6. **Heure de l'événement** : champ éditable (défaut 14:30), utilisée pour le compte à rebours et le `.ics`. Ok ?
7. **Admin** : accès réservé à une liste d'e-mails en variable d'environnement (`ADMIN_EMAILS`). Suffisant ?
8. **Nom de marque / domaine** : pas nécessaire avant la phase 5 (publication). Je pars sur un nom de code neutre dans le dépôt en attendant.

Réponses par défaut si tu ne tranches pas : 1 tout Cloudflare, 2 chemin, 4 désactivé, 5 oui, 6 oui, 7 oui.
