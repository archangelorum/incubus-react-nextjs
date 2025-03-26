import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/app/api/utils/auth";
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse 
} from "@/app/api/utils/response";
import { validateBody } from "@/app/api/utils/validation";
import { createMarketplaceListingSchema } from "./schema";

/**
 * POST /api/marketplace/listings
 * 
 * Creates a new marketplace listing
 * 
 * @requires Authentication
 * 
 * @param req - The incoming request
 * @returns The created marketplace listing
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate request
    const session = await authenticateRequest(req);
    if (session instanceof Response) return session;

    // Validate request body
    const validatedData = await validateBody(req, createMarketplaceListingSchema);
    if (validatedData instanceof Response) return validatedData;

    const { type, price, quantity, gameId, itemId, expiresAt } = validatedData;

    // Verify ownership based on listing type
    if (type === "GAME_LICENSE" && gameId) {
      // Check if user owns the game license
      const license = await prisma.gameLicense.findFirst({
        where: {
          gameId,
          wallet: {
            userId: session.user.id
          },
          isActive: true
        }
      });

      if (!license) {
        return errorResponse("You don't own a license for this game", 403);
      }
    } else if (type === "GAME_ITEM" && itemId) {
      // Check if user owns the item
      const ownership = await prisma.itemOwnership.findFirst({
        where: {
          itemId,
          wallet: {
            userId: session.user.id
          },
          quantity: {
            gte: quantity
          }
        }
      });

      if (!ownership) {
        return errorResponse("You don't own enough of this item", 403);
      }
    } else if (type === "BUNDLE") {
      // Bundle validation would go here
      return errorResponse("Bundle listings are not yet supported", 400);
    }

    // Create the listing
    const listing = await prisma.marketplaceListing.create({
      data: {
        id: crypto.randomUUID(),
        type,
        status: "ACTIVE",
        sellerId: session.user.id,
        price,
        quantity,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        gameId,
        itemId,
        createdAt: new Date(),
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

    return successResponse(listing, "Listing created successfully", undefined, 201);
  } catch (error) {
    console.error("Error creating marketplace listing:", error);
    return errorResponse("Failed to create marketplace listing", 500);
  }
}