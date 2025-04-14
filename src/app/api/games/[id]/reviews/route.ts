import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest, authorizeAdmin } from "../../../utils/auth";
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse, 
  notFoundResponse 
} from "../../../utils/response";
import { getPaginationParams, getSortParams } from "../../../utils/query";
import { validateBody, validateParams } from "../../../utils/validation";
import { gameIdSchema, createGameReviewSchema } from "../../schema";

/**
 * GET /api/games/[id]/reviews
 * 
 * Retrieves a paginated list of reviews for a specific game
 * Supports filtering by rating and status
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns Paginated list of game reviews
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    const validatedParams = validateParams(await params, gameIdSchema);
    if (validatedParams instanceof Response) return validatedParams;
    
    const { id } = await params;
    // Check if game exists
    const game = await prisma.game.findUnique({
      where: { id }
    });

    if (!game) {
      return notFoundResponse("Game");
    }

    // Get pagination and sorting parameters
    const { page, limit, skip } = getPaginationParams(req);
    const { orderBy } = getSortParams(req, "createdAt", "desc", ["rating", "createdAt", "upvotes"]);
    
    // Get filters if provided
    const url = new URL(req.url);
    const ratingFilter = url.searchParams.get("rating");
    const statusFilter = url.searchParams.get("status");
    const verifiedFilter = url.searchParams.get("verified");
    const recommendedFilter = url.searchParams.get("recommended");
    
    const where: any = { gameId: game.id };
    
    if (ratingFilter) {
      where.rating = parseInt(ratingFilter);
    }
    
    if (statusFilter) {
      where.status = statusFilter;
    }
    
    if (verifiedFilter) {
      where.isVerifiedPurchase = verifiedFilter === "true";
    }
    
    if (recommendedFilter) {
      where.isRecommended = recommendedFilter === "true";
    }

    // Fetch reviews with pagination
    const [reviews, total] = await Promise.all([
      prisma.gameReview.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          gameId: true,
          userId: true,
          rating: true,
          title: true,
          content: true,
          playTime: true,
          isVerifiedPurchase: true,
          isRecommended: true,
          upvotes: true,
          downvotes: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      }),
      prisma.gameReview.count({ where })
    ]);

    // Calculate average rating
    const averageRating = await prisma.gameReview.aggregate({
      where: {
        gameId: game.id,
        status: "APPROVED"
      },
      _avg: {
        rating: true
      },
      _count: true
    });

    return paginatedResponse(
      reviews, 
      page, 
      limit, 
      total, 
      undefined, 
      {
        averageRating: averageRating._avg.rating || 0,
        approvedReviewsCount: averageRating._count
      }
    );
  } catch (error) {
    console.error("Error fetching game reviews:", error);
    return errorResponse("Failed to fetch game reviews", 500);
  }
}

/**
 * POST /api/games/[id]/reviews
 * 
 * Creates a new review for a game
 * Users can only submit one review per game
 * 
 * @requires Authentication
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns The created review
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  params = await params;
  try {
    // Validate ID parameter
    const validatedParams = validateParams(params, gameIdSchema);
    if (validatedParams instanceof Response) return validatedParams;

    // Authenticate request
    const session = await authenticateRequest(req);
    if (session instanceof Response) return session;

    // Validate request body
    const validatedData = await validateBody(req, createGameReviewSchema);
    if (validatedData instanceof Response) return validatedData;
    
    // Check if game exists
    const game = await prisma.game.findUnique({
      where: { id: params.id }
    });

    if (!game) {
      return notFoundResponse("Game");
    }

    // Check if user already has a review for this game
    const existingReview = await prisma.gameReview.findUnique({
      where: {
        gameId_userId: {
          gameId: params.id,
          userId: session.user.id
        }
      }
    });
    if (existingReview) {
      return errorResponse("You have already submitted a review for this game", 409);
    }

    // Check if user owns the game (has a license)
    const userLicense = await prisma.gameLicense.findFirst({
      where: {
        gameId: params.id,
        wallet: {
          userId: session.user.id
        }
      }
    });

    const isVerifiedPurchase = !!userLicense;

    // Create review
    const review = await prisma.gameReview.create({
      data: {
        id: crypto.randomUUID(),
        gameId: params.id,
        userId: session.user.id,
        rating: validatedData.rating,
        title: validatedData.title,
        content: validatedData.content,
        playTime: validatedData.playTime,
        isVerifiedPurchase,
        isRecommended: validatedData.isRecommended,
        upvotes: 0,
        downvotes: 0,
        status: "PENDING", // Reviews start as pending and need approval
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    return successResponse(
      review, 
      "Review submitted successfully and is pending approval", 
      undefined, 
      201
    );
  } catch (error) {
    console.error("Error creating game review:", error);
    return errorResponse("Failed to create game review", 500);
  }
}