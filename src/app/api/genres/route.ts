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
 * GET /api/genres
 * 
 * Retrieves a paginated list of game genres
 * Supports sorting and searching
 * 
 * @param req - The incoming request
 * @returns Paginated list of genres
 */
export async function GET(req: NextRequest) {
  try {
    // Get pagination and sorting parameters
    const { page, limit, skip } = getPaginationParams(req);
    const { orderBy } = getSortParams(
      req, 
      "name", 
      "asc", 
      ["name", "createdAt"]
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

    // Fetch genres with pagination
    const [genres, total] = await Promise.all([
      prisma.genre.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              games: true
            }
          }
        }
      }),
      prisma.genre.count({ where })
    ]);

    return paginatedResponse(genres, page, limit, total);
  } catch (error) {
    console.error("Error fetching genres:", error);
    return errorResponse("Failed to fetch genres", 500);
  }
}