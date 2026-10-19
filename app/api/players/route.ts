// app/api/players/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/lib/generated/prisma/client'

const MAX_USERNAME = 32

export async function GET() {
  const players = await prisma.players.findMany({ orderBy: { username: 'asc' } })
  return NextResponse.json(players)
}

// Creates a player, or returns the existing one when the username is already
// taken (case-insensitive), so the season form can't create duplicates.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const username =
    typeof body?.username === 'string' ? body.username.trim().replace(/\s+/g, ' ') : ''

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })
  }
  if (username.length > MAX_USERNAME) {
    return NextResponse.json(
      { error: `Username must be ${MAX_USERNAME} characters or fewer` },
      { status: 400 }
    )
  }

  const existing = await prisma.players.findFirst({
    where: { username: { equals: username, mode: 'insensitive' } },
  })
  if (existing) return NextResponse.json(existing, { status: 200 })

  try {
    const player = await prisma.players.create({ data: { username } })
    return NextResponse.json(player, { status: 201 })
  } catch (err) {
    // Lost a race with another request creating the same username
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const player = await prisma.players.findUnique({ where: { username } })
      if (player) return NextResponse.json(player, { status: 200 })
    }
    throw err
  }
}
