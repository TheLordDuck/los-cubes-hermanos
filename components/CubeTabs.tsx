// components/CubeTabs.tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import type { Cube, Archetype } from '@/types/cube'
import { BoosterSetup, BOOSTER_ROWS, BoosterTableHead } from '@/components/BoosterSetup'

interface CubeTabsProps {
  cube: Cube & { archetypes: Archetype[] }
}

type Tab = 'archetypes' | 'booster'

const TABS: { key: Tab; label: string }[] = [
  { key: 'archetypes', label: 'Archetypes' },
  { key: 'booster', label: 'Booster setup' },
]

const COLORS = ['W', 'U', 'B', 'R', 'G', 'C'] as const

const SECTION_TITLE =
  'm-0 font-display font-bold text-[26px] tracking-tight'

function ColorPips({ colorPair }: { colorPair: string }) {
  const colors = COLORS.filter((c) => colorPair.includes(c))
  if (colors.length === 0) return null
  return (
    <div className="flex shrink-0">
      {colors.map((c, i) => (
        <div
          key={c}
          className={`relative w-10 h-10 rounded-full border-[3px] border-surface bg-surface ${i > 0 ? '-ml-3' : ''}`}
        >
          <Image
            src={`/colors/${c}.png`}
            alt={c}
            fill
            className="object-contain"
            sizes="40px"
          />
        </div>
      ))}
    </div>
  )
}

function ArchetypeCard({ archetype }: { archetype: Archetype }) {
  return (
    <div className="flex items-center gap-4.5 px-5 py-4.5 rounded-[14px] border border-line bg-surface">
      <ColorPips colorPair={archetype.colorPair} />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
          {archetype.colorPair}
        </span>
        <span className="font-semibold">{archetype.strategy}</span>
      </div>
    </div>
  )
}

function RandomBoosterTable() {
  return (
    <div className="overflow-x-auto rounded-[14px] border border-line bg-surface">
      <table className="w-full min-w-150 border-collapse text-sm text-center">
        <BoosterTableHead
          headers={['Players', 'Packs', 'Pack size', 'Picks', 'Total packs', 'Cards used']}
        />
        <tbody>
          {BOOSTER_ROWS.map((r) => (
            <tr key={r.players} className="border-t border-line">
              <td className="px-3 py-4">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] bg-raised font-mono font-bold">
                  {r.players}
                </span>
              </td>
              <td className="px-3 py-4 font-mono text-soft">{r.packs}</td>
              <td className="px-3 py-4 font-mono text-soft">{r.packSize}</td>
              <td className="px-3 py-4 font-mono text-soft">{r.picks}</td>
              <td className="px-3 py-4 font-mono text-soft">{r.totalPacks}</td>
              <td className="px-3 py-4 font-mono font-bold">{r.totalCards}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
    return (
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className={SECTION_TITLE}>Archetypes</h2>
          {cube.archetypes.length > 0 && (
            <span className="text-[13px] text-muted">
              {cube.archetypes.length}{' '}
              {cube.archetypes.length === 1 ? 'archetype' : 'archetypes'}
            </span>
          )}
        </div>
        {cube.archetypes.length === 0 ? (
          <p className="text-sm text-muted text-center py-10 rounded-[14px] border border-dashed border-line-strong">
            No archetypes added yet.
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,360px),1fr))] gap-3">
            {cube.archetypes.map((a) => (
              <ArchetypeCard key={a.id} archetype={a} />
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className={SECTION_TITLE}>Booster setup</h2>
        <span className="px-3 py-1.5 rounded-full border border-line-strong text-xs text-soft">
          {cube.isRandomBoosterPacked ? 'Random packs' : 'Color-balanced packs'}
        </span>
      </div>
      {cube.isRandomBoosterPacked ? (
        <RandomBoosterTable />
      ) : (
        <BoosterSetup cubeCode={cube.code} />
      )}
    </section>
  )
}

export function CubeTabs({ cube }: CubeTabsProps) {
  const [tab, setTab] = useState<Tab>('archetypes')

  return (
    <div className="flex flex-col gap-7">
      <div
        role="tablist"
        aria-label="Cube sections"
        className="flex gap-1 p-1 w-fit max-w-full rounded-xl border border-line bg-surface"
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
              className={`min-h-11 px-5.5 rounded-[9px] font-semibold transition-colors ${
                isActive ? 'bg-accent text-ink' : 'text-soft hover:text-fg'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <TabContent tab={tab} cube={cube} />
    </div>
  )
}
