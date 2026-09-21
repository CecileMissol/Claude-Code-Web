import type { InvitationProps } from '../types';
import { paletteStyle, resolvePalette, resolveScript } from '../types';
import { manifest } from './manifest';
import { parseExtras } from './schema';
import { directionsUrl, initials, longDate, postmarkDate, shortDate } from '@/content/derived';
import type { Photo } from '@/content/schema';
import en from './messages/en.json';
import fr from './messages/fr.json';
import './fonts';
import './styles.css';

type Messages = typeof en;

const MESSAGES: Record<string, Messages> = { en, fr: fr as Messages };

/**
 * Static, animation-free rendering of the "Noir & ivoire" invitation.
 *
 * This is the phase-2 placeholder: it proves the theme contract end to end
 * (manifest palette + script injected as CSS variables, content read from the
 * common Zod schema, theme copy read from the invitation locale). The scrolly
 * telling version — envelope timeline, sticky chapters, GSAP — lands in phase 3
 * and replaces this file without touching anything outside this folder.
 */
export default function Invitation({ content, mode }: InvitationProps) {
  const t = MESSAGES[content.locale] ?? en;
  const palette = resolvePalette(manifest, content.style.paletteId);
  const script = resolveScript(manifest, content.style.scriptId);
  const extras = parseExtras(content.extras);

  const names = `${content.couple.partner1.firstName} & ${content.couple.partner2.firstName}`;
  const [year = '', month = '', day = ''] = content.event.date.split('-');

  return (
    <div
      className="invitation"
      data-theme={manifest.slug}
      data-palette={palette.id}
      data-mode={mode}
      lang={content.locale}
      style={paletteStyle(palette, script)}
    >
      {mode === 'demo' && <p className="invitation__demo-banner">{t.demoBanner}</p>}

      {/* ---------- Intro : envelope + save the date ticket ---------- */}
      <section className="invitation__section" aria-label={t.intro.kicker}>
        <p className="invitation__kicker">{extras.envelope?.kicker ?? t.intro.kicker}</p>

        <div className="invitation__envelope" role="img" aria-label={t.intro.openLabel}>
          <span className="invitation__postmark">{postmarkDate(content)}</span>
          <span className="invitation__address">
            <span className="script">{names}</span>
            <span className="caps">{shortDate(content)}</span>
          </span>
          <span className="invitation__seal">{initials(content)}</span>
        </div>

        <div className="invitation__ticket">
          <p className="t1">{t.intro.saveTheDate}</p>
          <p className="t2">{shortDate(content)}</p>
          <p className="t3">{t.intro.weAreGettingMarried}</p>
        </div>

        <p className="invitation__hint" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          {t.intro.hint}
        </p>

        <div className="invitation__gallery">
          <PhotoFrame photo={content.photos['envelope-1']} />
          <PhotoFrame photo={content.photos['envelope-2']} />
        </div>
      </section>

      {/* ---------- Story ---------- */}
      <section className="invitation__section" aria-label={t.chapters.story}>
        <h2 className="invitation__title">{t.chapters.story}</h2>
        <Lines lines={content.story.lines} />

        {extras.memento && (
          <div className="invitation__memento">
            <p className="route">{extras.memento.route}</p>
            <p>
              <small>{extras.memento.date}</small>
            </p>
            <p>
              <small>{extras.memento.lineA}</small> · <small>{extras.memento.lineB}</small>
            </p>
          </div>
        )}

        {extras.note && <p className="invitation__note">{extras.note}</p>}

        <div className="invitation__gallery">
          {content.story.photoSlots.map((slot) => (
            <PhotoFrame key={slot} photo={content.photos[slot]} />
          ))}
        </div>
      </section>

      {/* ---------- Date ---------- */}
      <section className="invitation__section" aria-label={t.chapters.date}>
        <h2 className="invitation__title">{t.chapters.date}</h2>
        <div className="invitation__scraps" aria-hidden="true">
          <span className="invitation__scrap">{day}</span>
          <span className="invitation__scrap">{month}</span>
          <span className="invitation__scrap">{year.slice(2)}</span>
        </div>
        <p className="invitation__highlight">{content.dateChapter.highlight}</p>
        <Lines
          lines={content.dateChapter.lines.map((line) => line.replace('{date}', longDate(content)))}
        />
      </section>

      {/* ---------- Programme ---------- */}
      <section className="invitation__section" aria-label={t.chapters.program}>
        <h2 className="invitation__title">{t.chapters.program}</h2>
        <Lines lines={content.program.lines} />
        <ol className="invitation__program">
          {content.program.items.map((item) => (
            <li key={`${item.time}-${item.title}`}>
              <time dateTime={item.time}>{item.time}</time>
              <strong>{item.title}</strong>
              {item.detail && <em>{item.detail}</em>}
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Venue ---------- */}
      <section className="invitation__section" aria-label={t.chapters.place}>
        <h2 className="invitation__title">{t.chapters.place}</h2>
        <Lines lines={content.place.lines} />
        <div className="invitation__gallery">
          <PhotoFrame photo={content.photos.venue} caption={content.venue.city} />
        </div>
        <p>
          <a
            className="invitation__btn"
            href={directionsUrl(content)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.place.directions}
          </a>
        </p>
      </section>

      {/* ---------- Good to know ---------- */}
      {content.info.length > 0 && (
        <section className="invitation__section" aria-label={t.info.title}>
          <h2 className="invitation__title">{t.info.title}</h2>
          <ul className="invitation__tags">
            {content.info.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- RSVP ---------- */}
      <section className="invitation__section" id="rsvp" aria-label={t.rsvp.title}>
        <h2 className="invitation__title">{t.rsvp.title}</h2>
        <div className="invitation__rsvp">
          {content.rsvp.enabled ? (
            <form method="post" action="#" aria-describedby="rsvp-notice">
              <label>
                {t.rsvp.name}
                <input name="name" autoComplete="name" required />
              </label>

              {content.rsvp.askEmail && (
                <label>
                  {t.rsvp.email}
                  <input name="email" type="email" autoComplete="email" required />
                </label>
              )}

              <fieldset>
                <legend>{t.rsvp.attendingLegend}</legend>
                <label>
                  <input type="radio" name="attending" value="yes" required /> {t.rsvp.yes}
                </label>
                <label>
                  <input type="radio" name="attending" value="no" /> {t.rsvp.no}
                </label>
              </fieldset>

              <label>
                {t.rsvp.guests}
                <select name="guests" defaultValue="1">
                  {Array.from({ length: content.rsvp.maxGuestsPerReply }, (_, i) => i + 1).map(
                    (n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ),
                  )}
                </select>
              </label>

              {content.rsvp.askDiet && (
                <label>
                  {t.rsvp.diet}
                  <input name="diet" />
                </label>
              )}

              {content.rsvp.askMessage && (
                <label>
                  {t.rsvp.message}
                  <textarea name="message" />
                </label>
              )}

              <button className="invitation__btn" type="submit">
                {t.rsvp.submit}
              </button>
            </form>
          ) : (
            <p>{t.rsvp.closed}</p>
          )}
          <p className="invitation__notice" id="rsvp-notice">
            {t.rsvp.dataNotice}
          </p>
        </div>
      </section>

      {/* ---------- Signature ---------- */}
      <footer className="invitation__signature">
        <span className="script">{names}</span>
        <p>{content.signature.text || t.signature.farewell}</p>
      </footer>
    </div>
  );
}

/** One paragraph per story/chapter line. */
function Lines({ lines }: { lines: readonly string[] }) {
  if (lines.length === 0) return null;
  return (
    <ul className="invitation__lines">
      {lines.map((line, index) => (
        <li key={`${index}-${line.slice(0, 12)}`}>{line}</li>
      ))}
    </ul>
  );
}

/**
 * Polaroid frame. Photos are not uploaded yet in phase 2, so an empty slot
 * renders the grey placeholder defined in `styles.css`.
 */
function PhotoFrame({ photo, caption }: { photo?: Photo; caption?: string }) {
  const label = photo?.caption ?? caption;
  return (
    <figure className="invitation__polaroid" style={{ margin: 0 }}>
      {photo ? (
        // Photos come straight from R2 in their final size; next/image's
        // optimizer is unavailable on Workers (images.unoptimized).
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="invitation__photo"
          src={photo.key}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
        />
      ) : (
        <span className="invitation__photo" aria-hidden="true" />
      )}
      {label && <figcaption className="invitation__caption">{label}</figcaption>}
    </figure>
  );
}
