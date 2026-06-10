import prisma from '../src/database/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const hashedPassword = await bcrypt.hash('test123', 10);
  const role = await prisma.role.findFirst({ where: { name: 'super-admin' } });
  
  if (!role) throw new Error('Role not found');

  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: { password: hashedPassword },
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      roleId: role.id,
    },
  });

  console.log('User created/updated:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
