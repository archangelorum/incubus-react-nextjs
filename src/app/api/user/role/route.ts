import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/prisma';
import { createSuccessResponse, createErrorResponse } from '../../types';

export const GET = auth(async function GET(request) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: request.auth?.user.id },
            include: {
                platformStaff: true,
                publisherStaff: true,
                player: true
            }
        });

        if (!user) {
            return createErrorResponse('User not found', 404);
        }

        let role = null;
        if (user.platformStaff) {
            role = 'platform';
        } else if (user.publisherStaff) {
            role = 'publisher';
        } else if (user.player) {
            role = 'player';
        }

        return createSuccessResponse({ role });
    } catch (error) {
        return createErrorResponse('Internal server error', 500);
    }
}); 