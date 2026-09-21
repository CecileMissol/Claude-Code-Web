import { SiteHeader } from '@/components/SiteHeader';

/**
 * Layout of the application shell (marketing site, editor, dashboard, admin).
 * The published invitation (`/[slug]`) and the theme demos (`/demo/[theme]`)
 * live outside this group, so they render on a bare page.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-10">{children}</main>
    </>
  );
}
