import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InvitationContent } from '@/content/schema';
import { loadTheme, THEME_SLUGS } from '@/themes/registry';

/** Pre-render every registered theme demo at build time. */
export function generateStaticParams() {
  return THEME_SLUGS.map((theme) => ({ theme }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ theme: string }>;
}): Promise<Metadata> {
  const { theme: slug } = await params;
  const theme = await loadTheme(slug);
  if (!theme) return { title: 'Demo' };
  return { title: theme.manifest.name.en, robots: { index: false } };
}

/**
 * `/demo/[theme]` — public showcase of a theme, rendered from the theme's own
 * `demo.json`. Used on the Etsy listings and by the Playwright screenshots.
 */
export default async function ThemeDemoPage({ params }: { params: Promise<{ theme: string }> }) {
  const { theme: slug } = await params;
  const theme = await loadTheme(slug);
  if (!theme) notFound();

  const raw = (await import(`@/themes/${slug}/demo.json`)) as { default: unknown };
  const content = InvitationContent.parse(raw.default);

  const { Invitation } = theme;
  return <Invitation content={content} mode="demo" />;
}
