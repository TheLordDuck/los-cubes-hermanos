// components/CubeList.tsx
'use client'
import { useState, useMemo, useTransition } from 'react'
import { CubeCard } from './CubeCard'
import type { Cube, TabKey } from '@/types/cube'

interface CubeListProps {
  initialCubes: Cube[]
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'CUBE', label: 'Cubes' },
  { key: 'BATTLEBOX', label: 'Battleboxes' },
  { key: 'TWOBERT', label: 'Twoberts' },
]

export function CubeList({ initialCubes }: CubeListProps) {
  const [tab, setTab] = useState<TabKey>('all')
  const [search, setSearch] = useState('')
  const [, startTransition] = useTransition()

  const filtered = useMemo(() => {
    return initialCubes.filter((c) => {
      const matchType =
        tab === 'all' ? true : tab === 'TWOBERT' ? c.isTwobert : c.type === tab
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
      return matchType && matchSearch
    })
  }, [initialCubes, tab, search])

  const counts = useMemo(
    () => ({
      all: initialCubes.length,
      CUBE: initialCubes.filter((c) => c.type === 'CUBE').length,
      BATTLEBOX: initialCubes.filter((c) => c.type === 'BATTLEBOX').length,
      TWOBERT: initialCubes.filter((c) => c.isTwobert).length,
    }),
    [initialCubes]
  )

  return (
    <main className="max-w-310 w-full mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-20 flex flex-col gap-9">
      {/* Hero + search */}
      <section className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-2.5">
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-accent">
            The shelf
          </span>
          <h1 className="m-0 font-display font-extrabold text-4xl sm:text-[56px] leading-none tracking-tighter">
            Pick a cube.
            <br />
            Shuffle up.
          </h1>
          <p className="m-0 text-muted max-w-115 leading-relaxed">
            Every cube and battlebox we own, with lists pulled live from
            CubeCobra.
          </p>
        </div>
        <div className="flex flex-col gap-1.5 w-85 max-w-full">
          <label htmlFor="cube-search" className="text-xs font-medium text-muted">
            Search the shelf
          </label>
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint pointer-events-none"
              width={16}
              height={16}
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              aria-hidden="true"
            >
              <circle cx={7} cy={7} r={5} />
              <line x1={11} y1={11} x2={15} y2={15} strokeLinecap="round" />
            </svg>
            <input
              id="cube-search"
              type="search"
              placeholder="Cube name…"
              value={search}
              onChange={(e) => startTransition(() => setSearch(e.target.value))}
              className="w-full h-11.5 pl-10 pr-3.5 rounded-[10px] border border-line-strong bg-surface text-fg placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Filter by type"
        className="flex flex-wrap gap-2 pb-5 border-b border-line"
      >
        {TABS.map((t) => {
          const isActive = tab === t.key
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2.5 min-h-11 px-4.5 rounded-full border font-medium transition-colors ${
                isActive
                  ? 'border-accent bg-accent text-ink'
                  : 'border-line-strong text-soft hover:border-faint'
              }`}
            >
              {t.label}
              <span className="font-mono text-xs opacity-75">
                {counts[t.key]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted">
          No cubes found{search ? ` for "${search}"` : ''}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
          {filtered.map((cube) => (
            <CubeCard key={cube.id} cube={cube} />
          ))}
        </div>
      )}
    </main>
  )
}
