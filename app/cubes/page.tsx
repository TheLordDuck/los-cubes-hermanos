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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Header />
      <CubeList initialCubes={cubes} />
    </div>
  )
}
