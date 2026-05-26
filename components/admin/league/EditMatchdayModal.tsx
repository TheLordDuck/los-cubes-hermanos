// components/admin/league/EditMatchdayModal.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { MatchdayWithRounds, SeasonPlayerWithPlayer } from "@/types/cube";
import { MATCH_RESULT } from "@/lib/generated/prisma/enums";

interface EditMatchEntry {
  id:          number;
  player1_id:  number;
  player2_id:  number | null;
  p1_games:    number;
  p2_games:    number;
  is_bye:      boolean;
}

interface EditRoundEntry {
  id:           number;
  round_number: number;
  matches:      EditMatchEntry[];
}

interface EditMatchdayModalProps {
  matchday:  MatchdayWithRounds;
  players:   SeasonPlayerWithPlayer[];
  seasonId:  number;
  onClose:   () => void;
}

function playerName(players: SeasonPlayerWithPlayer[], id: number | null): string {
  if (!id) return "Bye";
  return players.find((p) => p.id === id)?.player.username ?? "?";
}

export function EditMatchdayModal({ matchday, players, seasonId, onClose }: EditMatchdayModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [rounds, setRounds] = useState<EditRoundEntry[]>(
    matchday.rounds.map((r) => ({
      id:           r.id,
      round_number: r.round_number,
      matches: r.matches.map((m) => ({
        id:         m.id,
        player1_id: m.player1_id,
        player2_id: m.player2_id,
        p1_games:   m.p1_games,
        p2_games:   m.p2_games,
        is_bye:     m.is_bye,
      })),
    }))
  );

  function updateMatch(roundIdx: number, matchIdx: number, patch: Partial<EditMatchEntry>) {
    setRounds((prev) => prev.map((r, ri) =>
      ri !== roundIdx ? r : {
        ...r,
        matches: r.matches.map((m, mi) => mi !== matchIdx ? m : { ...m, ...patch }),
      }
    ));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/seasons/${seasonId}/matchdays/${matchday.id}`, {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ rounds }),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed"); }
        router.refresh();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Edit Matchday {matchday.number}
          </h2>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
            <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
              <line x1={4} y1={4} x2={12} y2={12}/><line x1={12} y1={4} x2={4} y2={12}/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-5 overflow-y-auto">
          {error && (
            <p className="text-sm text-red-400 bg-red-950 border border-red-800 rounded-lg px-4 py-2">{error}</p>
          )}

          {rounds.map((round, ri) => (
            <div key={round.id} className="flex flex-col gap-3">
              {/* Round header */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide shrink-0">
                  Round {round.round_number}
                </span>
                <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
              </div>

              {round.matches.map((m, mi) => (
                <div key={m.id} className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/30 overflow-hidden">
                  {/* Match header */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
                    <span className="text-xs text-neutral-400">Match {mi + 1}</span>
                    <label className="flex items-center gap-1.5 text-xs text-neutral-500 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={m.is_bye}
                        onChange={(e) => updateMatch(ri, mi, {
                          is_bye:     e.target.checked,
                          player2_id: e.target.checked ? null : m.player2_id,
                          p1_games:   e.target.checked ? 2 : m.p1_games,
                          p2_games:   e.target.checked ? 0 : m.p2_games,
                        })}
                        className="accent-amber-500"
                      />
                      Bye
                    </label>
                  </div>

                  {/* Score row */}
                  <div className="flex items-center gap-2 px-3 py-3">
                    {/* Player 1 */}
                    <div className="flex-1 min-w-0">
                      <select
                        value={m.player1_id}
                        onChange={(e) => updateMatch(ri, mi, { player1_id: parseInt(e.target.value) })}
                        className={selectCls}
                      >
                        {players.filter((p) => p.id !== m.player2_id).map((p) => (
                          <option key={p.id} value={p.id}>{p.player.username}</option>
                        ))}
                      </select>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number" min={0} max={2} value={m.p1_games}
                        disabled={m.is_bye}
                        onChange={(e) => updateMatch(ri, mi, { p1_games: parseInt(e.target.value) || 0 })}
                        className="w-10 px-1 py-2 text-sm text-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
                      />
                      <span className="text-neutral-400 text-xs">—</span>
                      <input
                        type="number" min={0} max={2} value={m.p2_games}
                        disabled={m.is_bye}
                        onChange={(e) => updateMatch(ri, mi, { p2_games: parseInt(e.target.value) || 0 })}
                        className="w-10 px-1 py-2 text-sm text-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
                      />
                    </div>

                    {/* Player 2 */}
                    <div className="flex-1 min-w-0">
                      {m.is_bye ? (
                        <div className={`${selectCls} text-neutral-400 italic text-xs`}>Bye</div>
                      ) : (
                        <select
                          value={m.player2_id ?? ""}
                          onChange={(e) => updateMatch(ri, mi, { player2_id: parseInt(e.target.value) || null })}
                          className={selectCls}
                        >
                          <option value="">Select…</option>
                          {players.filter((p) => p.id !== m.player1_id).map((p) => (
                            <option key={p.id} value={p.id}>{p.player.username}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 shrink-0">
            <button
              type="submit" disabled={isPending}
              className="flex-1 sm:flex-none px-5 py-2 text-sm font-medium rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isPending ? "Saving…" : "Save changes"}
            </button>
            <button type="button" onClick={onClose} className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const selectCls = "w-full px-2 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500";
