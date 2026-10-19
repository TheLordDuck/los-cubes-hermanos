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

const TH =
  'py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted'

const MEDAL = ['bg-accent', 'bg-soft', 'bg-[#c98a5b]']

const RESULT_BADGE = {
  win: { label: 'Win', className: 'bg-win text-[#0b1c12]' },
  loss: { label: 'Loss', className: 'bg-loss text-[#1e0c08]' },
  draw: { label: 'Draw', className: 'bg-[#5c606a] text-fg' },
  bye: { label: 'Bye', className: 'bg-accent text-[#2b2208]' },
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
    <div className="flex flex-col gap-8">
      {/* Podium */}
      {sortedPlayers.length > 0 && (
        <section
          aria-label="Podium"
          className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4"
        >
          {sortedPlayers.slice(0, 3).map((sp, i) => (
            <div
              key={sp.id}
              className={`flex flex-col gap-3.5 p-5.5 rounded-2xl bg-surface border ${
                i === 0 ? 'border-accent' : 'border-line'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-mono font-bold text-ink ${MEDAL[i]}`}
                >
                  #{i + 1}
                </span>
                <span className="font-mono text-xs text-muted">
                  {sp.wins}W {sp.losses}L {sp.draws}D
                </span>
              </div>
              <span className="font-display font-bold text-[26px] tracking-tight truncate">
                {sp.player.username}
              </span>
              <span className="flex items-baseline gap-1.5">
                <span className="font-mono font-bold text-[40px] leading-none">
                  {bestNPoints(sp, season.matchdays)}
                </span>
                <span className="text-[13px] text-muted">pts</span>
              </span>
            </div>
          ))}
        </section>
      )}

      <div className="flex flex-wrap gap-6 items-start">
        {/* Standings table */}
        <section className="flex-[1_1_380px] min-w-0 rounded-2xl border border-line bg-surface overflow-hidden">
          <div className="px-5 py-4.5 flex items-center justify-between border-b border-line">
            <h2 className="m-0 font-display font-bold text-xl">Standings</h2>
            <span className="text-xs text-muted">Select a player</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className={`${TH} text-left pl-5 pr-2 w-8`}>#</th>
                  <th className={`${TH} text-left px-2`}>Player</th>
                  <th className={`${TH} text-right px-2`}>Pts</th>
                  <th className={`${TH} text-right px-2`}>Match</th>
                  <th className={`${TH} text-right pl-2 pr-5`}>Game</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((sp, i) => {
                  const isSelected = sp.id === selectedId
                  return (
                    <tr
                      key={sp.id}
                      className={`border-t border-line ${
                        isSelected
                          ? 'bg-[#1f2228] shadow-[inset_3px_0_0_var(--color-accent)]'
                          : ''
                      }`}
                    >
                      <td className="pl-5 pr-2 py-1.5 font-mono text-muted">
                        {i + 1}
                      </td>
                      <td className="px-2 py-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedId(sp.id)}
                          aria-pressed={isSelected}
                          className="min-h-11 text-left font-semibold hover:text-accent transition-colors"
                        >
                          {sp.player.username}
                        </button>
                      </td>
                      <td className="px-2 py-1.5 text-right font-mono font-bold">
                        {bestNPoints(sp, season.matchdays)}
                      </td>
                      <td className="px-2 py-1.5 text-right font-mono text-soft">
                        {matchWR(sp)}
                      </td>
                      <td className="pl-2 pr-5 py-1.5 text-right font-mono text-soft">
                        {gameWR(sp, season.matchdays)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Player detail */}
        {selected && (
          <section className="flex-[999_1_560px] min-w-0 flex flex-col gap-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="m-0 font-display font-extrabold text-[34px] tracking-tight">
                {selected.player.username}
              </h2>
              <span className="inline-flex items-center gap-2 text-[13px] text-muted">
                <span
                  className="block w-3 h-3 rounded-[3px] border-2 border-accent"
                  aria-hidden="true"
                />
                Counts toward best {BEST_N}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: `Best ${BEST_N} points`,
                  value: bestNPoints(selected, season.matchdays),
                },
                {
                  label: 'Matchdays',
                  value: `${matchdaysPlayed} / ${season.matchdays.length}`,
                },
                { label: 'Match WR', value: matchWR(selected) },
                { label: 'Game WR', value: gameWR(selected, season.matchdays) },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col gap-1 p-4 rounded-xl border border-line bg-surface"
                >
                  <span className="text-xs text-muted">{s.label}</span>
                  <span className="font-mono font-bold text-2xl">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>

            {matchesByMatchday.length === 0 ? (
              <p className="text-sm text-muted py-10 text-center rounded-[14px] border border-dashed border-line-strong">
                No matches played yet.
              </p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-3.5">
                {matchesByMatchday.map(({ matchday, rounds }) => {
                  const isBest = bestIds.has(matchday.id)
                  const mdPts = pointsInMatchday(selected, matchday)
                  const deckUrl = matchday.decklists?.find(
                    (d) => d.player_id === selectedId
                  )?.decklist_url

                  return (
                    <article
                      key={matchday.id}
                      className={`rounded-[14px] overflow-hidden bg-surface ${
                        isBest
                          ? 'border-2 border-accent'
                          : 'border border-line'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 px-4 py-1.5 min-h-14 border-b border-line">
                        <span className="flex items-center gap-2.5">
                          <span className="font-display font-bold text-[17px]">
                            Matchday {matchday.number}
                          </span>
                          <span
                            className={`px-2 py-0.75 rounded-md font-mono text-xs font-bold ${
                              isBest
                                ? 'bg-accent text-ink'
                                : 'bg-line text-muted'
                            }`}
                          >
                            +{mdPts}
                          </span>
                        </span>
                        {deckUrl && (
                          <a
                            href={deckUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 min-h-11 text-[13px] font-semibold text-accent hover:text-accent-hover transition-colors"
                            title="View decklist on Moxfield"
                          >
                            <MoxfieldIcon />
                            Deck
                          </a>
                        )}
                      </div>
                      <ol className="list-none m-0 py-1.5">
                        {rounds.map(({ round, match }) => {
                          if (!match) return null
                          const isP1 = match.player1_id === selectedId
                          const myGames = isP1 ? match.p1_games : match.p2_games
                          const oppGames = isP1
                            ? match.p2_games
                            : match.p1_games
                          const won =
                            (isP1 && match.result === 'P1_WIN') ||
                            (!isP1 && match.result === 'P2_WIN')
                          const lost =
                            (isP1 && match.result === 'P2_WIN') ||
                            (!isP1 && match.result === 'P1_WIN')
                          const badge = match.is_bye
                            ? RESULT_BADGE.bye
                            : won
                              ? RESULT_BADGE.win
                              : lost
                                ? RESULT_BADGE.loss
                                : match.result === 'DRAW'
                                  ? RESULT_BADGE.draw
                                  : null
                          const opponentName = match.is_bye
                            ? 'Bye'
                            : ((isP1 ? match.player2 : match.player1)?.player
                                .username ?? '?')

                          return (
                            <li
                              key={round.id}
                              className="grid grid-cols-[34px_1fr_auto_56px] items-center gap-2.5 px-4 py-2"
                            >
                              <span className="font-mono text-xs text-faint">
                                R{round.round_number}
                              </span>
                              <span
                                className={`font-medium truncate ${match.is_bye ? 'italic text-muted' : ''}`}
                              >
                                {opponentName}
                              </span>
                              <span className="font-mono text-soft">
                                {match.is_bye ? '—' : `${myGames}–${oppGames}`}
                              </span>
                              {badge ? (
                                <span
                                  className={`justify-self-end w-13 py-0.75 rounded-md text-center text-[11px] font-bold uppercase tracking-[0.06em] ${badge.className}`}
                                >
                                  {badge.label}
                                </span>
                              ) : (
                                <span />
                              )}
                            </li>
                          )
                        })}
                      </ol>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

