import { prisma } from '../src/prisma'
import seedUsers from './seeds/users';

async function main() {
  await seedUsers();

  console.log('Seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
