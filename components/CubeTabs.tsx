// components/CubeTabs.tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import type { Cube, Archetype } from '@/types/cube'

interface CubeTabsProps {
  cube: Cube & { archetypes: Archetype[] }
}

type Tab = 'archetypes' | 'booster'

const TABS: { key: Tab; label: string }[] = [
  { key: 'archetypes', label: 'Archetypes'    },
  { key: 'booster',    label: 'Booster Setup' },
]

const COLORS = ['W', 'U', 'B', 'R', 'G', 'C'] as const

function ColorPips({ colorPair }: { colorPair: string }) {
  const colors = COLORS.filter((c) => colorPair.includes(c))
  if (colors.length === 0) return null
  return (
    <div className="flex items-center gap-1 sm:gap-1.5">
      {colors.map((c) => (
        <div key={c} className="relative w-5 h-5 sm:w-7 sm:h-7 lg:w-9 lg:h-9 shrink-0">
          <Image
            src={`/colors/${c}.png`}
            alt={c}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 20px, (max-width: 1024px) 28px, 36px"
          />
        </div>
      ))}
    </div>
  )
}

function ArchetypeCard({ archetype }: { archetype: Archetype }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 px-3 py-2.5 sm:px-5 sm:py-4 lg:px-6 lg:py-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <ColorPips colorPair={archetype.colorPair} />
      <p className="text-xs sm:text-sm lg:text-base font-medium text-neutral-900 dark:text-neutral-100">
        {archetype.strategy}
      </p>
    </div>
  )
}

function TabContent({
  tab,
  cube,
}: {
  tab: Tab
  cube: Cube & { archetypes: Archetype[] }
}) {
  if (tab === 'archetypes') {
    return cube.archetypes.length === 0 ? (
      <p className="text-xs sm:text-sm text-neutral-400 text-center py-8">
        No archetypes added yet.
      </p>
    ) : (
      <div className="grid grid-cols-1 gap-2 sm:gap-3 lg:gap-4">
        {cube.archetypes.map((a) => (
          <ArchetypeCard key={a.id} archetype={a} />
        ))}
      </div>
    )
  }
  const rows = [
    { players: 3, packs: 8,  cards: 6,  picks: 48, totalPacks: 24, totalCards: 144 },
    { players: 4, packs: 6,  cards: 8,  picks: 48, totalPacks: 24, totalCards: 192 },
    { players: 5, packs: 6,  cards: 8,  picks: 48, totalPacks: 30, totalCards: 240 },
    { players: 6, packs: 4,  cards: 12, picks: 48, totalPacks: 24, totalCards: 288 },
    { players: 7, packs: 4,  cards: 12, picks: 48, totalPacks: 28, totalCards: 336 },
    { players: 8, packs: 3,  cards: 15, picks: 45, totalPacks: 24, totalCards: 360 },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-800">
            {['Players', 'Packs', 'Cards', 'Picks', 'Total Packs', 'Total Cards'].map((h) => (
              <th key={h} className="px-3 py-2.5 text-center font-medium text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {rows.map((r) => (
            <tr key={r.players} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
              <td className="px-3 py-2.5 text-center font-medium text-neutral-900 dark:text-neutral-100">{r.players}</td>
              <td className="px-3 py-2.5 text-center text-neutral-600 dark:text-neutral-400">{r.packs}</td>
              <td className="px-3 py-2.5 text-center text-neutral-600 dark:text-neutral-400">{r.cards}</td>
              <td className="px-3 py-2.5 text-center text-neutral-600 dark:text-neutral-400">{r.picks}</td>
              <td className="px-3 py-2.5 text-center text-neutral-600 dark:text-neutral-400">{r.totalPacks}</td>
              <td className="px-3 py-2.5 text-center font-medium text-neutral-900 dark:text-neutral-100">{r.totalCards}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function CubeTabs({ cube }: CubeTabsProps) {
  const [tab, setTab] = useState<Tab>('archetypes')

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto">
        {TABS.map((t) => {
          const isActive = tab === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`shrink-0 px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8 lg:py-4 text-xs sm:text-sm lg:text-base font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <TabContent tab={tab} cube={cube} />
      </div>
    </div>
  )
}
