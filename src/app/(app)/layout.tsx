import { ConsentBanner } from '@/components/ConsentBanner';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

/**
 * Layout of the application shell (marketing site, editor, dashboard, admin).
 * The published invitation (`/[slug]`) and the theme demos (`/demo/[theme]`)
 * live outside this group, so they render on a bare page.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 pb-24">{children}</main>
      <SiteFooter />
      <ConsentBanner />
    </div>
  );
}
