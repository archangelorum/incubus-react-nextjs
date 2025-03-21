import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

/**
 * Authentication middleware for API routes
 * Verifies the user is authenticated and attaches the user to the request
 *
 * @param req - The incoming request
 * @returns The authenticated session or an error response
 */
export async function authenticateRequest(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session || !session.user) {
        return NextResponse.json(
            { error: "Unauthorized: Authentication required" },
            { status: 401 }
        );
    }
    
    return session;
}

/**
 * Authorization middleware for admin-only routes
 * Verifies the user has admin privileges
 *
 * @param req - The incoming request
 * @returns The authenticated admin session or an error response
 */
export async function authorizeAdmin(req: NextRequest) {
    const session = await authenticateRequest(req);
    
    if (session instanceof NextResponse) {
        return session;
    }

    // Check if user has admin role
    if (session.user.role !== 'admin') {
        return NextResponse.json(
            { error: "Forbidden: Admin privileges required" },
            { status: 403 }
        );
    }

    return session;
}

/**
 * Authorization middleware for organization-specific routes
 * Verifies the user belongs to the specified organization with appropriate role
 *
 * @param req - The incoming request
 * @param organizationId - The organization ID to check against
 * @param requiredRoles - Optional array of roles that are allowed to access the resource
 * @returns The authenticated session or an error response
 */
export async function authorizeOrganization(
    req: NextRequest,
    organizationId: string,
    requiredRoles?: string[]
) {
    const session = await authenticateRequest(req);

    if (session instanceof NextResponse) {
        return session;
    }

    // Admin bypass - admins can access all organization resources
    if (session.user.role === 'admin') {
        return session;
    }

    // Check if user is a member of the organization
    // We need to fetch the membership from the database
    const { prisma } = await import('@/prisma');
    const membership = await prisma.member.findFirst({
        where: {
            userId: session.user.id,
            organizationId: organizationId
        }
    });

    if (!membership) {
        return NextResponse.json(
            { error: "Forbidden: Not a member of this organization" },
            { status: 403 }
        );
    }

    // If specific roles are required, check if the user has one of them
    if (requiredRoles && requiredRoles.length > 0) {
        if (!requiredRoles.includes(membership.role)) {
            return NextResponse.json(
                {
                    error: "Forbidden: Insufficient permissions",
                    requiredRoles,
                    userRole: membership.role
                },
                { status: 403 }
            );
        }
    }

    return session;
}

/**
 * Authorization middleware for user-specific routes
 * Verifies the authenticated user matches the requested user ID
 *
 * @param req - The incoming request
 * @param userId - The user ID to check against
 * @returns The authenticated session or an error response
 */
export async function authorizeUser(req: NextRequest, userId: string) {
    const session = await authenticateRequest(req);

    if (session instanceof NextResponse) {
        return session;
    }

    // Admin bypass - admins can access all user resources
    if (session.user.role === 'admin') {
        return session;
    }

    if (session.user.id !== userId) {
        return NextResponse.json(
            { error: "Forbidden: You can only access your own resources" },
            { status: 403 }
        );
    }

    return session;
}