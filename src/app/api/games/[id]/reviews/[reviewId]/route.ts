import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { authenticateRequest, authorizeAdmin } from "../../../../utils/auth";
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse 
} from "../../../../utils/response";
import { validateParams } from "../../../../utils/validation";
import { gameIdSchema } from "../../../schema";
import { z } from "zod";

// Schema for review ID parameter
const reviewIdSchema = z.object({
  reviewId: z.string().uuid({ message: "Invalid review ID format" })
});

// Schema for updating a review
const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  isRecommended: z.boolean().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional()
});

/**
 * GET /api/games/[id]/reviews/[reviewId]
 * 
 * Retrieves a specific game review
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns The requested review
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  try {
    // Validate ID parameters
    const validatedGameParams = validateParams({ id: params.id }, gameIdSchema);
    if (validatedGameParams instanceof Response) return validatedGameParams;
    
    const validatedReviewParams = validateParams({ reviewId: params.reviewId }, reviewIdSchema);
    if (validatedReviewParams instanceof Response) return validatedReviewParams;

    // Fetch review
    const review = await prisma.gameReview.findFirst({
      where: {
        id: params.reviewId,
        gameId: params.id
      }
    });

    if (!review) {
      return notFoundResponse("Review");
    }

    return successResponse(review);
  } catch (error) {
    console.error("Error fetching review:", error);
    return errorResponse("Failed to fetch review", 500);
  }
}

/**
 * PUT /api/games/[id]/reviews/[reviewId]
 * 
 * Updates a specific review
 * Users can update their own reviews
 * Admins can update any review and change status
 * 
 * @requires Authentication
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns The updated review
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  try {
    // Validate ID parameters
    const validatedGameParams = validateParams({ id: params.id }, gameIdSchema);
    if (validatedGameParams instanceof Response) return validatedGameParams;
    
    const validatedReviewParams = validateParams({ reviewId: params.reviewId }, reviewIdSchema);
    if (validatedReviewParams instanceof Response) return validatedReviewParams;

    // Authenticate request
    const session = await authenticateRequest(req);
    if (session instanceof Response) return session;

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return errorResponse("Invalid JSON in request body", 400);
    }

    const validationResult = updateReviewSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(`Validation error: ${validationResult.error.message}`, 400);
    }

    const validatedData = validationResult.data;

    // Fetch review
    const review = await prisma.gameReview.findFirst({
      where: {
        id: params.reviewId,
        gameId: params.id
      }
    });

    if (!review) {
      return notFoundResponse("Review");
    }

    // Check permissions
    const isAdmin = session.user.role === "admin";
    const isOwner = review.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return errorResponse("You don't have permission to update this review", 403);
    }

    // If not admin, remove status field
    if (!isAdmin) {
      delete validatedData.status;
    }

    // If not owner, remove content fields
    if (!isOwner) {
      delete validatedData.rating;
      delete validatedData.title;
      delete validatedData.content;
      delete validatedData.isRecommended;
    }

    // Update review
    const updatedReview = await prisma.gameReview.update({
      where: { id: params.reviewId },
      data: {
        ...validatedData,
        updatedAt: new Date()
      }
    });

    return successResponse(updatedReview, "Review updated successfully");
  } catch (error) {
    console.error("Error updating review:", error);
    return errorResponse("Failed to update review", 500);
  }
}

/**
 * DELETE /api/games/[id]/reviews/[reviewId]
 * 
 * Deletes a specific review
 * Users can delete their own reviews
 * Admins can delete any review
 * 
 * @requires Authentication
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns Success message
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  try {
    // Validate ID parameters
    const validatedGameParams = validateParams({ id: params.id }, gameIdSchema);
    if (validatedGameParams instanceof Response) return validatedGameParams;
    
    const validatedReviewParams = validateParams({ reviewId: params.reviewId }, reviewIdSchema);
    if (validatedReviewParams instanceof Response) return validatedReviewParams;

    // Authenticate request
    const session = await authenticateRequest(req);
    if (session instanceof Response) return session;

    // Fetch review
    const review = await prisma.gameReview.findFirst({
      where: {
        id: params.reviewId,
        gameId: params.id
      }
    });

    if (!review) {
      return notFoundResponse("Review");
    }

    // Check permissions
    const isAdmin = session.user.role === "admin";
    const isOwner = review.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return errorResponse("You don't have permission to delete this review", 403);
    }

    // Delete review
    await prisma.gameReview.delete({
      where: { id: params.reviewId }
    });

    return successResponse(null, "Review deleted successfully");
  } catch (error) {
    console.error("Error deleting review:", error);
    return errorResponse("Failed to delete review", 500);
  }
}

/**
 * PATCH /api/games/[id]/reviews/[reviewId]/vote
 * 
 * Votes on a review (upvote or downvote)
 * 
 * @requires Authentication
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns The updated review with vote counts
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  try {
    // Validate ID parameters
    const validatedGameParams = validateParams({ id: params.id }, gameIdSchema);
    if (validatedGameParams instanceof Response) return validatedGameParams;
    
    const validatedReviewParams = validateParams({ reviewId: params.reviewId }, reviewIdSchema);
    if (validatedReviewParams instanceof Response) return validatedReviewParams;

    // Authenticate request
    const session = await authenticateRequest(req);
    if (session instanceof Response) return session;

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return errorResponse("Invalid JSON in request body", 400);
    }

    // Validate vote type
    if (!body.voteType || !["upvote", "downvote", "remove"].includes(body.voteType)) {
      return errorResponse("Invalid vote type. Must be 'upvote', 'downvote', or 'remove'", 400);
    }

    // Fetch review
    const review = await prisma.gameReview.findFirst({
      where: {
        id: params.reviewId,
        gameId: params.id
      }
    });

    if (!review) {
      return notFoundResponse("Review");
    }

    // Prevent voting on own review
    if (review.userId === session.user.id) {
      return errorResponse("You cannot vote on your own review", 400);
    }

    // TODO: In a real implementation, we would track individual user votes
    // For simplicity, we'll just increment/decrement the counters

    let updateData: any = {};
    
    if (body.voteType === "upvote") {
      updateData.upvotes = { increment: 1 };
    } else if (body.voteType === "downvote") {
      updateData.downvotes = { increment: 1 };
    } else if (body.voteType === "remove") {
      // This is simplified; in reality we would need to know which vote to remove
      if (body.previousVote === "upvote") {
        updateData.upvotes = { decrement: 1 };
      } else if (body.previousVote === "downvote") {
        updateData.downvotes = { decrement: 1 };
      }
    }

    // Update review vote counts
    const updatedReview = await prisma.gameReview.update({
      where: { id: params.reviewId },
      data: updateData
    });

    return successResponse(updatedReview, "Vote recorded successfully");
  } catch (error) {
    console.error("Error voting on review:", error);
    return errorResponse("Failed to vote on review", 500);
  }
}