// components/CubeBadges.tsx
import type { Cube } from '@/types/cube'

const DIFFICULTY_LEVEL: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
}

// Filled bar color per level: easy green, medium yellow, hard red
const DIFFICULTY_COLOR: Record<number, string> = {
  1: 'bg-[#3e9b63]',
  2: 'bg-[#e9c44c]',
  3: 'bg-[#e0573f]',
}

// 1–3 bar meter instead of a colored difficulty badge
export function DifficultyMeter({
  difficulty,
  size = 'md',
}: {
  difficulty: string
  size?: 'sm' | 'md'
}) {
  const level = DIFFICULTY_LEVEL[difficulty.toLowerCase()] ?? 0
  const fill = DIFFICULTY_COLOR[level] ?? 'bg-accent'
  const bar = size === 'sm' ? 'w-[5px] h-3' : 'w-1.5 h-3.5'
  return (
    <span className="inline-flex items-center gap-2 capitalize">
      <span aria-hidden="true" className="flex gap-[3px]">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`block rounded-[2px] ${bar} ${n <= level ? fill : 'bg-line-strong'}`}
          />
        ))}
      </span>
      {difficulty}
    </span>
  )
}

export function cubeTypeLabel(cube: Pick<Cube, 'type' | 'isTwobert'>) {
  if (cube.isTwobert) return 'Twobert'
  return cube.type === 'BATTLEBOX' ? 'Battlebox' : 'Cube'
}

// Up to two initials, used when a cube has no image
export function cubeMonogram(name: string) {
  return name
    .replace(/[^A-Za-z ]/g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

// Subtle diagonal stripes behind the monogram placeholder
export const ART_PLACEHOLDER_STYLE = {
  backgroundImage:
    'repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0 2px, transparent 2px 12px)',
}
