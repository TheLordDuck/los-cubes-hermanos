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
    <div className="min-h-screen bg-ink">
      <Header />
      <main className="max-w-310 mx-auto px-4 sm:px-6 pt-7 pb-20 flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <Link
            href="/league"
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
              <path
                d="M10 3L5 8l5 5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            All seasons
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="m-0 font-display font-extrabold text-4xl sm:text-[56px] leading-none tracking-tighter">
              {season.name}
            </h1>
            <span className="text-sm text-muted">
              {season.players.length} players · {season.matchdays.length}{' '}
              matchdays · best 5 count
            </span>
          </div>
        </div>
        <SeasonStandings season={season} />
      </main>
    </div>
  )
}
