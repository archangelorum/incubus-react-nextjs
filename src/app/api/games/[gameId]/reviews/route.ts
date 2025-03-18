import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import {
  createSuccessResponse,
  createErrorResponse,
  handleApiError,
  type NextRequestWithAuth
} from "../../../types";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional()
});

export async function GET(req: NextRequest, { params }: { params: { gameId: string } }) {
  try {
    const gameId = parseInt(params.gameId);
    if (isNaN(gameId)) {
      return createErrorResponse("Invalid game ID", 400);
    }

    const reviews = await prisma.review.findMany({
      where: { gameId },
      include: { player: true }
    });

    return createSuccessResponse(reviews);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequestWithAuth, { params }: { params: { gameId: string } }) {
  try {
    const gameId = parseInt(params.gameId);
    if (isNaN(gameId)) {
      return createErrorResponse("Invalid game ID", 400);
    }

    const userId = req.auth?.user?.id;
    if (!userId) {
      return createErrorResponse("Authentication required", 401);
    }

    const body = await req.json();
    const validation = reviewSchema.safeParse(body);
    
    if (!validation.success) {
      return createErrorResponse(validation.error.message, 400);
    }

    const review = await prisma.review.create({
      data: {
        gameId,
        playerId: userId,
        rating: validation.data.rating,
        comment: validation.data.comment
      },
      include: { player: true }
    });

    return NextResponse.json({
      success: true,
      data: review
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}