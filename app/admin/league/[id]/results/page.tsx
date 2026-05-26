// app/admin/league/[id]/results/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'
import { AddResultsForm } from '@/components/league/AddResultsForm'
import { MatchdayList } from '@/components/admin/league/MatchdayList'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function AdminResultsPage({ params }: PageProps) {
  const { id } = await params

  const season = await prisma.seasons.findUnique({
    where: { id: parseInt(id) },
    include: {
      players: { include: { player: true } },
      matchdays: {
        orderBy: { number: 'desc' },
        include: {
          rounds: {
            orderBy: { round_number: 'asc' },
            include: {
              matches: {
                include: {
                  player1: { include: { player: true } },
                  player2: { include: { player: true } },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!season) notFound()

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Header />
      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Back + title */}
        <div>
          <Link
            href="/admin/league"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
          >
            <svg
              width={14}
              height={14}
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                d="M10 3L5 8l5 5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </Link>
          <h1 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 mt-2">
            {season.name}
          </h1>
        </div>

        {/* Add matchday form */}
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Add matchday
          </h2>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-6">
            <AddResultsForm seasonId={season.id} players={season.players} />
          </div>
        </section>

        {/* Past matchdays */}
        {season.matchdays.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Past matchdays
            </h2>
            <MatchdayList
              matchdays={season.matchdays}
              seasonId={season.id}
              players={season.players}
            />
          </section>
        )}
      </main>
    </div>
  )
}
