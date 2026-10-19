// app/admin/login/page.tsx
import { Header } from '@/components/Header'
import { LoginForm } from '@/components/admin/LoginForm'
import { isAdminConfigured } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ next?: string }>
}

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const { next } = await searchParams

  return (
    <div className="min-h-screen bg-ink">
      <Header />
      <main className="max-w-105 w-full mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-20">
        <div className="flex flex-col gap-7 p-6 sm:p-8 rounded-[18px] border border-line bg-surface">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-accent">
              Admin
            </span>
            <h1 className="m-0 font-display font-extrabold text-4xl leading-none tracking-tighter">
              Who goes there?
            </h1>
            <p className="m-0 text-sm text-muted leading-relaxed">
              Enter the admin password to manage cubes and the league.
            </p>
          </div>

          {isAdminConfigured() ? (
            <LoginForm next={next ?? ''} />
          ) : (
            <p className="m-0 text-sm text-[#f2826a] bg-loss/10 border border-loss/40 rounded-[10px] px-4 py-3">
              No admin password is set. Add <code className="font-mono">ADMIN_PASSWORD</code>{' '}
              to your <code className="font-mono">.env</code> and restart the server.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
