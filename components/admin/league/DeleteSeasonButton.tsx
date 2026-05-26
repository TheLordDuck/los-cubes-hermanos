// components/admin/league/DeleteSeasonButton.tsx
'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'

export function DeleteSeasonButton({ id, name }: { id: number; name: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirm, setConfirm] = useState(false)

  function handleDelete() {
    startTransition(async () => {
      await fetch(`/api/seasons/${id}`, { method: 'DELETE' })
      router.refresh()
    })
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-400">Delete `{name}`?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs font-medium text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Deleting…' : 'Yes, delete'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="text-xs text-neutral-400 hover:text-red-400 transition-colors"
    >
      Delete
    </button>
  )
}
