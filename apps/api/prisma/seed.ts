import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'super-admin' },
    update: {},
    create: {
      name: 'super-admin',
      permissions: JSON.stringify(['ALL']),
    },
  });

  const coordinatorRole = await prisma.role.upsert({
    where: { name: 'coordinator' },
    update: {},
    create: {
      name: 'coordinator',
      permissions: JSON.stringify(['MANAGE_CUSTOMERS', 'MANAGE_SALES', 'MANAGE_INSTALLATIONS']),
    },
  });

  // Users
  const adminPassword = await bcrypt.hash('nur9jamaL0978', 10);
  await prisma.user.upsert({
    where: { email: 'nurjamalbabu949@gmail.com' },
    update: { password: adminPassword },
    create: {
      email: 'nurjamalbabu949@gmail.com',
      name: 'Nur Jamal',
      password: adminPassword,
      roleId: adminRole.id,
    },
  });

  const defaultPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@ocms.com' },
    update: {},
    create: {
      email: 'admin@ocms.com',
      name: 'Super Admin',
      password: defaultPassword,
      roleId: adminRole.id,
    },
  });

  // Engineers
  await prisma.engineer.upsert({
    where: { engineerId: 'ENG-1001' },
    update: {},
    create: {
      engineerId: 'ENG-1001',
      name: 'John Doe',
      phone: '01711111111',
      joiningDate: new Date(),
      status: 'active',
    },
  });

  await prisma.engineer.upsert({
    where: { engineerId: 'ENG-1002' },
    update: {},
    create: {
      engineerId: 'ENG-1002',
      name: 'Jane Smith',
      phone: '01822222222',
      joiningDate: new Date(),
      status: 'active',
    },
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
