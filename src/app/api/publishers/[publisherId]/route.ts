import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { createSuccessResponse, createErrorResponse, handleApiError } from "../../types";
import { PlatformStaffRole, PublisherStaffRole } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";

const publisherUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  contactInfo: z.string().optional()
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

// Helper to check if user is publisher staff for this publisher
const isPublisherStaff = async (userId: string, publisherId: number) => {
  const publisherStaff = await prisma.publisherStaff.findFirst({
    where: { 
      userId,
      publisherId,
      role: PublisherStaffRole.Publisher
    }
  });
  
  return !!publisherStaff;
};

/**
 * @route GET /api/publishers/:publisherId
 * @description Get a specific publisher by ID
 * @access Public
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { publisherId: string } }
) {
  try {
    const publisherId = parseInt(params.publisherId);
    if (isNaN(publisherId)) {
      return createErrorResponse("Invalid publisher ID", 400);
    }

    const publisher = await prisma.publisher.findUnique({
      where: { id: publisherId },
      include: {
        games: {
          select: {
            id: true,
            title: true,
            releaseDate: true,
            price: true,
            discountPrice: true
          }
        },
        PublisherStaff: {
          select: {
            userId: true,
            role: true,
            user: {
              select: {
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        _count: {
          select: {
            games: true
          }
        }
      }
    });

    if (!publisher) {
      return createErrorResponse("Publisher not found", 404);
    }

    return createSuccessResponse(publisher);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * @route PUT /api/publishers/:publisherId
 * @description Update a specific publisher
 * @access Private - Platform Admin or Publisher Staff
 */
export const PUT = auth(async function PUT(request) {
  try {
    const params = request.nextUrl.pathname.split('/');
    const publisherIdStr = params[params.length - 1];
    const publisherId = parseInt(publisherIdStr);
    
    if (isNaN(publisherId)) {
      return createErrorResponse("Invalid publisher ID", 400);
    }

    // Check if publisher exists
    const existingPublisher = await prisma.publisher.findUnique({
      where: { id: publisherId }
    });

    if (!existingPublisher) {
      return createErrorResponse("Publisher not found", 404);
    }

    // Validate request body
    const body = await request.json();
    const validation = publisherUpdateSchema.safeParse(body);
    
    if (!validation.success) {
      return createErrorResponse(validation.error.message, 400);
    }

    // Get user ID from auth
    const userId = request.auth?.user?.id;
    if (!userId) {
      return createErrorResponse("Unauthorized access", 401);
    }

    // Check if user is platform admin or publisher staff
    const platformStaff = await prisma.platformStaff.findUnique({
      where: { userId }
    });

    const isPlatformAdmin = platformStaff && (
      platformStaff.role === PlatformStaffRole.Admin ||
      platformStaff.role === PlatformStaffRole.Owner
    );

    const isPublisher = await isPublisherStaff(userId, publisherId);

    if (!isPlatformAdmin && !isPublisher) {
      return createErrorResponse("Insufficient permissions", 403);
    }

    // If updating name, check if new name is already taken
    if (body.name && body.name !== existingPublisher.name) {
      const nameExists = await prisma.publisher.findFirst({
        where: {
          name: body.name,
          id: { not: publisherId }
        }
      });

      if (nameExists) {
        return createErrorResponse("Publisher with this name already exists", 409);
      }
    }

    const publisherData = validation.data;
    
    // Update publisher
    const updatedPublisher = await prisma.publisher.update({
      where: { id: publisherId },
      data: publisherData
    });

    return createSuccessResponse(updatedPublisher);
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * @route DELETE /api/publishers/:publisherId
 * @description Delete a specific publisher
 * @access Private - Platform Admin only
 */
export const DELETE = auth(async function DELETE(request) {
  try {
    const params = request.nextUrl.pathname.split('/');
    const publisherIdStr = params[params.length - 1];
    const publisherId = parseInt(publisherIdStr);
    
    if (isNaN(publisherId)) {
      return createErrorResponse("Invalid publisher ID", 400);
    }

    // Check if publisher exists
    const existingPublisher = await prisma.publisher.findUnique({
      where: { id: publisherId },
      include: {
        _count: {
          select: {
            games: true
          }
        }
      }
    });

    if (!existingPublisher) {
      return createErrorResponse("Publisher not found", 404);
    }

    // Check if publisher has games
    if (existingPublisher._count.games > 0) {
      return createErrorResponse(
        "Cannot delete publisher with existing games. Delete all games first.",
        400
      );
    }

    // Check permissions - only platform admins can delete publishers
    await checkAuthRole(request, [
      PlatformStaffRole.Admin,
      PlatformStaffRole.Owner
    ]);

    // Delete publisher
    await prisma.publisher.delete({
      where: { id: publisherId }
    });

    return createSuccessResponse({ message: "Publisher deleted successfully" });
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
