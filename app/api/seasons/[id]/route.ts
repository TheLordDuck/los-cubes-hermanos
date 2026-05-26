// app/api/seasons/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

interface Ctx { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const season = await prisma.seasons.findUnique({
    where: { id: parseInt(id) },
    include: {
      players: { include: { player: true } },
      matchdays: {
        orderBy: { number: "asc" },
        include: {
          rounds: {
            orderBy: { round_number: "asc" },
            include: {
              matches: {
                include: {
                  player1: { include: { player: true } },
                  player2: { include: { player: true } },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!season) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(season);
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const seasonId = parseInt(id);
  const { name, playerIds } = await request.json();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  await prisma.$transaction(async (tx) => {
    await tx.seasons.update({ where: { id: seasonId }, data: { name } });

    if (Array.isArray(playerIds)) {
      const existing = await tx.seasonPlayer.findMany({
        where: { season_id: seasonId },
        select: { player_id: true },
      });
      const existingIds = existing.map((e) => e.player_id);
      const toAdd = playerIds.filter((pid: number) => !existingIds.includes(pid));
      const toRemove = existingIds.filter((pid) => !playerIds.includes(pid));

      if (toAdd.length > 0) {
        await tx.seasonPlayer.createMany({
          data: toAdd.map((player_id: number) => ({ season_id: seasonId, player_id })),
        });
      }
      if (toRemove.length > 0) {
        await tx.seasonPlayer.deleteMany({
          where: { season_id: seasonId, player_id: { in: toRemove } },
        });
      }
    }
  });

  revalidatePath("/league");
  revalidatePath(`/league/${seasonId}`);
  revalidatePath("/admin/league");
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await prisma.seasons.delete({ where: { id: parseInt(id) } });
  revalidatePath("/league");
  revalidatePath("/admin/league");
  return new NextResponse(null, { status: 204 });
}
