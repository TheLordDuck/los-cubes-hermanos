-- CreateEnum
CREATE TYPE "CUBE_TYPE" AS ENUM ('CUBE', 'BATTLEBOX');

-- CreateTable
CREATE TABLE "Cubes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "type" "CUBE_TYPE" NOT NULL,
    "isTwobert" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cubes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Archetypes" (
    "id" SERIAL NOT NULL,
    "cube_id" INTEGER NOT NULL,
    "colorPair" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,

    CONSTRAINT "Archetypes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Archetypes" ADD CONSTRAINT "Archetypes_cube_id_fkey" FOREIGN KEY ("cube_id") REFERENCES "Cubes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
