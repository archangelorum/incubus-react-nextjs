import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { PlatformStaffRole } from "@prisma/client";
import { createSuccessResponse, createErrorResponse, checkRole } from "../types";

const validRoles: PlatformStaffRole[] = [
    PlatformStaffRole.Owner,
    PlatformStaffRole.Admin,
    PlatformStaffRole.Moderator
];

export const GET = auth(async function GET(request) {
    try {
        // Check role
        await checkRole(request, validRoles);

        const page = Number(request.nextUrl.searchParams.get('page')) || 1;
        const limit = Number(request.nextUrl.searchParams.get('limit')) || 10;

        const staff = await prisma.platformStaff.findMany({
            select: {
                role: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    }
                }
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        const totalStaff = await prisma.platformStaff.count();

        return createSuccessResponse({ staff, totalStaff, page, limit });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Insufficient permissions') {
                return createErrorResponse('Insufficient permissions', 403);
            }
        }
        return createErrorResponse('Internal server error', 500);
    }
});

export const POST = auth(async function POST(request) {
    try {
        // Check role
        await checkRole(request, validRoles);

        const { email, name, role } = await request.json();

        if (!email || !name || !role) {
            return createErrorResponse('Missing required fields');
        }

        // Create user first
        const user = await prisma.user.create({
            data: {
                email,
                name,
                emailVerified: new Date(),
            }
        });

        // Then create platform staff
        const newStaff = await prisma.platformStaff.create({
            data: {
                userId: user.id,
                role: role as PlatformStaffRole
            },
            select: {
                role: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    }
                }
            }
        });

        return createSuccessResponse({ staff: newStaff });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Insufficient permissions') {
                return createErrorResponse('Insufficient permissions', 403);
            }
        }
        return createErrorResponse('Internal server error', 500);
    }
});

export const DELETE = auth(async function DELETE(request) {
    try {
        // Check role
        await checkRole(request, validRoles);

        const { userId } = await request.json();

        if (!userId) {
            return createErrorResponse('User ID is required');
        }

        // Delete platform staff first (due to foreign key constraint)
        await prisma.platformStaff.delete({
            where: { userId }
        });

        // Then delete the user
        await prisma.user.delete({
            where: { id: userId }
        });

        return createSuccessResponse({ success: true });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Insufficient permissions') {
                return createErrorResponse('Insufficient permissions', 403);
            }
        }
        return createErrorResponse('Internal server error', 500);
    }
}); 