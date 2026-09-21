import type { Metadata } from 'next';
import { InvitationContent } from '@/content/schema';
import type { ThemeModule } from '@/themes/types';

/**
 * Shared body of the three `/demo/<slug>` routes.
 *
 * Why three routes instead of one `/demo/[theme]`: a dynamic segment has to go
 * through the registry, and the registry can reach all three themes, so Next
 * listed **all three** client chunks (≈ 36 kB gzip) in the document of every
 * demo — two of which the page never runs. One folder per slug lets each page
 * import exactly its own theme, and nothing else. An unknown slug now 404s
 * through the router instead of through `notFound()`.
 */
export function demoMetadata(theme: ThemeModule): Metadata {
  return { title: theme.manifest.name.en, robots: { index: false } };
}

export function renderDemo(theme: ThemeModule, demo: unknown) {
  const content = InvitationContent.parse(demo);
  const { Invitation } = theme;
  return <Invitation content={content} mode="demo" />;
}
