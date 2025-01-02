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
  const contentCreator = await prisma.role.upsert({
    where: { name: "content_creator" },
    update: {},
    create: {
        id: 2,
        name: "content_creator"
    }
  })
  const admin = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
        id: 3,
        name: "admin"
    }
  })
  console.log({user, contentCreator, admin});
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