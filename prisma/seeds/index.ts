import { prisma } from "../../src/prisma";
import seedUsers from "./users";
import seedGenres from "./genres";
import seedGames from "./games";
import seedGameGenres from "./game-genres";
import seedBundles from "./bundles";
import seedPlayerGames from "./player-games";
import seedReviews from "./reviews";
import { Player, Publisher } from "@prisma/client";

export default async function seedAll() {
  console.log('Starting database seeding process...');
  console.log('-----------------------------------');
  
  try {
    // Step 1: Seed users (platform staff, publishers, publisher staff, players)
    console.log('\n📊 Step 1: Seeding users and related entities');
    const { publishers, players } = await seedUsersWithReturn();
    
    // Step 2: Seed genres
    console.log('\n📊 Step 2: Seeding genres');
    const genres = await seedGenres();
    
    // Step 3: Seed games
    console.log('\n📊 Step 3: Seeding games');
    const games = await seedGames(publishers);
    
    // Step 4: Seed game-genre relationships
    console.log('\n📊 Step 4: Seeding game-genre relationships');
    await seedGameGenres(games, genres);
    
    // Step 5: Seed bundles and bundle-game relationships
    console.log('\n📊 Step 5: Seeding bundles');
    await seedBundles(games);
    
    // Step 6: Seed player-game relationships
    console.log('\n📊 Step 6: Seeding player-game relationships');
    const playerGames = await seedPlayerGames(players, games);
    
    // Step 7: Seed reviews
    console.log('\n📊 Step 7: Seeding reviews');
    await seedReviews(players, games, playerGames);
    
    console.log('\n-----------------------------------');
    console.log('✅ Database seeding completed successfully!');
    
    // Print some statistics
    const stats = await getDataStats();
    console.log('\n📈 Database Statistics:');
    Object.entries(stats).forEach(([key, value]) => {
      console.log(`   - ${key}: ${value}`);
    });
    
  } catch (error) {
    console.error('❌ Error during seeding process:', error);
    throw error;
  }
}

// Helper function to get users, publishers, and players from the seedUsers function
async function seedUsersWithReturn(): Promise<{ publishers: Publisher[], players: Player[] }> {
  // Call the original seedUsers function
  await seedUsers();
  
  // Fetch the created publishers and players
  const publishers = await prisma.publisher.findMany();
  const players = await prisma.player.findMany({
    include: {
      user: true
    }
  });
  
  return { publishers, players };
}

// Helper function to get statistics about the seeded data
async function getDataStats() {
  const userCount = await prisma.user.count();
  const platformStaffCount = await prisma.platformStaff.count();
  const publisherCount = await prisma.publisher.count();
  const publisherStaffCount = await prisma.publisherStaff.count();
  const playerCount = await prisma.player.count();
  const gameCount = await prisma.game.count();
  const genreCount = await prisma.genre.count();
  const gameGenreCount = await prisma.gameGenre.count();
  const bundleCount = await prisma.bundle.count();
  const bundleGameCount = await prisma.bundleGame.count();
  const playerGameCount = await prisma.playerGame.count();
  const reviewCount = await prisma.review.count();
  
  return {
    'Users': userCount,
    'Platform Staff': platformStaffCount,
    'Publishers': publisherCount,
    'Publisher Staff': publisherStaffCount,
    'Players': playerCount,
    'Games': gameCount,
    'Genres': genreCount,
    'Game-Genre Relationships': gameGenreCount,
    'Bundles': bundleCount,
    'Bundle-Game Relationships': bundleGameCount,
    'Player-Game Relationships': playerGameCount,
    'Reviews': reviewCount
  };
}