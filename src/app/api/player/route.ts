import { prisma } from "@/prisma";
import { PlatformStaffRole } from "@prisma/client";
import { createSuccessResponse, createErrorResponse, checkRole } from "../types";
import { auth } from "@/auth";

const validRoles: PlatformStaffRole[] = [
    PlatformStaffRole.Owner,
    PlatformStaffRole.Admin,
    PlatformStaffRole.Moderator
];

export const PATCH = auth(async function PATCH(request) {
    try {
        // Check role
        await checkRole(request as any, validRoles);

        const body = await request.json();
        const { userId, newType } = body;

        if (!userId || !newType) {
            return createErrorResponse('Player ID and new type are required');
        }

        const player = await prisma.player.findUnique({
            where: { userId }
        });

        if (!player) {
            return createErrorResponse('Player not found', 404);
        }

        const updatedPlayer = await prisma.player.update({
            where: { userId },
            data: { type: newType }
        });

        return createSuccessResponse(updatedPlayer);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Insufficient permissions') {
                return createErrorResponse('Insufficient permissions', 403);
            }
        }
        return createErrorResponse('Internal server error', 500);
    }
});