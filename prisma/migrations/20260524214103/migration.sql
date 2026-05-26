-- DropForeignKey
ALTER TABLE "Matches" DROP CONSTRAINT "Matches_player2_id_fkey";

-- AlterTable
ALTER TABLE "Matches" ALTER COLUMN "player2_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Matches" ADD CONSTRAINT "Matches_player2_id_fkey" FOREIGN KEY ("player2_id") REFERENCES "SeasonPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
