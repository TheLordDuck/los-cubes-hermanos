// components/admin/CubeForm.tsx
'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Cube, Archetype } from '@/types/cube'

interface CubeFormProps {
  cube?: Cube
  archetypes?: Archetype[]
}

interface ArchetypeRow {
  localId: string
  colorPair: string[]
  strategy: string
}

const DIFFICULTIES = ['easy', 'medium', 'hard']
const COLORS = ['W', 'U', 'B', 'R', 'G', 'C'] as const

function toColorArray(colorPair: string): string[] {
  return colorPair
    .split('')
    .filter((c) => COLORS.includes(c as (typeof COLORS)[number]))
}

function toColorPairString(colors: string[]): string {
  return COLORS.filter((c) => colors.includes(c)).join('')
}

function ColorPip({
  color,
  selected,
  onToggle,
}: {
  color: string
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative w-7 h-7 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      title={color}
    >
      <Image
        src={`/colors/${color}.png`}
        alt={color}
        fill
        className={`object-contain rounded-full transition-all duration-150 ${
          selected ? 'opacity-100 scale-110' : 'opacity-25 grayscale'
        }`}
        sizes="28px"
      />
    </button>
  )
}

function ArchetypeRowEditor({
  row,
  onChange,
  onRemove,
}: {
  row: ArchetypeRow
  onChange: (updated: ArchetypeRow) => void
  onRemove: () => void
}) {
  function toggleColor(color: string) {
    const next = row.colorPair.includes(color)
      ? row.colorPair.filter((c) => c !== color)
      : [...row.colorPair, color]
    onChange({ ...row, colorPair: next })
  }

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
      <div className="flex items-center gap-1 shrink-0">
        {COLORS.map((c) => (
          <ColorPip
            key={c}
            color={c}
            selected={row.colorPair.includes(c)}
            onToggle={() => toggleColor(c)}
          />
        ))}
      </div>
      <input
        type="text"
        value={row.strategy}
        onChange={(e) => onChange({ ...row, strategy: e.target.value })}
        placeholder="Strategy name (e.g. Aggro, Control…)"
        className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 text-neutral-400 hover:text-red-400 transition-colors"
      >
        <svg
          width={16}
          height={16}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
        >
          <line x1={4} y1={4} x2={12} y2={12} />
          <line x1={12} y1={4} x2={4} y2={12} />
        </svg>
      </button>
    </div>
  )
}

export function CubeForm({ cube, archetypes = [] }: CubeFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [type, setType] = useState<string>(cube?.type ?? 'CUBE')
  const [rows, setRows] = useState<ArchetypeRow[]>(
    archetypes.map((a) => ({
      localId: String(a.id),
      colorPair: toColorArray(a.colorPair),
      strategy: a.strategy,
    }))
  )

  const isEdit = !!cube
  const isBattlebox = type === 'BATTLEBOX'

  function addRow() {
    setRows((prev) => [
      ...prev,
      { localId: `new-${Date.now()}`, colorPair: [], strategy: '' },
    ])
  }

  function updateRow(localId: string, updated: ArchetypeRow) {
    setRows((prev) => prev.map((r) => (r.localId === localId ? updated : r)))
  }

  function removeRow(localId: string) {
    setRows((prev) => prev.filter((r) => r.localId !== localId))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const fd = new FormData(e.currentTarget)
    const payload = {
      code: fd.get('code') as string,
      name: fd.get('name') as string,
      type: fd.get('type') as string,
      difficulty: fd.get('difficulty') as string,
      imageUrl: fd.get('imageUrl') as string,
      isTwobert: isBattlebox ? false : fd.get('isTwobert') === 'true',
      archetypes: rows
        .filter((r) => r.strategy.trim() !== '')
        .map((r) => ({
          colorPair: toColorPairString(r.colorPair),
          strategy: r.strategy.trim(),
        })),
    }

    startTransition(async () => {
      try {
        const res = await fetch(
          isEdit ? `/api/cubes/${cube.id}` : '/api/cubes',
          {
            method: isEdit ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        )

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error ?? 'Something went wrong')
        }

        router.push('/admin/cubes')
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

      {/* Code */}
      <Field label="Code">
        <input
          name="code"
          type="text"
          required
          defaultValue={cube?.code ?? ''}
          placeholder="e.g. bolt-cube"
          className={inputCls}
        />
      </Field>

      {/* Name */}
      <Field label="Name">
        <input
          name="name"
          type="text"
          required
          defaultValue={cube?.name ?? ''}
          placeholder="e.g. Bolt Cube"
          className={inputCls}
        />
      </Field>

      {/* Image URL */}
      <Field label="Image URL">
        <input
          name="imageUrl"
          type="url"
          defaultValue={cube?.imageUrl ?? ''}
          placeholder="https://cards.scryfall.io/..."
          className={inputCls}
        />
      </Field>

      {/* Type + Difficulty */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Type">
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={inputCls}
          >
            <option value="CUBE">Cube</option>
            <option value="BATTLEBOX">Battlebox</option>
          </select>
        </Field>

        <Field label="Difficulty">
          <select
            name="difficulty"
            defaultValue={cube?.difficulty ?? 'medium'}
            className={inputCls}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Twobert */}
      <Field label="Twobert">
        {isBattlebox ? (
          <p className="text-sm text-neutral-400 italic h-9 flex items-center">
            Not applicable for Battleboxes
          </p>
        ) : (
          <div className="flex items-center gap-3 h-9">
            {(['true', 'false'] as const).map((val) => (
              <label
                key={val}
                className="flex items-center gap-1.5 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer"
              >
                <input
                  type="radio"
                  name="isTwobert"
                  value={val}
                  defaultChecked={
                    cube ? String(cube.isTwobert) === val : val === 'false'
                  }
                  className="accent-purple-500"
                />
                {val === 'true' ? 'Yes' : 'No'}
              </label>
            ))}
          </div>
        )}
      </Field>

      {/* Archetypes */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
            Archetypes
          </span>
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 transition-colors"
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
            Add archetype
          </button>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-neutral-400 italic py-2">
            No archetypes yet. Click `Add archetype` to add one.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map((row) => (
              <ArchetypeRowEditor
                key={row.localId}
                row={row}
                onChange={(updated) => updateRow(row.localId, updated)}
                onRemove={() => removeRow(row.localId)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 text-sm font-medium rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create cube'}
        </button>
        <a
          href="/admin/cubes"
          className="px-5 py-2 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
