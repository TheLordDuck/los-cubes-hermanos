-- CreateEnum
CREATE TYPE "MATCH_RESULT" AS ENUM ('PENDING', 'P1_WIN', 'P2_WIN', 'DRAW');

-- CreateTable
CREATE TABLE "Players" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "Players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seasons" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonPlayer" (
    "id" SERIAL NOT NULL,
    "season_id" INTEGER NOT NULL,
    "player_id" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SeasonPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matchdays" (
    "id" SERIAL NOT NULL,
    "season_id" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "played_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Matchdays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matches" (
    "id" SERIAL NOT NULL,
    "matchday_id" INTEGER NOT NULL,
    "player1_id" INTEGER NOT NULL,
    "player2_id" INTEGER NOT NULL,
    "decklist_p1" TEXT,
    "decklist_p2" TEXT,
    "result" "MATCH_RESULT" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rounds" (
    "id" SERIAL NOT NULL,
    "match_id" INTEGER NOT NULL,
    "round_number" INTEGER NOT NULL,
    "p1_wins" INTEGER NOT NULL DEFAULT 0,
    "p2_wins" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Rounds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Players_username_key" ON "Players"("username");

-- CreateIndex
CREATE UNIQUE INDEX "SeasonPlayer_season_id_player_id_key" ON "SeasonPlayer"("season_id", "player_id");

-- CreateIndex
CREATE UNIQUE INDEX "Matchdays_season_id_number_key" ON "Matchdays"("season_id", "number");

-- AddForeignKey
ALTER TABLE "SeasonPlayer" ADD CONSTRAINT "SeasonPlayer_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "Seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonPlayer" ADD CONSTRAINT "SeasonPlayer_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matchdays" ADD CONSTRAINT "Matchdays_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "Seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matches" ADD CONSTRAINT "Matches_matchday_id_fkey" FOREIGN KEY ("matchday_id") REFERENCES "Matchdays"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matches" ADD CONSTRAINT "Matches_player1_id_fkey" FOREIGN KEY ("player1_id") REFERENCES "SeasonPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matches" ADD CONSTRAINT "Matches_player2_id_fkey" FOREIGN KEY ("player2_id") REFERENCES "SeasonPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rounds" ADD CONSTRAINT "Rounds_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "Matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
