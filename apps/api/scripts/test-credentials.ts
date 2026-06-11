import { PrismaClient } from '@prisma/client';

const usernames = [
  'nur949',
  'nurjamalbabu949',
  'nurjamalbabu949@gmail.com',
  'nur949@gmail.com',
  'admin',
  'ocms'
];

const password = 'nur9jamaL0978';
const host = 'ocms.u0gxigz.mongodb.net';

async function testAll() {
  for (const user of usernames) {
    const encodedUser = encodeURIComponent(user);
    const uri = `mongodb+srv://${encodedUser}:${password}@${host}/ocms?retryWrites=true&w=majority`;
    console.log(`Testing username: "${user}"...`);
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: uri,
        },
      },
    });

    try {
      await prisma.$connect();
      // Try a simple count query
      await prisma.role.count();
      console.log(`\n========================================`);
      console.log(`SUCCESS! Username "${user}" connected successfully.`);
      console.log(`========================================\n`);
      await prisma.$disconnect();
      return;
    } catch (err: any) {
      console.log(`Failed for "${user}":`, err.message || err);
      await prisma.$disconnect();
    }
  }
  console.log("None of the usernames worked.");
}

testAll();

