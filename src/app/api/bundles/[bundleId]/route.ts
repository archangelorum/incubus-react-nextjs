import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { createSuccessResponse, createErrorResponse, handleApiError } from "../../types";
import { PlatformStaffRole, PublisherStaffRole } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";

const bundleUpdateSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  discountPrice: z.number().positive().nullable().optional(),
  gameIds: z.array(z.number().int().positive()).optional()
});

// Helper function to check roles for auth-wrapped handlers
const checkAuthRole = async (request: any, allowedRoles: (PlatformStaffRole | PublisherStaffRole)[]) => {
  if (!request.auth?.user?.id) {
    throw new Error('Unauthorized access');
  }

  const userId = request.auth.user.id;

  // Check if user is platform staff
  const platformStaff = await prisma.platformStaff.findUnique({
    where: { userId }
  });

  // Check if user is publisher staff
  const publisherStaff = await prisma.publisherStaff.findUnique({
    where: { userId }
  });

  const userRoles: (PlatformStaffRole | PublisherStaffRole)[] = [];
  if (platformStaff) userRoles.push(platformStaff.role);
  if (publisherStaff) userRoles.push(publisherStaff.role);

  const hasValidRole = userRoles.some(role => allowedRoles.includes(role));
  if (!hasValidRole) {
    throw new Error('Insufficient permissions');
  }

  return { 
    userId, 
    userRoles,
    isPlatformStaff: !!platformStaff,
    publisherId: publisherStaff?.publisherId
  };
};

// Helper to check if publisher owns all games in a bundle
const verifyPublisherOwnsGames = async (publisherId: number, gameIds: number[]) => {
  const games = await prisma.game.findMany({
    where: {
      id: { in: gameIds }
    }
  });

  const unauthorizedGames = games.filter(game => game.publisherId !== publisherId);
  return unauthorizedGames.length === 0 ? null : unauthorizedGames;
};

/**
 * @route GET /api/bundles/:bundleId
 * @description Get a specific bundle by ID
 * @access Public
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { bundleId: string } }
) {
  try {
    const bundleId = parseInt(params.bundleId);
    if (isNaN(bundleId)) {
      return createErrorResponse("Invalid bundle ID", 400);
    }

    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleId },
      include: {
        bundleGames: {
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
          }
        }
      }
    });

    if (!bundle) {
      return createErrorResponse("Bundle not found", 404);
    }

    // Calculate pricing information
    const totalOriginalPrice = bundle.bundleGames.reduce(
      (sum, bg) => sum + bg.game.price, 
      0
    );
    
    const savings = bundle.discountPrice 
      ? totalOriginalPrice - bundle.discountPrice
      : 0;
    
    const savingsPercentage = bundle.discountPrice
      ? Math.round((savings / totalOriginalPrice) * 100)
      : 0;

    return createSuccessResponse({
      ...bundle,
      pricing: {
        totalOriginalPrice,
        savings,
        savingsPercentage
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * @route PUT /api/bundles/:bundleId
 * @description Update a specific bundle
 * @access Private - Platform Admin or Publisher who owns all games
 */
