import type { Metadata } from 'next'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import MotionSpecimens from './motion-specimens'

// The living component reference — every design-system primitive rendered in the house
// style (gold accent, 0 radius, Karla/Rozha), so pages are built from these, not ad-hoc.
export const metadata: Metadata = {
  title: 'Components — the design system in use · Bharat',
  description: 'The Bharat design-system component library: buttons, cards, tags, forms, segmented controls, tables, elevation — the primitives every page is built from.',
}

function Row({ title, kicker, children }: { title: string; kicker: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: '26px 0', borderBottom: '1px solid var(--line)' }}>
      <div className="card-kicker" style={{ marginBottom: 4 }}>{kicker}</div>
      <h2 style={{ font: '700 20px var(--font-ui)', margin: '0 0 16px', color: 'var(--ink)' }}>{title}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-start' }}>{children}</div>
    </section>
  )
}

export default function ComponentsPage() {
  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 'var(--wrap)', margin: '0 auto', padding: '36px var(--edge) 60px' }}>
        <div className="card-kicker">The design system, in use</div>
        <h1 style={{ font: "400 clamp(30px,5vw,48px) 'Rozha One', var(--font-display)", margin: '6px 0 8px', color: 'var(--ink)' }}>Components</h1>
        <p className="text-muted" style={{ font: '400 15px/1.6 var(--font-ui)', maxWidth: '62ch', margin: 0 }}>
          The primitives every Bharat page is built from — one accent voice (house gold), flat
          surfaces, 2px rules, hard offset shadows. Carved from artefacts, organised in tiers.
        </p>

        <Row kicker="Actions" title="Buttons">
          <button className="btn btn-primary">Primary action</button>
          <button className="btn btn-secondary">Secondary</button>
          <button className="btn btn-ghost">Ghost link →</button>
          <button className="btn btn-primary btn-lg">Large primary</button>
          <button className="btn btn-secondary" disabled>Disabled</button>
        </Row>

        <Row kicker="Status" title="Tags">
          <span className="tag tag-accent">accent</span>
          <span className="tag tag-neutral">neutral</span>
          <span className="tag tag-outline">outline</span>
          <span className="tag tag-gap">gap</span>
        </Row>

        <Row kicker="Content" title="Cards">
          <div className="card card-pad elev-sm" style={{ maxWidth: 260 }}>
            <div className="card-kicker">Deep district</div>
            <div className="card-title">Kolkata</div>
            <p className="card-body">More than half the city&apos;s civic money is grant-in-aid transferred down — and the budget still runs a deficit.</p>
            <div className="card-meta">West Bengal · split-admin metro</div>
          </div>
          <a className="card card-pad card--interactive elev-sm" style={{ maxWidth: 260 }} href="#">
            <div className="card-kicker">Interactive</div>
            <div className="card-title">Hover me →</div>
            <p className="card-body">Cards that are links lift on hover and cast the offset shadow.</p>
          </a>
        </Row>

        <Row kicker="Input" title="Forms & controls">
          <div className="field" style={{ minWidth: 220 }}>
            <label>District</label>
            <input className="input" placeholder="e.g. Kolkata" />
          </div>
          <div className="seg" role="group" aria-label="View">
            <button className="seg-opt on">Money</button>
            <button className="seg-opt">Land</button>
            <button className="seg-opt">Law</button>
          </div>
          <label className="radio"><input type="radio" name="r" defaultChecked /> Sourced</label>
          <label className="radio"><input type="radio" name="r" /> Gap</label>
        </Row>

        <Row kicker="Data" title="Table">
          <table className="ds-table" style={{ maxWidth: 520 }}>
            <thead><tr><th>District</th><th>State</th><th>₹ in</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td>Kolkata</td><td>West Bengal</td><td>₹5,525 cr</td><td><span className="tag tag-accent">sourced</span></td></tr>
              <tr><td>Birbhum</td><td>West Bengal</td><td>gap</td><td><span className="tag tag-gap">gap</span></td></tr>
              <tr><td>Greater Bombay</td><td>Maharashtra</td><td>₹74,427 cr</td><td><span className="tag tag-accent">sourced</span></td></tr>
            </tbody>
          </table>
        </Row>

        <Row kicker="Surface" title="Elevation & rule">
          <div className="card card-pad elev-sm" style={{ width: 150 }}><div className="card-meta">elev-sm</div></div>
          <div className="card card-pad elev-md" style={{ width: 150 }}><div className="card-meta">elev-md</div></div>
          <div className="card card-pad elev-lg" style={{ width: 150 }}><div className="card-meta">elev-lg</div></div>
        </Row>

        <section style={{ padding: '26px 0', borderBottom: '1px solid var(--line)' }}>
          <div className="card-kicker" style={{ marginBottom: 4 }}>Motion · powered by Motion (framer-motion)</div>
          <h2 style={{ font: '700 20px var(--font-ui)', margin: '0 0 6px', color: 'var(--ink)' }}>Motion</h2>
          <p className="text-muted" style={{ font: '400 13px/1.6 var(--font-ui)', maxWidth: '64ch', margin: '0 0 16px' }}>
            The animation layer — spring physics, gestures and scroll reveals as reusable primitives
            (<code>&lt;Reveal&gt;</code>, <code>&lt;Stagger&gt;</code>, <code>&lt;Press&gt;</code>) and tokens
            (<code>SPRING</code>, <code>DUR</code>, <code>EASE</code>). Every one honours reduce-motion —
            the reader&apos;s toggle or the OS setting renders it static.
          </p>
          <MotionSpecimens />
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
