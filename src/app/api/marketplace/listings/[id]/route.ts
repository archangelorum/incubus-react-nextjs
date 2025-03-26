import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/app/api/utils/auth";
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse 
} from "@/app/api/utils/response";
import { validateBody } from "@/app/api/utils/validation";
import { updateMarketplaceListingSchema } from "../../schema";

/**
 * GET /api/marketplace/listings/[id]
 * 
 * Retrieves a specific marketplace listing by ID
 * 
 * @param req - The incoming request
 * @param params - Route parameters containing the listing ID
 * @returns The marketplace listing
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const listing = await prisma.marketplaceListing.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        status: true,
        sellerId: true,
        seller: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        price: true,
        quantity: true,
        expiresAt: true,
        gameId: true,
        game: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            shortDescription: true,
            basePrice: true,
            discountPrice: true,
            releaseDate: true,
            coverImage: {
              select: {
                id: true,
                path: true
              }
            },
            publisher: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        itemId: true,
        item: {
          select: {
            id: true,
            name: true,
            description: true,
            rarity: true,
            price: true,
            itemType: true,
            image: {
              select: {
                id: true,
                path: true
              }
            },
            game: {
              select: {
                id: true,
                title: true,
                slug: true
              }
            }
          }
        },
        createdAt: true,
        updatedAt: true
      }
    });

    if (!listing) {
      return notFoundResponse("Marketplace listing");
    }

    return successResponse(listing);
  } catch (error) {
    console.error("Error fetching marketplace listing:", error);
    return errorResponse("Failed to fetch marketplace listing", 500);
  }
}

/**
 * PATCH /api/marketplace/listings/[id]
 * 
 * Updates a marketplace listing
 * Only the seller can update their own listing
 * 
 * @requires Authentication
 * 
 * @param req - The incoming request
 * @param params - Route parameters containing the listing ID
 * @returns The updated marketplace listing
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Authenticate request
    const session = await authenticateRequest(req);
    if (session instanceof Response) return session;

    // Find the listing
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id }
    });

    if (!listing) {
      return notFoundResponse("Marketplace listing");
    }

    // Check if user is the seller
    if (listing.sellerId !== session.user.id) {
      return errorResponse("You can only update your own listings", 403);
    }

    // Validate request body
    const validatedData = await validateBody(req, updateMarketplaceListingSchema);
    if (validatedData instanceof Response) return validatedData;

    // Update the listing
    const updatedListing = await prisma.marketplaceListing.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date()
      },
      select: {
        id: true,
        type: true,
        status: true,
        sellerId: true,
        seller: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        price: true,
        quantity: true,
        expiresAt: true,
        gameId: true,
        game: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: {
              select: {
                id: true,
                path: true
              }
            }
          }
        },
        itemId: true,
        item: {
          select: {
            id: true,
            name: true,
            description: true,
            rarity: true,
            image: {
              select: {
                id: true,
                path: true
              }
            }
          }
        },
        createdAt: true,
        updatedAt: true
      }
    });

    return successResponse(updatedListing, "Listing updated successfully");
  } catch (error) {
    console.error("Error updating marketplace listing:", error);
    return errorResponse("Failed to update marketplace listing", 500);
  }
}

/**
 * DELETE /api/marketplace/listings/[id]
 * 
 * Deletes a marketplace listing
 * Only the seller can delete their own listing
 * 
 * @requires Authentication
 * 
 * @param req - The incoming request
 * @param params - Route parameters containing the listing ID
 * @returns Success message
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Authenticate request
    const session = await authenticateRequest(req);
    if (session instanceof Response) return session;

    // Find the listing
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id }
    });

    if (!listing) {
      return notFoundResponse("Marketplace listing");
    }

    // Check if user is the seller
    if (listing.sellerId !== session.user.id && session.user.role !== "admin") {
      return errorResponse("You can only delete your own listings", 403);
    }

    // Delete the listing
    await prisma.marketplaceListing.delete({
      where: { id }
    });

    return successResponse(null, "Listing deleted successfully");
  } catch (error) {
    console.error("Error deleting marketplace listing:", error);
    return errorResponse("Failed to delete marketplace listing", 500);
  }
}