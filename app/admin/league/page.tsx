// app/admin/league/page.tsx
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'
import { DeleteSeasonButton } from '@/components/admin/league/DeleteSeasonButton'

export const dynamic = 'force-dynamic'

export default async function AdminLeaguePage() {
  const seasons = await prisma.seasons.findMany({
    orderBy: { id: 'desc' },
    include: { players: true, matchdays: true },
  })

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Manage seasons</h1>
            <p className="text-sm text-neutral-400 mt-0.5">{seasons.length} season{seasons.length !== 1 ? 's' : ''} total</p>
          </div>
          <Link
            href="/admin/league/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
          >
            <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <line x1={8} y1={2} x2={8} y2={14} /><line x1={2} y1={8} x2={14} y2={8} />
            </svg>
            New season
          </Link>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          {seasons.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-16">
              No seasons yet.{' '}
              <Link href="/admin/league/new" className="text-blue-500 hover:underline">Create the first one.</Link>
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wide">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wide hidden sm:table-cell">Players</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wide hidden sm:table-cell">Matchdays</th>
                  <th className="px-5 py-3 w-32" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {seasons.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-neutral-900 dark:text-neutral-100">{s.name}</td>
                    <td className="px-5 py-3 hidden sm:table-cell text-neutral-500">{s.players.length}</td>
                    <td className="px-5 py-3 hidden sm:table-cell text-neutral-500">{s.matchdays.length}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/admin/league/${s.id}/edit`} className="text-xs text-neutral-400 hover:text-blue-400 transition-colors">Edit</Link>
                        <Link href={`/admin/league/${s.id}/results`} className="text-xs text-neutral-400 hover:text-emerald-400 transition-colors">Results</Link>
                        <DeleteSeasonButton id={s.id} name={s.name} />
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
