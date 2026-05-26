// app/league/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'
import { SeasonStandings } from '@/components/league/SeasonStandings'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function SeasonPage({ params }: PageProps) {
  const { id } = await params
  const seasonId = parseInt(id)

  const season = await prisma.seasons.findUnique({
    where: { id: seasonId },
    include: {
      players: {
        include: { player: true },
        orderBy: [{ points: 'desc' }, { wins: 'desc' }],
      },
      matchdays: {
        orderBy: { number: 'asc' },
        include: {
          decklists: true,
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
      <main className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div>
          <Link
            href="/league"
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
            Back to League
          </Link>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mt-2">
            {season.name}
          </h1>
        </div>
        <SeasonStandings season={season} />
      </main>
    </div>
  )
}
