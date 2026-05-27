// types/cube.ts
import {
  Cubes,
  Archetypes,
  Players,
  Seasons,
  SeasonPlayer,
  Matchdays,
  Rounds,
  Matches,
  MatchdayDecklist,
} from "@/lib/generated/prisma/client";
import { CUBE_TYPE, MATCH_RESULT } from "@/lib/generated/prisma/enums";

// ── Cubes ──────────────────────────────────────────────────────────────────
export type Cube = Cubes;
export type Archetype = Archetypes;
export { CUBE_TYPE };
export type TabKey = "all" | "CUBE" | "BATTLEBOX" | "TWOBERT";

// ── League ─────────────────────────────────────────────────────────────────
export type Player = Players;
export type Season = Seasons;
export type SeasonPlayerRow = SeasonPlayer;
export type Matchday = Matchdays;
export type Round = Rounds;
export type Match = Matches;
export type DecklistEntry = MatchdayDecklist;
export { MATCH_RESULT };

// ── Composed types ─────────────────────────────────────────────────────────
export type SeasonPlayerWithPlayer = SeasonPlayer & {
  player: Players;
};

export type MatchWithPlayers = Matches & {
  player1: SeasonPlayer & { player: Players };
  player2: (SeasonPlayer & { player: Players }) | null;
};

export type RoundWithMatches = Rounds & {
  matches: MatchWithPlayers[];
};

export type MatchdayWithRounds = Matchdays & {
  rounds: RoundWithMatches[];
  decklists?: Pick<MatchdayDecklist, 'id' | 'player_id' | 'matchday_id' | 'decklist_url'>[];
};

export type SeasonWithDetails = Seasons & {
  players: SeasonPlayerWithPlayer[];
  matchdays: MatchdayWithRounds[];
};

export type SeasonWithPlayers = Seasons & {
  players: SeasonPlayerWithPlayer[];
};
