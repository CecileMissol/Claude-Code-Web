import { CONTENT_VERSION, InvitationContent, type Locale } from './schema';

/**
 * Default content for a freshly created draft, in English and in French.
 * It is deliberately generic (no names, no venue): the editor pre-fills the
 * structure so the couple always sees a complete invitation from step one.
 */

const EN = {
  version: CONTENT_VERSION,
  locale: 'en',
  eventType: 'wedding',
  couple: { partner1: { firstName: 'Alex' }, partner2: { firstName: 'Sam' } },
  event: { date: '2027-06-12', time: '14:30', timezone: 'Europe/Paris' },
  venue: {
    name: 'The venue',
    addressLine: '',
    city: 'Your town',
    photoSlot: 'venue',
  },
  photos: {},
  story: {
    lines: [
      'It started on an ordinary evening.',
      'Then came the trips, the moves, the small habits.',
      'One morning, the question was finally asked.',
      'Now we would love to have you with us for what comes next.',
    ],
    photoSlots: ['story-1', 'story-2'],
  },
  dateChapter: {
    lines: ['Get your diary out.', '{date}.', 'And the countdown has already started.'],
    highlight: 'the big day',
  },
  program: {
    lines: ['A day in four acts.', 'Bring shoes for the grass. And others for dancing.'],
    items: [
      { time: '14:30', title: 'Ceremony', detail: 'under the old oak' },
      { time: '16:30', title: 'Drinks', detail: 'in the olive grove' },
      { time: '20:00', title: 'Dinner', detail: 'in the courtyard' },
      { time: '23:00', title: 'Dancing', detail: 'until the small hours' },
    ],
  },
  place: {
    lines: ['See you at the venue.', 'Parking on site. We will be waiting for you.'],
  },
  info: [
    { title: 'Where to sleep', body: 'Rooms are held in the village. Tell us in your reply.' },
    { title: 'Dress code', body: 'Country chic. Avoid thin heels, the ceremony is on grass.' },
    { title: 'Children', body: 'They are very welcome, a play corner awaits them at dinner.' },
  ],
  rsvp: {
    enabled: true,
    maxGuestsPerReply: 5,
    askEmail: true,
    askDiet: true,
    askMessage: true,
    notifyByEmail: true,
  },
  signature: { text: 'See you very soon' },
  style: { paletteId: 'noir', scriptId: 'pinyon' },
  extras: {},
} as const;

const FR = {
  version: CONTENT_VERSION,
  locale: 'fr',
  eventType: 'wedding',
  couple: { partner1: { firstName: 'Alex' }, partner2: { firstName: 'Sam' } },
  event: { date: '2027-06-12', time: '14:30', timezone: 'Europe/Paris' },
  venue: {
    name: 'Le lieu',
    addressLine: '',
    city: 'Votre ville',
    photoSlot: 'venue',
  },
  photos: {},
  story: {
    lines: [
      'Tout a commencé un soir ordinaire.',
      'Puis il y a eu les voyages, les déménagements, les petites habitudes.',
      'Un matin, la question a enfin été posée.',
      'Maintenant, on aimerait vous avoir près de nous pour la suite.',
    ],
    photoSlots: ['story-1', 'story-2'],
  },
  dateChapter: {
    lines: ['Sortez votre agenda.', '{date}.', 'Et le compte à rebours a déjà commencé.'],
    highlight: 'le grand jour',
  },
  program: {
    lines: [
      'Une journée en quatre temps.',
      'Prévoyez des chaussures pour marcher dans l’herbe. Et d’autres pour danser.',
    ],
    items: [
      { time: '14:30', title: 'Cérémonie', detail: 'sous le vieux chêne' },
      { time: '16:30', title: 'Vin d’honneur', detail: 'dans l’oliveraie' },
      { time: '20:00', title: 'Dîner', detail: 'dans la cour' },
      { time: '23:00', title: 'On danse', detail: 'jusqu’au bout de la nuit' },
    ],
  },
  place: {
    lines: ['Rendez-vous sur place.', 'Parking sur place. On vous attend.'],
  },
  info: [
    {
      title: 'Hébergement',
      body: 'Des chambres sont réservées au village. Dites-le dans votre réponse.',
    },
    {
      title: 'Tenue',
      body: 'Chic champêtre. Évitez les talons fins, la cérémonie a lieu sur l’herbe.',
    },
    { title: 'Enfants', body: 'Ils sont les bienvenus, un coin jeux les attend pendant le dîner.' },
  ],
  rsvp: {
    enabled: true,
    maxGuestsPerReply: 5,
    askEmail: true,
    askDiet: true,
    askMessage: true,
    notifyByEmail: true,
  },
  signature: { text: 'À très vite' },
  style: { paletteId: 'noir', scriptId: 'pinyon' },
  extras: {},
} as const;

/**
 * Returns a fresh, schema-valid draft content for the given locale.
 * The object is parsed on every call, so callers always get a deep copy they
 * can safely mutate.
 */
export function defaultContent(locale: Locale): InvitationContent {
  return InvitationContent.parse(locale === 'fr' ? FR : EN);
}

export const DEFAULT_CONTENT_BY_LOCALE = {
  en: EN,
  fr: FR,
} as const;
