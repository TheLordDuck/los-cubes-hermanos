// components/league/DecklistModal.tsx
'use client'

import { DecklistImporter } from './DecklistImporter'

interface DecklistModalProps {
  onConfirm: (text: string) => void
  onCancel: () => void
}

export function DecklistModal({ onConfirm, onCancel }: DecklistModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Import decklist
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
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
        <div className="p-5 overflow-y-auto max-h-[80vh]">
          <DecklistImporter onConfirm={onConfirm} onCancel={onCancel} />
        </div>
      </div>
    </div>
  )
}
