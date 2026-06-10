import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const sales = await prisma.sale.findMany({
    select: { saleNumber: true, status: true }
  });
  console.log(JSON.stringify(sales, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
