import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = [
    { email: 'admin@ocms.com', password: 'admin123' },
    { email: 'nur949@gmail.com', password: 'nur9jamaL0978' }
  ];

  for (const u of users) {
    const user = await prisma.user.findUnique({ where: { email: u.email } });
    if (user) {
      const isMatch = await bcrypt.compare(u.password, user.password);
      console.log(`Email: ${u.email}, Password: ${u.password}, Match: ${isMatch}`);
    } else {
      console.log(`User ${u.email} not found`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
