import { prisma } from "../../src/prisma";
import { Game, Player, PlayerGame } from "@prisma/client";

export default async function seedReviews(players: Player[], games: Game[], playerGames: PlayerGame[]) {
  console.log('Seeding reviews...');
  
  try {
    if (!players || players.length === 0) {
      throw new Error('No players provided for review seeding');
    }
    
    if (!games || games.length === 0) {
      throw new Error('No games provided for review seeding');
    }
    
    if (!playerGames || playerGames.length === 0) {
      throw new Error('No player-game relationships provided for review seeding');
    }

    const createdReviews = [];
    
    // Only create reviews for games that players own
    const ownedPlayerGames = playerGames.filter(pg => pg.owned);
    
    // Generate reviews with different ratings and comments
    for (const playerGame of ownedPlayerGames) {
      // Not all owned games will have reviews (70% chance)
      if (Math.random() > 0.3) {
        // Generate a random rating between 1 and 5
        const rating = Math.floor(Math.random() * 5) + 1;
        
        // Generate a comment based on the rating
        let comment = '';
        
        switch (rating) {
          case 1:
            comment = getRandomComment([
              "Extremely disappointed with this game. Would not recommend.",
              "Terrible experience. Lots of bugs and poor gameplay.",
              "Waste of money. Don't buy this game.",
              "One of the worst games I've ever played.",
              "Unplayable due to technical issues and poor design."
            ]);
            break;
          case 2:
            comment = getRandomComment([
              "Below average. Has potential but falls short in many areas.",
              "Some good ideas but poorly executed.",
              "Mediocre gameplay with too many issues to enjoy.",
              "Not worth the price. Wait for a deep discount.",
              "Disappointing compared to what was advertised."
            ]);
            break;
          case 3:
            comment = getRandomComment([
              "Average game. Nothing special but decent enough.",
              "Has its moments but also some frustrating aspects.",
              "Okay for casual play but lacks depth.",
              "Middle of the road. Neither great nor terrible.",
              "Decent game that could have been better with more polish."
            ]);
            break;
          case 4:
            comment = getRandomComment([
              "Really enjoyable game with minor issues.",
              "Great gameplay and story. Highly recommended.",
              "One of the better games I've played recently.",
              "Very good experience overall. Worth the price.",
              "Impressive game with lots of content to enjoy."
            ]);
            break;
          case 5:
            comment = getRandomComment([
              "Masterpiece! Absolutely loved every minute of it.",
              "Perfect in almost every way. A must-play game.",
              "One of the best games I've ever experienced.",
              "Incredible gameplay, story, and visuals. 10/10",
              "Outstanding game that sets a new standard for the genre."
            ]);
            break;
        }
        
        // Create the review with a random date in the past 6 months
        const createdAt = new Date();
        createdAt.setMonth(createdAt.getMonth() - Math.floor(Math.random() * 6));
        
        try {
          const review = await prisma.review.create({
            data: {
              playerId: playerGame.playerId,
              gameId: playerGame.gameId,
              rating: rating,
              comment: comment,
              createdAt: createdAt
            }
          });
          createdReviews.push(review);
        } catch (error: any) {
          console.warn(`Could not create review for player ${playerGame.playerId} and game ${playerGame.gameId}: ${error.message || 'Unknown error'}`);
        }
      }
    }

    console.log(`Successfully seeded ${createdReviews.length} reviews`);
    return createdReviews;
  } catch (error) {
    console.error('Error seeding reviews:', error);
    throw error;
  }
}

// Helper function to get a random comment from an array
function getRandomComment(comments: string[]): string {
  const randomIndex = Math.floor(Math.random() * comments.length);
  return comments[randomIndex];
}