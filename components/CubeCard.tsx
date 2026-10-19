// components/CubeCard.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { Cube } from '@/types/cube'
import {
  ART_PLACEHOLDER_STYLE,
  DifficultyMeter,
  cubeMonogram,
  cubeTypeLabel,
} from './CubeBadges'

export function CubeCard({ cube }: { cube: Cube }) {
  const [imgError, setImgError] = useState(false)

  return (
    <Link
      href={`/cubes/${cube.code}`}
      className="group flex flex-col overflow-hidden rounded-[14px] border border-line bg-surface text-fg hover:border-line-strong hover:bg-raised transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div
        className="relative w-full aspect-16/10 bg-raised overflow-hidden flex items-center justify-center text-soft"
        style={ART_PLACEHOLDER_STYLE}
      >
        {cube.imageUrl && !imgError ? (
          <Image
            unoptimized
            src={cube.imageUrl}
            alt={cube.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <span className="font-display font-extrabold text-6xl tracking-tighter opacity-90">
            {cubeMonogram(cube.name)}
          </span>
        )}

        <span
          className={`absolute top-3 left-3 px-2 py-1 rounded-md bg-ink/80 font-mono text-[11px] font-bold uppercase tracking-[0.08em] ${
            cube.isTwobert ? 'text-[#c3aee6]' : 'text-fg'
          }`}
        >
          {cubeTypeLabel(cube)}
        </span>
      </div>

      <div className="flex flex-col gap-3 px-4 pt-4 pb-3.5">
        <p className="font-display font-bold text-lg leading-tight tracking-tight line-clamp-2 min-h-11">
          {cube.name}
        </p>
        <div className="flex items-center justify-between gap-2 text-xs text-muted">
          <DifficultyMeter difficulty={cube.difficulty} />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.open(
                `https://cubecobra.com/cube/list/${cube.code}?display=spoiler`,
                '_blank',
                'noopener,noreferrer'
              )
            }}
            className="inline-flex items-center gap-1.5 -my-2 py-2 hover:text-accent transition-colors"
            title="View on CubeCobra"
          >
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            CubeCobra
          </button>
        </div>
      </div>
    </Link>
  )
}
