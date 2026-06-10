import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sales = await prisma.sale.findMany({});

  console.log(`Found ${sales.length} sales. Starting cleanup...`);

  for (const sale of sales) {
    if (!sale.remarks) continue;

    // Pattern to find: " | Devices: ..." or "| Devices: ..."
    // We want to remove this part.
    const newRemarks = sale.remarks.replace(/\s*\|?\s*Devices:.*$/, '').trim();

    if (newRemarks !== sale.remarks) {
      await prisma.sale.update({
        where: { id: sale.id },
        data: { remarks: newRemarks }
      });
      console.log(`Updated sale ${sale.saleNumber}: Cleaned remarks.`);
    }
  }

  console.log('Cleanup completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
