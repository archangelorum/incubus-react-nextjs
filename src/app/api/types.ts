import { NextResponse } from "next/server";
import { PlatformStaffRole, PublisherStaffRole } from "@prisma/client";
import { prisma } from "@/prisma";

export type Role = PlatformStaffRole | PublisherStaffRole;

export type ApiResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

export type ApiError = {
    success: false;
    error: string;
};

export const createSuccessResponse = <T>(data: T): NextResponse<ApiResponse<T>> => {
    return NextResponse.json({
        success: true,
        data
    });
};

export const createErrorResponse = (
    error: string,
    status: number = 400
): NextResponse<ApiError> => {
    return NextResponse.json({
        success: false,
        error
    }, { status });
};

export const handleApiError = (error: unknown): NextResponse<ApiError> => {
    console.error('API Error:', error);
    return createErrorResponse(
        'Internal server error',
        500
    );
};

export const checkRole = async (request: Request, allowedRoles: Role[]) => {
    const platformStaff = await prisma.platformStaff.findUnique({
        where: { userId: request.auth?.user.id }
    });

    const publisherStaff = await prisma.publisherStaff.findUnique({
        where: { userId: request.auth?.user.id }
    });

    const userRoles: Role[] = [];
    if (platformStaff) userRoles.push(platformStaff.role);
    if (publisherStaff) userRoles.push(publisherStaff.role);
    
    const hasValidRole = userRoles.some(role => allowedRoles.includes(role));
    if (!hasValidRole) {
        throw new Error('Insufficient permissions');
    }

    return { userRoles };
}; 