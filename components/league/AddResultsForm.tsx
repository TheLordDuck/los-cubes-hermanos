// components/league/AddResultsForm.tsx
'use client'

import { DecklistModal } from './DecklistModal'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { SeasonPlayerWithPlayer } from '@/types/cube'

interface MatchEntry {
  player1_id: number | null
  player2_id: number | null
  p1_games: number
  p2_games: number
  is_bye: boolean
  decklist_p1: string
  decklist_p2: string
}

interface RoundEntry {
  round_number: number
  matches: MatchEntry[]
}

interface DecklistEntry {
  player_id: number
  decklist_url: string
}

function buildDefaultRounds(players: SeasonPlayerWithPlayer[]): RoundEntry[] {
  const count = Math.ceil(players.length / 2)
  const emptyMatch = (): MatchEntry => ({
    player1_id: null,
    player2_id: null,
    p1_games: 0,
    p2_games: 0,
    is_bye: false,
    decklist_p1: '',
    decklist_p2: '',
  })
  return [1, 2, 3].map((round_number) => ({
    round_number,
    matches: Array.from({ length: count }, emptyMatch),
  }))
}

function playerName(
  players: SeasonPlayerWithPlayer[],
  id: number | null
): string {
  if (id === null) return 'Bye'
  return players.find((p) => p.id === id)?.player.username ?? '?'
}

function usedInRound(round: RoundEntry, excludeMatchIdx: number): Set<number> {
  const used = new Set<number>()
  round.matches.forEach((m, mi) => {
    if (mi === excludeMatchIdx) return
    if (m.player1_id) used.add(m.player1_id)
    if (m.player2_id) used.add(m.player2_id)
  })
  return used
}

