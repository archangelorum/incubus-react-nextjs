'use server';

import { prisma } from '@/prisma';

export async function getUserRole(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                platformStaff: true,
                publisherStaff: true,
                player: true
            }
        });

        if (!user) return null;

        if (user.platformStaff) {
            return 'platform';
        } else if (user.publisherStaff) {
            return 'publisher';
        } else if (user.player) {
            return 'player';
        }

        return null;
    } catch (error) {
        console.error('Error checking user role:', error);
        return null;
    }
} 