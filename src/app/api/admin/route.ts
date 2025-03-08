import { prisma } from '@/prisma';
import { auth } from '@/auth';
import { PlatformStaffRole } from '@prisma/client';
import { createSuccessResponse, createErrorResponse, checkRole } from '../types';

const validRoles: PlatformStaffRole[] = [
    PlatformStaffRole.Owner,
    PlatformStaffRole.Admin
];

export const GET = auth(async function GET(request) {
    try {
        // Check role
        await checkRole(request, validRoles);

        // Get admin dashboard data
        const stats = await prisma.$transaction([
            prisma.user.count(),
            prisma.player.count(),
            prisma.game.count(),
            prisma.publisher.count()
        ]);

        return createSuccessResponse({
            stats: {
                totalUsers: stats[0],
                totalPlayers: stats[1],
                totalGames: stats[2],
                totalPublishers: stats[3]
            }
        });
    } catch (error) {
        console.error('Admin API Error:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        
        if (error instanceof Error) {
            if (error.message === 'Insufficient permissions') {
                return createErrorResponse('Insufficient permissions', 403);
            }
        }
        return createErrorResponse('Internal server error', 500);
    }
}); 