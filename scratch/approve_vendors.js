const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.vendor.updateMany({
    data: {
      isApproved: true,
      isActive: true
    }
  });
  console.log(`Updated ${updated.count} vendors.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
