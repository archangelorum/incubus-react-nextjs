import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { createSuccessResponse, createErrorResponse, handleApiError } from "../types";
import { PlatformStaffRole } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";

const genreCreateSchema = z.object({
  name: z.string().min(2).max(50)
});

const genreUpdateSchema = genreCreateSchema.partial();

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
 * @route GET /api/genres
 * @description Get all genres
 * @access Public
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const where = search ? {
      name: {
        contains: search,
        mode: 'insensitive' as const
      }
    } : {};

    const genres = await prisma.genre.findMany({
      where,
      orderBy: {
        name: 'asc'
      },
      include: {
        _count: {
          select: {
            gameGenres: true
          }
        }
      }
    });

    return createSuccessResponse(genres);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * @route POST /api/genres
 * @description Create a new genre
 * @access Private - Platform Admin only
 */
export const POST = auth(async function POST(request) {
  try {
    // Check role - only platform admins can create genres
    await checkAuthRole(request, [
      PlatformStaffRole.Admin,
      PlatformStaffRole.Owner
    ]);

    // Validate request body
    const body = await request.json();
    const validation = genreCreateSchema.safeParse(body);
    
    if (!validation.success) {
      return createErrorResponse(validation.error.message, 400);
    }

    const { name } = validation.data;
    
    // Check if genre with same name already exists
    const existingGenre = await prisma.genre.findFirst({
      where: { 
        name: {
          equals: name,
          mode: 'insensitive' as const
        }
      }
    });

    if (existingGenre) {
      return createErrorResponse("Genre with this name already exists", 409);
    }

    // Get the highest existing ID to determine the next ID
    const highestGenre = await prisma.genre.findFirst({
      orderBy: {
        id: 'desc'
      }
    });

    const nextId = highestGenre ? highestGenre.id + 1 : 1;

    // Create genre
    const genre = await prisma.genre.create({
      data: {
        id: nextId,
        name
      }
    });

    return createSuccessResponse(genre);
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