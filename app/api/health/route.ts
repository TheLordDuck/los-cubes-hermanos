// app/api/health/route.ts
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Liveness probe for the container healthcheck (no database access)
export function GET() {
  return NextResponse.json({ ok: true })
}
