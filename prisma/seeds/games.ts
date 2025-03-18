import { prisma } from "../../src/prisma";
import { Publisher } from "@prisma/client";

export default async function seedGames(publishers: Publisher[]) {
  console.log('Seeding games...');
  
  try {
    // Make sure we have at least one publisher
    if (!publishers || publishers.length === 0) {
      console.warn('No publishers found. Using default publisher ID 1');
      publishers = [{ id: 1 } as Publisher];
    }

    const games = [
      {
        title: "Cosmic Explorers",
        publisherId: publishers[0].id,
        releaseDate: new Date("2024-01-15"),
        price: 59.99,
        discountPrice: 49.99,
        description: "Embark on an epic journey through the cosmos, discovering new planets and alien civilizations."
      },
      {
        title: "Medieval Kingdom",
        publisherId: publishers[0].id,
        releaseDate: new Date("2023-11-05"),
        price: 49.99,
        description: "Build and manage your medieval kingdom, form alliances, and conquer neighboring territories."
      },
      {
        title: "Cyber Nexus",
        publisherId: publishers[0].id,
        releaseDate: new Date("2024-03-22"),
        price: 69.99,
        discountPrice: 59.99,
        description: "Navigate a dystopian cyberpunk world filled with corporate espionage, advanced technology, and moral dilemmas."
      },
      {
        title: "Racing Evolution",
        publisherId: publishers[0].id,
        releaseDate: new Date("2023-08-30"),
        price: 39.99,
        description: "Experience high-speed racing with realistic physics and a variety of tracks and vehicles."
      },
      {
        title: "Fantasy Realms",
        publisherId: publishers[0].id,
        releaseDate: new Date("2024-02-10"),
        price: 54.99,
        discountPrice: 44.99,
        description: "Immerse yourself in a magical world of dragons, wizards, and ancient prophecies."
      },
      {
        title: "Urban Survival",
        publisherId: publishers[0].id,
        releaseDate: new Date("2023-10-18"),
        price: 44.99,
        description: "Survive in a post-apocalyptic urban environment, scavenging for resources and avoiding dangers."
      },
      {
        title: "Tactical Operations",
        publisherId: publishers[0].id,
        releaseDate: new Date("2024-04-05"),
        price: 59.99,
        description: "Lead a team of elite operatives on high-stakes missions requiring strategic planning and execution."
      },
      {
        title: "Puzzle Dimensions",
        publisherId: publishers[0].id,
        releaseDate: new Date("2023-09-12"),
        price: 29.99,
        discountPrice: 19.99,
        description: "Solve mind-bending puzzles across different dimensions with unique physics and mechanics."
      },
      {
        title: "Sports Championship",
        publisherId: publishers[0].id,
        releaseDate: new Date("2024-01-30"),
        price: 49.99,
        description: "Compete in various sports disciplines to become the ultimate champion."
      },
      {
        title: "Historical Conquest",
        publisherId: publishers[0].id,
        releaseDate: new Date("2023-12-08"),
        price: 54.99,
        discountPrice: 39.99,
        description: "Rewrite history by leading ancient civilizations to glory through diplomacy, trade, and warfare."
      }
    ];

    // Create multiple publishers if available
    if (publishers.length > 1) {
      for (let i = 1; i < Math.min(publishers.length, games.length); i++) {
        games[i].publisherId = publishers[i].id;
      }
    }

    const createdGames = [];
    for (const game of games) {
      const createdGame = await prisma.game.create({
        data: game
      });
      createdGames.push(createdGame);
    }

    console.log(`Successfully seeded ${createdGames.length} games`);
    return createdGames;
  } catch (error) {
    console.error('Error seeding games:', error);
    throw error;
  }
}