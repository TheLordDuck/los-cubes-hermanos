// app/api/cubes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { CUBE_TYPE } from '@/types/cube'

interface RouteContext {
  params: Promise<{ id: string }>
}

// ── GET /api/cubes/[id] ────────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params

  const cube = await prisma.cubes.findUnique({
    where: { id: parseInt(id) },
    include: { archetypes: true },
  })

  if (!cube) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(cube)
}

// ── PUT /api/cubes/[id] ────────────────────────────────────────────────────

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const numericId = parseInt(id)
  const body = await request.json()
  const { code, name, type, difficulty, imageUrl, isTwobert, archetypes } = body

  if (!code || !name || !type || !difficulty) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const cube = await prisma.$transaction(async (tx) => {
    const updated = await tx.cubes.update({
      where: { id: numericId },
      data: {
        code,
        name,
        type: type as CUBE_TYPE,
        difficulty,
        imageUrl: imageUrl ?? '',
        isTwobert: isTwobert ?? false,
      },
    })

    await tx.archetypes.deleteMany({ where: { cube_id: numericId } })

    if (Array.isArray(archetypes)) {
      for (const a of archetypes as { colorPair: string; strategy: string }[]) {
        await tx.archetypes.create({
          data: { cube_id: numericId, colorPair: a.colorPair, strategy: a.strategy },
        })
      }
    }

    return updated
  })

  revalidatePath('/cubes')
  revalidatePath(`/cubes/${cube.code}`)
  revalidatePath('/admin/cubes')

  return NextResponse.json(cube)
}

// ── DELETE /api/cubes/[id] ─────────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params

  await prisma.cubes.delete({ where: { id: parseInt(id) } })

  revalidatePath('/cubes')
  revalidatePath('/admin/cubes')

  return new NextResponse(null, { status: 204 })
}
