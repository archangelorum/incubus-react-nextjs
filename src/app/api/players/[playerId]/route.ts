import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { createSuccessResponse, createErrorResponse, handleApiError } from "../../types";
import { PlatformStaffRole, PlayerType } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";

const playerUpdateSchema = z.object({
  type: z.nativeEnum(PlayerType).optional()
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
 * @route GET /api/players/:playerId
 * @description Get a specific player by ID
 * @access Private - Platform Staff or the player themselves
 */
export const GET = auth(async function GET(request) {
  try {
    const params = request.nextUrl.pathname.split('/');
    const playerId = params[params.length - 1];
    
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

    // Get player
    const player = await prisma.player.findUnique({
      where: { userId: playerId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true
          }
        },
        playerGames: {
          include: {
            game: {
              select: {
                id: true,
                title: true,
                releaseDate: true,
                price: true,
                discountPrice: true,
                publisher: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        reviews: {
          include: {
            game: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        _count: {
          select: {
            reviews: true,
            playerGames: true
          }
        }
      }
    });

    if (!player) {
      return createErrorResponse("Player not found", 404);
    }

    return createSuccessResponse(player);
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * @route PUT /api/players/:playerId
 * @description Update a specific player
 * @access Private - Platform Admin or the player themselves
 */
export const PUT = auth(async function PUT(request) {
  try {
    const params = request.nextUrl.pathname.split('/');
    const playerId = params[params.length - 1];
    
    if (!playerId) {
      return createErrorResponse("Invalid player ID", 400);
    }

    // Check if player exists
    const existingPlayer = await prisma.player.findUnique({
      where: { userId: playerId }
    });

    if (!existingPlayer) {
      return createErrorResponse("Player not found", 404);
    }

    // Get authenticated user ID
    const authUserId = request.auth?.user?.id;
    if (!authUserId) {
      return createErrorResponse("Unauthorized access", 401);
    }

    // Check if user is platform admin
    const platformStaff = await prisma.platformStaff.findUnique({
      where: { userId: authUserId }
    });

    const isPlatformAdmin = platformStaff && (
      platformStaff.role === PlatformStaffRole.Admin ||
      platformStaff.role === PlatformStaffRole.Owner
    );

    // Check if user is the player themselves
    const isSelfUpdate = playerId === authUserId;

    // Only allow updates if user is platform admin or the player themselves
    if (!isPlatformAdmin && !isSelfUpdate) {
      return createErrorResponse("Insufficient permissions", 403);
    }

    // Validate request body
    const body = await request.json();
    const validation = playerUpdateSchema.safeParse(body);
    
    if (!validation.success) {
      return createErrorResponse(validation.error.message, 400);
    }

    // Only platform admins can change player type
    if (body.type && !isPlatformAdmin) {
      return createErrorResponse("Only platform admins can change player type", 403);
    }

    const playerData = validation.data;
    
    // Update player
    const updatedPlayer = await prisma.player.update({
      where: { userId: playerId },
      data: playerData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return createSuccessResponse(updatedPlayer);
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * @route DELETE /api/players/:playerId
 * @description Delete a specific player
 * @access Private - Platform Admin only
 */
export const DELETE = auth(async function DELETE(request) {
  try {
    const params = request.nextUrl.pathname.split('/');
    const playerId = params[params.length - 1];
    
    if (!playerId) {
      return createErrorResponse("Invalid player ID", 400);
    }

    // Check if player exists
    const existingPlayer = await prisma.player.findUnique({
      where: { userId: playerId }
    });

    if (!existingPlayer) {
      return createErrorResponse("Player not found", 404);
    }

    // Check permissions - only platform admins can delete players
    await checkAuthRole(request, [
      PlatformStaffRole.Admin,
      PlatformStaffRole.Owner
    ]);

    // Delete player
    await prisma.player.delete({
      where: { userId: playerId }
    });

    // Optionally delete user as well
    const deleteUser = request.nextUrl.searchParams.get('deleteUser') === 'true';
    if (deleteUser) {
      await prisma.user.delete({
        where: { id: playerId }
      });
    }

    return createSuccessResponse({ 
      message: "Player deleted successfully",
      userDeleted: deleteUser
    });
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