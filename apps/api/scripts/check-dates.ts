import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sales = await prisma.sale.findMany({
    take: 50,
    select: {
      id: true,
      customerName: true,
      saleDate: true,
    }
  });
  console.log(JSON.stringify(sales, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
