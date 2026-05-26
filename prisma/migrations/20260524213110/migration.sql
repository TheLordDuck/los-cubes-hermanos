/*
  Warnings:

  - You are about to drop the column `matchday_id` on the `Matches` table. All the data in the column will be lost.
  - You are about to drop the column `match_id` on the `Rounds` table. All the data in the column will be lost.
  - You are about to drop the column `p1_wins` on the `Rounds` table. All the data in the column will be lost.
  - You are about to drop the column `p2_wins` on the `Rounds` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[matchday_id,round_number]` on the table `Rounds` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `round_id` to the `Matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matchday_id` to the `Rounds` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Matchdays" DROP CONSTRAINT "Matchdays_season_id_fkey";

-- DropForeignKey
ALTER TABLE "Matches" DROP CONSTRAINT "Matches_matchday_id_fkey";

-- DropForeignKey
ALTER TABLE "Rounds" DROP CONSTRAINT "Rounds_match_id_fkey";

-- DropForeignKey
ALTER TABLE "SeasonPlayer" DROP CONSTRAINT "SeasonPlayer_season_id_fkey";

-- AlterTable
ALTER TABLE "Matches" DROP COLUMN "matchday_id",
ADD COLUMN     "is_bye" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "p1_games" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "p2_games" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "round_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Rounds" DROP COLUMN "match_id",
DROP COLUMN "p1_wins",
DROP COLUMN "p2_wins",
ADD COLUMN     "matchday_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SeasonPlayer" ADD COLUMN     "bye_wins" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Rounds_matchday_id_round_number_key" ON "Rounds"("matchday_id", "round_number");

-- AddForeignKey
ALTER TABLE "SeasonPlayer" ADD CONSTRAINT "SeasonPlayer_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "Seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matchdays" ADD CONSTRAINT "Matchdays_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "Seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rounds" ADD CONSTRAINT "Rounds_matchday_id_fkey" FOREIGN KEY ("matchday_id") REFERENCES "Matchdays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matches" ADD CONSTRAINT "Matches_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "Rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
