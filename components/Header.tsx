// components/Header.tsx
import Image from 'next/image'

export function Header() {
  return (
    <header className="px-6 h-14 flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <Image
        src="/favicon.png"
        alt="Los Cubes Hermanos logo"
        width={36}
        height={36}
        className="rounded-md"
      />
      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
        Los Cubes Hermanos
      </span>
    </header>
  )
}
