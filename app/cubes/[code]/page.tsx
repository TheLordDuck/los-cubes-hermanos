// app/cubes/[code]/page.tsx
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'
import { CubeTabs } from '@/components/CubeTabs'

interface PageProps {
  params: Promise<{ code: string }>
}

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: 'bg-emerald-950 text-emerald-300',
  medium: 'bg-amber-950 text-amber-300',
  hard: 'bg-red-950 text-red-300',
}

export default async function CubeDetailPage({ params }: PageProps) {
  const { code } = await params

  const cube = await prisma.cubes.findUnique({
    where: { code },
    include: { archetypes: true },
  })

  if (!cube) notFound()

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">
        <Link
          href="/cubes"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors w-fit"
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
          Back to cube selection
        </Link>

        <div className="flex gap-5 items-start p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="relative shrink-0 w-32 h-20 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            {cube.imageUrl ? (
              <Image
                unoptimized
                src={cube.imageUrl}
                alt={cube.name}
                fill
                className="object-cover"
                sizes="128px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                <svg
                  width={28}
                  height={28}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x={3} y={3} width={18} height={18} rx={2} />
                  <circle cx={8.5} cy={8.5} r={1.5} />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 min-w-0">
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
              {cube.name}
            </h1>
            <div className="flex flex-wrap gap-1.5">
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded uppercase tracking-wide ${cube.type === 'BATTLEBOX' ? 'bg-blue-950 text-blue-300' : 'bg-emerald-950 text-emerald-300'}`}
              >
                {cube.type === 'BATTLEBOX' ? 'Battlebox' : 'Cube'}
              </span>
              {cube.isTwobert && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded uppercase tracking-wide bg-purple-950 text-purple-300">
                  Twobert
                </span>
              )}
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded uppercase tracking-wide ${DIFFICULTY_STYLES[cube.difficulty.toLowerCase()] ?? 'bg-neutral-800 text-neutral-300'}`}
              >
                {cube.difficulty}
              </span>
            </div>
          </div>
        </div>

        <CubeTabs cube={cube} />
      </main>
    </div>
  )
}
