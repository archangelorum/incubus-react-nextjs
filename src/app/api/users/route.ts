import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/prisma';
import { z } from 'zod';
import logger from '@/logger';

// Constants for role management
const MIN_ROLE = 1;
const MAX_ROLE = 3;

// Helper function for role checking
const checkUserRole = async (req, minimumRole: number): Promise<NextResponse | null> => {
    if (!req.auth || req.auth.user.roleId < minimumRole) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
    return null;
};

// Middleware to check authentication
const authenticateRequest = async (req): Promise<NextResponse | null> => {
    if (!req.auth) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
    return null;
};

// Define request body schemas using Zod
const PatchRequestBodySchema = z.object({
    id: z.string().uuid(), // Ensure ID is a valid UUID
    action: z.enum(['rankUp', 'rankDown']),
});

const DeleteRequestBodySchema = z.object({
    id: z.string().uuid(),
});

// Type definitions for request bodies
type PatchRequestBody = z.infer<typeof PatchRequestBodySchema>;
type DeleteRequestBody = z.infer<typeof DeleteRequestBodySchema>;

// GET request to fetch all users with pagination
export const GET = auth(async function GET(request) {
    console.log(request.auth);
    const authCheckResponse = await authenticateRequest(request);
    if (authCheckResponse) return authCheckResponse;

    const roleCheckResponse = await checkUserRole(request, MIN_ROLE);
    if (roleCheckResponse) return roleCheckResponse;

    const page = Number(request.nextUrl.searchParams.get('page')) || 1; // Get page number from query params
    const limit = Number(request.nextUrl.searchParams.get('limit')) || 10; // Get limit from query params

    try {
        const users = await prisma.user.findMany({
            skip: (page - 1) * limit,
            take: limit,
        });
        const totalUsers = await prisma.user.count(); // Count total users for pagination
        return NextResponse.json({ success: true, users, totalUsers, page, limit });
    } catch (error) {
        logger.error(`Error fetching users: ${error.message}`);
        return NextResponse.json({ success: false, error: `Error fetching users` }, { status: 500 });
    }
});

// PATCH request to update a user's role
export const PATCH = auth(async function PATCH(request) {
    request.auth?.user;
    const authCheckResponse = await authenticateRequest(request);
    if (authCheckResponse) return authCheckResponse;

    const roleCheckResponse = await checkUserRole(request, MIN_ROLE);
    if (roleCheckResponse) return roleCheckResponse;

    let body: unknown; // Declare a variable for the request body

    try {
        body = await request.json(); // Get the request body
        const parsedBody: PatchRequestBody = PatchRequestBodySchema.parse(body); // Validate input

        const user = await prisma.user.findUnique({ where: { id: parsedBody.id } });

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        // Update user role based on action
        if (parsedBody.action === "rankUp" && user.roleId < MAX_ROLE) {
            user.roleId += 1;
        } else if (parsedBody.action === "rankDown" && user.roleId > MIN_ROLE) {
            user.roleId -= 1;
        }

        await prisma.user.update({
            where: { id: parsedBody.id },
            data: { roleId: user.roleId },
        });

        logger.info(`User role updated successfully for user ID ${parsedBody.id}`);
        return NextResponse.json({
            success: true,
            message: "User role updated successfully",
            user,
        });
    } catch (error) {
        logger.error(`Error updating user's role for ID ${body?.id || 'unknown'}: ${error.message}`);
        return NextResponse.json({ success: false, error: `Error updating user's role`, details: error.message }, { status: 500 });
    }
});

// DELETE request to remove a user
export const DELETE = auth(async function DELETE(request: NextRequest) {
    const authCheckResponse = await authenticateRequest(request);
    if (authCheckResponse) return authCheckResponse;

    const roleCheckResponse = await checkUserRole(request, MIN_ROLE);
    if (roleCheckResponse) return roleCheckResponse;

    let body: unknown; // Declare a variable for the request body

    try {
        body = await request.json(); // Get the request body
        const parsedBody: DeleteRequestBody = DeleteRequestBodySchema.parse(body); // Validate input

        const user = await prisma.user.findUnique({ where: { id: parsedBody.id } });

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        await prisma.user.delete({
            where: { id: parsedBody.id },
        });

        logger.info(`User deleted successfully with ID ${parsedBody.id}`);
        return NextResponse.json({ success: true, message: "User deleted successfully" }, { status: 204 }); // No content response
    } catch (error) {
        logger.error(`Delete failed for user ID ${body?.id || 'unknown'}: ${error.message}`);
        return NextResponse.json({ success: false, error: `Delete failed`, details: error.message }, { status: 500 });
    }
});
