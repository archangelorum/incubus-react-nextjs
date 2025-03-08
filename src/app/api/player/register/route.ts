import { prisma } from "@/prisma";
import { PlayerType } from "@prisma/client";
import { createSuccessResponse, createErrorResponse } from "../../types";
import { auth } from "@/auth";

export const POST = auth(async function POST(request) {
    try {
        const user = request.auth?.user;
        
        if (!user) {
            return createErrorResponse('Unauthorized access', 401);
        }

        // Check if player already exists
        const existingPlayer = await prisma.player.findUnique({
            where: { userId: user.id },
        });

        if (existingPlayer) {
            return createErrorResponse('Player already registered', 400);
        }

        // Create new player
        const player = await prisma.player.create({
            data: {
                userId: user.id,
                type: PlayerType.Standard,
            },
        });

        return createSuccessResponse(player);
    } catch (error) {
        console.error('Error registering player:', error);
        return createErrorResponse('Error registering player', 500);
    }
}); 