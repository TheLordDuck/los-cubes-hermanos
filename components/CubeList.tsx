// components/CubeList.tsx
'use client'
import { useState, useMemo, useTransition } from 'react'
import { CubeCard } from './CubeCard'
import type { Cube, TabKey } from '@/types/cube'

interface CubeListProps {
  initialCubes: Cube[]
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',       label: 'All'         },
  { key: 'CUBE',      label: 'Cubes'       },
  { key: 'BATTLEBOX', label: 'Battleboxes' },
]

export function CubeList({ initialCubes }: CubeListProps) {
  const [tab, setTab]       = useState<TabKey>('all')
  const [search, setSearch] = useState('')
  const [, startTransition] = useTransition()

  const filtered = useMemo(() => {
    return initialCubes.filter((c) => {
      const matchType   = tab === 'all' || c.type === tab
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
      return matchType && matchSearch
    })
  }, [initialCubes, tab, search])

  const counts = useMemo(
    () => ({
      all:       initialCubes.length,
      CUBE:      initialCubes.filter((c) => c.type === 'CUBE').length,
      BATTLEBOX: initialCubes.filter((c) => c.type === 'BATTLEBOX').length,
    }),
    [initialCubes]
  )

  return (
    <div>
      {/* Search */}
      <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="relative max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
            width={14} height={14} viewBox="0 0 16 16"
            fill="none" stroke="currentColor" strokeWidth={1.5}
          >
            <circle cx={7} cy={7} r={5} />
            <line x1={11} y1={11} x2={15} y2={15} />
          </svg>
          <input
            type="search"
            placeholder="Search cubes..."
            value={search}
            onChange={(e) => startTransition(() => setSearch(e.target.value))}
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto">
        {TABS.map((t) => {
          const isActive = tab === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`shrink-0 flex items-center gap-1.5 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              {t.label}
              <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                {counts[t.key]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Grid */}
      <main className="p-6">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-neutral-400">
            No cubes found{search ? ` for "${search}"` : ''}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((cube) => (
              <CubeCard key={cube.id} cube={cube} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
