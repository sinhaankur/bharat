// Icon — renders a Mauryan sprite symbol at a given size, inheriting colour via
// currentColor. Names match the symbols in svg-sprite.tsx.
export type IconName =
  | 'lotus' | 'pillar' | 'stupa' | 'edict' | 'jali' | 'coin'
  | 'torana' | 'lion' | 'tree' | 'sun'

export default function Icon({
  name,
  size = 16,
  className,
}: {
  name: IconName
  size?: number
  className?: string
}) {
  return (
    <svg width={size} height={size} className={className} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  )
}

// Chakra — the spoked wheel, from the #chakra symbol.
export function Chakra({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden="true">
      <use href="#chakra" />
    </svg>
  )
}
