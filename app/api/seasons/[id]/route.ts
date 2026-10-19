// app/api/seasons/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { lockedPlayerIds, parseSeasonPayload } from "@/lib/season-players";

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
  const season = Number.isInteger(seasonId)
    ? await prisma.seasons.findUnique({ where: { id: seasonId }, select: { id: true } })
    : null;
  if (!season) return NextResponse.json({ error: "Season not found" }, { status: 404 });

  const payload = await parseSeasonPayload(await request.json().catch(() => null));
  if (!payload.ok) return NextResponse.json({ error: payload.error }, { status: 400 });
  const { name, playerIds } = payload;

  const existing = await prisma.seasonPlayer.findMany({
    where: { season_id: seasonId },
    select: { player_id: true, player: { select: { username: true } } },
  });
  const existingIds = existing.map((e) => e.player_id);
  const toAdd = playerIds.filter((pid) => !existingIds.includes(pid));
  const toRemove = existingIds.filter((pid) => !playerIds.includes(pid));

  // Players with recorded matches or decklists can't be dropped from the season
  const locked = new Set(await lockedPlayerIds(seasonId));
  const blocked = existing.filter((e) => toRemove.includes(e.player_id) && locked.has(e.player_id));
  if (blocked.length > 0) {
    const names = blocked.map((b) => b.player.username).join(", ");
    return NextResponse.json(
      { error: `Can't remove ${names}: they already have results in this season.` },
      { status: 409 }
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.seasons.update({ where: { id: seasonId }, data: { name } });

    if (toAdd.length > 0) {
      await tx.seasonPlayer.createMany({
        data: toAdd.map((player_id) => ({ season_id: seasonId, player_id })),
      });
    }
    if (toRemove.length > 0) {
      await tx.seasonPlayer.deleteMany({
        where: { season_id: seasonId, player_id: { in: toRemove } },
      });
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
