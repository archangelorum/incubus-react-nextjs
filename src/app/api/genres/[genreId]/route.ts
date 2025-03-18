import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { createSuccessResponse, createErrorResponse, handleApiError } from "../../types";
import { PlatformStaffRole } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";

const genreUpdateSchema = z.object({
  name: z.string().min(2).max(50)
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
 * @route GET /api/genres/:genreId
 * @description Get a specific genre by ID
 * @access Public
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { genreId: string } }
) {
  try {
    const genreId = parseInt(params.genreId);
    if (isNaN(genreId)) {
      return createErrorResponse("Invalid genre ID", 400);
    }

    const genre = await prisma.genre.findUnique({
      where: { id: genreId },
      include: {
        gameGenres: {
          include: {
            game: {
              select: {
                id: true,
                title: true,
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
            gameGenres: true
          }
        }
      }
    });

    if (!genre) {
      return createErrorResponse("Genre not found", 404);
    }

    return createSuccessResponse(genre);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * @route PUT /api/genres/:genreId
 * @description Update a specific genre
 * @access Private - Platform Admin only
 */
export const PUT = auth(async function PUT(request) {
  try {
    const params = request.nextUrl.pathname.split('/');
    const genreIdStr = params[params.length - 1];
    const genreId = parseInt(genreIdStr);
    
    if (isNaN(genreId)) {
      return createErrorResponse("Invalid genre ID", 400);
    }

    // Check if genre exists
    const existingGenre = await prisma.genre.findUnique({
      where: { id: genreId }
    });

    if (!existingGenre) {
      return createErrorResponse("Genre not found", 404);
    }

    // Check permissions - only platform admins can update genres
    await checkAuthRole(request, [
      PlatformStaffRole.Admin,
      PlatformStaffRole.Owner
    ]);

    // Validate request body
    const body = await request.json();
    const validation = genreUpdateSchema.safeParse(body);
    
    if (!validation.success) {
      return createErrorResponse(validation.error.message, 400);
    }

    const { name } = validation.data;

    // Check if genre with same name already exists
    if (name !== existingGenre.name) {
      const nameExists = await prisma.genre.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive' as const
          },
          id: { not: genreId }
        }
      });

      if (nameExists) {
        return createErrorResponse("Genre with this name already exists", 409);
      }
    }
    
    // Update genre
    const updatedGenre = await prisma.genre.update({
      where: { id: genreId },
      data: { name }
    });

    return createSuccessResponse(updatedGenre);
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
 * @route DELETE /api/genres/:genreId
 * @description Delete a specific genre
 * @access Private - Platform Admin only
 */
export const DELETE = auth(async function DELETE(request) {
  try {
    const params = request.nextUrl.pathname.split('/');
    const genreIdStr = params[params.length - 1];
    const genreId = parseInt(genreIdStr);
    
    if (isNaN(genreId)) {
      return createErrorResponse("Invalid genre ID", 400);
    }

    // Check if genre exists
    const existingGenre = await prisma.genre.findUnique({
      where: { id: genreId },
      include: {
        _count: {
          select: {
            gameGenres: true
          }
        }
      }
    });

    if (!existingGenre) {
      return createErrorResponse("Genre not found", 404);
    }

    // Check if genre is used by any games
    if (existingGenre._count.gameGenres > 0) {
      return createErrorResponse(
        "Cannot delete genre that is used by games. Remove genre from all games first.",
        400
      );
    }

    // Check permissions - only platform admins can delete genres
    await checkAuthRole(request, [
      PlatformStaffRole.Admin,
      PlatformStaffRole.Owner
    ]);

    // Delete genre
    await prisma.genre.delete({
      where: { id: genreId }
    });

    return createSuccessResponse({ message: "Genre deleted successfully" });
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