// app/cubes/[code]/page.tsx
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'
import { CubeTabs } from '@/components/CubeTabs'
import {
  ART_PLACEHOLDER_STYLE,
  DifficultyMeter,
} from '@/components/CubeBadges'

interface PageProps {
  params: Promise<{ code: string }>
}

const BADGE =
  'inline-flex items-center px-2.5 py-1.5 rounded-md bg-ink/75 font-mono text-[11px] font-bold uppercase tracking-[0.08em]'

export default async function CubeDetailPage({ params }: PageProps) {
  const { code } = await params

  const cube = await prisma.cubes.findUnique({
    where: { code },
    include: { archetypes: true },
  })

  if (!cube) notFound()

  return (
    <div className="min-h-screen bg-ink">
      <Header />

      {/* Banner */}
      <section
        className="relative overflow-hidden border-b border-line bg-raised"
        style={cube.imageUrl ? undefined : ART_PLACEHOLDER_STYLE}
      >
        {cube.imageUrl && (
          <>
            <Image
              unoptimized
              src={cube.imageUrl}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-ink/70" aria-hidden="true" />
          </>
        )}
        <div className="relative max-w-310 mx-auto px-4 sm:px-6 pt-5 pb-10 flex flex-col gap-6">
          <Link
            href="/cubes"
            className="inline-flex items-center gap-2 min-h-11 w-fit text-sm text-soft hover:text-fg transition-colors"
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
            All cubes
          </Link>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-col gap-4 min-w-0">
              <div className="flex flex-wrap gap-2">
                <span className={BADGE}>
                  {cube.type === 'BATTLEBOX' ? 'Battlebox' : 'Cube'}
                </span>
                {cube.isTwobert && (
                  <span className={`${BADGE} text-[#c3aee6]`}>Twobert</span>
                )}
                <span className={BADGE}>
                  <DifficultyMeter difficulty={cube.difficulty} size="sm" />
                </span>
              </div>
              <h1 className="m-0 font-display font-extrabold text-4xl sm:text-[64px] leading-[0.95] tracking-tighter">
                {cube.name}
              </h1>
            </div>
            <a
              href={`https://cubecobra.com/cube/list/${cube.code}?display=spoiler`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 min-h-12 px-5 rounded-[10px] bg-fg text-ink font-semibold hover:bg-white transition-colors"
            >
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Open list on CubeCobra
            </a>
          </div>
        </div>
      </section>

      <main className="max-w-310 mx-auto px-4 sm:px-6 pt-8 pb-20">
        <CubeTabs cube={cube} />
      </main>
    </div>
  )
}
