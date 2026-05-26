// components/league/SeasonStandings.tsx
'use client'

import { useState } from 'react'
import type {
  SeasonWithDetails,
  SeasonPlayerWithPlayer,
  MatchdayWithRounds,
} from '@/types/cube'

const BEST_N = 5

function calcWR(wins: number, total: number) {
  if (total === 0) return '—'
  return ((wins / total) * 100).toFixed(1) + '%'
}

// Points a player earned in a specific matchday
function pointsInMatchday(
  sp: SeasonPlayerWithPlayer,
  md: MatchdayWithRounds
): number {
  let pts = 0
  md.rounds.forEach((r) =>
    r.matches.forEach((m) => {
      if (m.player1_id !== sp.id && m.player2_id !== sp.id) return
      const isP1 = m.player1_id === sp.id
      if (m.is_bye) {
        pts += 3
        return
      }
      if ((isP1 && m.result === 'P1_WIN') || (!isP1 && m.result === 'P2_WIN'))
        pts += 3
      else if (m.result === 'DRAW') pts += 1
    })
  )
  return pts
}

// Get the ids of the best N matchdays for a player (by points, ties kept)
function bestMatchdayIds(
  sp: SeasonPlayerWithPlayer,
  matchdays: MatchdayWithRounds[]
): Set<number> {
  const played = matchdays
    .filter((md) =>
      md.rounds.some((r) =>
        r.matches.some((m) => m.player1_id === sp.id || m.player2_id === sp.id)
      )
    )
    .map((md) => ({ id: md.id, pts: pointsInMatchday(sp, md) }))
    .sort((a, b) => b.pts - a.pts)
    .slice(0, BEST_N)
  return new Set(played.map((x) => x.id))
}

// Points counting only best N matchdays
function bestNPoints(
  sp: SeasonPlayerWithPlayer,
  matchdays: MatchdayWithRounds[]
): number {
  const ids = bestMatchdayIds(sp, matchdays)
  return matchdays
    .filter((md) => ids.has(md.id))
    .reduce((sum, md) => sum + pointsInMatchday(sp, md), 0)
}

// Game WR — all matchdays
function gameWR(sp: SeasonPlayerWithPlayer, matchdays: MatchdayWithRounds[]) {
  let gWins = 0,
    gTotal = 0
  matchdays.forEach((md) =>
    md.rounds.forEach((r) =>
      r.matches.forEach((m) => {
        if (m.is_bye) {
          if (m.player1_id === sp.id) gTotal += 1
          return
        }
        if (m.player1_id === sp.id) {
          gWins += m.p1_games
          gTotal += m.p1_games + m.p2_games
        }
        if (m.player2_id === sp.id) {
          gWins += m.p2_games
          gTotal += m.p1_games + m.p2_games
        }
      })
    )
  )
  return calcWR(gWins, gTotal)
}

// Match WR — all matchdays
function matchWR(sp: SeasonPlayerWithPlayer) {
  const total = sp.wins + sp.losses + sp.draws
  return calcWR(sp.wins, total)
}

function MoxfieldIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  )
}

