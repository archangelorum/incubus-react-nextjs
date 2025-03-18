import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { createSuccessResponse, createErrorResponse, handleApiError } from "../types";
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
 * @route GET /api/players
 * @description Get all players with pagination and filtering
 * @access Private - Platform Staff only
 */
export const GET = auth(async function GET(request) {
  try {
    // Check permissions - only platform staff can view all players
    await checkAuthRole(request, [
      PlatformStaffRole.Admin,
      PlatformStaffRole.Owner,
      PlatformStaffRole.Moderator,
      PlatformStaffRole.Support
    ]);

    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const type = url.searchParams.get('type') as PlayerType | null;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } }
        ]
      };
    }
    
    if (type) {
      where.type = type;
    }

    // Get players
    const players = await prisma.player.findMany({
      where,
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
        _count: {
          select: {
            reviews: true,
            playerGames: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        user: {
          createdAt: 'desc'
        }
      }
    });

    const totalPlayers = await prisma.player.count({ where });

    return createSuccessResponse({
      players,
      pagination: {
        page,
        limit,
        total: totalPlayers
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
 * @route POST /api/players
 * @description Register a new player
 * @access Public
 */
export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email || !name) {
      return createErrorResponse("Email and name are required", 400);
    }

    // Check if user with email exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    // Create user if not exists
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          emailVerified: new Date()
        }
      });
    }

    // Check if user is already a player
    const existingPlayer = await prisma.player.findUnique({
      where: { userId: user.id }
    });

    if (existingPlayer) {
      return createErrorResponse("User is already registered as a player", 409);
    }

    // Create player
    const player = await prisma.player.create({
      data: {
        userId: user.id,
        type: PlayerType.Standard
      },
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

    return createSuccessResponse(player);
  } catch (error) {
    return handleApiError(error);
  }
}
