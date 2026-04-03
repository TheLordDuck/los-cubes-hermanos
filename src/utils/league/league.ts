// /utils/league/league.ts
import { RawRound, RawPlayer, Jornada, PlayerStats } from "./types";

export function getMatchWR(wins: number, draws: number, losses: number) {
    const total = wins + losses + draws;
    return total === 0 ? 0 : wins / total;
}

export function getGameWR(gameWins: number, gameLosses: number) {
    const total = gameWins + gameLosses;
    return total === 0 ? 0 : gameWins / total;
}

export function computeJornada(rounds: RawRound[], decklistLink: string): Jornada {
    let matchWins = 0;
    let matchLosses = 0;
    let matchDraws = 0;
    let assistPoint = 1;
    let points = 0;

    for (const r of rounds) {
        if (r.wins > r.losses) matchWins++;
        else if (r.wins < r.losses) matchLosses++;
        else matchDraws++;
    }
    console.log("matchWins", matchWins, "matchLosses", matchLosses, "matchDraws", matchDraws);

    // Calcular bonus según resultado final de la jornada
    if (matchWins === 3) points += 3;
    if (matchWins === 2) points += 2;
    if (matchWins === 1) points += 1;
    // No hay bonus para otros resultados (1-2, 0-3, empates totales)

    //points = points + (matchWins * 2);
    //points = points + (matchDraws * 1);

    points = (points * 3) + assistPoint;

    return {
        rounds,
        points,
        matchWins,
        matchLosses,
        matchDraws,
        decklistLink
    };
}

export function getPlayerDetailedStats(player: RawPlayer, bestOf: number): PlayerStats {
    const jornadasStats = player.jornadas.map(j => computeJornada(j.rounds, j.decklistLink));
    const totalStats = {
        points: jornadasStats.reduce((sum, j) => sum + j.points, 0),
        matchWins: jornadasStats.reduce((sum, j) => sum + j.matchWins, 0),
        matchDraws: jornadasStats.reduce((sum, j) => sum + j.matchDraws, 0),
        matchLosses: jornadasStats.reduce((sum, j) => sum + j.matchLosses, 0),
        gameWins: jornadasStats.reduce((sum, j) => sum + j.rounds.reduce((a, r) => a + r.wins, 0), 0),
        gameLosses: jornadasStats.reduce((sum, j) => sum + j.rounds.reduce((a, r) => a + r.losses, 0), 0),
        decklistLink: jornadasStats.reduce((sum, j) => sum + j.decklistLink, ""),
    };
    const bestJornadas = jornadasStats
        .map((j, i) => ({ idx: i, points: j.points }))
        .sort((a, b) => b.points - a.points)
        .slice(0, bestOf)
        .map(j => j.idx);
    const bestStats = {
        points: bestJornadas.reduce((sum, i) => sum + jornadasStats[i].points, 0),
        matchWins: bestJornadas.reduce((sum, i) => sum + jornadasStats[i].matchWins, 0),
        matchDraws: bestJornadas.reduce((sum, i) => sum + jornadasStats[i].matchDraws, 0),
        matchLosses: bestJornadas.reduce((sum, i) => sum + jornadasStats[i].matchLosses, 0),
        gameWins: bestJornadas.reduce((sum, i) => sum + jornadasStats[i].rounds.reduce((a, r) => a + r.wins, 0), 0),
        gameLosses: bestJornadas.reduce((sum, i) => sum + jornadasStats[i].rounds.reduce((a, r) => a + r.losses, 0), 0)
    };
    return { jornadasStats, bestJornadas, bestStats, totalStats };
}

export function markBestJornadas(jornadasStats: Jornada[], bestJornadas: number[]): Jornada[] {
    return jornadasStats.map((j, i) => ({ ...j, counts: bestJornadas.includes(i) }));
}