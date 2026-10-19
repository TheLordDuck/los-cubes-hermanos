// lib/season-players.ts
import { prisma } from '@/lib/prisma'

export const MAX_SEASON_NAME = 80

export type SeasonPayload =
  | { ok: true; name: string; playerIds: number[] }
  | { ok: false; error: string }

// Validates the body sent by the season form: trimmed name and a
// de-duplicated list of ids that belong to real players.
export async function parseSeasonPayload(body: unknown): Promise<SeasonPayload> {
  const data = (body ?? {}) as { name?: unknown; playerIds?: unknown }
  const name = typeof data.name === 'string' ? data.name.trim() : ''
  if (!name) return { ok: false, error: 'Season name is required' }
  if (name.length > MAX_SEASON_NAME) {
    return { ok: false, error: `Season name must be ${MAX_SEASON_NAME} characters or fewer` }
  }

  const rawIds = Array.isArray(data.playerIds) ? data.playerIds : []
  if (!rawIds.every((id) => Number.isInteger(id))) {
    return { ok: false, error: 'Invalid player list' }
  }
  const playerIds = [...new Set(rawIds as number[])]

  if (playerIds.length > 0) {
    const found = await prisma.players.count({ where: { id: { in: playerIds } } })
    if (found !== playerIds.length) {
      return { ok: false, error: 'Some players no longer exist. Reload the page and try again.' }
    }
  }

  return { ok: true, name, playerIds }
}

// Player ids (Players.id) in a season that already have matches or decklists,
// so they can't be removed from it without deleting results.
export async function lockedPlayerIds(seasonId: number): Promise<number[]> {
  const rows = await prisma.seasonPlayer.findMany({
    where: {
      season_id: seasonId,
      OR: [
        { matchesAsP1: { some: {} } },
        { matchesAsP2: { some: {} } },
        { decklists: { some: {} } },
      ],
    },
    select: { player_id: true },
  })
  return rows.map((r) => r.player_id)
}
