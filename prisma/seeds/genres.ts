import { prisma } from "../../src/prisma";

export default async function seedGenres() {
  console.log('Seeding genres...');
  
  try {
    const genres = [
      { id: 1, name: "Action" },
      { id: 2, name: "Adventure" },
      { id: 3, name: "RPG" },
      { id: 4, name: "Strategy" },
      { id: 5, name: "Simulation" },
      { id: 6, name: "Sports" },
      { id: 7, name: "Racing" },
      { id: 8, name: "Puzzle" },
      { id: 9, name: "Shooter" },
      { id: 10, name: "Platformer" },
      { id: 11, name: "Fighting" },
      { id: 12, name: "Stealth" },
      { id: 13, name: "Survival" },
      { id: 14, name: "Horror" },
      { id: 15, name: "MMORPG" },
    ];

    for (const genre of genres) {
      await prisma.genre.upsert({
        where: { id: genre.id },
        update: {},
        create: genre,
      });
    }

    console.log(`Successfully seeded ${genres.length} genres`);
    return genres;
  } catch (error) {
    console.error('Error seeding genres:', error);
    throw error;
  }
}