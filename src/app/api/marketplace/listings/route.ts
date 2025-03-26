import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse, 
  notFoundResponse 
} from "@/app/api/utils/response";
import { 
  getPaginationParams, 
  getSortParams, 
  getSearchParams, 
  combineQueryParams 
} from "@/app/api/utils/query";
import { validateQuery } from "@/app/api/utils/validation";
import { marketplaceListingQuerySchema } from "../schema";

/**
 * GET /api/marketplace/listings
 * 
 * Retrieves a paginated list of marketplace listings
 * Supports filtering, sorting, and searching
 * 
 * @param req - The incoming request
 * @returns Paginated list of marketplace listings
 */
export async function GET(req: NextRequest) {
  try {
    // Validate query parameters
    const queryResult = validateQuery(req, marketplaceListingQuerySchema);
    if (queryResult instanceof Response) return queryResult;

    // Get pagination, sorting, and filtering parameters
    const { page, limit, skip } = getPaginationParams(req);
    const { orderBy } = getSortParams(
      req, 
      "createdAt", 
      "desc", 
      ["price", "createdAt", "updatedAt"]
    );
    
    const url = new URL(req.url);
    
    // Build where clause
    let where: any = {};
    
    // Basic filters
    if (url.searchParams.has("type")) {
      where.type = url.searchParams.get("type");
    }
    
    if (url.searchParams.has("status")) {
      where.status = url.searchParams.get("status");
    } else {
      // Default to showing only active listings
      where.status = "ACTIVE";
    }
    
    if (url.searchParams.has("sellerId")) {
      where.sellerId = url.searchParams.get("sellerId");
    }
    
    if (url.searchParams.has("gameId")) {
      where.gameId = url.searchParams.get("gameId");
    }
    
    if (url.searchParams.has("itemId")) {
      where.itemId = url.searchParams.get("itemId");
    }
    
    // Price range filters
    if (url.searchParams.has("minPrice")) {
      where.price = {
        ...where.price,
        gte: parseFloat(url.searchParams.get("minPrice") || "0")
      };
    }
    
    if (url.searchParams.has("maxPrice")) {
      where.price = {
        ...where.price,
        lte: parseFloat(url.searchParams.get("maxPrice") || "999999")
      };
    }
    
    // Search
    const searchParams = getSearchParams(req, ["game.title", "item.name"]);
    const combinedWhere = combineQueryParams({ where }, searchParams).where;

    // Fetch listings with pagination
    const [listings, total] = await Promise.all([
      prisma.marketplaceListing.findMany({
        where: combinedWhere,
        orderBy,
        skip,
        take: limit,
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
      }),
      prisma.marketplaceListing.count({ where: combinedWhere })
    ]);

    return paginatedResponse(listings, page, limit, total);
  } catch (error) {
    console.error("Error fetching marketplace listings:", error);
    return errorResponse("Failed to fetch marketplace listings", 500);
  }
}