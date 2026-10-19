// components/Header.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/cubes', label: 'Cubes' },
  { href: '/league', label: 'League' },
  { href: '/admin/cubes', label: 'Admin' },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="border-b border-line bg-ink">
      <div className="max-w-310 mx-auto px-4 sm:px-6 h-16 flex items-center gap-4 sm:gap-8">
        <Link href="/cubes" className="flex items-center gap-3 text-fg min-w-0">
          <Image
            src="/favicon.png"
            alt="Los Cubes Hermanos logo"
            width={44}
            height={44}
            className="rounded-[10px] bg-white shrink-0"
          />
          <span className="hidden sm:inline font-display font-extrabold text-lg tracking-tight">
            Los Cubes Hermanos
          </span>
        </Link>
        <nav aria-label="Main" className="flex gap-1 ml-auto">
          {NAV.map((item) => {
            const section = item.href.startsWith('/admin') ? '/admin' : item.href
            const isActive = pathname.startsWith(section)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`px-3.5 py-2.5 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-raised text-fg'
                    : 'text-muted hover:text-fg'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
