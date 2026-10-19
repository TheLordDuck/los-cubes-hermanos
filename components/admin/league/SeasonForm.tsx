// components/admin/league/SeasonForm.tsx
'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Player, SeasonWithPlayers } from '@/types/cube'

interface SeasonFormProps {
  season?: SeasonWithPlayers
  players: Player[]
  // Player ids that already have results in this season and can't be removed
  lockedIds?: number[]
}

const norm = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase()

const LABEL = 'text-[11px] font-semibold uppercase tracking-[0.08em] text-muted'
const INPUT =
  'w-full h-11.5 px-3.5 rounded-[10px] border border-line-strong bg-ink text-fg placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent'

function Avatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center w-8 h-8 shrink-0 rounded-full bg-raised font-mono text-xs font-bold text-soft uppercase"
    >
      {name.slice(0, 2)}
    </span>
  )
}

export function SeasonForm({ season, players, lockedIds = [] }: SeasonFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(season?.name ?? '')
  const [allPlayers, setAllPlayers] = useState<Player[]>(players)
  const [selectedIds, setSelectedIds] = useState<number[]>(
    season?.players.map((sp) => sp.player_id) ?? []
  )
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const isEdit = !!season
  const locked = useMemo(() => new Set(lockedIds), [lockedIds])

  const byId = useMemo(
    () => new Map(allPlayers.map((p) => [p.id, p])),
    [allPlayers]
  )

  const signedUp = selectedIds
    .map((id) => byId.get(id))
    .filter((p): p is Player => !!p)

  const q = norm(query)
  const available = allPlayers
    .filter((p) => !selectedIds.includes(p.id))
    .filter((p) => !q || p.username.toLowerCase().includes(q))
    .sort((a, b) => a.username.localeCompare(b.username))
  const exactMatch = q ? allPlayers.find((p) => norm(p.username) === q) : undefined
  const canCreate = q.length > 0 && !exactMatch

  function addPlayer(id: number) {
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  function removePlayer(id: number) {
    if (locked.has(id)) return
    setSelectedIds((prev) => prev.filter((x) => x !== id))
  }

  async function createPlayer() {
    const username = query.trim().replace(/\s+/g, ' ')
    if (!username) return
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not add player')
      const player = data as Player
      setAllPlayers((prev) =>
        prev.some((p) => p.id === player.id) ? prev : [...prev, player]
      )
      addPlayer(player.id)
      setQuery('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add player')
    } finally {
      setCreating(false)
    }
  }

  // Enter only acts on an exact name, so typing "Ana" never signs up "Anabel"
  function handleSearchEnter() {
    if (exactMatch) {
      addPlayer(exactMatch.id)
      setQuery('')
    } else if (canCreate) {
      createPlayer()
    }
  }

  function clearRoster() {
    setSelectedIds((prev) => prev.filter((id) => locked.has(id)))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError('Season name is required')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch(
          isEdit ? `/api/seasons/${season.id}` : '/api/seasons',
          {
            method: isEdit ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name.trim(), playerIds: selectedIds }),
          }
        )
        if (!res.ok) {
          const d = await res.json().catch(() => ({}))
          throw new Error(d.error ?? 'Something went wrong')
        }
        router.push('/admin/league')
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <p
          role="alert"
          className="m-0 text-sm text-[#f2826a] bg-loss/10 border border-loss/40 rounded-[10px] px-4 py-3"
        >
          {error}
        </p>
      )}

      <section className="flex flex-col gap-2 p-5 sm:p-6 rounded-2xl border border-line bg-surface">
        <label htmlFor="season-name" className={LABEL}>
          Season name
        </label>
        <input
          id="season-name"
          type="text"
          required
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Season 3"
          className={INPUT}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Roster */}
        <section className="flex flex-col rounded-2xl border border-line bg-surface overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-line">
            <h2 className="m-0 font-display font-bold text-lg">
              Signed up{' '}
              <span className="font-mono text-sm text-accent">
                {signedUp.length}
              </span>
            </h2>
            {signedUp.length > locked.size && (
              <button
                type="button"
                onClick={clearRoster}
                className="min-h-9 px-3 rounded-lg text-xs font-medium text-muted hover:text-fg hover:bg-raised transition-colors"
              >
                {locked.size > 0 ? 'Remove all without results' : 'Remove all'}
              </button>
            )}
          </div>
          {signedUp.length === 0 ? (
            <p className="m-0 px-5 py-10 text-sm text-muted text-center">
              Nobody yet. Add players from the list.
            </p>
          ) : (
            <ul className="list-none m-0 p-2 flex flex-col gap-1 max-h-105 overflow-y-auto">
              {signedUp.map((p) => {
                const isLocked = locked.has(p.id)
                return (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 pl-3 pr-1.5 py-1.5 rounded-[10px] hover:bg-raised"
                  >
                    <Avatar name={p.username} />
                    <span className="flex-1 min-w-0 truncate font-medium">
                      {p.username}
                    </span>
                    {isLocked ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 text-xs text-muted"
                        title="Has results this season, so it can't be removed"
                      >
                        <svg
                          width={12}
                          height={12}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <rect x={4} y={11} width={16} height={10} rx={2} />
                          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                        </svg>
                        Has results
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removePlayer(p.id)}
                        aria-label={`Remove ${p.username}`}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-muted hover:text-[#f2826a] hover:bg-loss/10 transition-colors"
                      >
                        <svg
                          width={14}
                          height={14}
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          aria-hidden="true"
                        >
                          <path d="M4 4l8 8M12 4l-8 8" />
                        </svg>
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* Add players */}
        <section className="flex flex-col rounded-2xl border border-line bg-surface overflow-hidden">
          <div className="flex flex-col gap-2 px-5 py-4 border-b border-line">
            <label htmlFor="player-search" className="m-0 font-display font-bold text-lg">
              Add players
            </label>
            <input
              id="player-search"
              type="search"
              autoComplete="off"
              maxLength={32}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSearchEnter()
                }
              }}
              placeholder="Search or type a new name…"
              aria-describedby="player-search-hint"
              className={INPUT}
            />
            <span id="player-search-hint" className="text-xs text-faint">
              Click a name to add it. Enter signs up the exact name typed, creating
              the player if needed.
            </span>
          </div>

          <ul className="list-none m-0 p-2 flex flex-col gap-1 max-h-105 overflow-y-auto">
            {canCreate && (
              <li>
                <button
                  type="button"
                  onClick={createPlayer}
                  disabled={creating}
                  className="w-full flex items-center gap-3 pl-3 pr-3 py-2 rounded-[10px] text-left border border-dashed border-accent/60 text-accent hover:bg-accent/10 disabled:opacity-60 transition-colors"
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex items-center justify-center w-8 h-8 shrink-0 rounded-full bg-accent/15"
                  >
                    <svg
                      width={14}
                      height={14}
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                    >
                      <path d="M8 2v12M2 8h12" />
                    </svg>
                  </span>
                  <span className="flex-1 min-w-0 truncate font-medium">
                    {creating ? 'Adding…' : `Create “${query.trim()}” and sign up`}
                  </span>
                </button>
              </li>
            )}
            {available.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => addPlayer(p.id)}
                  className="w-full flex items-center gap-3 pl-3 pr-3 py-1.5 rounded-[10px] text-left hover:bg-raised transition-colors"
                >
                  <Avatar name={p.username} />
                  <span className="flex-1 min-w-0 truncate font-medium">
                    {p.username}
                  </span>
                  <span className="text-xs font-semibold text-accent">Add</span>
                </button>
              </li>
            ))}
            {available.length === 0 && !canCreate && (
              <li className="px-3 py-10 text-sm text-muted text-center">
                {q
                  ? 'That player is already signed up.'
                  : allPlayers.length === 0
                    ? 'No players yet. Type a name to create one.'
                    : 'Everyone is signed up.'}
              </li>
            )}
          </ul>
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-line">
        <span className="text-sm text-muted">
          {signedUp.length} {signedUp.length === 1 ? 'player' : 'players'} signed up
        </span>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/league"
            className="inline-flex items-center min-h-11.5 px-5 rounded-[10px] text-soft hover:text-fg hover:bg-raised transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="min-h-11.5 px-6 rounded-[10px] bg-accent text-ink font-semibold hover:bg-accent-hover disabled:opacity-60 transition-colors"
          >
            {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create season'}
          </button>
        </div>
      </div>
    </form>
  )
}
