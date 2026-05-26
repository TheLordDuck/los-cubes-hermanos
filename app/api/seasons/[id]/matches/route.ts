// app/api/seasons/[id]/matches/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { MATCH_RESULT } from "@/lib/generated/prisma/enums";

interface Ctx { params: Promise<{ id: string }> }

// Each round entry: { round_number, matches: [{ player1_id, player2_id, p1_games, p2_games, is_bye, decklist_p1?, decklist_p2? }] }
export async function POST(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const seasonId = parseInt(id);
  const { rounds, decklists } = await request.json();
  // decklists: Array<{ player_id: number; decklist_url: string }>

  if (!Array.isArray(rounds) || rounds.length === 0) {
    return NextResponse.json({ error: "No rounds provided" }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    // Next matchday number
    const last = await tx.matchdays.findFirst({
      where: { season_id: seasonId },
      orderBy: { number: "desc" },
    });
    const nextNumber = (last?.number ?? 0) + 1;

    const matchday = await tx.matchdays.create({
      data: { season_id: seasonId, number: nextNumber },
    });

    for (const r of rounds) {
      const round = await tx.rounds.create({
        data: { matchday_id: matchday.id, round_number: r.round_number },
      });

      for (const m of r.matches) {
        // Determine result
        let matchResult: MATCH_RESULT = MATCH_RESULT.PENDING;
        if (m.p1_games > m.p2_games) matchResult = MATCH_RESULT.P1_WIN;
        else if (m.p2_games > m.p1_games) matchResult = MATCH_RESULT.P2_WIN;
        else if (m.p1_games === m.p2_games && m.p1_games > 0) matchResult = MATCH_RESULT.DRAW;

        await tx.matches.create({
          data: {
            round_id: round.id,
            player1_id: m.player1_id,
            player2_id: m.player2_id,
            p1_games: m.p1_games,
            p2_games: m.p2_games,
            is_bye: m.is_bye ?? false,
            result: matchResult,
            decklist_p1: m.decklist_p1 ?? null,
            decklist_p2: m.decklist_p2 ?? null,
          },
        });

        // Update standings — byes give points but count as a loss in WR
        if (m.is_bye) {
          const byeWinner = matchResult === MATCH_RESULT.P1_WIN ? m.player1_id : m.player2_id;
          await tx.seasonPlayer.update({
            where: { id: byeWinner },
            data: {
              points: { increment: 3 },
              bye_wins: { increment: 1 },
              losses: { increment: 1 }, // counts as loss for WR
            },
          });
        } else {
          const pts_p1 = matchResult === MATCH_RESULT.P1_WIN ? 3 : matchResult === MATCH_RESULT.DRAW ? 1 : 0;
          const pts_p2 = matchResult === MATCH_RESULT.P2_WIN ? 3 : matchResult === MATCH_RESULT.DRAW ? 1 : 0;

          await tx.seasonPlayer.update({
            where: { id: m.player1_id },
            data: {
              points: { increment: pts_p1 },
              wins: { increment: matchResult === MATCH_RESULT.P1_WIN ? 1 : 0 },
              losses: { increment: matchResult === MATCH_RESULT.P2_WIN ? 1 : 0 },
              draws: { increment: matchResult === MATCH_RESULT.DRAW ? 1 : 0 },
            },
          });

          await tx.seasonPlayer.update({
            where: { id: m.player2_id },
            data: {
              points: { increment: pts_p2 },
              wins: { increment: matchResult === MATCH_RESULT.P2_WIN ? 1 : 0 },
              losses: { increment: matchResult === MATCH_RESULT.P1_WIN ? 1 : 0 },
              draws: { increment: matchResult === MATCH_RESULT.DRAW ? 1 : 0 },
            },
          });
        }
      }
    }

    // Save general decklists
    if (Array.isArray(decklists)) {
      for (const d of decklists as { player_id: number; decklist_url: string }[]) {
        if (d.decklist_url?.trim()) {
          await tx.matchdayDecklist.create({
            data: { matchday_id: matchday.id, player_id: d.player_id, decklist_url: d.decklist_url.trim() },
          });
        }
      }
    }

    return matchday;
  });

  revalidatePath(`/league/${seasonId}`);
  revalidatePath(`/admin/league/${seasonId}/results`);
  return NextResponse.json(result, { status: 201 });
}
