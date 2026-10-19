// components/admin/LoginForm.tsx
'use client'

import { useActionState } from 'react'
import { login, type LoginState } from '@/app/admin/login/actions'

const INITIAL: LoginState = { error: null }

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(login, INITIAL)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="admin-password" className="text-xs font-medium text-muted">
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? 'admin-password-error' : undefined}
          className="w-full h-11.5 px-3.5 rounded-[10px] border border-line-strong bg-ink text-fg placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {state.error && (
          <p id="admin-password-error" className="m-0 text-sm text-[#f2826a]">
            {state.error}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="min-h-11.5 px-5 rounded-[10px] bg-accent text-ink font-semibold hover:bg-accent-hover disabled:opacity-60 transition-colors"
      >
        {isPending ? 'Checking…' : 'Unlock admin'}
      </button>
    </form>
  )
}
