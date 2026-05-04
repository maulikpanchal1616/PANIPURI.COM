import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up seeded data...');

  // Delete users (and cascading vendors/dishes) created by the seed script
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      email: {
        endsWith: '@example.com'
      }
    }
  });

  console.log(`Deleted ${deletedUsers.count} users and their associated vendors/dishes.`);
  console.log('Cleanup finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
