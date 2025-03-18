import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { createSuccessResponse, createErrorResponse, handleApiError, checkRole } from "../types";
import { PlatformStaffRole, PublisherStaffRole } from "@prisma/client";
import { z } from "zod";

const gameCreateSchema = z.object({
  title: z.string().min(3),
  publisherId: z.number().int(),
  releaseDate: z.coerce.date(),
  price: z.number().positive(),
  description: z.string().min(10),
  genreIds: z.array(z.number().int()).optional()
});

const gameUpdateSchema = gameCreateSchema.partial();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const games = await prisma.game.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        publisher: true,
        gameGenres: { include: { genre: true } }
      }
    });

    const total = await prisma.game.count();

    return createSuccessResponse({
      data: games,
      pagination: { page, pageSize, total }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = gameCreateSchema.safeParse(body);

    if (!validation.success) {
      return createErrorResponse(validation.error.message, 400);
    }

    const { userRoles } = await checkRole(req, [PublisherStaffRole.Publisher]);

    const gameData = validation.data;
    const game = await prisma.game.create({
      data: {
        title: gameData.title,
        publisherId: gameData.publisherId,
        releaseDate: gameData.releaseDate,
        price: gameData.price,
        description: gameData.description,
        gameGenres: gameData.genreIds ? {
          createMany: {
            data: gameData.genreIds.map(genreId => ({ genreId }))
          }
        } : undefined
      },
      include: {
        publisher: true,
        gameGenres: { include: { genre: true } }
      }
    });

    return NextResponse.json({
      success: true,
      data: game
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}