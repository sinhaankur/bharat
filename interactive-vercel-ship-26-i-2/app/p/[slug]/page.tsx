import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import LegacyFrame from '@/components/legacy-frame'
import { ATLAS_PAGES, findPage } from '@/lib/atlas-pages'

// static-export: pre-generate a route for every legacy page (skip native ones)
export function generateStaticParams() {
  return ATLAS_PAGES.filter((p) => !p.native).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = findPage(slug)
  return { title: page ? `${page.title} — Bharat` : 'Bharat' }
}

export default async function LegacyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = findPage(slug)
  if (!page) notFound()
  return <LegacyFrame page={page} />
}
