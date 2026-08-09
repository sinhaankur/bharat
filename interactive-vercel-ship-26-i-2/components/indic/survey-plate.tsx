// SURVEY PLATE — a temple elevation drawn as a measured archival survey sheet
// (from the Atlas Mockups "temple plates" turn). Aged paper, moulded plinth
// courses, ratha bands, the latina shikhara curve, ribbed amalaka + kalasha,
// dimension lines and a scale figure. Drawn in the system — not a facsimile.
// A hero piece for the temple-forms / heritage survey.

export default function SurveyPlate({
  plate = 'PLATE IX',
  register = 'HERITAGE SURVEY · MEASURED ELEVATION',
  title = 'Nagara shikhara — Kandariya Mahādeva, Khajurāho',
  date = 'c. 1030 CE',
  scale = 'scale 1 : 200',
  className,
}: {
  plate?: string
  register?: string
  title?: string
  date?: string
  scale?: string
  className?: string
}) {
  const ink = '#2a2018'
  const sepia = '#8a5a3a'
  const red = '#8a3020'
  return (
    <figure
      className={className}
      style={{
        background: '#e8dcc0',
        color: ink,
        fontFamily: 'Inter, sans-serif',
        borderRadius: 2,
        border: '1px solid rgba(42,32,24,.18)',
        boxShadow: '0 2px 10px rgba(42,32,24,.14)',
        backgroundImage:
          'radial-gradient(ellipse 90% 70% at 30% 20%, rgba(255,250,235,.5), transparent 60%),radial-gradient(ellipse 60% 50% at 80% 85%, rgba(160,130,80,.14), transparent 65%)',
      }}
    >
      {/* header band */}
      <div
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          padding: '18px 28px 10px', borderBottom: '1.5px solid rgba(42,32,24,.55)', margin: '0 16px',
        }}
      >
        <div>
          <div style={{ font: "600 9px 'JetBrains Mono', monospace", letterSpacing: '.2em', color: sepia }}>
            {plate} · {register}
          </div>
          <div style={{ font: '600 19px Fraunces, serif', marginTop: 3 }}>{title}</div>
        </div>
        <div style={{ font: "500 9.5px 'JetBrains Mono', monospace", color: '#6b5c48', textAlign: 'right' }}>
          {date}<br />{scale}
        </div>
      </div>

      {/* the measured drawing */}
      <svg viewBox="0 0 720 760" style={{ width: '100%', display: 'block' }} aria-label={title}>
        {/* ground lines */}
        <line x1="90" y1="700" x2="640" y2="700" stroke={ink} strokeWidth="2" />
        <line x1="70" y1="708" x2="660" y2="708" stroke={ink} strokeWidth=".7" opacity=".5" />
        <g fill="none" stroke={ink} strokeWidth="1.1">
          {/* moulded plinth (adhisthana) courses */}
          <path d="M160 700 V688 H600 V700 M172 688 V678 H588 V688 M184 678 V670 H576 V678 M196 670 V664 H564 V670" strokeWidth=".9" />
          <path d="M208 664 V652 H552 V664 M214 652 V644 H546 V652 M220 644 V638 H540 V644" />
          <g strokeWidth=".7" opacity=".7"><path d="M212 658 H548 M216 648 H544 M222 641 H538" /></g>
          {/* jangha wall with devakoshtha niches */}
          <path d="M232 638 V596 H528 V638" strokeWidth="1.2" />
          <g strokeWidth=".8">
            <path d="M244 638 V596 M262 638 V596 M280 638 V596 M480 638 V596 M498 638 V596 M516 638 V596" />
            <rect x="292" y="604" width="26" height="34" /><rect x="330" y="604" width="26" height="34" />
            <rect x="404" y="604" width="26" height="34" /><rect x="442" y="604" width="26" height="34" />
          </g>
          <path d="M368 638 V584 M392 638 V584 M362 596 H398 M368 584 C368 576 373 572 380 572 C387 572 392 576 392 584" strokeWidth="1.1" />
          {/* the latina shikhara curve (highlighted) */}
          <path d="M274 500 C268 428 280 340 380 258 C480 340 492 428 486 500" strokeWidth="1.6" stroke={red} />
          <path d="M292 500 C288 440 298 368 380 296 C462 368 472 440 468 500" strokeWidth="1" />
          <path d="M312 500 C310 452 318 396 380 336 C442 396 450 452 448 500" strokeWidth=".8" opacity=".8" />
          <path d="M332 500 C331 462 337 420 380 374 C423 420 429 462 428 500" strokeWidth=".7" opacity=".65" />
          {/* horizontal course lines up the tower */}
          <g strokeWidth=".55" opacity=".55">
            <path d="M276 488 H484 M282 460 H478 M290 432 H470 M301 404 H459 M316 376 H444 M334 348 H426 M355 320 H405 M366 306 H394" />
          </g>
          {/* ribbed amalaka + kalasha finial */}
          <ellipse cx="380" cy="252" rx="34" ry="13" strokeWidth="1.3" />
          <path d="M380 239 V222 M370 222 H390 M380 222 V206 M374 206 C374 200 386 200 386 206 M380 200 V190 M376 190 H384" strokeWidth="1.2" />
        </g>
        {/* dimension lines */}
        <g stroke={ink} fill={ink}>
          <path d="M120 700 V560 M116 700 H124 M116 560 H124" strokeWidth=".8" fill="none" />
          <path d="M120 560 V258 M116 258 H124" strokeWidth=".8" fill="none" strokeDasharray="3 3" />
          <path d="M96 700 V190 M92 700 H100 M92 190 H100" strokeWidth=".8" fill="none" />
        </g>
        {/* labels */}
        <g fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#5a4632">
          <text x="60" y="445" transform="rotate(-90 60 445)">30.5 m — 100 ft to the kalasha</text>
          <text x="240" y="730">ADHISTHANA — MOULDED PLINTH COURSES</text>
          <text x="508" y="548" fill={red}>LATINA CURVE  w = W(1−t)^1.35</text>
          <text x="424" y="250" fill={red}>AMALAKA · 16 RIBS</text>
          <text x="398" y="196">KALASHA</text>
          <text x="296" y="592" opacity=".8">DEVAKOSHTHA NICHES</text>
        </g>
        {/* scale figure (a person, ~1.7m) */}
        <g fill="none" stroke={ink} strokeWidth="1">
          <circle cx="176" cy="586" r="7" />
          <path d="M176 593 V622 M176 600 L164 612 M176 600 L188 612 M176 622 L166 646 M176 622 L186 646" />
          <line x1="158" y1="648" x2="194" y2="648" strokeWidth=".8" />
        </g>
        <text x="152" y="662" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#5a4632">1.7 m</text>
      </svg>

      {/* footer band */}
      <figcaption
        style={{
          display: 'flex', justifyContent: 'space-between', padding: '8px 28px 16px', margin: '0 16px',
          borderTop: '1.5px solid rgba(42,32,24,.55)',
          font: "500 9px 'JetBrains Mono', monospace", letterSpacing: '.12em', color: sepia,
        }}
      >
        <span>SOURCED: ASI · DIMENSIONS T1</span>
        <span>DRAWN IN THE SYSTEM — NOT A SURVEY FACSIMILE</span>
        <span>BHARAT · HERITAGE</span>
      </figcaption>
    </figure>
  )
}
