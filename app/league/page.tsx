// app/league/page.tsx
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'

export const dynamic = 'force-dynamic'

export default async function LeaguePage() {
  const seasons = await prisma.seasons.findMany({
    orderBy: { id: 'desc' },
    include: { players: true, matchdays: true },
  })

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-6">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          League
        </h1>

        {seasons.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-16">
            No seasons yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {seasons.map((s) => (
              <Link
                key={s.id}
                href={`/league/${s.id}`}
                className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
              >
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {s.name}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {s.players.length} players · {s.matchdays.length} matchdays
                  </p>
                </div>
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="text-neutral-400 shrink-0"
                >
                  <path
                    d="M6 3l5 5-5 5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
