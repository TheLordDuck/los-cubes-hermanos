// app/admin/cubes/[id]/edit/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'
import { CubeForm } from '@/components/admin/CubeForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditCubePage({ params }: PageProps) {
  const { id } = await params

  const cube = await prisma.cubes.findUnique({
    where: { id: Number(id) },
    include: { archetypes: true },
  })

  if (!cube) notFound()

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div>
          <Link
            href="/admin/cubes"
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
            Back to cubes
          </Link>
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mt-3">
            Edit — {cube.name}
          </h1>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
          <CubeForm cube={cube} archetypes={cube.archetypes} />
        </div>
      </main>
    </div>
  )
}
