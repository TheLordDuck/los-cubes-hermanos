// app/admin/cubes/page.tsx
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'
import { DeleteButton } from '@/components/admin/DeleteButton'

export const dynamic = 'force-dynamic'

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: 'bg-emerald-950 text-emerald-300',
  medium: 'bg-amber-950 text-amber-300',
  hard: 'bg-red-950 text-red-300',
}

export default async function AdminCubesPage() {
  const cubes = await prisma.cubes.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Manage cubes
            </h1>
            <p className="text-sm text-neutral-400 mt-0.5">
              {cubes.length} {cubes.length === 1 ? 'cube' : 'cubes'} total
            </p>
          </div>
          <Link
            href="/admin/cubes/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
          >
            <svg
              width={14}
              height={14}
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <line x1={8} y1={2} x2={8} y2={14} strokeLinecap="round" />
              <line x1={2} y1={8} x2={14} y2={8} strokeLinecap="round" />
            </svg>
            New cube
          </Link>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          {cubes.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-16">
              No cubes yet.{' '}
              <Link
                href="/admin/cubes/new"
                className="text-blue-500 hover:underline"
              >
                Create the first one.
              </Link>
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wide w-12" />
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wide">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wide hidden sm:table-cell">
                    Code
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wide hidden sm:table-cell">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wide hidden md:table-cell">
                    Difficulty
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wide hidden md:table-cell">
                    Twobert
                  </th>
                  <th className="px-4 py-3 w-28" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {cubes.map((cube) => (
                  <tr
                    key={cube.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="relative w-10 h-7 rounded overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                        {cube.imageUrl ? (
                          <Image
                            unoptimized
                            src={cube.imageUrl}
                            alt={cube.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            <svg
                              width={14}
                              height={14}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.5}
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
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                      {cube.name}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-neutral-400 font-mono">
                        {cube.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wide ${cube.type === 'BATTLEBOX' ? 'bg-blue-950 text-blue-300' : 'bg-emerald-950 text-emerald-300'}`}
                      >
                        {cube.type === 'BATTLEBOX' ? 'Battlebox' : 'Cube'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wide ${DIFFICULTY_STYLES[cube.difficulty.toLowerCase()] ?? 'bg-neutral-800 text-neutral-300'}`}
                      >
                        {cube.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {cube.isTwobert ? (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wide bg-purple-950 text-purple-300">
                          Yes
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/cubes/${cube.id}/edit`}
                          className="text-xs text-neutral-400 hover:text-blue-400 transition-colors"
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
