import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { createSuccessResponse, createErrorResponse, handleApiError, Role } from "../../../../types";
import { PlatformStaffRole, PublisherStaffRole } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";

const reviewUpdateSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().optional()
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
 * @route GET /api/games/:gameId/reviews/:reviewId
 * @description Get a specific review by ID
 * @access Public
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { gameId: string, reviewId: string } }
) {
  try {
    const reviewId = parseInt(params.reviewId);
    if (isNaN(reviewId)) {
      return createErrorResponse("Invalid review ID", 400);
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
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
        },
        game: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!review) {
      return createErrorResponse("Review not found", 404);
    }

    return createSuccessResponse(review);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * @route PUT /api/games/:gameId/reviews/:reviewId
 * @description Update a specific review
 * @access Private - Review owner or Admin
 */
export const PUT = auth(async function PUT(request) {
  try {
    const pathParts = request.nextUrl.pathname.split('/');
    const reviewIdStr = pathParts[pathParts.length - 1];
    const reviewId = parseInt(reviewIdStr);
    
    if (isNaN(reviewId)) {
      return createErrorResponse("Invalid review ID", 400);
    }

    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { player: true }
    });

    if (!existingReview) {
      return createErrorResponse("Review not found", 404);
    }

    // Validate request body
    const body = await request.json();
    const validation = reviewUpdateSchema.safeParse(body);
    
    if (!validation.success) {
      return createErrorResponse(validation.error.message, 400);
    }

    // Get user ID from auth
    const { userId, userRoles } = await checkAuthRole(request, [
      PlatformStaffRole.Admin,
      PlatformStaffRole.Moderator,
      PlatformStaffRole.Owner
    ]);

    // Check if user is the review owner or has admin privileges
    const isAdmin = userRoles.some(role =>
      role === PlatformStaffRole.Admin ||
      role === PlatformStaffRole.Moderator ||
      role === PlatformStaffRole.Owner
    );

    if (existingReview.playerId !== userId && !isAdmin) {
      return createErrorResponse("You can only update your own reviews", 403);
    }

    const reviewData = validation.data;
    
    // Update review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: reviewData.rating,
        comment: reviewData.comment
      },
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
    });

    return createSuccessResponse(updatedReview);
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
 * @route DELETE /api/games/:gameId/reviews/:reviewId
 * @description Delete a specific review
 * @access Private - Review owner or Admin
 */
export const DELETE = auth(async function DELETE(request) {
  try {
    const pathParts = request.nextUrl.pathname.split('/');
    const reviewIdStr = pathParts[pathParts.length - 1];
    const reviewId = parseInt(reviewIdStr);
    
    if (isNaN(reviewId)) {
      return createErrorResponse("Invalid review ID", 400);
    }

    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { player: true }
    });

    if (!existingReview) {
      return createErrorResponse("Review not found", 404);
    }

    // Get user ID from auth
    const { userId, userRoles } = await checkAuthRole(request, [
      PlatformStaffRole.Admin,
      PlatformStaffRole.Moderator,
      PlatformStaffRole.Owner
    ]);

    // Check if user is the review owner or has admin privileges
    const isAdmin = userRoles.some(role =>
      role === PlatformStaffRole.Admin ||
      role === PlatformStaffRole.Moderator ||
      role === PlatformStaffRole.Owner
    );

    if (existingReview.playerId !== userId && !isAdmin) {
      return createErrorResponse("You can only delete your own reviews", 403);
    }

    // Delete review
    await prisma.review.delete({
      where: { id: reviewId }
    });

    return createSuccessResponse({ message: "Review deleted successfully" });
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