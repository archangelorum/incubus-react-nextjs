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
 * GET /api/tags
 * 
 * Retrieves a paginated list of tags
 * Supports sorting and searching
 * 
 * @param req - The incoming request
 * @returns Paginated list of tags
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
        { name: { contains: searchTerm, mode: "insensitive" } }
      ];
    }

    // Fetch tags with pagination
    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              games: true,
              items: true
            }
          }
        }
      }),
      prisma.tag.count({ where })
    ]);

    return paginatedResponse(tags, page, limit, total);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return errorResponse("Failed to fetch tags", 500);
  }
}