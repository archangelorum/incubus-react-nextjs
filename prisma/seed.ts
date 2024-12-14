import { prisma } from './prisma'

async function main() {
  const user = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: {
        id: 1,
        name: "user",
    },
  })
  const admin = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
        id: 2,
        name: "admin"
    }
  })
  const contentCreator = await prisma.role.upsert({
    where: { name: "content_creator" },
    update: {},
    create: {
        id: 3,
        name: "content_creator"
    }
  })
  console.log({user, admin, contentCreator});
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })