// prisma/seed.ts

import { prisma } from "@/lib/prisma";
import { CUBE_TYPE } from "@/types/cube";

const cubes = [
  {
    code: "30025e64-1510-4d7b-981e-7ae58472aa09",
    name: "100 Ornithopters",
    type: CUBE_TYPE.CUBE,
    difficulty: "medium",
    isTwobert: false,
    imageUrl: "",
  },
  {
    code: "30025e64-1510-4d7b-981e-7ae58472aa10",
    name: "A Study in Harmony",
    type: CUBE_TYPE.CUBE,
    difficulty: "hard",
    isTwobert: false,
    imageUrl: "",
  },
  {
    code: "30025e64-1510-4d7b-981e-7ae58472aa11",
    name: "Avatar: The Last Airbender",
    type: CUBE_TYPE.CUBE,
    difficulty: "easy",
    isTwobert: false,
    imageUrl: "",
  },
  {
    code: "30025e64-1510-4d7b-981e-7ae58472aa12",
    name: "Bolt Cube",
    type: CUBE_TYPE.CUBE,
    difficulty: "easy",
    isTwobert: false,
    imageUrl: "",
  },
  {
    code: "30025e64-1510-4d7b-981e-7ae58472aa13",
    name: "Brandon Sanderson Commander Cube",
    type: CUBE_TYPE.CUBE,
    difficulty: "hard",
    isTwobert: true,
    imageUrl: "",
  },
  {
    code: "30025e64-1510-4d7b-981e-7ae58472aa14",
    name: "DESCEND INTO AVERNUS",
    type: CUBE_TYPE.CUBE,
    difficulty: "medium",
    isTwobert: false,
    imageUrl: "",
  },
  {
    code: "30025e64-1510-4d7b-981e-7ae58472aa15",
    name: "Devoid Cube",
    type: CUBE_TYPE.CUBE,
    difficulty: "medium",
    isTwobert: false,
    imageUrl: "",
  },
  {
    code: "30025e64-1510-4d7b-981e-7ae58472aa16",
    name: "Dominaria United",
    type: CUBE_TYPE.CUBE,
    difficulty: "easy",
    isTwobert: false,
    imageUrl: "",
  },
];

async function main() {
  console.log("Seeding cubes...");
  for (const cube of cubes) {
    await prisma.cubes.create({ data: cube });
  }
  console.log(`Seeded ${cubes.length} cubes.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
