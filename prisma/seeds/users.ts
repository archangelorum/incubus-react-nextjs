import { prisma } from "../../src/prisma";
import { PlatformStaffRole, PlayerType, Publisher, PublisherStaffRole } from "@prisma/client";

export default async function seedUsers() {
    seedPlatformStaff();
    seedStaffIntoPublisher(await seedPublisher());
    seedPlayers();
}

async function seedPlatformStaff() {
    for (const role in PlatformStaffRole) {
        const user = await prisma.user.create({
            data: {
                email: `${role}@example.com`,
                name: role,
                emailVerified: new Date(),
                image: `https://example.com/${role}.png`,
            }
        });
        const platformStaff = await prisma.platformStaff.create({
            data: {
                userId: user.id,
                role: role as PlatformStaffRole
            }
        })
    }
}

const seedPublisher = async () => await prisma.publisher.create({
    data: {
        name: "Publisher",
        contactInfo: "publisher@example.com",
    }
})

async function seedStaffIntoPublisher(publisher: Publisher) {
    for (const role in PublisherStaffRole) {
        const user = await prisma.user.create({
            data: {
                email: `${role}@example.com`,
                name: role,
                emailVerified: new Date(),
                image: `https://example.com/${role}.png`,
            }
        });
        const publisherStaff = await prisma.publisherStaff.create({
            data: {
                publisherId: publisher.id,
                userId: user.id,
                role: role as PublisherStaffRole
            }
        })
    }
}

async function seedPlayers() {
    for (const role in PlayerType) {
        const user = await prisma.user.create({
            data: {
                email: `${role}@example.com`,
                name: role,
                emailVerified: new Date(),
                image: `https://example.com/${role}.png`,
            }
        });
        const player = await prisma.player.create({
            data: {
                userId: user.id,
                type: role as PlayerType
            }
        })
    }
}