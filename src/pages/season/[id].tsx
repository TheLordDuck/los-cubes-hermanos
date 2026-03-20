"use client";

import { useState } from "react";
import seasonRaw from "@/data/season-2026.json";
import {
  getPlayerDetailedStats,
  markBestJornadas,
  getMatchWR,
  getGameWR,
} from "@/utils/league/league";

import { HeaderCubeDetail } from "@/components/Header/HeaderCubeDetail";
import "../../app/globals.css";
import { WideFooter } from "@/components/Footer/WideFooter";

const season = {
  ...seasonRaw,
  players: seasonRaw.players.map((p) => ({
    ...p,
    stats: getPlayerDetailedStats(p, seasonRaw.bestOf),
  })),
};

export default function SeasonPage() {
  const [activePlayerId, setActivePlayerId] = useState(season.players[0].id);

  const sortedPlayers = [...season.players].sort(
    (a, b) => b.stats.bestStats.points - a.stats.bestStats.points,
  );

  const activePlayer =
    sortedPlayers.find((p) => p.id === activePlayerId) || sortedPlayers[0];

  const jornadas = markBestJornadas(
    activePlayer.stats.jornadasStats,
    activePlayer.stats.bestJornadas,
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HeaderCubeDetail />

      <main className="flex-grow container mx-auto px-4 py-8 pb-32 md:pb-8">
        {/* TITLE */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Season {season.id}
        </h1>

        {/* STANDINGS */}
        <div className="bg-white rounded-xl shadow-sm border mb-8 overflow-hidden">
          <h2 className="text-lg font-semibold p-4 border-b bg-gray-50">
            Standings
          </h2>

          <table className="w-full text-sm">
            <thead className="text-gray-500">
              <tr className="text-left">
                <th className="p-3">#</th>
                <th className="p-3">Player</th>
                <th className="p-3 text-center">Pts</th>
                <th className="p-3 text-center">Match WR</th>
                <th className="p-3 text-center">Game WR</th>
              </tr>
            </thead>

            <tbody>
              {sortedPlayers.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-t ${
                    p.jornadas.length < season.bestOf
                      ? "bg-red-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <td className="p-3 text-gray-800 font-medium">{i + 1}</td>

                  <td className="p-3">
                    <button
                      onClick={() => setActivePlayerId(p.id)}
                      className="font-medium text-gray-800 hover:text-cyan-700"
                    >
                      {p.name}
                    </button>
                  </td>

                  <td className="p-3 text-gray-800 text-center font-semibold">
                    {p.stats.bestStats.points}
                  </td>

                  <td className="p-3 text-gray-800 text-center">
                    {(
                      getMatchWR(
                        p.stats.totalStats.matchWins,
                        p.stats.totalStats.matchDraws,
                        p.stats.totalStats.matchLosses,
                      ) * 100
                    ).toFixed(1)}
                    %
                  </td>

                  <td className="p-3 text-gray-800 text-center">
                    {(
                      getGameWR(
                        p.stats.totalStats.gameWins,
                        p.stats.totalStats.gameLosses,
                      ) * 100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PLAYER TABS */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="flex flex-wrap gap-2 p-4 border-b">
            {sortedPlayers.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePlayerId(p.id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  p.id === activePlayerId
                    ? "bg-cyan-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* PLAYER CONTENT */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {activePlayer.name}
            </h2>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-sm text-gray-500">Best {season.bestOf}</p>
                <p className="text-xl font-bold text-gray-900">
                  {activePlayer.stats.bestStats.points} pts
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-sm text-gray-500">Match WR</p>
                <p className="text-xl font-bold text-gray-900">
                  {(
                    getMatchWR(
                      activePlayer.stats.totalStats.matchWins,
                      activePlayer.stats.totalStats.matchDraws,
                      activePlayer.stats.totalStats.matchLosses,
                    ) * 100
                  ).toFixed(1)}
                  %
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-sm text-gray-500">Game WR</p>
                <p className="text-xl font-bold text-gray-900">
                  {(
                    getGameWR(
                      activePlayer.stats.totalStats.gameWins,
                      activePlayer.stats.totalStats.gameLosses,
                    ) * 100
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </div>

            {/* JORNADAS */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-center">
                <thead className="text-gray-500 border-b">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">Pts</th>
                    <th className="p-2">W</th>
                    <th className="p-2">D</th>
                    <th className="p-2">L</th>
                    <th className="p-2">⭐</th>
                    <th className="p-2">Rounds</th>
                  </tr>
                </thead>

                <tbody>
                  {jornadas.map((j, i) => (
                    <tr
                      key={i}
                      className={`border-t ${
                        j.counts ? "bg-yellow-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="p-2 text-gray-800">{i + 1}</td>
                      <td className="p-2 font-semibold">{j.points}</td>
                      <td className="p-2 text-gray-800">{j.matchWins}</td>
                      <td className="p-2 text-gray-800">{j.matchDraws}</td>
                      <td className="p-2 text-gray-800">{j.matchLosses}</td>
                      <td className="p-2">{j.counts && "⭐"}</td>
                      <td className="p-2 text-gray-800 text-xs">
                        <strong>
                          {j.matchWins}-{j.matchLosses}-{j.matchDraws}
                        </strong>{" "}
                        |{" "}
                        {j.rounds
                          .map((r) => `${r.wins}-${r.losses}`)
                          .join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <WideFooter />
    </div>
  );
}
