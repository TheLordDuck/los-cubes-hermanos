// components/BoosterSetup.tsx
'use client'

import { useState, useEffect } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────

interface CardDetails {
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic'
  colorcategory: string
}

interface CubeCard {
  details: CardDetails
}

interface CubeData {
  cards: { mainboard: CubeCard[] }
  cardCount: number
}

interface ColorBreakdown {
  W: number
  U: number
  B: number
  R: number
  G: number
  M: number
  C: number
  L: number
}

// Fixed table rows — standard configurations
const BASE_ROWS = [
  {
    players: 3,
    packs: 8,
    packSize: 6,
    picks: 48,
    totalPacks: 24,
    totalCards: 144,
  },
  {
    players: 4,
    packs: 6,
    packSize: 8,
    picks: 48,
    totalPacks: 24,
    totalCards: 192,
  },
  {
    players: 5,
    packs: 6,
    packSize: 8,
    picks: 48,
    totalPacks: 30,
    totalCards: 240,
  },
  {
    players: 6,
    packs: 4,
    packSize: 12,
    picks: 48,
    totalPacks: 24,
    totalCards: 288,
  },
  {
    players: 7,
    packs: 4,
    packSize: 12,
    picks: 48,
    totalPacks: 28,
    totalCards: 336,
  },
  {
    players: 8,
    packs: 3,
    packSize: 15,
    picks: 45,
    totalPacks: 24,
    totalCards: 360,
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────

function analyzeCards(mainboard: CubeCard[]) {
  let common = 0,
    uncommon = 0,
    rareOrMythic = 0
  const color: ColorBreakdown = {
    W: 0,
    U: 0,
    B: 0,
    R: 0,
    G: 0,
    M: 0,
    C: 0,
    L: 0,
  }

  for (const card of mainboard) {
    const r = card.details.rarity
    if (r === 'common') common++
    else if (r === 'uncommon') uncommon++
    else rareOrMythic++

    const cat = (card.details.colorcategory ?? '').toLowerCase()
    if (cat === 'white') color.W++
    else if (cat === 'blue') color.U++
    else if (cat === 'black') color.B++
    else if (cat === 'red') color.R++
    else if (cat === 'green') color.G++
    else if (cat === 'multicolor' || cat === 'gold') color.M++
    else if (cat === 'land') color.L++
    else color.C++
  }

  return { common, uncommon, rareOrMythic, color, total: mainboard.length }
}

// Scale a count proportionally to a new total, floor then distribute remainder
function scaleProportional(
  counts: Record<string, number>,
  totalSource: number,
  targetTotal: number
): Record<string, number> {
  const result: Record<string, number> = {}
  let assigned = 0
  const keys = Object.keys(counts).filter((k) => counts[k] > 0)

  // Floor each
  for (const k of keys) {
    result[k] = Math.floor((counts[k] / totalSource) * targetTotal)
    assigned += result[k]
  }

  // Distribute remainder to keys with highest fractional part
  const remainder = targetTotal - assigned
  const sorted = keys
    .map((k) => ({
      k,
      frac: (counts[k] / totalSource) * targetTotal - result[k],
    }))
    .sort((a, b) => b.frac - a.frac)

  for (let i = 0; i < remainder; i++) {
    result[sorted[i % sorted.length].k]++
  }

  return result
}

// BASE: 8 players, 3 packs per player = 24 total packs
// raresPerPack for base = totalRares / 24  (e.g. 48 rares → 2R/pack)
// raresPerPlayer for base = raresPerPack * packsPerPlayer
// For other player counts: cap raresPerPack so each player gets AT MOST the base raresPerPlayer
// Extra slots freed by the cap go to uncommons, then commons

const BASE_PLAYERS = 8
const BASE_PACKS_PER_PLAYER = 3

function packRarity(
  packSize: number,
  players: number,
  packsPerPlayer: number,
  totalPacks: number,
  rareOrMythic: number,
  uncommon: number
) {
  const baseTotalPacks = BASE_PLAYERS * BASE_PACKS_PER_PLAYER // 24
  const baseRaresPerPack = rareOrMythic / baseTotalPacks // e.g. 48/24 = 2
  const baseRaresPerPlayer = baseRaresPerPack * BASE_PACKS_PER_PLAYER // e.g. 2*3 = 6

  // For this player count: max rares per pack so player doesn't exceed base allotment
  const maxRaresPerPack = baseRaresPerPlayer / packsPerPlayer // e.g. 6/6 = 1 for 6-pack config

  // For 8 players use exact cube ratio; for others cap at base player allotment
  const raresPerPack =
    players === BASE_PLAYERS
      ? baseRaresPerPack
      : Math.min(baseRaresPerPack, maxRaresPerPack)

  // Same logic for uncommons
  const baseUncommonsPerPack = uncommon / baseTotalPacks
  const baseUncommonsPerPlayer = baseUncommonsPerPack * BASE_PACKS_PER_PLAYER
  const maxUncommonsPerPack = baseUncommonsPerPlayer / packsPerPlayer
  const uncommonsPerPack =
    players === BASE_PLAYERS
      ? baseUncommonsPerPack
      : Math.min(baseUncommonsPerPack, maxUncommonsPerPack)

  const commonsPerPack = Math.max(0, packSize - raresPerPack - uncommonsPerPack)

  function label(val: number, suffix: string): string {
    const floor = Math.floor(val)
    const frac = val - floor
    if (frac < 0.001) return `${floor}${suffix}`
    return `${floor + 1}${suffix} / ${floor}${suffix}`
  }

  return {
    raresPerPack,
    uncommonsPerPack,
    commonsPerPack,
    rareLabel: label(raresPerPack, 'R'),
    uncommonLabel: label(uncommonsPerPack, 'U'),
    commonLabel: `~${Math.round(commonsPerPack)}C`,
  }
}

// Per-pack color breakdown
function packColors(
  packSize: number,
  color: ColorBreakdown,
  total: number
): ColorBreakdown {
  const scaled = scaleProportional(
    color as unknown as Record<string, number>,
    total,
    packSize
  )
  return scaled as unknown as ColorBreakdown
}

// ── Color pill ─────────────────────────────────────────────────────────────

const COLOR_META: Record<string, { bg: string; text: string; label: string }> =
  {
    W: { bg: '#f3f4f6', text: '#374151', label: 'W' },
    U: { bg: '#dbeafe', text: '#1e40af', label: 'U' },
    B: { bg: '#1f2937', text: '#e5e7eb', label: 'B' },
    R: { bg: '#fee2e2', text: '#991b1b', label: 'R' },
    G: { bg: '#dcfce7', text: '#166534', label: 'G' },
    M: { bg: '#fef9c3', text: '#854d0e', label: 'M' },
    C: { bg: '#e5e7eb', text: '#374151', label: 'C' },
    L: { bg: '#fce7f3', text: '#9d174d', label: 'L' },
  }

function ColorPills({ colors }: { colors: ColorBreakdown }) {
  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {(Object.entries(colors) as [keyof ColorBreakdown, number][])
        .filter(([, v]) => v > 0)
        .map(([k, v]) => {
          const m = COLOR_META[k]
          return (
            <span
              key={k}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold"
              style={{
                background: m.bg,
                color: m.text,
                border: `1px solid ${m.text}33`,
              }}
            >
              {m.label}
              {v}
            </span>
          )
        })}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export function BoosterSetup({ cubeCode }: { cubeCode: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<ReturnType<
    typeof analyzeCards
  > | null>(null)

  useEffect(() => {
    if (!cubeCode) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const r = await fetch(`/api/cubecobra/${encodeURIComponent(cubeCode)}`)
        if (!r.ok) throw new Error(`CubeCobra error ${r.status}`)
        const data: CubeData = await r.json()
        if (!cancelled) setAnalysis(analyzeCards(data.cards?.mainboard ?? []))
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [cubeCode])

  if (loading)
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-neutral-400">
        <svg
          className="animate-spin"
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83"
            strokeLinecap="round"
          />
        </svg>
        Loading cube data…
      </div>
    )

  if (error)
    return (
      <p className="text-sm text-red-400 bg-red-950/30 border border-red-900 rounded-lg px-4 py-3">
        {error}
      </p>
    )

  return (
    <div className="flex flex-col gap-5">
      {/* Cube composition */}
      {analysis && (
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Total', value: analysis.total },
            {
              label: 'Commons',
              value: analysis.common,
              color: 'text-neutral-500',
            },
            {
              label: 'Uncommons',
              value: analysis.uncommon,
              color: 'text-blue-400',
            },
            {
              label: 'Rares+',
              value: analysis.rareOrMythic,
              color: 'text-amber-400',
            },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col gap-0.5 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 min-w-[70px]"
            >
              <span className="text-[10px] text-neutral-400 uppercase tracking-wide">
                {s.label}
              </span>
              <span
                className={`text-base font-semibold ${s.color ?? 'text-neutral-900 dark:text-neutral-100'}`}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
              {[
                'Players',
                'Packs',
                'Pack Size',
                'Picks',
                'Total Packs',
                'Total Cards',
                'Rarity / Pack',
                ...(analysis ? ['Colors / Pack'] : []),
              ].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2.5 text-center text-xs font-medium text-neutral-400 uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {BASE_ROWS.map((r) => {
              const pr = analysis
                ? packRarity(
                    r.packSize,
                    r.players,
                    r.packs,
                    r.totalPacks,
                    analysis.rareOrMythic,
                    analysis.uncommon
                  )
                : null
              const pc = analysis
                ? packColors(r.packSize, analysis.color, analysis.total)
                : null
              const overCube = r.totalCards > (analysis?.total ?? Infinity)

              return (
                <tr
                  key={r.players}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <td className="px-3 py-3 text-center font-semibold text-neutral-900 dark:text-neutral-100">
                    {r.players}
                  </td>
                  <td className="px-3 py-3 text-center text-neutral-600 dark:text-neutral-400">
                    {r.packs}
                  </td>
                  <td className="px-3 py-3 text-center text-neutral-600 dark:text-neutral-400">
                    {r.packSize}
                  </td>
                  <td className="px-3 py-3 text-center text-neutral-600 dark:text-neutral-400">
                    {r.picks}
                  </td>
                  <td className="px-3 py-3 text-center text-neutral-600 dark:text-neutral-400">
                    {r.totalPacks}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span
                      className={`font-semibold ${overCube ? 'text-amber-500' : 'text-neutral-900 dark:text-neutral-100'}`}
                    >
                      {r.totalCards}
                    </span>
                    {overCube && (
                      <div className="text-[10px] text-amber-500">
                        exceeds cube
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {pr ? (
                      <div className="flex flex-col items-center gap-0.5 text-xs">
                        <span className="text-amber-400 font-medium">
                          {pr.rareLabel}
                        </span>
                        <span className="text-blue-400">
                          {pr.uncommonLabel}
                        </span>
                        <span className="text-neutral-400">
                          {pr.commonLabel}
                        </span>
                      </div>
                    ) : (
                      <span className="text-neutral-400 text-xs">—</span>
                    )}
                  </td>
                  {pc && (
                    <td className="px-3 py-3">
                      <ColorPills colors={pc} />
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
