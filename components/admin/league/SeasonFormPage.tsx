// components/admin/league/SeasonFormPage.tsx
import Link from 'next/link'
import { Header } from '@/components/Header'
import { AdminNav } from '@/components/admin/AdminNav'

// Shared shell for the new / edit season screens
export function SeasonFormPage({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-ink">
      <Header />
      <main className="max-w-250 mx-auto px-4 sm:px-6 pt-10 pb-20 flex flex-col gap-7">
        <AdminNav />
        <div className="flex flex-col gap-3">
          <Link
            href="/admin/league"
            className="inline-flex items-center gap-2 min-h-11 w-fit text-sm text-muted hover:text-fg transition-colors"
          >
            <svg
              width={16}
              height={16}
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              aria-hidden="true"
            >
              <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to seasons
          </Link>
          <h1 className="m-0 font-display font-extrabold text-[44px] leading-none tracking-tighter">
            {title}
          </h1>
        </div>
        {children}
      </main>
    </div>
  )
}
