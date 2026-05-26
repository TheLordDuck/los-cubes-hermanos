// app/api/cubes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { CUBE_TYPE } from '@/types/cube'

// ── GET /api/cubes ─────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') ?? ''
  const type = searchParams.get('type')

  const cubes = await prisma.cubes.findMany({
    where: {
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      ...(type && type !== 'all' && { type: type as CUBE_TYPE }),
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(cubes)
}

// ── POST /api/cubes ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { code, name, type, difficulty, imageUrl, isTwobert, archetypes } = body

  if (!code || !name || !type || !difficulty) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const cube = await prisma.$transaction(async (tx) => {
    const created = await tx.cubes.create({
      data: { code, name, type, difficulty, imageUrl: imageUrl ?? '', isTwobert: isTwobert ?? false },
    })

    if (Array.isArray(archetypes)) {
      for (const a of archetypes as { colorPair: string; strategy: string }[]) {
        await tx.archetypes.create({
          data: { cube_id: created.id, colorPair: a.colorPair, strategy: a.strategy },
        })
      }
    }

    return created
  })

  revalidatePath('/cubes')
  revalidatePath('/admin/cubes')

  return NextResponse.json(cube, { status: 201 })
}
