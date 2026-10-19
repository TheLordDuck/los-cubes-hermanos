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
export const BOOSTER_ROWS = [
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

const COLOR_META: Record<string, { bg: string; text: string }> = {
  W: { bg: '#f4ebd0', text: '#3a3324' },
  U: { bg: '#4a90d9', text: '#0b1726' },
  B: { bg: '#3b3540', text: '#ece6f0' },
  R: { bg: '#e0573f', text: '#1e0c08' },
  G: { bg: '#3e9b63', text: '#0b1c12' },
  M: { bg: '#d9b44a', text: '#2b2208' },
  C: { bg: '#b8b3aa', text: '#1e1c19' },
  L: { bg: '#8a6e52', text: '#fff6ec' },
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
              className="inline-block px-1.75 py-0.75 rounded-md font-mono text-[11px] font-bold"
              style={{ background: m.bg, color: m.text }}
            >
              {k}
              {v}
            </span>
          )
        })}
    </div>
  )
}

// ── Shared table head ──────────────────────────────────────────────────────

export function BoosterTableHead({ headers }: { headers: string[] }) {
  return (
    <thead>
      <tr className="bg-raised">
        {headers.map((h) => (
          <th
            key={h}
            className="px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted whitespace-nowrap"
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>
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
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
        <svg
          className="animate-spin"
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
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
      <p className="text-sm text-[#f2826a] bg-loss/10 border border-loss/40 rounded-[10px] px-4 py-3">
        {error}
      </p>
    )

  return (
    <div className="flex flex-col gap-5">
      {/* Cube composition */}
      {analysis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total cards', value: analysis.total, color: 'text-fg' },
            { label: 'Commons', value: analysis.common, color: 'text-soft' },
            {
              label: 'Uncommons',
              value: analysis.uncommon,
              color: 'text-uncommon',
            },
            {
              label: 'Rares & mythics',
              value: analysis.rareOrMythic,
              color: 'text-accent',
            },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col gap-1.5 px-5 py-4.5 rounded-[14px] border border-line bg-surface"
            >
              <span className="text-xs text-muted">{s.label}</span>
              <span
                className={`font-mono font-bold text-[32px] leading-none ${s.color}`}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-[14px] border border-line bg-surface">
        <table className="w-full min-w-215 border-collapse text-sm text-center">
          <BoosterTableHead
            headers={[
              'Players',
              'Packs',
              'Pack size',
              'Picks',
              'Cards used',
              'Rarity / pack',
              ...(analysis ? ['Colors / pack'] : []),
            ]}
          />
          <tbody>
            {BOOSTER_ROWS.map((r) => {
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
                <tr key={r.players} className="border-t border-line">
                  <td className="px-3 py-4">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] bg-raised font-mono font-bold">
                      {r.players}
                    </span>
                  </td>
                  <td className="px-3 py-4 font-mono text-soft">{r.packs}</td>
                  <td className="px-3 py-4 font-mono text-soft">
                    {r.packSize}
                  </td>
                  <td className="px-3 py-4 font-mono text-soft">{r.picks}</td>
                  <td className="px-3 py-4 font-mono">
                    <span
                      className={overCube ? 'text-[#ef7b45] font-bold' : ''}
                    >
                      {r.totalCards}
                    </span>
                    {analysis && (
                      <span className="text-faint"> / {analysis.total}</span>
                    )}
                    {overCube && (
                      <div className="text-[10px] text-[#ef7b45] font-sans">
                        exceeds cube
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-4">
                    {pr ? (
                      <span className="inline-flex gap-1.5 font-mono text-[13px]">
                        <span className="text-accent font-bold">
                          {pr.rareLabel}
                        </span>
                        <span className="text-uncommon">
                          {pr.uncommonLabel}
                        </span>
                        <span className="text-muted">{pr.commonLabel}</span>
                      </span>
                    ) : (
                      <span className="text-faint text-xs">—</span>
                    )}
                  </td>
                  {pc && (
                    <td className="px-3 py-4">
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

