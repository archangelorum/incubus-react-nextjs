import { prisma } from '../src/prisma'
import seedAll from './seeds/index';

async function main() {
  await seedAll();
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
