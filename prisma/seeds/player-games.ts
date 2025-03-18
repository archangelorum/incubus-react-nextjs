import { prisma } from "../../src/prisma";
import { Game, Player } from "@prisma/client";

export default async function seedPlayerGames(players: Player[], games: Game[]) {
  console.log('Seeding player-game relationships...');
  
  try {
    if (!players || players.length === 0) {
      throw new Error('No players provided for player-game seeding');
    }
    
    if (!games || games.length === 0) {
      throw new Error('No games provided for player-game seeding');
    }

    const createdPlayerGames = [];
    
    // Assign games to players with different patterns
    // Standard players will own fewer games than Premium players
    for (const player of players) {
      // Determine how many games this player should own based on player type
      const isPremium = player.type === 'Premium';
      const ownedGameCount = isPremium ? Math.floor(games.length * 0.8) : Math.floor(games.length * 0.4);
      
      // Select random games for this player
      const gameIndices = getRandomIndices(games.length, ownedGameCount);
      
      for (const index of gameIndices) {
        const game = games[index];
        
        // Randomly determine if some games are not owned (e.g., wishlisted)
        const owned = Math.random() > 0.2; // 80% chance of being owned
        
        try {
          const playerGame = await prisma.playerGame.create({
            data: {
              playerId: player.userId,
              gameId: game.id,
              owned: owned
            }
          });
          createdPlayerGames.push(playerGame);
        } catch (error: any) {
          console.warn(`Could not create player-game relationship (${player.userId}, ${game.id}): ${error.message || 'Unknown error'}`);
        }
      }
    }

    console.log(`Successfully seeded ${createdPlayerGames.length} player-game relationships`);
    return createdPlayerGames;
  } catch (error) {
    console.error('Error seeding player-game relationships:', error);
    throw error;
  }
}

// Helper function to get random indices without duplicates
function getRandomIndices(max: number, count: number): number[] {
  const indices = new Set<number>();
  
  // Make sure we don't try to get more indices than available
  const actualCount = Math.min(max, count);
  
  while (indices.size < actualCount) {
    const randomIndex = Math.floor(Math.random() * max);
    indices.add(randomIndex);
  }
  
  return Array.from(indices);
}