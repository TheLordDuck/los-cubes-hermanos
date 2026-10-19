// app/api/seasons/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseSeasonPayload } from "@/lib/season-players";

export async function GET() {
  const seasons = await prisma.seasons.findMany({
    orderBy: { id: "desc" },
    include: { players: true, matchdays: true },
  });
  return NextResponse.json(seasons);
}

export async function POST(request: NextRequest) {
  const payload = await parseSeasonPayload(await request.json().catch(() => null));
  if (!payload.ok) return NextResponse.json({ error: payload.error }, { status: 400 });
  const { name, playerIds } = payload;

  const season = await prisma.$transaction(async (tx) => {
    const created = await tx.seasons.create({ data: { name } });
    if (playerIds.length > 0) {
      await tx.seasonPlayer.createMany({
        data: playerIds.map((player_id) => ({
          season_id: created.id,
          player_id,
        })),
      });
    }
    return created;
  });

  revalidatePath("/league");
  revalidatePath("/admin/league");
  return NextResponse.json(season, { status: 201 });
}
