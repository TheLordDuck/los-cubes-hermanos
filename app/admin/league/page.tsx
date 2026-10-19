// app/admin/league/page.tsx
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'
import { DeleteSeasonButton } from '@/components/admin/league/DeleteSeasonButton'
import { AdminNav } from '@/components/admin/AdminNav'

export const dynamic = 'force-dynamic'

const TH =
  'px-2 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted'

const ACTION =
  'inline-flex items-center min-h-10 px-3.5 rounded-lg border border-line-strong font-medium hover:bg-raised transition-colors'

export default async function AdminLeaguePage() {
  const seasons = await prisma.seasons.findMany({
    orderBy: { id: 'desc' },
    include: { players: true, matchdays: true },
  })

  return (
    <div className="min-h-screen bg-ink">
      <Header />
      <main className="max-w-310 mx-auto px-4 sm:px-6 pt-10 pb-20 flex flex-col gap-7">
        <AdminNav />

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="m-0 font-display font-extrabold text-[44px] leading-none tracking-tighter">
              Manage seasons
            </h1>
            <span className="text-sm text-muted">
              {seasons.length} {seasons.length === 1 ? 'season' : 'seasons'}{' '}
              total
            </span>
          </div>
          <Link
            href="/admin/league/new"
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
            New season
          </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          {seasons.length === 0 ? (
            <p className="text-sm text-muted text-center py-16">
              No seasons yet.{' '}
              <Link
                href="/admin/league/new"
                className="text-accent hover:underline"
              >
                Create the first one.
              </Link>
            </p>
          ) : (
            <table className="w-full min-w-170 border-collapse text-sm">
              <thead>
                <tr className="bg-raised">
                  <th className={`${TH} pl-5 w-18`}>
                    <span className="sr-only">Season number</span>
                  </th>
                  <th className={TH}>Name</th>
                  <th className={`${TH} text-right!`}>Players</th>
                  <th className={`${TH} text-right!`}>Matchdays</th>
                  <th className={`${TH} pr-5 text-right!`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {seasons.map((s, i) => (
                  <tr key={s.id} className="border-t border-line">
                    <td className="pl-5 pr-2 py-2.5">
                      <span
                        className={`inline-flex items-center justify-center w-11 h-11 rounded-xl font-mono font-bold ${
                          i === 0 ? 'bg-accent text-ink' : 'bg-raised'
                        }`}
                      >
                        S{s.id}
                      </span>
                    </td>
                    <td className="px-2 py-2.5">
                      <span className="flex flex-col gap-0.5">
                        <span className="font-semibold">{s.name}</span>
                        {i === 0 && (
                          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-accent">
                            Current season
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-right font-mono text-soft">
                      {s.players.length}
                    </td>
                    <td className="px-2 py-2.5 text-right font-mono text-soft">
                      {s.matchdays.length}
                    </td>
                    <td className="pl-2 pr-5 py-2.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/league/${s.id}/results`}
                          className={ACTION}
                        >
                          Results
                        </Link>
                        <Link
                          href={`/admin/league/${s.id}/edit`}
                          className={ACTION}
                        >
                          Edit
                        </Link>
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
