// app/admin/league/[id]/edit/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { lockedPlayerIds } from '@/lib/season-players'
import { SeasonForm } from '@/components/admin/league/SeasonForm'
import { SeasonFormPage } from '@/components/admin/league/SeasonFormPage'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditSeasonPage({ params }: PageProps) {
  const { id } = await params
  const seasonId = parseInt(id)
  if (!Number.isInteger(seasonId)) notFound()

  const [season, players, lockedIds] = await Promise.all([
    prisma.seasons.findUnique({
      where: { id: seasonId },
      include: { players: { include: { player: true } } },
    }),
    prisma.players.findMany({ orderBy: { username: 'asc' } }),
    lockedPlayerIds(seasonId),
  ])

  if (!season) notFound()

  return (
    <SeasonFormPage title={`Edit ${season.name}`}>
      <SeasonForm season={season} players={players} lockedIds={lockedIds} />
    </SeasonFormPage>
  )
}
