// app/cubes/page.tsx
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'
import { CubeList } from '@/components/CubeList'

export const dynamic = 'force-dynamic'

export default async function CubesPage() {
  const cubes = await prisma.cubes.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <div className="min-h-screen bg-ink">
      <Header />
      <CubeList initialCubes={cubes} />
    </div>
  )
}
