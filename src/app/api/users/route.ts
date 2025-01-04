import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma';

// GET request to fetch all users
export async function GET() {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
}

// PATCH request to update a user's role
export async function PATCH(request: NextRequest) {
    const body = await request.json();
    const { id, action } = body;

    try {
        const user = await prisma.user.findUnique({ where: { id } });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (action === "rankUp" && user.roleId < 3) {
            user.roleId += 1;
        } else if (action === "rankDown" && user.roleId > 1) {
            user.roleId -= 1;
        }

        await prisma.user.update({
            where: { id },
            data: { roleId: user.roleId },
        });

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: `Error updating user's role: ${error.message}` }, { status: 500 });
    }
}

// DELETE request to remove a user
export async function DELETE(request: NextRequest) {
    const body = await request.json();
    const { id } = body;

    try {
        const user = await prisma.user.delete({
            where: { id },
        });
        return NextResponse.json( user );
    } catch (error) {
        return NextResponse.json({ error: `User not found or delete failed: ${error.message}` }, { status: 404 });
    }
}