export const PUT = auth(async function PUT(request) {
  try {
    const params = request.nextUrl.pathname.split('/');
    const bundleIdStr = params[params.length - 1];
    const bundleId = parseInt(bundleIdStr);
    
    if (isNaN(bundleId)) {
      return createErrorResponse("Invalid bundle ID", 400);
    }

    // Check if bundle exists
    const existingBundle = await prisma.bundle.findUnique({
      where: { id: bundleId },
      include: {
        bundleGames: {
          include: {
            game: {
              include: {
                publisher: true
              }
            }
          }
        }
      }
    });

    if (!existingBundle) {
      return createErrorResponse("Bundle not found", 404);
    }

    // Check role - only platform admins or publishers can update bundles
    const { publisherId, isPlatformStaff } = await checkAuthRole(request, [
      PlatformStaffRole.Admin,
      PlatformStaffRole.Owner,
      PublisherStaffRole.Publisher
    ]);

    // If user is a publisher, verify they own all the games in the bundle
    if (publisherId && !isPlatformStaff) {
      const bundlePublishers = new Set(
        existingBundle.bundleGames.map(bg => bg.game.publisherId)
      );
      
      // If bundle contains games from multiple publishers or from a different publisher
      if (bundlePublishers.size > 1 || !bundlePublishers.has(publisherId)) {
        return createErrorResponse(
          "You can only update bundles containing only your games",
          403
        );
      }
    }

    // Validate request body
    const body = await request.json();
    const validation = bundleUpdateSchema.safeParse(body);
    
    if (!validation.success) {
      return createErrorResponse(validation.error.message, 400);
    }

    const { title, discountPrice, gameIds } = validation.data;

    // If updating title, check if new title is already taken
    if (title && title !== existingBundle.title) {
      const titleExists = await prisma.bundle.findFirst({
        where: {
          title: {
            equals: title,
            mode: 'insensitive' as const
          },
          id: { not: bundleId }
        }
      });

      if (titleExists) {
        return createErrorResponse("Bundle with this title already exists", 409);
      }
    }

    // If updating games, check if all games exist and publisher owns them
    if (gameIds) {
      // Check if all games exist
      const games = await prisma.game.findMany({
        where: {
          id: { in: gameIds }
        }
      });

      if (games.length !== gameIds.length) {
        return createErrorResponse("One or more games not found", 404);
      }

      // If user is a publisher, verify they own all the games
      if (publisherId && !isPlatformStaff) {
        const unauthorizedGames = await verifyPublisherOwnsGames(publisherId, gameIds);
        if (unauthorizedGames) {
          return createErrorResponse(
            `You can only include games from your publisher. Unauthorized games: ${unauthorizedGames.map(g => g.title).join(', ')}`,
            403
          );
        }
      }
    }

    // Update bundle
    const updatedBundle = await prisma.bundle.update({
      where: { id: bundleId },
      data: {
        ...(title && { title }),
        ...(discountPrice !== undefined && { discountPrice }),
        ...(gameIds && {
          bundleGames: {
            deleteMany: {},
            createMany: {
              data: gameIds.map(gameId => ({ gameId }))
            }
          }
        })
      }
    });

    // Fetch the complete updated bundle with games
    const completeBundle = await prisma.bundle.findUnique({
      where: { id: updatedBundle.id },
      include: {
        bundleGames: {
          include: {
            game: {
              select: {
                id: true,
                title: true,
                price: true,
                publisher: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Calculate pricing information
    const totalOriginalPrice = completeBundle?.bundleGames.reduce(
      (sum, bg) => sum + bg.game.price, 
      0
    ) || 0;
    
    const savings = updatedBundle.discountPrice 
      ? totalOriginalPrice - updatedBundle.discountPrice
      : 0;
    
    const savingsPercentage = updatedBundle.discountPrice
      ? Math.round((savings / totalOriginalPrice) * 100)
      : 0;

    return createSuccessResponse({
      ...completeBundle,
      pricing: {
        totalOriginalPrice,
        savings,
        savingsPercentage
      }
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

/**
 * @route DELETE /api/bundles/:bundleId
 * @description Delete a specific bundle
 * @access Private - Platform Admin or Publisher who owns all games
 */
export const DELETE = auth(async function DELETE(request) {
  try {
    const params = request.nextUrl.pathname.split('/');
    const bundleIdStr = params[params.length - 1];
    const bundleId = parseInt(bundleIdStr);
    
    if (isNaN(bundleId)) {
      return createErrorResponse("Invalid bundle ID", 400);
    }

    // Check if bundle exists
    const existingBundle = await prisma.bundle.findUnique({
      where: { id: bundleId },
      include: {
        bundleGames: {
          include: {
            game: {
              include: {
                publisher: true
              }
            }
          }
        }
      }
    });

    if (!existingBundle) {
      return createErrorResponse("Bundle not found", 404);
    }

    // Check role - only platform admins or publishers can delete bundles
    const { publisherId, isPlatformStaff } = await checkAuthRole(request, [
      PlatformStaffRole.Admin,
      PlatformStaffRole.Owner,
      PublisherStaffRole.Publisher
    ]);

    // If user is a publisher, verify they own all the games in the bundle
    if (publisherId && !isPlatformStaff) {
      const bundlePublishers = new Set(
        existingBundle.bundleGames.map(bg => bg.game.publisherId)
      );
      
      // If bundle contains games from multiple publishers or from a different publisher
      if (bundlePublishers.size > 1 || !bundlePublishers.has(publisherId)) {
        return createErrorResponse(
          "You can only delete bundles containing only your games",
          403
        );
      }
    }

    // Delete bundle
    await prisma.bundle.delete({
      where: { id: bundleId }
    });

    return createSuccessResponse({ message: "Bundle deleted successfully" });
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