export function AddResultsForm({
  seasonId,
  players,
}: {
  seasonId: number
  players: SeasonPlayerWithPlayer[]
}) {
  const router = useRouter()
  const [importModal, setImportModal] = useState<{ playerId: number } | null>(
    null
  )
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [rounds, setRounds] = useState<RoundEntry[]>(() =>
    buildDefaultRounds(players)
  )
  const [decklists, setDecklists] = useState<DecklistEntry[]>(
    players.map((p) => ({ player_id: p.id, decklist_url: '' }))
  )

  function updateMatch(
    roundIdx: number,
    matchIdx: number,
    patch: Partial<MatchEntry>
  ) {
    setRounds((prev) =>
      prev.map((r, ri) =>
        ri !== roundIdx
          ? r
          : {
              ...r,
              matches: r.matches.map((m, mi) =>
                mi === matchIdx ? { ...m, ...patch } : m
              ),
            }
      )
    )
  }

  function addMatch(roundIdx: number) {
    setRounds((prev) =>
      prev.map((r, ri) =>
        ri !== roundIdx
          ? r
          : {
              ...r,
              matches: [
                ...r.matches,
                {
                  player1_id: null,
                  player2_id: null,
                  p1_games: 0,
                  p2_games: 0,
                  is_bye: false,
                  decklist_p1: '',
                  decklist_p2: '',
                },
              ],
            }
      )
    )
  }

  function removeMatch(roundIdx: number, matchIdx: number) {
    setRounds((prev) =>
      prev.map((r, ri) =>
        ri !== roundIdx
          ? r
          : { ...r, matches: r.matches.filter((_, mi) => mi !== matchIdx) }
      )
    )
  }

  function toggleBye(roundIdx: number, matchIdx: number) {
    const m = rounds[roundIdx].matches[matchIdx]
    if (m.is_bye)
      updateMatch(roundIdx, matchIdx, {
        is_bye: false,
        player2_id: null,
        p1_games: 0,
        p2_games: 0,
      })
    else
      updateMatch(roundIdx, matchIdx, {
        is_bye: true,
        player2_id: null,
        p1_games: 2,
        p2_games: 0,
      })
  }

  function updateDecklist(playerId: number, url: string) {
    setDecklists((prev) =>
      prev.map((d) =>
        d.player_id === playerId ? { ...d, decklist_url: url } : d
      )
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    for (const r of rounds) {
      for (const m of r.matches) {
        if (!m.player1_id) {
          setError(`Round ${r.round_number} has a match without Player 1.`)
          return
        }
        if (!m.is_bye && !m.player2_id) {
          setError(`Round ${r.round_number} has a match without Player 2.`)
          return
        }
      }
    }
    startTransition(async () => {
      try {
        const res = await fetch(`/api/seasons/${seasonId}/matches`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rounds, decklists }),
        })
        if (!res.ok) {
          const d = await res.json()
          throw new Error(d.error)
        }
        router.push(`/admin/league/${seasonId}/results`)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <p className="text-sm text-red-400 bg-red-950 border border-red-800 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      {/* Decklists */}
      <section className="flex flex-col gap-3">
        <SectionHeader>Decklists</SectionHeader>
        <div className="flex flex-col gap-2">
          {players.map((p) => {
            const entry = decklists.find((d) => d.player_id === p.id)
            return (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 w-24 shrink-0 truncate">
                  {p.player.username}
                </span>
                <input
                  type="url"
                  placeholder="https://moxfield.com/decks/…"
                  value={entry?.decklist_url ?? ''}
                  onChange={(e) => updateDecklist(p.id, e.target.value)}
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => setImportModal({ playerId: p.id })}
                  title="Import decklist from text"
                  className="shrink-0 flex items-center gap-1 px-2.5 py-2 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:border-neutral-400 transition-colors"
                >
                  <svg
                    width={12}
                    height={12}
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8 2v8M5 7l3 3 3-3M2 13h12" />
                  </svg>
                  <span className="hidden sm:inline">Import</span>
                </button>
              </div>
            )
          })}

          {importModal && (
            <DecklistModal
              onConfirm={(text) => {
                // Store the raw validated text as the decklist value
                // User will still need to paste into Moxfield and get URL
                updateDecklist(importModal.playerId, text)
                setImportModal(null)
              }}
              onCancel={() => setImportModal(null)}
            />
          )}
        </div>
      </section>

      {/* Rounds */}
      {rounds.map((round, ri) => (
        <section key={round.round_number} className="flex flex-col gap-3">
          <SectionHeader>Round {round.round_number}</SectionHeader>

          <div className="flex flex-col gap-2">
            {round.matches.map((m, mi) => {
              const used = usedInRound(round, mi)
              const p1Label = m.player1_id
                ? playerName(players, m.player1_id)
                : 'P1'
              const p2Label = m.is_bye
                ? 'Bye'
                : m.player2_id
                  ? playerName(players, m.player2_id)
                  : 'P2'

              return (
                <div
                  key={mi}
                  className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/30 overflow-hidden"
                >
                  {/* Match row header */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
                    <span className="text-xs font-medium text-neutral-500">
                      Match {mi + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-neutral-500 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={m.is_bye}
                          onChange={() => toggleBye(ri, mi)}
                          className="accent-amber-500"
                        />
                        Bye
                      </label>
                      {round.matches.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMatch(ri, mi)}
                          className="text-xs text-neutral-400 hover:text-red-400 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Score row — mobile optimised: player | score | player */}
                  <div className="flex items-center gap-2 px-3 py-3">
                    {/* Player 1 */}
                    <div className="flex-1 min-w-0">
                      <select
                        value={m.player1_id ?? ''}
                        onChange={(e) =>
                          updateMatch(ri, mi, {
                            player1_id: parseInt(e.target.value) || null,
                          })
                        }
                        className={selectCls}
                      >
                        <option value="">P1…</option>
                        {players
                          .filter(
                            (p) => p.id !== m.player2_id && !used.has(p.id)
                          )
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.player.username}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        min={0}
                        max={2}
                        value={m.p1_games}
                        disabled={m.is_bye}
                        onChange={(e) =>
                          updateMatch(ri, mi, {
                            p1_games: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-10 px-1 py-2 text-sm text-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
                      />
                      <span className="text-neutral-400 text-xs">—</span>
                      <input
                        type="number"
                        min={0}
                        max={2}
                        value={m.p2_games}
                        disabled={m.is_bye}
                        onChange={(e) =>
                          updateMatch(ri, mi, {
                            p2_games: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-10 px-1 py-2 text-sm text-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
                      />
                    </div>

                    {/* Player 2 */}
                    <div className="flex-1 min-w-0">
                      {m.is_bye ? (
                        <div
                          className={`${selectCls} text-neutral-400 italic text-xs`}
                        >
                          Bye
                        </div>
                      ) : (
                        <select
                          value={m.player2_id ?? ''}
                          onChange={(e) =>
                            updateMatch(ri, mi, {
                              player2_id: parseInt(e.target.value) || null,
                            })
                          }
                          className={selectCls}
                        >
                          <option value="">P2…</option>
                          {players
                            .filter(
                              (p) => p.id !== m.player1_id && !used.has(p.id)
                            )
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.player.username}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            <button
              type="button"
              onClick={() => addMatch(ri)}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-xs text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            >
              <svg
                width={12}
                height={12}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <line x1={8} y1={2} x2={8} y2={14} />
                <line x1={2} y1={8} x2={14} y2={8} />
              </svg>
              Add match
            </button>
          </div>
        </section>
      ))}

      <div className="flex items-center gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-50 transition-opacity text-center"
        >
          {isPending ? 'Saving…' : 'Save matchday'}
        </button>
        <a
          href={`/admin/league/${seasonId}/results`}
          className="flex-1 sm:flex-none px-5 py-2.5 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors text-center"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 shrink-0">
        {children}
      </h3>
      <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
    </div>
  )
}

const inputCls =
  'w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
const selectCls =
  'w-full px-2 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500'
