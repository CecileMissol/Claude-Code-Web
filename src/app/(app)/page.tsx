import type { Metadata } from 'next';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { brand } from '@/brand';
import { loadAllManifests } from '@/themes/manifests';
import type { Locale } from '@/i18n/config';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('marketing');
  return {
    title: t('seo.title'),
    description: t('seo.description'),
    openGraph: {
      title: t('seo.title'),
      description: t('seo.ogDescription'),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('seo.title'),
      description: t('seo.ogDescription'),
    },
  };
}

/**
 * `/` — the marketing home page. Bilingual (FR/EN) via `marketing.json`,
 * mobile-first, and deliberately light on JS: the FAQ uses native
 * `<details>`, the theme "demo" is a plain link (no embedded iframe re-running
 * the whole GSAP-powered invitation), and every animation is CSS only.
 */
export default async function HomePage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('marketing');
  const manifests = await loadAllManifests();

  const steps = t.raw('howItWorks.steps') as { title: string; body: string }[];
  const vsCanvaPoints = t.raw('vsCanva.points') as { title: string; body: string }[];
  const faqItems = t.raw('faq.items') as { q: string; a: string }[];
  const themeMoods = t.raw('themesGallery.items') as Record<string, { mood: string }>;

  return (
    <div className="space-y-20 sm:space-y-28">
      {/* ---------------- Hero ---------------- */}
      <FullBleed className="bg-brand-bg-alt">
        <section className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:py-20 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6 text-center lg:text-left">
            <p
              className="inline-block rounded-full bg-brand-accent/10 px-3 py-1 text-sm font-medium text-brand-accent"
              style={{ fontFamily: 'var(--brand-font-script)' }}
            >
              {brand.tagline[locale]}
            </p>
            <h1
              className="text-3xl font-semibold tracking-tight text-brand-fg sm:text-4xl lg:text-5xl"
              style={{ fontFamily: 'var(--brand-font-heading)' }}
            >
              {t('hero.title')}
            </h1>
            <p className="text-lg text-brand-fg/75">{t('hero.subtitle')}</p>
            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                href="/demo/mariage-noir-ivoire"
                className="rounded-full bg-brand-accent px-5 py-2.5 text-sm font-medium text-brand-on-accent"
              >
                {t('hero.ctaDemo')}
              </Link>
              <Link
                href="/activate"
                className="rounded-full border border-brand-muted/50 px-5 py-2.5 text-sm font-medium text-brand-fg"
              >
                {t('hero.ctaActivate')}
              </Link>
            </div>
          </div>

          <PhoneTeaser caption={t('hero.phoneCaption')} ctaDemo={t('hero.ctaDemo')} />
        </section>
      </FullBleed>

      {/* ---------------- How it works ---------------- */}
      <section className="mx-auto max-w-5xl space-y-8 px-4">
        <div className="text-center">
          <h2
            className="text-2xl font-semibold text-brand-fg sm:text-3xl"
            style={{ fontFamily: 'var(--brand-font-heading)' }}
          >
            {t('howItWorks.title')}
          </h2>
          <p className="mt-2 text-brand-fg/70">{t('howItWorks.subtitle')}</p>
        </div>
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="rounded-2xl border border-brand-muted/25 bg-brand-bg p-5"
            >
              <span
                className="flex size-8 items-center justify-center rounded-full bg-brand-accent text-sm font-semibold text-brand-on-accent"
                aria-hidden
              >
                {i + 1}
              </span>
              <h3 className="mt-3 font-semibold text-brand-fg">{step.title}</h3>
              <p className="mt-1 text-sm text-brand-fg/70">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------- Themes gallery ---------------- */}
      <FullBleed className="bg-brand-bg-alt">
        <section className="mx-auto max-w-5xl space-y-8 px-4 py-14 sm:py-16">
          <div className="text-center">
            <h2
              className="text-2xl font-semibold text-brand-fg sm:text-3xl"
              style={{ fontFamily: 'var(--brand-font-heading)' }}
            >
              {t('themesGallery.title')}
            </h2>
            <p className="mt-2 text-brand-fg/70">{t('themesGallery.subtitle')}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {manifests.map((manifest) => (
              <article
                key={manifest.slug}
                className="flex flex-col rounded-2xl border border-brand-muted/25 bg-brand-bg p-5"
              >
                <h3 className="font-semibold text-brand-fg">{manifest.name[locale]}</h3>
                <p className="mt-2 flex-1 text-sm text-brand-fg/70">
                  {themeMoods[manifest.slug]?.mood}
                </p>
                <div className="mt-4 flex items-center gap-1.5" aria-hidden>
                  {manifest.palettes.map((palette) => (
                    <span
                      key={palette.id}
                      className="size-4 rounded-full border border-black/10"
                      style={{ backgroundColor: palette.swatch }}
                    />
                  ))}
                </div>
                <Link
                  href={`/demo/${manifest.slug}`}
                  className="mt-4 inline-flex items-center justify-center rounded-full border border-brand-accent px-4 py-2 text-sm font-medium text-brand-accent"
                >
                  {t('themesGallery.cta')}
                </Link>
              </article>
            ))}
          </div>
        </section>
      </FullBleed>

      {/* ---------------- vs Canva ---------------- */}
      <section className="mx-auto max-w-5xl space-y-8 px-4">
        <div className="text-center">
          <h2
            className="text-2xl font-semibold text-brand-fg sm:text-3xl"
            style={{ fontFamily: 'var(--brand-font-heading)' }}
          >
            {t('vsCanva.title')}
          </h2>
          <p className="mt-2 text-brand-fg/70">{t('vsCanva.subtitle')}</p>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2">
          {vsCanvaPoints.map((point) => (
            <li key={point.title} className="rounded-2xl border border-brand-muted/25 p-5">
              <h3 className="font-semibold text-brand-fg">{point.title}</h3>
              <p className="mt-1 text-sm text-brand-fg/70">{point.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="mx-auto max-w-3xl space-y-6 px-4">
        <h2
          className="text-center text-2xl font-semibold text-brand-fg sm:text-3xl"
          style={{ fontFamily: 'var(--brand-font-heading)' }}
        >
          {t('faq.title')}
        </h2>
        <div className="divide-y divide-brand-muted/25 rounded-2xl border border-brand-muted/25">
          {faqItems.map((item) => (
            <details key={item.q} className="group p-5 open:bg-brand-bg-alt/60">
              <summary className="cursor-pointer list-none font-medium text-brand-fg marker:content-none">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span aria-hidden className="text-brand-accent group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-2 text-sm text-brand-fg/70">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------------- Final CTA ---------------- */}
      <FullBleed className="bg-brand-accent text-brand-on-accent">
        <section className="mx-auto max-w-3xl space-y-5 px-4 py-14 text-center sm:py-16">
          <h2
            className="text-2xl font-semibold sm:text-3xl"
            style={{ fontFamily: 'var(--brand-font-heading)' }}
          >
            {t('finalCta.title')}
          </h2>
          <p className="text-brand-on-accent/90">{t('finalCta.body')}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={brand.etsyShopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-brand-on-accent px-5 py-2.5 text-sm font-medium text-brand-accent"
            >
              {t('finalCta.ctaShop')}
            </a>
            <Link
              href="/activate"
              className="rounded-full border border-brand-on-accent/60 px-5 py-2.5 text-sm font-medium text-brand-on-accent"
            >
              {t('finalCta.ctaActivate')}
            </Link>
          </div>
        </section>
      </FullBleed>
    </div>
  );
}

/** Breaks a section out of the constrained `<main>` to span the full viewport width. */
function FullBleed({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`w-screen ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] ${className}`}>
      {children}
    </div>
  );
}

/**
 * Static, CSS-only phone mock-up linking to the reference theme demo.
 * A real screenshot/photo mock-up is still to be produced — see
 * `docs/phase-10-vitrine-marque.md`. Deliberately not an `<iframe>`: that
 * would re-run the whole GSAP-driven demo just to show a teaser.
 */
function PhoneTeaser({ caption, ctaDemo }: { caption: string; ctaDemo: string }) {
  return (
    <Link
      href="/demo/mariage-noir-ivoire"
      className="group mx-auto block w-full max-w-[260px]"
      aria-label={ctaDemo}
    >
      <div className="rounded-[2.2rem] border-8 border-brand-fg/90 bg-brand-fg p-1 shadow-xl transition-transform group-hover:-translate-y-1">
        <div className="flex aspect-[9/17.5] flex-col items-center justify-center gap-3 rounded-[1.7rem] bg-[#1D1D1B] px-6 text-center">
          <svg width="56" height="40" viewBox="0 0 56 40" aria-hidden>
            <rect
              x="1"
              y="1"
              width="54"
              height="38"
              rx="3"
              fill="#DCD7CB"
              stroke="#6E8228"
              strokeWidth="1.5"
            />
            <path d="M2 3 L28 22 L54 3" fill="none" stroke="#6E8228" strokeWidth="1.5" />
          </svg>
          <p className="text-xs text-[#DCD7CB]">{caption}</p>
        </div>
      </div>
    </Link>
  );
}
