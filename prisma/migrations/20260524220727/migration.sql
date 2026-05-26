-- CreateTable
CREATE TABLE "MatchdayDecklist" (
    "id" SERIAL NOT NULL,
    "matchday_id" INTEGER NOT NULL,
    "player_id" INTEGER NOT NULL,
    "decklist_url" TEXT NOT NULL,

    CONSTRAINT "MatchdayDecklist_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MatchdayDecklist" ADD CONSTRAINT "MatchdayDecklist_matchday_id_fkey" FOREIGN KEY ("matchday_id") REFERENCES "Matchdays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchdayDecklist" ADD CONSTRAINT "MatchdayDecklist_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "SeasonPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
