import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { Season, Jornada } from "../../../utils/league/types";

type AddJornadaBody = {
    playerId: string;
    jornada: Jornada;
};

export async function POST(req: NextRequest) {
    const body: AddJornadaBody = await req.json();

    const filePath = path.join(process.cwd(), "data/season1.json");

    const raw = fs.readFileSync(filePath, "utf-8");
    const season: Season = JSON.parse(raw);

    const player = season.players.find((p) => p.id === body.playerId);

    if (!player) {
        return new Response("Player not found", { status: 404 });
    }

    player.jornadas.push(body.jornada);

    fs.writeFileSync(filePath, JSON.stringify(season, null, 2));

    return Response.json({ ok: true });
}