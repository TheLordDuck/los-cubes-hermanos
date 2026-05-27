// components/CubeCard.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { Cube } from '@/types/cube'

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: 'bg-emerald-950 text-emerald-300',
  medium: 'bg-amber-950 text-amber-300',
  hard: 'bg-red-950 text-red-300',
}

export function CubeCard({ cube }: { cube: Cube }) {
  const [imgError, setImgError] = useState(false)

  return (
    <Link
      href={`/cubes/${cube.code}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <div className="relative w-full aspect-video bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        {cube.imageUrl && !imgError ? (
          <Image
            src={cube.imageUrl}
            alt={cube.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            <svg
              width={40}
              height={40}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x={3} y={3} width={18} height={18} rx={2} />
              <circle cx={8.5} cy={8.5} r={1.5} />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}

        {cube.isTwobert ? (
          <span className="absolute top-2 left-2 text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wide bg-purple-950 text-purple-300">
            Twobert
          </span>
        ) : (
          <span
            className={`absolute top-2 left-2 text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wide ${
              cube.type === 'BATTLEBOX'
                ? 'bg-blue-950 text-blue-300'
                : 'bg-emerald-950 text-emerald-300'
            }`}
          >
            {cube.type === 'BATTLEBOX' ? 'Battlebox' : 'Cube'}
          </span>
        )}

        <span
          className={`absolute top-2 right-2 text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wide ${
            DIFFICULTY_STYLES[cube.difficulty.toLowerCase()] ??
            'bg-neutral-800 text-neutral-300'
          }`}
        >
          {cube.difficulty}
        </span>
      </div>

      <div className="flex items-center justify-between gap-1 px-3 py-2.5">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 leading-snug line-clamp-2">
          {cube.name}
        </p>
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
          className="shrink-0 text-neutral-400 hover:text-emerald-500 transition-colors"
          title="View on CubeCobra"
        >
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </button>
      </div>
    </Link>
  )
}
