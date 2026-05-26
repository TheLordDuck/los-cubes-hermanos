// app/admin/cubes/new/page.tsx
import Link from 'next/link'
import { Header } from '@/components/Header'
import { CubeForm } from '@/components/admin/CubeForm'

export default function NewCubePage() {
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
            New cube
          </h1>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
          <CubeForm />
        </div>
      </main>
    </div>
  )
}
