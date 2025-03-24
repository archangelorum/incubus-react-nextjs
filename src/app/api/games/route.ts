import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest, authorizeOrganization } from "../utils/auth";
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse, 
  notFoundResponse 
} from "../utils/response";
import { 
  getPaginationParams, 
  getSortParams, 
  getFilterParams, 
  getSearchParams, 
  combineQueryParams 
} from "../utils/query";
import { validateBody, validateQuery } from "../utils/validation";
import { createGameSchema, gameQuerySchema } from "./schema";

/**
 * GET /api/games
 * 
 * Retrieves a paginated list of games
 * Supports filtering, sorting, and searching
 * 
 * @param req - The incoming request
 * @returns Paginated list of games
 */
export async function GET(req: NextRequest) {
  try {
    // Validate query parameters
    const queryResult = validateQuery(req, gameQuerySchema);
    if (queryResult instanceof Response) return queryResult;

    // Get pagination, sorting, and filtering parameters
    const { page, limit, skip } = getPaginationParams(req);
    const { orderBy } = getSortParams(
      req, 
      "createdAt", 
      "desc", 
      ["title", "releaseDate", "basePrice", "createdAt"]
    );
    
    console.log(orderBy);

    const url = new URL(req.url);
    
    // Build where clause
    let where: any = {};
    
    // Basic filters
    // Handle publisher filtering by ID or slug
    if (url.searchParams.has("publisherId")) {
      where.publisherId = url.searchParams.get("publisherId");
    } else if (url.searchParams.has("publisher")) {
      const publisherSlug = url.searchParams.get("publisher");
      where.publisher = {
        slug: publisherSlug
      };
    }
    
    // Handle developer filtering by ID or slug
    if (url.searchParams.has("developerId")) {
      where.developerIds = {
        some: {
          developerId: url.searchParams.get("developerId")
        }
      };
    } else if (url.searchParams.has("developer")) {
      const developerSlug = url.searchParams.get("developer");
      where.developerIds = {
        some: {
          developer: {
            slug: developerSlug
          }
        }
      };
    }
    
    // Handle genre filtering by ID or slug
    if (url.searchParams.has("genreId")) {
      where.genres = {
        some: {
          genreId: url.searchParams.get("genreId")
        }
      };
    } else if (url.searchParams.has("genre")) {
      const genreSlug = url.searchParams.get("genre");
      where.genres = {
        some: {
          genre: {
            slug: genreSlug
          }
        }
      };
    }
    
    // Handle tag filtering by ID or slug
    if (url.searchParams.has("tagId")) {
      where.tags = {
        some: {
          tagId: url.searchParams.get("tagId")
        }
      };
    } else if (url.searchParams.has("tag")) {
      const tagSlug = url.searchParams.get("tag");
      where.tags = {
        some: {
          tag: {
            slug: tagSlug
          }
        }
      };
    }
    
    if (url.searchParams.has("isActive")) {
      where.isActive = url.searchParams.get("isActive") === "true";
    }
    
    if (url.searchParams.has("isFeatured")) {
      where.isFeatured = url.searchParams.get("isFeatured") === "true";
    }
    
    // Price range filters
    if (url.searchParams.has("minPrice")) {
      where.basePrice = {
        ...where.basePrice,
        gte: parseFloat(url.searchParams.get("minPrice") || "0")
      };
    }
    
    if (url.searchParams.has("maxPrice")) {
      where.basePrice = {
        ...where.basePrice,
        lte: parseFloat(url.searchParams.get("maxPrice") || "999999")
      };
    }
    
    // Date range filters
    if (url.searchParams.has("releasedAfter")) {
      where.releaseDate = {
        ...where.releaseDate,
        gte: new Date(url.searchParams.get("releasedAfter") || "")
      };
    }
    
    if (url.searchParams.has("releasedBefore")) {
      where.releaseDate = {
        ...where.releaseDate,
        lte: new Date(url.searchParams.get("releasedBefore") || "")
      };
    }
    
    // Search
    if (url.searchParams.has("search")) {
      const searchTerm = url.searchParams.get("search") || "";
      where.OR = [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
        { shortDescription: { contains: searchTerm, mode: "insensitive" } }
      ];
    }

    // Fetch games with pagination
    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          shortDescription: true,
          publisherId: true,
          publisher: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true
            }
          },
          releaseDate: true,
          basePrice: true,
          discountPrice: true,
          isActive: true,
          isFeatured: true,
          contentRating: true,
          coverImage: {
            select: {
              id: true,
              path: true,
              contentCid: true
            }
          },
          _count: {
            select: {
              reviews: true,
              licenses: true
            }
          },
          genres: {
            select: {
              genre: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          },
          tags: {
            select: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          },
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.game.count({ where })
    ]);

    // Transform the response to flatten nested objects
    const transformedGames = games.map(game => ({
      ...game,
      genres: game.genres.map(g => g.genre),
      tags: game.tags.map(t => t.tag)
    }));

    return paginatedResponse(transformedGames, page, limit, total);
  } catch (error) {
    console.error("Error fetching games:", error);
    return errorResponse("Failed to fetch games", 500);
  }
}

