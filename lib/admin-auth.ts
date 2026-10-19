// lib/admin-auth.ts
// Single shared admin password (ADMIN_PASSWORD). The session cookie holds an
// HMAC derived from the password, so changing the password logs everyone out.

export const ADMIN_COOKIE = 'lch_admin'
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

const encoder = new TextEncoder()

async function hmacHex(key: string, message: string) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Constant-time comparison of two equal-length hex strings
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD)
}

// Token stored in the cookie after a successful login
export async function adminSessionToken() {
  const password = process.env.ADMIN_PASSWORD
  if (!password) return null
  return hmacHex(password, 'los-cubes-hermanos:admin-session')
}

export async function isValidAdminSession(token: string | undefined) {
  if (!token) return false
  const expected = await adminSessionToken()
  return expected !== null && safeEqual(token, expected)
}

export async function checkAdminPassword(candidate: string) {
  const password = process.env.ADMIN_PASSWORD
  if (!password) return false
  // Compare HMACs so the comparison length never depends on the input
  const [a, b] = await Promise.all([
    hmacHex(password, candidate),
    hmacHex(password, password),
  ])
  return safeEqual(a, b)
}
