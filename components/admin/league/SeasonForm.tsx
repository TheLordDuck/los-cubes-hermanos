// components/admin/league/SeasonForm.tsx
'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Player, SeasonWithPlayers } from '@/types/cube'

interface SeasonFormProps {
  season?: SeasonWithPlayers
}

export function SeasonForm({ season }: SeasonFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(season?.name ?? '')
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>(
    season?.players.map((sp) => sp.player_id) ?? []
  )
  const [newUsername, setNewUsername] = useState('')
  const [addingPlayer, setAddingPlayer] = useState(false)
  const isEdit = !!season

  useEffect(() => {
    fetch('/api/players')
      .then((r) => r.json())
      .then(setAllPlayers)
  }, [])

  function togglePlayer(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  async function handleAddPlayer() {
    if (!newUsername.trim()) return
    setAddingPlayer(true)
    const res = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: newUsername.trim() }),
    })
    const player = await res.json()
    setAllPlayers((prev) => [...prev, player])
    setSelectedIds((prev) => [...prev, player.id])
    setNewUsername('')
    setAddingPlayer(false)
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
            body: JSON.stringify({ name, playerIds: selectedIds }),
          }
        )
        if (!res.ok) {
          const d = await res.json()
          throw new Error(d.error)
        }
        router.push('/admin/league')
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <p className="text-sm text-red-400 bg-red-950 border border-red-800 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
          Season name
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Season 1: Standard Cube"
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
          Players
        </label>
        <div className="flex flex-wrap gap-2">
          {allPlayers.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => togglePlayer(p.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedIds.includes(p.id)
                  ? 'bg-teal-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {p.username}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-1">
          <input
            type="text"
            placeholder="New player username…"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddPlayer()
              }
            }}
            className={inputCls}
          />
          <button
            type="button"
            onClick={handleAddPlayer}
            disabled={addingPlayer || !newUsername.trim()}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            Add
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 text-sm font-medium rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create season'}
        </button>
        <a
          href="/admin/league"
          className="px-5 py-2 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}

const inputCls =
  'w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
