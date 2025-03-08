import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse } from '../../types';

const updateProfileSchema = z.object({
    name: z.string().min(2).max(50).optional(),
    email: z.string().email().optional(),
});

export const GET = auth(async function GET(request) {
    try {
        if (!request.auth?.user?.id) {
            return createErrorResponse('Unauthorized', 401);
        }

        const user = await prisma.user.findUnique({
            where: { id: request.auth.user.id },
            include: {
                platformStaff: true,
                publisherStaff: {
                    include: {
                        publisher: true
                    }
                },
                player: true,
                accounts: {
                    select: {
                        provider: true,
                        providerAccountId: true,
                    }
                }
            }
        });

        if (!user) {
            return createErrorResponse('User not found', 404);
        }

        return createSuccessResponse(user);
    } catch (error) {
        console.error('Profile GET error:', error);
        return createErrorResponse('Internal server error', 500);
    }
});

export const PATCH = auth(async function PATCH(request) {
    try {
        if (!request.auth?.user?.id) {
            return createErrorResponse('Unauthorized', 401);
        }

        const body = await request.json();
        const validatedData = updateProfileSchema.parse(body);

        const user = await prisma.user.update({
            where: { id: request.auth.user.id },
            data: validatedData,
            include: {
                platformStaff: true,
                publisherStaff: {
                    include: {
                        publisher: true
                    }
                },
                player: true,
                accounts: {
                    select: {
                        provider: true,
                        providerAccountId: true,
                    }
                }
            }
        });

        return createSuccessResponse(user);
    } catch (error) {
        console.error('Profile PATCH error:', error);
        if (error instanceof z.ZodError) {
            return createErrorResponse('Invalid data', 400);
        }
        return createErrorResponse('Internal server error', 500);
    }
}); 