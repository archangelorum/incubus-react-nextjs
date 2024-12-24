import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma'; 

// GET request to fetch all users
export async function GET() {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
}

// PATCH request to update a user's role
export async function PATCH(request: NextRequest) {
    const { id, roleId } = await request.json();
    
    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data: { roleId },
        });
        return NextResponse.json(updatedUser);
    } catch (error) {
        return NextResponse.json({ error: 'User not found or update failed' }, { status: 404 });
    }
}

// DELETE request to remove a user
export async function DELETE(request: NextRequest) {
    const { id } = await request.json();
    
    try {
        await prisma.user.delete({
            where: { id },
        });
        return NextResponse.json({ message: 'User deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'User not found or delete failed' }, { status: 404 });
    }
}
