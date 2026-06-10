import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sales = await prisma.sale.findMany({
    include: { devices: true }
  });

  console.log(`Found ${sales.length} sales. Starting migration...`);

  for (const sale of sales) {
    if (!sale.remarks) continue;

    // Pattern: "... | Devices: Scanner, Label Print, Desktop"
    const devicesMatch = sale.remarks.match(/\| Devices: (.*)$/);
    if (!devicesMatch) continue;

    const deviceNamesStr = devicesMatch[1].trim();
    if (deviceNamesStr === 'No' || deviceNamesStr === 'N/A' || deviceNamesStr === '') continue;

    const deviceNames = deviceNamesStr.split(',').map(d => d.trim()).filter(d => d !== '');

    console.log(`Sale ${sale.saleNumber}: Found devices [${deviceNames.join(', ')}] in remarks.`);

    const deviceIds: string[] = [];

    for (const name of deviceNames) {
      // Find or create device
      let device = await prisma.device.findUnique({
        where: { name }
      });

      if (!device) {
        console.log(`Creating new device: ${name}`);
        device = await prisma.device.create({
          data: { name }
        });
      }
      deviceIds.push(device.id);
    }

    if (deviceIds.length > 0) {
      await prisma.sale.update({
        where: { id: sale.id },
        data: {
          devices: {
            connect: deviceIds.map(id => ({ id }))
          }
        }
      });
      console.log(`Updated sale ${sale.saleNumber} with ${deviceIds.length} devices.`);
    }
  }

  console.log('Migration completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
