// PageShell — the standard frame for a migrated content page:
// SiteHeader + <main> + EditorialBrief + SiteFooter, so every page is consistent.
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import EditorialBrief, { type Brief } from '@/components/editorial-brief'

export default function PageShell({
  children,
  brief,
}: {
  children: React.ReactNode
  brief?: Brief
}) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh]">{children}</main>
      {brief && <EditorialBrief brief={brief} />}
      <SiteFooter />
    </>
  )
}
