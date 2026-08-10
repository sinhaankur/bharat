// The Bharat seal mark (mockup 4a) — the seal-ring with भ cycling through भ / ভ / ಭ
// (Devanagari, Bengali, Kannada) so the brand carries India's scripts. Colour via the
// `color` prop (the ring inherits it; the glyph is inked).
export default function BrandSeal({ size = 28, color = '#ec3013', ink = '#201e1d' }: { size?: number; color?: string; ink?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Bharat" style={{ color }}>
      <use href="#seal-ring" />
      <text x="50" y="63" textAnchor="middle" fontSize="40" fontWeight="700" fill={ink} style={{ animation: 'bha 9s linear infinite' }}>भ</text>
      <text x="50" y="63" textAnchor="middle" fontSize="40" fontWeight="700" fill={ink} style={{ animation: 'bha 9s linear infinite', animationDelay: '-3s', opacity: 0 }}>ভ</text>
      <text x="50" y="63" textAnchor="middle" fontSize="40" fontWeight="700" fill={ink} style={{ animation: 'bha 9s linear infinite', animationDelay: '-6s', opacity: 0 }}>ಭ</text>
    </svg>
  )
}
