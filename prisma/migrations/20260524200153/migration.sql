/*
  Warnings:

  - The primary key for the `Cubes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Cubes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[code]` on the table `Cubes` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `cube_id` on the `Archetypes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `code` to the `Cubes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Archetypes" DROP CONSTRAINT "Archetypes_cube_id_fkey";

-- AlterTable
ALTER TABLE "Archetypes" DROP COLUMN "cube_id",
ADD COLUMN     "cube_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Cubes" DROP CONSTRAINT "Cubes_pkey",
ADD COLUMN     "code" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Cubes_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Cubes_code_key" ON "Cubes"("code");

-- AddForeignKey
ALTER TABLE "Archetypes" ADD CONSTRAINT "Archetypes_cube_id_fkey" FOREIGN KEY ("cube_id") REFERENCES "Cubes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
