// /utils/league/types.ts
export interface RawRound {
    wins: number;
    losses: number;
    draws?: number; // Nuevo: partidas empatadas en la ronda
}

export interface RawJornada { rounds: RawRound[]; }
export interface RawPlayer { id: string; name: string; jornadas: RawJornada[]; }
export interface RawSeason { id: string; bestOf: number; players: RawPlayer[]; }

export interface Jornada {
    rounds: RawRound[];
    points: number;
    matchWins: number;
    matchLosses: number;
    matchDraws: number;
    counts?: boolean; // bestOf marker
}

export interface PlayerStats {
    jornadasStats: Jornada[];
    bestJornadas: number[];
    bestStats: {
        points: number;
        matchWins: number;
        matchDraws: number;
        matchLosses: number;
        gameWins: number;
        gameLosses: number;
    };
    totalStats: {
        points: number;
        matchWins: number;
        matchDraws: number;
        matchLosses: number;
        gameWins: number;
        gameLosses: number;
    };
}

export interface Player {
    id: string;
    name: string;
    jornadas: Jornada[];
    stats?: PlayerStats;
}

export interface Season {
    id: string;
    bestOf: number;
    players: Player[];
}