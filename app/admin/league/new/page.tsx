// app/admin/league/new/page.tsx
import { prisma } from '@/lib/prisma'
import { SeasonForm } from '@/components/admin/league/SeasonForm'
import { SeasonFormPage } from '@/components/admin/league/SeasonFormPage'

export const dynamic = 'force-dynamic'

export default async function NewSeasonPage() {
  const players = await prisma.players.findMany({ orderBy: { username: 'asc' } })

  return (
    <SeasonFormPage title="New season">
      <SeasonForm players={players} />
    </SeasonFormPage>
  )
}
