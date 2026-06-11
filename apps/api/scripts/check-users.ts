import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching users from DB...");
  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
      },
    });
    console.log(`\n========================================`);
    console.log(`Found ${users.length} users in the database:`);
    for (const u of users) {
      console.log(`- Name: ${u.name}, Email: ${u.email}, Role: ${u.role.name}, Status: ${u.status}`);
    }
    console.log(`========================================\n`);
  } catch (error) {
    console.error("Failed to fetch users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
