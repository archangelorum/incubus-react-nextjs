import { prisma } from "../../src/prisma";
import { Game, Genre } from "@prisma/client";

export default async function seedGameGenres(games: Game[], genres: Genre[]) {
  console.log('Seeding game-genre relationships...');
  
  try {
    if (!games || games.length === 0) {
      throw new Error('No games provided for game-genre seeding');
    }
    
    if (!genres || genres.length === 0) {
      throw new Error('No genres provided for game-genre seeding');
    }

    // Game-genre mappings - each game will have 1-3 genres
    const gameGenreMappings = [
      // Cosmic Explorers: Action, Adventure, RPG
      { gameId: games[0].id, genreIds: [1, 2, 3] },
      
      // Medieval Kingdom: Strategy, Simulation
      { gameId: games[1].id, genreIds: [4, 5] },
      
      // Cyber Nexus: Action, RPG, Stealth
      { gameId: games[2].id, genreIds: [1, 3, 12] },
      
      // Racing Evolution: Racing, Sports
      { gameId: games[3].id, genreIds: [7, 6] },
      
      // Fantasy Realms: RPG, Adventure
      { gameId: games[4].id, genreIds: [3, 2] },
      
      // Urban Survival: Survival, Horror
      { gameId: games[5].id, genreIds: [13, 14] },
      
      // Tactical Operations: Strategy, Shooter
      { gameId: games[6].id, genreIds: [4, 9] },
      
      // Puzzle Dimensions: Puzzle, Adventure
      { gameId: games[7].id, genreIds: [8, 2] },
      
      // Sports Championship: Sports
      { gameId: games[8].id, genreIds: [6] },
      
      // Historical Conquest: Strategy, Simulation
      { gameId: games[9].id, genreIds: [4, 5] }
    ];

    const createdGameGenres = [];
    
    for (const mapping of gameGenreMappings) {
      // Make sure the game exists in our array
      const gameExists = games.some(g => g.id === mapping.gameId);
      if (!gameExists) {
        console.warn(`Game with ID ${mapping.gameId} not found, skipping genre mappings`);
        continue;
      }
      
      for (const genreId of mapping.genreIds) {
        // Make sure the genre exists in our array
        const genreExists = genres.some(g => g.id === genreId);
        if (!genreExists) {
          console.warn(`Genre with ID ${genreId} not found, skipping mapping`);
          continue;
        }
        
        try {
          const gameGenre = await prisma.gameGenre.create({
            data: {
              gameId: mapping.gameId,
              genreId: genreId
            }
          });
          createdGameGenres.push(gameGenre);
        } catch (error: any) {
          // Handle potential duplicate key errors
          console.warn(`Could not create game-genre relationship (${mapping.gameId}, ${genreId}): ${error.message || 'Unknown error'}`);
        }
      }
    }

    console.log(`Successfully seeded ${createdGameGenres.length} game-genre relationships`);
    return createdGameGenres;
  } catch (error) {
    console.error('Error seeding game-genre relationships:', error);
    throw error;
  }
}