// components/admin/DeleteButton.tsx
'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'

export function DeleteButton({
  id,
  name,
  endpoint = `/api/cubes/${id}`,
}: {
  id: number
  name: string
  endpoint?: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirm, setConfirm] = useState(false)

  function handleDelete() {
    startTransition(async () => {
      await fetch(endpoint, { method: 'DELETE' })
      router.refresh()
    })
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted">Delete?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="min-h-10 px-3 rounded-lg bg-loss text-[#1e0c08] text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isPending ? 'Deleting…' : 'Yes, delete'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="min-h-10 px-3 rounded-lg border border-line-strong text-xs text-soft hover:bg-raised transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      aria-label={`Delete ${name}`}
      title={`Delete ${name}`}
      className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-line-strong text-[#f2826a] hover:bg-loss/10 transition-colors"
    >
      <svg
        width={16}
        height={16}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
      </svg>
    </button>
  )
}
