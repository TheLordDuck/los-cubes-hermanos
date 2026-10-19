// app/admin/cubes/page.tsx
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { AdminNav } from '@/components/admin/AdminNav'
import {
  ART_PLACEHOLDER_STYLE,
  DifficultyMeter,
  cubeMonogram,
} from '@/components/CubeBadges'

export const dynamic = 'force-dynamic'

const TH =
  'px-2 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted'

const BADGE =
  'px-2 py-0.75 rounded-md font-mono text-[11px] font-bold uppercase tracking-[0.06em]'

export default async function AdminCubesPage() {
  const cubes = await prisma.cubes.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="min-h-screen bg-ink">
      <Header />
      <main className="max-w-310 mx-auto px-4 sm:px-6 pt-10 pb-20 flex flex-col gap-7">
        <AdminNav />

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="m-0 font-display font-extrabold text-[44px] leading-none tracking-tighter">
              Manage cubes
            </h1>
            <span className="text-sm text-muted">
              {cubes.length} {cubes.length === 1 ? 'cube' : 'cubes'} total
            </span>
          </div>
          <Link
            href="/admin/cubes/new"
            className="inline-flex items-center gap-2 min-h-11.5 px-5 rounded-[10px] bg-accent text-ink font-semibold hover:bg-accent-hover transition-colors"
          >
            <svg
              width={16}
              height={16}
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <line x1={8} y1={2} x2={8} y2={14} strokeLinecap="round" />
              <line x1={2} y1={8} x2={14} y2={8} strokeLinecap="round" />
            </svg>
            New cube
          </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          {cubes.length === 0 ? (
            <p className="text-sm text-muted text-center py-16">
              No cubes yet.{' '}
              <Link href="/admin/cubes/new" className="text-accent hover:underline">
                Create the first one.
              </Link>
            </p>
          ) : (
            <table className="w-full min-w-215 border-collapse text-sm">
              <thead>
                <tr className="bg-raised">
                  <th className={`${TH} pl-5 w-18`}>
                    <span className="sr-only">Image</span>
                  </th>
                  <th className={TH}>Name</th>
                  <th className={TH}>CubeCobra code</th>
                  <th className={TH}>Type</th>
                  <th className={TH}>Difficulty</th>
                  <th className={`${TH} pr-5 text-right!`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cubes.map((cube) => (
                  <tr key={cube.id} className="border-t border-line">
                    <td className="pl-5 pr-2 py-2.5">
                      <div
                        className="relative w-12 h-8 rounded-md overflow-hidden bg-raised flex items-center justify-center font-display font-extrabold text-[13px] text-soft"
                        style={ART_PLACEHOLDER_STYLE}
                      >
                        {cube.imageUrl ? (
                          <Image
                            unoptimized
                            src={cube.imageUrl}
                            alt={cube.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          cubeMonogram(cube.name)
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2.5 font-semibold">{cube.name}</td>
                    <td className="px-2 py-2.5">
                      <span
                        className="block max-w-45 truncate font-mono text-xs text-muted"
                        title={cube.code}
                      >
                        {cube.code}
                      </span>
                    </td>
                    <td className="px-2 py-2.5">
                      <span className="inline-flex gap-1.5">
                        <span className={`${BADGE} bg-line`}>
                          {cube.type === 'BATTLEBOX' ? 'Battlebox' : 'Cube'}
                        </span>
                        {cube.isTwobert && (
                          <span className={`${BADGE} bg-[#352b45] text-[#d9cbf2]`}>
                            Twobert
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-soft">
                      <DifficultyMeter difficulty={cube.difficulty} size="sm" />
                    </td>
                    <td className="pl-2 pr-5 py-2.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/cubes/${cube.id}/edit`}
                          className="inline-flex items-center min-h-10 px-3.5 rounded-lg border border-line-strong font-medium hover:bg-raised transition-colors"
                        >
                          Edit
                        </Link>
                        <DeleteButton id={cube.id} name={cube.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
