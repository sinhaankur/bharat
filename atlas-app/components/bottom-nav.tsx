'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon, { type IconName } from '@/components/icon'
import { classicMapHref } from '@/lib/links'

// Mobile bottom nav (mockup 6c) — a fixed 4-tab bar, ≥44px targets, active tab
// carries a gold top-border. Shown only ≤860px (hidden on desktop via CSS).
const TABS: { label: string; icon: IconName; href: string; ext?: boolean }[] = [
  { label: 'Map', icon: 'coin', href: classicMapHref(), ext: true },
  { label: '3D', icon: 'sun', href: '/3d' },
  { label: 'Study', icon: 'pillar', href: '/study/ashoka' },
  { label: 'Data', icon: 'edict', href: '/data' },
]

export default function BottomNav() {
  const pathname = usePathname() || '/'
  const isActive = (href: string) => !href.includes('.html') && (pathname === href || pathname.startsWith(href.split('/').slice(0, 2).join('/') + '/'))

  return (
    <nav className="bnav" aria-label="Primary (mobile)">
      {TABS.map((t) => {
        const on = isActive(t.href)
        const inner = (
          <>
            <Icon name={t.icon} size={18} />
            <span className="bnav-l">{t.label}</span>
          </>
        )
        return t.ext ? (
          <a key={t.label} href={t.href} className="bnav-tab">{inner}</a>
        ) : (
          <Link key={t.label} href={t.href} className={`bnav-tab${on ? ' on' : ''}`}>{inner}</Link>
        )
      })}

      <style>{`
        .bnav { display: none; }
        @media (max-width: 860px) {
          .bnav {
            display: grid; grid-template-columns: repeat(4, 1fr);
            position: fixed; left: 0; right: 0; bottom: 0; z-index: 180;
            background: var(--stone); border-top: 2px solid var(--line-strong);
          }
          .bnav-tab {
            display: flex; flex-direction: column; align-items: center; gap: 3px;
            padding: 9px 0 10px; min-height: 44px;
            color: var(--muted); border-top: 3px solid transparent;
          }
          .bnav-tab.on { color: var(--gold-700); border-top-color: var(--gold); }
          .bnav-l { font: 600 9.5px var(--font-ui); }
          /* keep content clear of the bar */
          body { padding-bottom: 60px; }
        }
      `}</style>
    </nav>
  )
}
