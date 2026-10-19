// app/admin/login/actions.ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  adminSessionToken,
  checkAdminPassword,
} from '@/lib/admin-auth'

export interface LoginState {
  error: string | null
}

// Only allow redirects back into the admin area
function safeNext(next: FormDataEntryValue | null) {
  return typeof next === 'string' && next.startsWith('/admin/')
    ? next
    : '/admin/cubes'
}

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = formData.get('password')
  if (typeof password !== 'string' || !(await checkAdminPassword(password))) {
    return { error: 'Wrong password.' }
  }

  const token = await adminSessionToken()
  if (!token) return { error: 'Admin password is not configured.' }

  const jar = await cookies()
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_COOKIE_MAX_AGE,
  })

  redirect(safeNext(formData.get('next')))
}

export async function logout() {
  const jar = await cookies()
  jar.delete(ADMIN_COOKIE)
  redirect('/cubes')
}