export function SeasonStandings({ season }: { season: SeasonWithDetails }) {
  const [selectedId, setSelectedId] = useState<number>(
    season.players[0]?.id ?? 0
  )

  const sortedPlayers = [...season.players].sort((a, b) => {
    const ptsA = bestNPoints(a, season.matchdays)
    const ptsB = bestNPoints(b, season.matchdays)
    if (ptsB !== ptsA) return ptsB - ptsA
    // tiebreak: match WR
    const totalA = a.wins + a.losses + a.draws
    const totalB = b.wins + b.losses + b.draws
    const wrA = totalA === 0 ? 0 : a.wins / totalA
    const wrB = totalB === 0 ? 0 : b.wins / totalB
    return wrB - wrA
  })

  const selected = sortedPlayers.find((p) => p.id === selectedId)

  const matchesByMatchday = season.matchdays
    .map((md) => ({
      matchday: md,
      rounds: md.rounds
        .map((r) => ({
          round: r,
          match: r.matches.find(
            (m) => m.player1_id === selectedId || m.player2_id === selectedId
          ),
        }))
        .filter((x) => x.match !== undefined),
    }))
    .filter((x) => x.rounds.length > 0)

  const bestIds = selected
    ? bestMatchdayIds(selected, season.matchdays)
    : new Set<number>()
  const matchdaysPlayed = matchesByMatchday.length

  return (
    <div className="flex flex-col gap-6">
      {/* Standings table */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">
            Standings
          </h2>
          <span className="text-xs text-neutral-400">
            Points = best {BEST_N} matchdays
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-neutral-800">
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wide w-8">
                #
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wide">
                Player
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wide">
                Pts
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wide hidden sm:table-cell">
                Match WR
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wide hidden sm:table-cell">
                Game WR
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {sortedPlayers.map((sp, i) => (
              <tr
                key={sp.id}
                className={i < 3 ? 'bg-rose-50/50 dark:bg-rose-950/10' : ''}
              >
                <td className="px-5 py-3 text-neutral-400">{i + 1}</td>
                <td className="px-5 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                  {sp.player.username}
                </td>
                <td className="px-5 py-3 font-semibold text-neutral-900 dark:text-neutral-100">
                  {bestNPoints(sp, season.matchdays)}
                </td>
                <td className="px-5 py-3 hidden sm:table-cell text-neutral-500">
                  {matchWR(sp)}
                </td>
                <td className="px-5 py-3 hidden sm:table-cell text-neutral-500">
                  {gameWR(sp, season.matchdays)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Player detail */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
        {/* Player pills */}
        <div className="flex flex-wrap gap-2 p-4 border-b border-neutral-200 dark:border-neutral-800">
          {sortedPlayers.map((sp) => (
            <button
              key={sp.id}
              type="button"
              onClick={() => setSelectedId(sp.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedId === sp.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {sp.player.username}
            </button>
          ))}
        </div>

        {selected && (
          <div className="p-5 flex flex-col gap-5">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {selected.player.username}
            </h3>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: `Best ${BEST_N} pts`,
                  value: `${bestNPoints(selected, season.matchdays)} pts`,
                },
                {
                  label: 'Matchdays played',
                  value: `${matchdaysPlayed} / ${season.matchdays.length}`,
                },
                { label: 'Match WR', value: matchWR(selected) },
                { label: 'Game WR', value: gameWR(selected, season.matchdays) },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col gap-1 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800"
                >
                  <span className="text-xs text-neutral-400">{s.label}</span>
                  <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Match history */}
            {matchesByMatchday.length === 0 ? (
              <p className="text-sm text-neutral-400">No matches played yet.</p>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Legend */}
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="inline-block w-3 h-3 rounded-sm border border-amber-400 bg-amber-400/10" />
                  <span>Counts toward best {BEST_N}</span>
                </div>

                {matchesByMatchday.map(({ matchday, rounds }) => {
                  const isBest = bestIds.has(matchday.id)
                  const mdPts = pointsInMatchday(selected, matchday)

                  let w = 0,
                    l = 0,
                    d = 0,
                    byeCount = 0
                  rounds.forEach(({ match }) => {
                    if (!match) return
                    if (match.is_bye) {
                      byeCount++
                      return
                    }
                    const isP1 = match.player1_id === selectedId
                    if (
                      (isP1 && match.result === 'P1_WIN') ||
                      (!isP1 && match.result === 'P2_WIN')
                    )
                      w++
                    else if (
                      (isP1 && match.result === 'P2_WIN') ||
                      (!isP1 && match.result === 'P1_WIN')
                    )
                      l++
                    else if (match.result === 'DRAW') d++
                  })

                  const deckUrl = matchday.decklists?.find(
                    (d) => d.player_id === selectedId
                  )?.decklist_url

                  return (
                    <div
                      key={matchday.id}
                      className={`flex flex-col gap-0 rounded-xl overflow-hidden ${
                        isBest
                          ? 'ring-2 ring-amber-400 dark:ring-amber-500'
                          : 'ring-1 ring-neutral-200 dark:ring-neutral-800'
                      }`}
                    >
                      {/* Matchday header */}
                      <div
                        className={`flex items-center justify-between px-3 py-2 ${
                          isBest
                            ? 'bg-amber-50 dark:bg-amber-950/30'
                            : 'bg-neutral-100 dark:bg-neutral-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold uppercase tracking-wider ${
                              isBest
                                ? 'text-amber-700 dark:text-amber-300'
                                : 'text-neutral-600 dark:text-neutral-400'
                            }`}
                          >
                            Matchday {matchday.number}
                          </span>
                          {isBest && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-amber-400/20 text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                              +{mdPts} pts
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {deckUrl && (
                            <a
                              href={deckUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-violet-500 hover:text-violet-400 transition-colors"
                              title="View decklist on Moxfield"
                            >
                              <MoxfieldIcon />
                              <span className="hidden sm:inline">Decklist</span>
                            </a>
                          )}
                          <span className="text-xs font-mono">
                            <span className="text-emerald-500">{w}W</span>
                            <span className="text-neutral-500">-</span>
                            <span className="text-red-400">{l}L</span>
                            <span className="text-neutral-500">-</span>
                            <span className="text-amber-500">{d}D</span>
                            {byeCount > 0 && (
                              <>
                                <span className="text-neutral-500">-</span>
                                <span className="text-amber-500">
                                  {byeCount}B
                                </span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Rounds table */}
                      <div className="border-t border-neutral-100 dark:border-neutral-800">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
                              <th className="text-left px-4 py-2 text-xs font-medium text-neutral-400 uppercase tracking-wide">
                                Round
                              </th>
                              <th className="text-left px-4 py-2 text-xs font-medium text-neutral-400 uppercase tracking-wide">
                                Opponent
                              </th>
                              <th className="text-left px-4 py-2 text-xs font-medium text-neutral-400 uppercase tracking-wide">
                                Score
                              </th>
                              <th className="text-left px-4 py-2 text-xs font-medium text-neutral-400 uppercase tracking-wide">
                                Result
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {rounds.map(({ round, match }) => {
                              if (!match) return null
                              const isP1 = match.player1_id === selectedId
                              const myGames = isP1
                                ? match.p1_games
                                : match.p2_games
                              const oppGames = isP1
                                ? match.p2_games
                                : match.p1_games
                              const won =
                                !match.is_bye &&
                                ((isP1 && match.result === 'P1_WIN') ||
                                  (!isP1 && match.result === 'P2_WIN'))
                              const lost =
                                !match.is_bye &&
                                ((isP1 && match.result === 'P2_WIN') ||
                                  (!isP1 && match.result === 'P1_WIN'))
                              const draw =
                                !match.is_bye && match.result === 'DRAW'
                              const opponentName = match.is_bye
                                ? null
                                : ((isP1 ? match.player2 : match.player1)
                                    ?.player.username ?? '?')

                              return (
                                <tr
                                  key={round.id}
                                  className={
                                    match.is_bye
                                      ? 'bg-amber-50/40 dark:bg-amber-950/10'
                                      : ''
                                  }
                                >
                                  <td className="px-4 py-2.5 text-neutral-400 font-mono text-xs">
                                    R{round.round_number}
                                  </td>
                                  <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-neutral-100">
                                    {match.is_bye ? (
                                      <span className="text-amber-500 italic text-xs">
                                        Bye
                                      </span>
                                    ) : (
                                      opponentName
                                    )}
                                  </td>
                                  <td className="px-4 py-2.5 font-mono text-neutral-500">
                                    {myGames}–{oppGames}
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <div className="flex items-center gap-2">
                                      {match.is_bye ? (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 uppercase tracking-wide">
                                          Bye
                                        </span>
                                      ) : won ? (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 uppercase tracking-wide">
                                          Win
                                        </span>
                                      ) : lost ? (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 uppercase tracking-wide">
                                          Loss
                                        </span>
                                      ) : draw ? (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 uppercase tracking-wide">
                                          Draw
                                        </span>
                                      ) : null}
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
