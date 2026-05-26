// app/api/players/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const players = await prisma.players.findMany({ orderBy: { username: 'asc' } })
  return NextResponse.json(players)
}

export async function POST(request: NextRequest) {
  const { username } = await request.json()
  if (!username) return NextResponse.json({ error: 'Username is required' }, { status: 400 })

  const player = await prisma.players.create({ data: { username } })
  return NextResponse.json(player, { status: 201 })
}
