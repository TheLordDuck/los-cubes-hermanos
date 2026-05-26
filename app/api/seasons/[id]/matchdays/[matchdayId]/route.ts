// app/api/seasons/[id]/matchdays/[matchdayId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { MATCH_RESULT } from "@/lib/generated/prisma/enums";

interface Ctx { params: Promise<{ id: string; matchdayId: string }> }

// ── PUT — edit matchday scores ─────────────────────────────────────────────

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id, matchdayId } = await params;
  const seasonId = parseInt(id);
  const mdId = parseInt(matchdayId);
  const { rounds } = await request.json();
  // rounds: { id, round_number, matches: { id, player1_id, player2_id, p1_games, p2_games, is_bye }[] }[]

  await prisma.$transaction(async (tx) => {
    // 1. Reverse old standings
    const oldMatches = await tx.matches.findMany({
      where: { round: { matchday_id: mdId } },
    });

    for (const m of oldMatches) {
      if (m.is_bye) {
        const byeWinnerId = m.result === MATCH_RESULT.P1_WIN ? m.player1_id : (m.player2_id ?? m.player1_id);
        await tx.seasonPlayer.update({
          where: { id: byeWinnerId },
          data: { points: { decrement: 3 }, bye_wins: { decrement: 1 }, losses: { decrement: 1 } },
        });
      } else {
        const p2id = m.player2_id!;
        const pts_p1 = m.result === MATCH_RESULT.P1_WIN ? 3 : m.result === MATCH_RESULT.DRAW ? 1 : 0;
        const pts_p2 = m.result === MATCH_RESULT.P2_WIN ? 3 : m.result === MATCH_RESULT.DRAW ? 1 : 0;
        await tx.seasonPlayer.update({
          where: { id: m.player1_id },
          data: { points: { decrement: pts_p1 }, wins: { decrement: m.result === MATCH_RESULT.P1_WIN ? 1 : 0 }, losses: { decrement: m.result === MATCH_RESULT.P2_WIN ? 1 : 0 }, draws: { decrement: m.result === MATCH_RESULT.DRAW ? 1 : 0 } },
        });
        await tx.seasonPlayer.update({
          where: { id: p2id },
          data: { points: { decrement: pts_p2 }, wins: { decrement: m.result === MATCH_RESULT.P2_WIN ? 1 : 0 }, losses: { decrement: m.result === MATCH_RESULT.P1_WIN ? 1 : 0 }, draws: { decrement: m.result === MATCH_RESULT.DRAW ? 1 : 0 } },
        });
      }
    }

    // 2. Update matches with new scores + recalculate results
    for (const r of rounds) {
      for (const m of r.matches) {
        let newResult: MATCH_RESULT = MATCH_RESULT.PENDING;
        if (m.p1_games > m.p2_games) newResult = MATCH_RESULT.P1_WIN;
        else if (m.p2_games > m.p1_games) newResult = MATCH_RESULT.P2_WIN;
        else if (m.p1_games > 0) newResult = MATCH_RESULT.DRAW;

        await tx.matches.update({
          where: { id: m.id },
          data: {
            player1_id: m.player1_id,
            player2_id: m.is_bye ? null : m.player2_id,
            p1_games: m.p1_games,
            p2_games: m.p2_games,
            is_bye: m.is_bye,
            result: m.is_bye ? MATCH_RESULT.P1_WIN : newResult,
          },
        });

        // 3. Apply new standings
        const finalResult = m.is_bye ? MATCH_RESULT.P1_WIN : newResult;

        if (m.is_bye) {
          await tx.seasonPlayer.update({
            where: { id: m.player1_id },
            data: { points: { increment: 3 }, bye_wins: { increment: 1 }, losses: { increment: 1 } },
          });
        } else {
          const p2id = m.player2_id!;
          const pts_p1 = finalResult === MATCH_RESULT.P1_WIN ? 3 : finalResult === MATCH_RESULT.DRAW ? 1 : 0;
          const pts_p2 = finalResult === MATCH_RESULT.P2_WIN ? 3 : finalResult === MATCH_RESULT.DRAW ? 1 : 0;
          await tx.seasonPlayer.update({
            where: { id: m.player1_id },
            data: { points: { increment: pts_p1 }, wins: { increment: finalResult === MATCH_RESULT.P1_WIN ? 1 : 0 }, losses: { increment: finalResult === MATCH_RESULT.P2_WIN ? 1 : 0 }, draws: { increment: finalResult === MATCH_RESULT.DRAW ? 1 : 0 } },
          });
          await tx.seasonPlayer.update({
            where: { id: p2id },
            data: { points: { increment: pts_p2 }, wins: { increment: finalResult === MATCH_RESULT.P2_WIN ? 1 : 0 }, losses: { increment: finalResult === MATCH_RESULT.P1_WIN ? 1 : 0 }, draws: { increment: finalResult === MATCH_RESULT.DRAW ? 1 : 0 } },
          });
        }
      }
    }
  });

  revalidatePath(`/league/${seasonId}`);
  revalidatePath(`/admin/league/${seasonId}/results`);
  return NextResponse.json({ ok: true });
}

// ── DELETE ─────────────────────────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id, matchdayId } = await params;
  const seasonId = parseInt(id);
  const mdId = parseInt(matchdayId);

  await prisma.$transaction(async (tx) => {
    const rounds = await tx.rounds.findMany({ where: { matchday_id: mdId }, include: { matches: true } });

    for (const round of rounds) {
      for (const m of round.matches) {
        if (m.is_bye) {
          const byeWinnerId = m.result === MATCH_RESULT.P1_WIN ? m.player1_id : (m.player2_id ?? m.player1_id);
          await tx.seasonPlayer.update({ where: { id: byeWinnerId }, data: { points: { decrement: 3 }, bye_wins: { decrement: 1 }, losses: { decrement: 1 } } });
        } else {
          const p2id = m.player2_id!;
          const pts_p1 = m.result === MATCH_RESULT.P1_WIN ? 3 : m.result === MATCH_RESULT.DRAW ? 1 : 0;
          const pts_p2 = m.result === MATCH_RESULT.P2_WIN ? 3 : m.result === MATCH_RESULT.DRAW ? 1 : 0;
          await tx.seasonPlayer.update({ where: { id: m.player1_id }, data: { points: { decrement: pts_p1 }, wins: { decrement: m.result === MATCH_RESULT.P1_WIN ? 1 : 0 }, losses: { decrement: m.result === MATCH_RESULT.P2_WIN ? 1 : 0 }, draws: { decrement: m.result === MATCH_RESULT.DRAW ? 1 : 0 } } });
          await tx.seasonPlayer.update({ where: { id: p2id }, data: { points: { decrement: pts_p2 }, wins: { decrement: m.result === MATCH_RESULT.P2_WIN ? 1 : 0 }, losses: { decrement: m.result === MATCH_RESULT.P1_WIN ? 1 : 0 }, draws: { decrement: m.result === MATCH_RESULT.DRAW ? 1 : 0 } } });
        }
      }
    }

    await tx.matchdays.delete({ where: { id: mdId } });
  });

  revalidatePath(`/league/${seasonId}`);
  revalidatePath(`/admin/league/${seasonId}/results`);
  return new NextResponse(null, { status: 204 });
}
