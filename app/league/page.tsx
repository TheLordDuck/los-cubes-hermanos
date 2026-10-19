// app/league/page.tsx
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'

export const dynamic = 'force-dynamic'

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
      aria-hidden="true"
    >
      <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default async function LeaguePage() {
  const seasons = await prisma.seasons.findMany({
    orderBy: { id: 'desc' },
    include: { players: true, matchdays: true },
  })

  const [current, ...past] = seasons

  return (
    <div className="min-h-screen bg-ink">
      <Header />
      <main className="max-w-230 mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-20 flex flex-col gap-9">
        <div className="flex flex-col gap-2.5">
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-accent">
            Draft league
          </span>
          <h1 className="m-0 font-display font-extrabold text-4xl sm:text-[56px] leading-none tracking-tighter">
            Seasons
          </h1>
          <p className="m-0 text-muted leading-relaxed max-w-130">
            Best-of-three rounds, three points a win. Your best five matchdays
            count toward the standings.
          </p>
        </div>

        {!current ? (
          <p className="text-sm text-muted text-center py-16 rounded-2xl border border-dashed border-line-strong">
            No seasons yet.
          </p>
        ) : (
          <>
            <Link
              href={`/league/${current.id}`}
              className="flex flex-col gap-7 p-6 sm:p-8 rounded-[18px] border border-accent bg-surface text-fg hover:bg-raised transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-accent/15 text-accent font-mono text-[11px] font-bold uppercase tracking-[0.08em]">
                  <span
                    className="block w-1.75 h-1.75 rounded-full bg-accent"
                    aria-hidden="true"
                  />
                  Current season
                </span>
                <span className="inline-flex items-center gap-1.5 text-accent font-semibold">
                  View standings
                  <ChevronRight />
                </span>
              </div>
              <span className="font-display font-extrabold text-4xl leading-none tracking-tight">
                {current.name}
              </span>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Players', value: current.players.length },
                  { label: 'Matchdays', value: current.matchdays.length },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex flex-col gap-1 p-4 rounded-xl bg-raised"
                  >
                    <span className="text-xs text-muted">{s.label}</span>
                    <span className="font-mono font-bold text-[26px] leading-tight">
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </Link>

            {past.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
                  Past seasons
                </h2>
                {past.map((s) => (
                  <Link
                    key={s.id}
                    href={`/league/${s.id}`}
                    className="flex items-center gap-5 px-6 py-5 rounded-[14px] border border-line bg-surface text-fg hover:border-line-strong hover:bg-raised transition-colors"
                  >
                    <span className="inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-xl bg-raised font-mono font-bold">
                      S{s.id}
                    </span>
                    <span className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="font-semibold text-[17px]">{s.name}</span>
                      <span className="text-[13px] text-muted">
                        {s.players.length} players · {s.matchdays.length}{' '}
                        matchdays
                      </span>
                    </span>
                    <ChevronRight className="text-faint shrink-0" />
                  </Link>
                ))}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}
