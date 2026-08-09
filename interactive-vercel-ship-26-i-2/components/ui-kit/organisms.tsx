// ─────────────────────────────────────────────────────────────────────────
// ORGANISMS — complete interface components assembled from MOLECULES + ATOMS.
// (Atomic Design · Step 3, layer 3)
// ─────────────────────────────────────────────────────────────────────────
'use client'

import * as React from 'react'
import { Button, Badge, Divider } from './atoms'
import { CardHeader, TagRow, StatBlock, SearchField } from './molecules'
import Chakra from '@/components/indic/chakra'
import SmartLink from '@/components/smart-link'

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

// ── StoryCard ─────────────────────────────────────────────────────────────
export function StoryCard({
  kicker,
  title,
  dek,
  meta,
  tags,
  href = '#',
  featured = false,
}: {
  kicker?: string
  title: string
  dek?: string
  meta?: string
  tags?: { label: string; tone?: any }[]
  href?: string
  featured?: boolean
}) {
  return (
    <SmartLink
      href={href}
      className={cx(
        'carved group block rounded-sm bg-[var(--card)] p-5 transition-transform duration-200 hover:-translate-y-1',
        featured && 'ring-1 ring-[var(--accent)]'
      )}
    >
      <CardHeader kicker={kicker} title={title} meta={meta} />
      {dek && <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{dek}</p>}
      {tags && <TagRow tags={tags} className="mt-3" />}
      <span className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-[var(--accent)]">
        Open <span aria-hidden>→</span>
      </span>
    </SmartLink>
  )
}

// ── DataTable ──────────────────────────────────────────────────────────────
export function DataTable<T extends Record<string, React.ReactNode>>({
  columns,
  rows,
  caption,
}: {
  columns: { key: keyof T; label: string; align?: 'left' | 'right' }[]
  rows: T[]
  caption?: string
}) {
  return (
    <div className="overflow-x-auto rounded-sm border border-[var(--border)]">
      <table className="w-full border-collapse text-sm">
        {caption && <caption className="px-3 py-2 text-left font-mono text-[11px] uppercase tracking-wide text-[var(--muted-foreground)]">{caption}</caption>}
        <thead>
          <tr className="border-b border-[var(--border-strong,var(--border))] bg-[var(--secondary)]">
            {columns.map((c) => (
              <th
                key={String(c.key)}
                className={cx(
                  'px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wide text-[var(--muted-foreground)]',
                  c.align === 'right' ? 'text-right' : 'text-left'
                )}
                scope="col"
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)]/50">
              {columns.map((c) => (
                <td key={String(c.key)} className={cx('px-3 py-2 text-[var(--foreground)]', c.align === 'right' ? 'text-right font-mono' : 'text-left')}>
                  {r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── SectionHeader — a chakra-marked section divider (organism-level rhythm) ─
export function SectionHeader({ n, kicker, title }: { n?: string; kicker?: string; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      {n && (
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--accent)] font-mono text-xs text-[var(--accent)]">
          {n}
        </span>
      )}
      <div>
        {kicker && <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)]">{kicker}</div>}
        <h2 className="font-serif text-2xl font-bold text-[var(--foreground)]">{title}</h2>
      </div>
      <Divider className="flex-1" />
    </div>
  )
}

// ── StatBand — a row of StatBlocks (organism) ──────────────────────────────
export function StatBand({ stats }: { stats: { value: React.ReactNode; label: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s, i) => (
        <StatBlock key={i} value={s.value} label={s.label} />
      ))}
    </div>
  )
}

// ── Toolbar — search + actions (a header sub-organism) ─────────────────────
export function Toolbar({ onSearch }: { onSearch?: (v: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SearchField className="min-w-[220px] flex-1" onSubmit={onSearch} placeholder="Search the atlas…" />
      <Button variant="ghost" size="md">
        Filter
      </Button>
      <Button variant="primary" size="md">
        <Chakra size={14} color="currentColor" /> Live
      </Button>
    </div>
  )
}
