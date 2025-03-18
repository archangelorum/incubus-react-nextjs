import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { createSuccessResponse, createErrorResponse, handleApiError, Role } from "../../types";
import { PlatformStaffRole, PublisherStaffRole } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";

const gameUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  publisherId: z.number().int().optional(),
  releaseDate: z.coerce.date().optional(),
  price: z.number().positive().optional(),
  discountPrice: z.number().positive().nullable().optional(),
  description: z.string().min(10).optional(),
  genreIds: z.array(z.number().int()).optional()
});

// Helper function to check roles for auth-wrapped handlers
const checkAuthRole = async (request: any, allowedRoles: Role[]) => {
  if (!request.auth?.user?.id) {
    throw new Error('Unauthorized access');
  }

  const platformStaff = await prisma.platformStaff.findUnique({
    where: { userId: request.auth.user.id }
  });

  const publisherStaff = await prisma.publisherStaff.findUnique({
    where: { userId: request.auth.user.id }
  });

  const userRoles: Role[] = [];
  if (platformStaff) userRoles.push(platformStaff.role);
  if (publisherStaff) userRoles.push(publisherStaff.role);
  
  const hasValidRole = userRoles.some(role => allowedRoles.includes(role));
  if (!hasValidRole) {
    throw new Error('Insufficient permissions');
  }

  return { userRoles, userId: request.auth.user.id };
};

/**
 * @route GET /api/games/:gameId
 * @description Get a specific game by ID
 * @access Public
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const gameId = parseInt(params.gameId);
    if (isNaN(gameId)) {
      return createErrorResponse("Invalid game ID", 400);
    }

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        publisher: true,
        gameGenres: { include: { genre: true } },
        reviews: {
          include: {
            player: {
              select: {
                userId: true,
                user: {
                  select: {
                    name: true,
                    image: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!game) {
      return createErrorResponse("Game not found", 404);
    }

    return createSuccessResponse(game);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * @route PUT /api/games/:gameId
 * @description Update a specific game
 * @access Private - Publisher or Admin
 */
export const PUT = auth(async function PUT(request) {
  try {
    const params = request.nextUrl.pathname.split('/');
    const gameIdStr = params[params.length - 1];
    const gameId = parseInt(gameIdStr);
    
    if (isNaN(gameId)) {
      return createErrorResponse("Invalid game ID", 400);
    }

    // Check if game exists
    const existingGame = await prisma.game.findUnique({
      where: { id: gameId },
      include: { publisher: true }
    });

    if (!existingGame) {
      return createErrorResponse("Game not found", 404);
    }

    // Validate request body
    const body = await request.json();
    const validation = gameUpdateSchema.safeParse(body);
    
    if (!validation.success) {
      return createErrorResponse(validation.error.message, 400);
    }

    // Check permissions - Publisher of this game or Platform Admin
    const { userId } = await checkAuthRole(request, [
      PlatformStaffRole.Admin, 
      PlatformStaffRole.Owner,
      PublisherStaffRole.Publisher
    ]);

    // If user is a publisher, verify they own this game
    const publisherStaff = await prisma.publisherStaff.findUnique({
      where: { userId }
    });

    if (publisherStaff?.role === PublisherStaffRole.Publisher && 
        publisherStaff.publisherId !== existingGame.publisherId) {
      return createErrorResponse("You can only update games from your publisher", 403);
    }

    const gameData = validation.data;
    
    // Update game
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        title: gameData.title,
        publisherId: gameData.publisherId,
        releaseDate: gameData.releaseDate,
        price: gameData.price,
        discountPrice: gameData.discountPrice,
        description: gameData.description,
        // Handle genre updates if provided
        ...(gameData.genreIds ? {
          gameGenres: {
            deleteMany: {},
            createMany: {
              data: gameData.genreIds.map(genreId => ({ genreId }))
            }
          }
        } : {})
      },
      include: {
        publisher: true,
        gameGenres: { include: { genre: true } }
      }
    });

    return createSuccessResponse(updatedGame);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Insufficient permissions') {
        return createErrorResponse('Insufficient permissions', 403);
      }
      if (error.message === 'Unauthorized access') {
        return createErrorResponse('Unauthorized access', 401);
      }
    }
    return handleApiError(error);
  }
});

/**
 * @route DELETE /api/games/:gameId
 * @description Delete a specific game
 * @access Private - Publisher or Admin
 */
export const DELETE = auth(async function DELETE(request) {
  try {
    const params = request.nextUrl.pathname.split('/');
    const gameIdStr = params[params.length - 1];
    const gameId = parseInt(gameIdStr);
    
    if (isNaN(gameId)) {
      return createErrorResponse("Invalid game ID", 400);
    }

    // Check if game exists
    const existingGame = await prisma.game.findUnique({
      where: { id: gameId },
      include: { publisher: true }
    });

    if (!existingGame) {
      return createErrorResponse("Game not found", 404);
    }

    // Check permissions - Publisher of this game or Platform Admin
    const { userId } = await checkAuthRole(request, [
      PlatformStaffRole.Admin, 
      PlatformStaffRole.Owner,
      PublisherStaffRole.Publisher
    ]);

    // If user is a publisher, verify they own this game
    const publisherStaff = await prisma.publisherStaff.findUnique({
      where: { userId }
    });

    if (publisherStaff?.role === PublisherStaffRole.Publisher && 
        publisherStaff.publisherId !== existingGame.publisherId) {
      return createErrorResponse("You can only delete games from your publisher", 403);
    }

    // Delete game
    await prisma.game.delete({
      where: { id: gameId }
    });

    return createSuccessResponse({ message: "Game deleted successfully" });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Insufficient permissions') {
        return createErrorResponse('Insufficient permissions', 403);
      }
      if (error.message === 'Unauthorized access') {
        return createErrorResponse('Unauthorized access', 401);
      }
    }
    return handleApiError(error);
  }
});