import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { authenticateRequest, authorizeOrganization } from "../../utils/auth";
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse 
} from "../../utils/response";
import { validateBody, validateParams } from "../../utils/validation";
import { updateGameSchema, gameIdSchema } from "../schema";

/**
 * GET /api/games/[id]
 * 
 * Retrieves a specific game by ID
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns The requested game
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    const validatedParams = validateParams(params, gameIdSchema);
    if (validatedParams instanceof Response) return validatedParams;

    // Fetch game with all relationships
    const game = await prisma.game.findUnique({
      where: { id: params.id },
      include: {
        publisher: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            website: true,
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
        versions: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          take: 1
        },
        coverImage: true,
        trailerVideo: true,
        screenshots: true,
        _count: {
          select: {
            reviews: true,
            licenses: true
          }
        }
      }
    });

    if (!game) {
      return notFoundResponse("Game");
    }

    // Transform the response to flatten nested objects
    const transformedGame = {
      ...game,
      developers: game.developerIds.map(d => d.developer),
      genres: game.genres.map(g => g.genre),
      tags: game.tags.map(t => t.tag),
      developerIds: undefined // Remove the original nested structure
    };

    return successResponse(transformedGame);
  } catch (error) {
    console.error("Error fetching game:", error);
    return errorResponse("Failed to fetch game", 500);
  }
}

/**
 * PUT /api/games/[id]
 * 
 * Updates a specific game
 * Publisher organization members with appropriate permissions can update games
 * 
 * @requires Authentication and publisher organization membership
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns The updated game
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    const validatedParams = validateParams(params, gameIdSchema);
    if (validatedParams instanceof Response) return validatedParams;

    // Authenticate request
    const session = await authenticateRequest(req);
    if (session instanceof Response) return session;

    // Validate request body
    const validatedData = await validateBody(req, updateGameSchema);
    if (validatedData instanceof Response) return validatedData;

    // Check if game exists
    const existingGame = await prisma.game.findUnique({
      where: { id: params.id },
      include: {
        publisher: true
      }
    });

    if (!existingGame) {
      return notFoundResponse("Game");
    }

    // Check if user has permission to update this game
    // If publisher is linked to an organization, check if user is a member with appropriate permissions
    if (existingGame.publisher.organizationId) {
      const orgSession = await authorizeOrganization(
        req, 
        existingGame.publisher.organizationId, 
        ["owner", "admin", "publisher"]
      );
      if (orgSession instanceof Response) return orgSession;
    } else {
      // If publisher is not linked to an organization, only admins can update games
      if (session.user.role !== "admin") {
        return errorResponse("You don't have permission to update this game", 403);
      }
    }

    // If slug is being changed, check if it's already in use
    if (validatedData.slug && validatedData.slug !== existingGame.slug) {
      const slugExists = await prisma.game.findUnique({
        where: { slug: validatedData.slug }
      });

      if (slugExists) {
        return errorResponse("Slug is already in use", 409);
      }
    }

    // Extract arrays from validated data
    const { developerIds, tagIds, genreIds, screenshotIds, ...gameData } = validatedData;

    // Update game in a transaction
    const updatedGame = await prisma.$transaction(async (tx) => {
      // Prepare update data with explicit fields
      const updateData: any = {
        updatedAt: new Date()
      };
      
      // Only include fields that are provided
      if (gameData.title !== undefined) updateData.title = gameData.title;
      if (gameData.slug !== undefined) updateData.slug = gameData.slug;
      if (gameData.description !== undefined) updateData.description = gameData.description;
      if (gameData.shortDescription !== undefined) updateData.shortDescription = gameData.shortDescription;
      if (gameData.publisherId !== undefined) updateData.publisherId = gameData.publisherId;
      if (gameData.releaseDate !== undefined) updateData.releaseDate = gameData.releaseDate;
      if (gameData.basePrice !== undefined) updateData.basePrice = gameData.basePrice;
      if (gameData.discountPrice !== undefined) updateData.discountPrice = gameData.discountPrice;
      if (gameData.isActive !== undefined) updateData.isActive = gameData.isActive;
      if (gameData.isFeatured !== undefined) updateData.isFeatured = gameData.isFeatured;
      if (gameData.contentRating !== undefined) updateData.contentRating = gameData.contentRating;
      if (gameData.systemRequirements !== undefined) updateData.systemRequirements = gameData.systemRequirements;
      if (gameData.coverImageId !== undefined) updateData.coverImageId = gameData.coverImageId;
      if (gameData.trailerVideoId !== undefined) updateData.trailerVideoId = gameData.trailerVideoId;
      
      // Update the game
      const game = await tx.game.update({
        where: { id: params.id },
        data: updateData
      });

      // Update developers if provided
      if (developerIds) {
        // Remove existing developer associations
        await tx.developerGame.deleteMany({
          where: { gameId: params.id }
        });

        // Add new developer associations
        if (developerIds.length > 0) {
          await Promise.all(
            developerIds.map(developerId =>
              tx.developerGame.create({
                data: {
                  id: crypto.randomUUID(),
                  gameId: params.id,
                  developerId
                }
              })
            )
          );
        }
      }

      // Update tags if provided
      if (tagIds) {
        // Remove existing tag associations
        await tx.gameTag.deleteMany({
          where: { gameId: params.id }
        });

        // Add new tag associations
        if (tagIds.length > 0) {
          await Promise.all(
            tagIds.map(tagId =>
              tx.gameTag.create({
                data: {
                  id: crypto.randomUUID(),
                  gameId: params.id,
                  tagId
                }
              })
            )
          );
        }
      }

      // Update genres if provided
      if (genreIds) {
        // Remove existing genre associations
        await tx.gameGenre.deleteMany({
          where: { gameId: params.id }
        });

        // Add new genre associations
        if (genreIds.length > 0) {
          await Promise.all(
            genreIds.map(genreId =>
              tx.gameGenre.create({
                data: {
                  id: crypto.randomUUID(),
                  gameId: params.id,
                  genreId
                }
              })
            )
          );
        }
      }

      // Update screenshots if provided
      if (screenshotIds) {
        // Remove existing screenshot associations
        await tx.game.update({
          where: { id: params.id },
          data: {
            screenshots: {
              set: []
            }
          }
        });

        // Add new screenshot associations
        if (screenshotIds.length > 0) {
          await Promise.all(
            screenshotIds.map(screenshotId =>
              tx.contentFile.update({
                where: { id: screenshotId },
                data: {
                  gameAsScreenshot: {
                    connect: { id: params.id }
                  }
                }
              })
            )
          );
        }
      }

      return game;
    });

    // Fetch the complete updated game with relationships
    const completeGame = await prisma.game.findUnique({
      where: { id: updatedGame.id },
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

    return successResponse(completeGame, "Game updated successfully");
  } catch (error) {
    console.error("Error updating game:", error);
    return errorResponse("Failed to update game", 500);
  }
}

/**
 * DELETE /api/games/[id]
 * 
 * Deletes a specific game
 * Publisher organization members with appropriate permissions can delete games
 * 
 * @requires Authentication and publisher organization membership
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns Success message
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    const validatedParams = validateParams(params, gameIdSchema);
    if (validatedParams instanceof Response) return validatedParams;

    // Authenticate request
    const session = await authenticateRequest(req);
    if (session instanceof Response) return session;

    // Check if game exists
    const existingGame = await prisma.game.findUnique({
      where: { id: params.id },
      include: {
        publisher: true
      }
    });

    if (!existingGame) {
      return notFoundResponse("Game");
    }

    // Check if user has permission to delete this game
    // If publisher is linked to an organization, check if user is a member with appropriate permissions
    if (existingGame.publisher.organizationId) {
      const orgSession = await authorizeOrganization(
        req, 
        existingGame.publisher.organizationId, 
        ["owner", "admin"]
      );
      if (orgSession instanceof Response) return orgSession;
    } else {
      // If publisher is not linked to an organization, only admins can delete games
      if (session.user.role !== "admin") {
        return errorResponse("You don't have permission to delete this game", 403);
      }
    }

    // Check if game has licenses
    const licensesCount = await prisma.gameLicense.count({
      where: { gameId: params.id }
    });

    if (licensesCount > 0) {
      return errorResponse(
        "Cannot delete game with existing licenses. Deactivate the game instead.",
        400
      );
    }

    // Delete game
    await prisma.game.delete({
      where: { id: params.id }
    });

    return successResponse(null, "Game deleted successfully");
  } catch (error) {
    console.error("Error deleting game:", error);
    return errorResponse("Failed to delete game", 500);
  }
}