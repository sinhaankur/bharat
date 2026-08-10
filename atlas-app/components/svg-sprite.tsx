// The shared SVG defs — ported verbatim from the Amazing mockup so any component
// can reference them with <svg><use href="#chakra" /></svg>. Rendered once, at the
// top of the layout. currentColor lets each use-site set the colour.
export default function SvgSprite() {
  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          {/* Ashokan chakra — 24 spokes */}
          <symbol id="chakra" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="3" />
            <g stroke="currentColor" strokeWidth="2">
              <line id="sp0" x1="60" y1="16" x2="60" y2="52" />
              {Array.from({ length: 23 }, (_, i) => (
                <use key={i} href="#sp0" transform={`rotate(${(i + 1) * 15} 60 60)`} />
              ))}
            </g>
            <circle cx="60" cy="60" r="9" fill="currentColor" />
          </symbol>

          {/* seal ring — used behind the brand mark */}
          <symbol id="seal-ring" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55" />
            <g stroke="currentColor" strokeWidth="1.1">
              <line id="sr0" x1="50" y1="10" x2="50" y2="4" />
              {Array.from({ length: 23 }, (_, i) => (
                <use key={i} href="#sr0" transform={`rotate(${(i + 1) * 15} 50 50)`} />
              ))}
            </g>
            <circle cx="50" cy="24" r="2.4" fill="currentColor" />
          </symbol>

          {/* jali lattice — light texture behind heros/panels */}
          <pattern id="jali" width="60" height="60" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="#a8794a" strokeWidth="1.1" opacity="0.14">
              <path d="M30 6 L38 22 L54 30 L38 38 L30 54 L22 38 L6 30 L22 22 Z" />
              <rect x="14" y="14" width="32" height="32" transform="rotate(45 30 30)" />
              <circle cx="30" cy="30" r="6" />
              <path d="M0 30 H6 M54 30 H60 M30 0 V6 M30 54 V60" />
            </g>
          </pattern>

          {/* jali lattice — for dark grounds (gold-leaf lines) */}
          <pattern id="jali-dark" width="60" height="60" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="#c9a227" strokeWidth="1" opacity="0.1">
              <path d="M30 6 L38 22 L54 30 L38 38 L30 54 L22 38 L6 30 L22 22 Z" />
              <rect x="14" y="14" width="32" height="32" transform="rotate(45 30 30)" />
              <circle cx="30" cy="30" r="6" />
            </g>
          </pattern>

          {/* floral band — section divider */}
          <pattern id="floral" width="40" height="22" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="#a8794a" strokeWidth="1.3">
              <path d="M0 11 C 8 3, 12 3, 20 11 S 32 19, 40 11" />
              <path d="M10 7 c -3 -4, 3 -4, 0 0" fill="#a8794a" />
              <path d="M30 15 c -3 4, 3 4, 0 0" fill="#a8794a" />
              <circle cx="20" cy="11" r="2" fill="#a8794a" />
            </g>
          </pattern>

          {/* — Mauryan stroke icons (32px grid, 1.6px incised line) — */}
          <symbol id="i-lotus" viewBox="0 0 32 32"><g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M6 12 C8 20 12 24 16 24 C20 24 24 20 26 12 C23 15 20 16 16 16 C12 16 9 15 6 12 Z" /><path d="M16 16 C14 12 14 8 16 5 C18 8 18 12 16 16 Z" /><path d="M11 15 C10 11 11 8 13 6 M21 15 C22 11 21 8 19 6" /><path d="M9 27 H23" /></g></symbol>
          <symbol id="i-pillar" viewBox="0 0 32 32"><g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M13.5 27 L14.5 9 H17.5 L18.5 27 Z" /><path d="M12 9 C13 6.5 19 6.5 20 9 Z" /><rect x="12" y="4" width="8" height="2.6" /><path d="M10 27 H22" /></g></symbol>
          <symbol id="i-stupa" viewBox="0 0 32 32"><g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M5 22 C5 14 10 9 16 9 C22 9 27 14 27 22 Z" /><rect x="13" y="5.5" width="6" height="3.5" /><path d="M16 5.5 V2.5 M12 2.5 H20" /><path d="M3 25.5 H29" /></g></symbol>
          <symbol id="i-edict" viewBox="0 0 32 32"><g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M8 27 C6 20 6 11 9 5 C13 3.5 19 3.5 23 5 C26 11 26 20 24 27 Z" /><path d="M11 10 H21 M11 14 H21 M11 18 H18" /></g></symbol>
          <symbol id="i-jali" viewBox="0 0 32 32"><g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M16 4 L20 12 L28 16 L20 20 L16 28 L12 20 L4 16 L12 12 Z" /><rect x="9" y="9" width="14" height="14" transform="rotate(45 16 16)" /><circle cx="16" cy="16" r="3" /></g></symbol>
          <symbol id="i-coin" viewBox="0 0 32 32"><g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M7 9 L24 6 L26 22 L10 26 Z" /><circle cx="14" cy="13" r="2.4" /><path d="M20 17 l1.8 3 h-3.6 Z" /><path d="M12 20 h.1 M21 11 h.1" strokeWidth="2.4" strokeLinecap="round" /></g></symbol>
          <symbol id="i-torana" viewBox="0 0 32 32"><g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M8 27 V8 M24 27 V8" /><path d="M4 8 Q16 5 28 8 M5 13 Q16 10.5 27 13 M6 18 Q16 15.5 26 18" /></g></symbol>
          <symbol id="i-lion" viewBox="0 0 32 32"><g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><circle cx="16" cy="13" r="6" /><path d="M16 4 L17.5 6.8 M22.8 6.5 L21 9 M25 13 L22 13 M22.8 19.5 L21 17 M9.2 6.5 L11 9 M7 13 L10 13 M9.2 19.5 L11 17" /><path d="M13.5 12 h.1 M18.5 12 h.1" strokeWidth="2.4" strokeLinecap="round" /><path d="M16 14 l-1.6 2.4 h3.2 Z" /><path d="M9 27 Q16 23 23 27" /></g></symbol>
          <symbol id="i-tree" viewBox="0 0 32 32"><g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M16 20 V11" /><circle cx="16" cy="8" r="3.2" /><circle cx="10" cy="12" r="2.8" /><circle cx="22" cy="12" r="2.8" /><path d="M16 15 L11.5 13 M16 15 L20.5 13" /><rect x="7" y="20" width="18" height="6" /><path d="M11.5 20 V26 M16 20 V26 M20.5 20 V26 M7 23 H25" /></g></symbol>
          <symbol id="i-sun" viewBox="0 0 32 32"><g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="16" cy="16" r="5.5" /><path d="M16 3 V7 M16 25 V29 M3 16 H7 M25 16 H29 M6.8 6.8 L9.6 9.6 M22.4 22.4 L25.2 25.2 M25.2 6.8 L22.4 9.6 M9.6 22.4 L6.8 25.2" /></g></symbol>
        </defs>
      </svg>
    </>
  )
}
