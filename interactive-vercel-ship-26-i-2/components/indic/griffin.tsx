'use client'

// ─────────────────────────────────────────────────────────────────────────
// GRIFFIN (shirdal, "lion-eagle") — a composite guardian: eagle head + wings
// on a lion's body. Born in the ancient Near East, a hallmark of Achaemenid
// Persepolis, it travelled the Indo-Persian world into Mauryan-era art. Greek
// writers (Ctesias, Aelian) even called the griffin an INDIAN beast, guarding
// gold in the north. We draw it as a heraldic incised relief — a guardian seal.
// Reduce-motion → still. Purely our own line drawing.
// ─────────────────────────────────────────────────────────────────────────

export default function Griffin({
  size = 200,
  color = 'var(--accent)',
  ink = 'var(--foreground)',
  className,
  facing = 'left',
}: {
  size?: number
  color?: string
  ink?: string
  className?: string
  facing?: 'left' | 'right'
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="Griffin — lion body, eagle head and wings"
      style={{ transform: facing === 'right' ? 'scaleX(-1)' : undefined }}
    >
      <g
        fill="none"
        stroke={ink}
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {/* ground line */}
        <path d="M28 164 H172" strokeWidth="1.4" opacity="0.4" />

        {/* the lion BODY — a lean, level heraldic torso (chest → haunch) */}
        <path d="M74 92
          C 70 84 74 78 84 78
          L 132 78
          C 150 78 160 88 160 104
          C 160 120 152 130 138 132
          L 90 132
          C 78 132 72 124 72 112
          C 72 104 74 98 74 92 Z" />

        {/* haunch curve of the powerful hindquarter */}
        <path d="M140 82 C 156 84 160 104 150 120" opacity="0.8" />

        {/* front lion leg + eagle talons */}
        <path d="M86 132 V160 M86 160 l-6 5 m6 -5 l0 7 m0 -7 l6 5" />
        {/* second front leg (behind) */}
        <path d="M98 132 V158" opacity="0.55" />
        {/* rear haunch leg + talons */}
        <path d="M142 132 V160 M142 160 l-6 5 m6 -5 l0 7 m6 -2 l-6 -5" />
        <path d="M130 132 V158" opacity="0.55" />

        {/* lion TAIL — sweeps up and back, with a leonine tuft */}
        <path d="M160 108 C 176 104 182 120 174 134 C 186 132 186 148 176 150" />
        <path d="M176 150 q-4 6 2 10 q6 -2 4 -9" fill={ink} stroke="none" opacity="0.85" />

        {/* the great EAGLE WING — a fan of feathers sweeping up off the shoulder */}
        {[0, 1, 2, 3, 4].map((i) => {
          const spread = i * 9
          return (
            <path
              key={i}
              d={`M96 82 C ${104 + spread} ${58 - spread * 0.5}, ${118 + spread} ${44 - spread * 0.4}, ${132 + spread} ${44 - spread * 0.3}`}
            />
          )
        })}
        {/* wing leading edge */}
        <path d="M96 82 C 108 58 128 42 150 40" strokeWidth="2.6" />

        {/* the arched EAGLE NECK rising to the head */}
        <path d="M80 80 C 68 70 62 54 70 40" />
        {/* eagle head */}
        <path d="M70 40
          C 62 32 50 34 47 44
          C 45 52 51 58 60 57
          C 68 56 73 50 73 42" />
        {/* hooked beak */}
        <path d="M47 44 C 38 43 31 47 29 54 C 37 52 42 53 45 49 Z" fill={ink} stroke="none" opacity="0.85" />
        {/* eye */}
        <circle cx="58" cy="46" r="2.6" fill={ink} stroke="none" />
        {/* ear-tuft / crest (Persian shirdal detail) */}
        <path d="M70 40 C 74 30 82 27 87 32" />
      </g>

      {/* a warm accent wash inside the wing to lift it */}
      <path
        d="M96 82 C 108 58 128 42 150 40 C 138 44 122 52 110 66 C 104 74 100 78 96 82 Z"
        fill={color}
        opacity="0.16"
      />
    </svg>
  )
}
