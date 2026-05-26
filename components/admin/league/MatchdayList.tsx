// components/admin/league/MatchdayList.tsx
'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { MatchdayWithRounds, SeasonPlayerWithPlayer } from '@/types/cube'
import { EditMatchdayModal } from './EditMatchdayModal'

function MoxfieldIcon() {
  return (
    <svg
      width={14}
      height={14}
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

function DeleteMatchdayButton({
  matchdayId,
  seasonId,
}: {
  matchdayId: number
  seasonId: number
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirm, setConfirm] = useState(false)

  function handleDelete() {
    startTransition(async () => {
      await fetch(`/api/seasons/${seasonId}/matchdays/${matchdayId}`, {
        method: 'DELETE',
      })
      router.refresh()
      setConfirm(false)
    })
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-400">Sure?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs font-medium text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
        >
          {isPending ? '…' : 'Yes'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setConfirm(true)}
      className="text-xs text-neutral-400 hover:text-red-400 transition-colors"
    >
      Delete
    </button>
  )
}

export function MatchdayList({
  matchdays,
  seasonId,
  players,
}: {
  matchdays: MatchdayWithRounds[]
  seasonId: number
  players: SeasonPlayerWithPlayer[]
}) {
  const [editingMatchday, setEditingMatchday] =
    useState<MatchdayWithRounds | null>(null)

  return (
    <>
      <div className="flex flex-col gap-3">
        {matchdays.map((md) => (
          <div
            key={md.id}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
              <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Matchday {md.number}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-400">
                  {new Date(md.played_at).toLocaleDateString()}
                </span>
                <button
                  type="button"
                  onClick={() => setEditingMatchday(md)}
                  className="text-xs text-neutral-400 hover:text-blue-400 transition-colors"
                >
                  Edit
                </button>
                <DeleteMatchdayButton matchdayId={md.id} seasonId={seasonId} />
              </div>
            </div>

            {/* Rounds */}
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {md.rounds.map((r) => (
                <div key={r.id} className="px-4 py-3 flex flex-col gap-2">
                  <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                    Round {r.round_number}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {r.matches.map((m) => {
                      const p1 = m.player1.player.username
                      const p2 = m.is_bye
                        ? 'Bye'
                        : (m.player2?.player.username ?? '?')
                      const resultColor =
                        m.result === 'P1_WIN'
                          ? 'text-emerald-500'
                          : m.result === 'P2_WIN'
                            ? 'text-red-400'
                            : m.result === 'DRAW'
                              ? 'text-amber-500'
                              : 'text-neutral-400'

                      return (
                        <div
                          key={m.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span
                              className={`text-sm font-medium truncate ${m.result === 'P1_WIN' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-500 dark:text-neutral-400'}`}
                            >
                              {p1}
                            </span>
                            <span className="text-xs font-mono text-neutral-500 shrink-0">
                              {m.p1_games}–{m.p2_games}
                            </span>
                            <span
                              className={`text-sm font-medium truncate ${m.result === 'P2_WIN' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-500 dark:text-neutral-400'}`}
                            >
                              {p2}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs ${resultColor}`}>
                              {m.is_bye ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 uppercase">
                                  bye
                                </span>
                              ) : m.result === 'P1_WIN' ? (
                                `${p1} wins`
                              ) : m.result === 'P2_WIN' ? (
                                `${p2} wins`
                              ) : m.result === 'DRAW' ? (
                                'Draw'
                              ) : (
                                '—'
                              )}
                            </span>
                            {m.decklist_p1 && (
                              <a
                                href={m.decklist_p1}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-violet-500 hover:text-violet-400 transition-colors"
                                title={`${p1} decklist`}
                              >
                                <MoxfieldIcon />
                              </a>
                            )}
                            {m.decklist_p2 && (
                              <a
                                href={m.decklist_p2}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-violet-500 hover:text-violet-400 transition-colors"
                                title={`${p2} decklist`}
                              >
                                <MoxfieldIcon />
                              </a>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {editingMatchday && (
        <EditMatchdayModal
          matchday={editingMatchday}
          players={players}
          seasonId={seasonId}
          onClose={() => setEditingMatchday(null)}
        />
      )}
    </>
  )
}
