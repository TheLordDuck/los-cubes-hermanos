// components/admin/AdminNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/admin/login/actions'

const SECTIONS = [
  { href: '/admin/cubes', label: 'Cubes' },
  { href: '/admin/league', label: 'League' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
    <nav
      aria-label="Admin sections"
      className="flex gap-1 p-1 w-fit rounded-xl border border-line bg-surface"
    >
      {SECTIONS.map((s) => {
        const isActive = pathname.startsWith(s.href)
        return (
          <Link
            key={s.href}
            href={s.href}
            aria-current={isActive ? 'page' : undefined}
            className={`inline-flex items-center min-h-10 px-4.5 rounded-[9px] font-semibold transition-colors ${
              isActive ? 'bg-accent text-ink' : 'text-soft hover:text-fg'
            }`}
          >
            {s.label}
          </Link>
        )
      })}
    </nav>
    <form action={logout}>
      <button
        type="submit"
        className="inline-flex items-center gap-2 min-h-10 px-3.5 rounded-lg border border-line-strong text-sm text-soft hover:text-fg hover:bg-raised transition-colors"
      >
        <svg
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
        Log out
      </button>
    </form>
    </div>
  )
}
