// Icon — references the Mauryan icon sprite (public/mauryan-icons.svg) from the
// Claude design-system handoff. currentColor-driven, so it inherits text color.
// Ids: chakra, lotus, pillar, stupa, lion, elephant, bull, horse, edict, jali,
// coin, torana, bell, sun, sixarm, chaitya, tree.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ''

export type IconName =
  | 'chakra' | 'lotus' | 'pillar' | 'stupa' | 'lion' | 'elephant' | 'bull'
  | 'horse' | 'edict' | 'jali' | 'coin' | 'torana' | 'bell'
  | 'sun' | 'sixarm' | 'chaitya' | 'tree'

export default function Icon({
  name,
  size = 24,
  className,
  title,
}: {
  name: IconName
  size?: number
  className?: string
  title?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={{ color: 'currentColor' }}
    >
      {title && <title>{title}</title>}
      <use href={`${BASE}/mauryan-icons.svg#i-${name}`} />
    </svg>
  )
}
