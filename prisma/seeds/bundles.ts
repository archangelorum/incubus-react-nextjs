import { prisma } from "../../src/prisma";
import { Game } from "@prisma/client";

export default async function seedBundles(games: Game[]) {
  console.log('Seeding bundles...');
  
  try {
    if (!games || games.length === 0) {
      throw new Error('No games provided for bundle seeding');
    }

    // Create bundles with discounted prices
    const bundles = [
      {
        title: "Adventure Pack",
        discountPrice: 89.99,
        gameIds: [0, 2, 4] // Cosmic Explorers, Cyber Nexus, Fantasy Realms
      },
      {
        title: "Strategy Collection",
        discountPrice: 79.99,
        gameIds: [1, 6, 9] // Medieval Kingdom, Tactical Operations, Historical Conquest
      },
      {
        title: "Casual Gaming Bundle",
        discountPrice: 49.99,
        gameIds: [3, 7, 8] // Racing Evolution, Puzzle Dimensions, Sports Championship
      },
      {
        title: "Immersive Worlds",
        discountPrice: 99.99,
        gameIds: [0, 4, 5, 9] // Cosmic Explorers, Fantasy Realms, Urban Survival, Historical Conquest
      },
      {
        title: "Action Packed",
        discountPrice: 69.99,
        gameIds: [0, 2, 6] // Cosmic Explorers, Cyber Nexus, Tactical Operations
      }
    ];

    const createdBundles = [];
    
    for (const bundle of bundles) {
      // Create the bundle
      const createdBundle = await prisma.bundle.create({
        data: {
          title: bundle.title,
          discountPrice: bundle.discountPrice
        }
      });
      
      // Create bundle-game relationships
      for (const gameIndex of bundle.gameIds) {
        // Make sure the game index is valid
        if (gameIndex >= 0 && gameIndex < games.length) {
          try {
            await prisma.bundleGame.create({
              data: {
                bundleId: createdBundle.id,
                gameId: games[gameIndex].id
              }
            });
          } catch (error: any) {
            console.warn(`Could not add game ${games[gameIndex].id} to bundle ${createdBundle.id}: ${error.message || 'Unknown error'}`);
          }
        } else {
          console.warn(`Invalid game index ${gameIndex} for bundle ${createdBundle.title}`);
        }
      }
      
      createdBundles.push(createdBundle);
    }

    console.log(`Successfully seeded ${createdBundles.length} bundles`);
    return createdBundles;
  } catch (error) {
    console.error('Error seeding bundles:', error);
    throw error;
  }
}