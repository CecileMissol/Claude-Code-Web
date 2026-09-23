import { brand, brandStyleVars } from '@/brand';
import { ConsentBanner } from '@/components/ConsentBanner';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

/**
 * Layout of the application shell (marketing site, editor, dashboard, admin).
 * The published invitation (`/[slug]`) and the theme demos (`/demo/<slug>`)
 * live outside this group, so they render on a bare page.
 *
 * The `--brand-*` custom properties (see `src/brand.ts`) are set here, on
 * `.brand-shell`, and nowhere else — an invitation page or theme demo never
 * renders this layout, so it never inherits them and keeps its own look.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="brand-shell flex min-h-dvh flex-col" style={brandStyleVars(brand)}>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 pb-24">{children}</main>
      <SiteFooter />
      <ConsentBanner />
    </div>
  );
}
