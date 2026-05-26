/*
  Warnings:

  - The primary key for the `Cubes` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Archetypes" DROP CONSTRAINT "Archetypes_cube_id_fkey";

-- AlterTable
ALTER TABLE "Archetypes" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "cube_id" SET DATA TYPE TEXT;
DROP SEQUENCE "Archetypes_id_seq";

-- AlterTable
ALTER TABLE "Cubes" DROP CONSTRAINT "Cubes_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Cubes_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Cubes_id_seq";

-- AddForeignKey
ALTER TABLE "Archetypes" ADD CONSTRAINT "Archetypes_cube_id_fkey" FOREIGN KEY ("cube_id") REFERENCES "Cubes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
