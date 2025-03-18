import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { createSuccessResponse, createErrorResponse, handleApiError } from "../types";
import { PlatformStaffRole, PublisherStaffRole } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";

const bundleCreateSchema = z.object({
  title: z.string().min(3).max(100),
  discountPrice: z.number().positive().optional(),
  gameIds: z.array(z.number().int().positive())
});

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

/**
 * @route GET /api/bundles
 * @description Get all bundles with pagination
 * @access Public
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';

    const where = search ? {
      title: {
        contains: search,
        mode: 'insensitive' as const
      }
    } : {};

    const bundles = await prisma.bundle.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        title: 'asc'
      },
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
        },
        _count: {
          select: {
            bundleGames: true
          }
        }
      }
    });

    // Calculate total price and savings for each bundle
    const bundlesWithPricing = bundles.map(bundle => {
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

      return {
        ...bundle,
        pricing: {
          totalOriginalPrice,
          savings,
          savingsPercentage
        }
      };
    });

    const total = await prisma.bundle.count({ where });

    return createSuccessResponse({
      data: bundlesWithPricing,
      pagination: { page, pageSize, total }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * @route POST /api/bundles
 * @description Create a new bundle
 * @access Private - Platform Admin or Publisher
 */
export const POST = auth(async function POST(request) {
  try {
    // Check role - only platform admins or publishers can create bundles
    const { userId, publisherId } = await checkAuthRole(request, [
      PlatformStaffRole.Admin,
      PlatformStaffRole.Owner,
      PublisherStaffRole.Publisher
    ]);

    // Validate request body
    const body = await request.json();
    const validation = bundleCreateSchema.safeParse(body);
    
    if (!validation.success) {
      return createErrorResponse(validation.error.message, 400);
    }

    const { title, discountPrice, gameIds } = validation.data;
    
    // Check if bundle with same title already exists
    const existingBundle = await prisma.bundle.findFirst({
      where: { 
        title: {
          equals: title,
          mode: 'insensitive' as const
        }
      }
    });

    if (existingBundle) {
      return createErrorResponse("Bundle with this title already exists", 409);
    }

    // Check if all games exist
    const games = await prisma.game.findMany({
      where: {
        id: { in: gameIds }
      },
      include: {
        publisher: true
      }
    });

    if (games.length !== gameIds.length) {
      return createErrorResponse("One or more games not found", 404);
    }

    // If user is a publisher, verify they own all the games
    if (publisherId) {
      const unauthorizedGames = games.filter(game => game.publisherId !== publisherId);
      if (unauthorizedGames.length > 0) {
        return createErrorResponse(
          `You can only include games from your publisher. Unauthorized games: ${unauthorizedGames.map(g => g.title).join(', ')}`,
          403
        );
      }
    }

    // Create bundle
    const bundle = await prisma.bundle.create({
      data: {
        title,
        discountPrice,
        bundleGames: {
          createMany: {
            data: gameIds.map(gameId => ({ gameId }))
          }
        }
      }
    });

    // Fetch the complete bundle with games
    const completeBundle = await prisma.bundle.findUnique({
      where: { id: bundle.id },
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
    
    const savings = discountPrice 
      ? totalOriginalPrice - discountPrice
      : 0;
    
    const savingsPercentage = discountPrice
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