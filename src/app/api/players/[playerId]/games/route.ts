import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { createSuccessResponse, createErrorResponse, handleApiError } from "../../../types";
import { PlatformStaffRole } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";

const playerGameAddSchema = z.object({
  gameId: z.number().int().positive(),
  owned: z.boolean().default(true)
});

// Helper function to check roles for auth-wrapped handlers
const checkAuthRole = async (request: any, allowedRoles: PlatformStaffRole[]) => {
  if (!request.auth?.user?.id) {
    throw new Error('Unauthorized access');
  }

  const platformStaff = await prisma.platformStaff.findUnique({
    where: { userId: request.auth.user.id }
  });

  if (!platformStaff) {
    throw new Error('Insufficient permissions');
  }

  const hasValidRole = allowedRoles.includes(platformStaff.role);
  if (!hasValidRole) {
    throw new Error('Insufficient permissions');
  }

  return { userId: request.auth.user.id, role: platformStaff.role };
};

/**
 * @route GET /api/players/:playerId/games
 * @description Get all games owned by a player
 * @access Private - Platform Staff or the player themselves
 */
export const GET = auth(async function GET(request) {
  try {
    const params = request.nextUrl.pathname.split('/');
    const playerId = params[params.length - 2]; // Get playerId from URL
    
    if (!playerId) {
      return createErrorResponse("Invalid player ID", 400);
    }

    // Get authenticated user ID
    const authUserId = request.auth?.user?.id;
    if (!authUserId) {
      return createErrorResponse("Unauthorized access", 401);
    }

    // Check if user is platform staff
    const platformStaff = await prisma.platformStaff.findUnique({
      where: { userId: authUserId }
    });

    const isPlatformStaff = !!platformStaff;

    // Check if user is the player themselves
    const isSelfAccess = playerId === authUserId;

    // Only allow access if user is platform staff or the player themselves
    if (!isPlatformStaff && !isSelfAccess) {
      return createErrorResponse("Insufficient permissions", 403);
    }

    // Check if player exists
    const player = await prisma.player.findUnique({
      where: { userId: playerId }
    });

    if (!player) {
      return createErrorResponse("Player not found", 404);
    }

    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Get player games
    const playerGames = await prisma.playerGame.findMany({
      where: { playerId },
      include: {
        game: {
          include: {
            publisher: {
              select: {
                id: true,
                name: true
              }
            },
            gameGenres: {
              include: {
                genre: true
              }
            }
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        game: {
          title: 'asc'
        }
      }
    });

    const totalGames = await prisma.playerGame.count({
      where: { playerId }
    });

    return createSuccessResponse({
      playerGames,
      pagination: {
        page,
        limit,
        total: totalGames
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * @route POST /api/players/:playerId/games
 * @description Add a game to a player's library
 * @access Private - Platform Staff or the player themselves
 */
export const POST = auth(async function POST(request) {
  try {
    const params = request.nextUrl.pathname.split('/');
    const playerId = params[params.length - 2]; // Get playerId from URL
    
    if (!playerId) {
      return createErrorResponse("Invalid player ID", 400);
    }

    // Get authenticated user ID
    const authUserId = request.auth?.user?.id;
    if (!authUserId) {
      return createErrorResponse("Unauthorized access", 401);
    }

    // Check if user is platform staff
    const platformStaff = await prisma.platformStaff.findUnique({
      where: { userId: authUserId }
    });

    const isPlatformStaff = !!platformStaff;

    // Check if user is the player themselves
    const isSelfAccess = playerId === authUserId;

    // Only allow access if user is platform staff or the player themselves
    if (!isPlatformStaff && !isSelfAccess) {
      return createErrorResponse("Insufficient permissions", 403);
    }

    // Check if player exists
    const player = await prisma.player.findUnique({
      where: { userId: playerId }
    });

    if (!player) {
      return createErrorResponse("Player not found", 404);
    }

    // Validate request body
    const body = await request.json();
    const validation = playerGameAddSchema.safeParse(body);
    
    if (!validation.success) {
      return createErrorResponse(validation.error.message, 400);
    }

    const { gameId, owned } = validation.data;

    // Check if game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId }
    });

    if (!game) {
      return createErrorResponse("Game not found", 404);
    }

    // Check if player already has this game
    const existingPlayerGame = await prisma.playerGame.findFirst({
      where: {
        playerId,
        gameId
      }
    });

    if (existingPlayerGame) {
      // Update owned status if it's different
      if (existingPlayerGame.owned !== owned) {
        const updatedPlayerGame = await prisma.playerGame.update({
          where: {
            playerId_gameId: {
              playerId,
              gameId
            }
          },
          data: { owned },
          include: {
            game: true
          }
        });
        return createSuccessResponse({
          playerGame: updatedPlayerGame,
          message: "Game ownership status updated"
        });
      }
      return createErrorResponse("Player already has this game", 409);
    }

    // Add game to player's library
    const playerGame = await prisma.playerGame.create({
      data: {
        playerId,
        gameId,
        owned
      },
      include: {
        game: {
          include: {
            publisher: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    return createSuccessResponse({
      playerGame,
      message: "Game added to player's library"
    });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * @route DELETE /api/players/:playerId/games
 * @description Remove a game from a player's library
 * @access Private - Platform Staff or the player themselves
 */
export const DELETE = auth(async function DELETE(request) {
  try {
    const params = request.nextUrl.pathname.split('/');
    const playerId = params[params.length - 2]; // Get playerId from URL
    
    if (!playerId) {
      return createErrorResponse("Invalid player ID", 400);
    }

    // Get authenticated user ID
    const authUserId = request.auth?.user?.id;
    if (!authUserId) {
      return createErrorResponse("Unauthorized access", 401);
    }

    // Check if user is platform staff
    const platformStaff = await prisma.platformStaff.findUnique({
      where: { userId: authUserId }
    });

    const isPlatformStaff = !!platformStaff;

    // Check if user is the player themselves
    const isSelfAccess = playerId === authUserId;

    // Only allow access if user is platform staff or the player themselves
    if (!isPlatformStaff && !isSelfAccess) {
      return createErrorResponse("Insufficient permissions", 403);
    }

    // Check if player exists
    const player = await prisma.player.findUnique({
      where: { userId: playerId }
    });

    if (!player) {
      return createErrorResponse("Player not found", 404);
    }

    // Get game ID from request body
    const { gameId } = await request.json();
    
    if (!gameId) {
      return createErrorResponse("Game ID is required", 400);
    }

    // Check if player has this game
    const playerGame = await prisma.playerGame.findFirst({
      where: {
        playerId,
        gameId
      }
    });

    if (!playerGame) {
      return createErrorResponse("Game not found in player's library", 404);
    }

    // Remove game from player's library
    await prisma.playerGame.delete({
      where: {
        playerId_gameId: {
          playerId,
          gameId
        }
      }
    });

    return createSuccessResponse({
      message: "Game removed from player's library"
    });
  } catch (error) {
    return handleApiError(error);
  }
});