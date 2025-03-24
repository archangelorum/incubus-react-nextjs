import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse, 
  notFoundResponse 
} from "../utils/response";
import { 
  getPaginationParams, 
  getSortParams, 
  getSearchParams
} from "../utils/query";

/**
 * GET /api/publishers
 * 
 * Retrieves a paginated list of game publishers
 * Supports sorting and searching
 * 
 * @param req - The incoming request
 * @returns Paginated list of publishers
 */
export async function GET(req: NextRequest) {
  try {
    // Get pagination and sorting parameters
    const { page, limit, skip } = getPaginationParams(req);
    const { orderBy } = getSortParams(
      req, 
      "name", 
      "asc", 
      ["name", "createdAt", "isVerified"]
    );
    
    const url = new URL(req.url);
    
    // Build where clause
    let where: any = {};
    
    // Search
    if (url.searchParams.has("search")) {
      const searchTerm = url.searchParams.get("search") || "";
      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } }
      ];
    }

    // Filter by verification status
    if (url.searchParams.has("verified")) {
      const verified = url.searchParams.get("verified") === "true";
      where.isVerified = verified;
    }

    // Fetch publishers with pagination
    const [publishers, total] = await Promise.all([
      prisma.publisher.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          website: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              games: true
            }
          }
        }
      }),
      prisma.publisher.count({ where })
    ]);

    return paginatedResponse(publishers, page, limit, total);
  } catch (error) {
    console.error("Error fetching publishers:", error);
    return errorResponse("Failed to fetch publishers", 500);
  }
}