/**
 * POST /api/games
 * 
 * Creates a new game
 * Publisher organization members with appropriate permissions can create games
 * 
 * @requires Authentication and publisher organization membership
 * 
 * @param req - The incoming request
 * @returns The created game
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate request
    const session = await authenticateRequest(req);
    if (session instanceof Response) return session;

    // Validate request body
    const validatedData = await validateBody(req, createGameSchema);
    if (validatedData instanceof Response) return validatedData;

    // Check if user has permission to create games for this publisher
    const publisher = await prisma.publisher.findUnique({
      where: { id: validatedData.publisherId }
    });

    if (!publisher) {
      return notFoundResponse("Publisher");
    }

    // If publisher is linked to an organization, check if user is a member with appropriate permissions
    if (publisher.organizationId) {
      const orgSession = await authorizeOrganization(req, publisher.organizationId, ["owner", "admin", "publisher"]);
      if (orgSession instanceof Response) return orgSession;
    } else {
      // If publisher is not linked to an organization, only admins can create games
      if (session.user.role !== "admin") {
        return errorResponse("You don't have permission to create games for this publisher", 403);
      }
    }

    // Generate slug if not provided
    const slug = validatedData.slug || validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug already exists
    const existingGame = await prisma.game.findUnique({
      where: { slug }
    });

    if (existingGame) {
      return errorResponse("A game with this slug already exists", 409);
    }

    // Extract arrays from validated data
    const { developerIds, tagIds, genreIds, screenshotIds, ...gameData } = validatedData;

    // Create game in a transaction
    const game = await prisma.$transaction(async (tx) => {
      // Create the game
      const newGame = await tx.game.create({
        data: {
          id: crypto.randomUUID(),
          ...gameData,
          slug, // Always provide the slug
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Add developers if provided
      if (developerIds && developerIds.length > 0) {
        await Promise.all(
          developerIds.map(developerId =>
            tx.developerGame.create({
              data: {
                id: crypto.randomUUID(),
                gameId: newGame.id,
                developerId
              }
            })
          )
        );
      }

      // Add tags if provided
      if (tagIds && tagIds.length > 0) {
        await Promise.all(
          tagIds.map(tagId =>
            tx.gameTag.create({
              data: {
                id: crypto.randomUUID(),
                gameId: newGame.id,
                tagId
              }
            })
          )
        );
      }

      // Add genres if provided
      if (genreIds && genreIds.length > 0) {
        await Promise.all(
          genreIds.map(genreId =>
            tx.gameGenre.create({
              data: {
                id: crypto.randomUUID(),
                gameId: newGame.id,
                genreId
              }
            })
          )
        );
      }

      // Add screenshots if provided
      if (screenshotIds && screenshotIds.length > 0) {
        await Promise.all(
          screenshotIds.map(screenshotId =>
            tx.contentFile.update({
              where: { id: screenshotId },
              data: {
                gameAsScreenshot: {
                  connect: { id: newGame.id }
                }
              }
            })
          )
        );
      }

      return newGame;
    });

    // Fetch the complete game with relationships
    const completeGame = await prisma.game.findUnique({
      where: { id: game.id },
      include: {
        publisher: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true
          }
        },
        developerIds: {
          include: {
            developer: true
          }
        },
        genres: {
          include: {
            genre: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        coverImage: true,
        trailerVideo: true,
        screenshots: true
      }
    });

    return successResponse(completeGame, "Game created successfully", undefined, 201);
  } catch (error) {
    console.error("Error creating game:", error);
    return errorResponse("Failed to create game", 500);
  }
}