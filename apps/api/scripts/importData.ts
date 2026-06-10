import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function parseDate(dateInput: any): Date | null {
  if (!dateInput) return null;
  
  // Handle Excel serial numbers
  if (typeof dateInput === 'number') {
    const originalDate = new Date(Math.round((dateInput - 25569) * 86400 * 1000));
    const day = originalDate.getUTCDate();
    const month = originalDate.getUTCMonth() + 1; // 1-indexed
    const year = originalDate.getUTCFullYear();

    // The user's Excel file has Month and Day swapped in serial numbers
    // e.g., Jan 6 (46028) was intended as June 1st.
    // If day <= 12, we treat the 'day' as the 'month'.
    if (month <= 12 && day <= 12) {
      return new Date(year, day - 1, month);
    }
    return originalDate;
  }

  // Handle string dates like '14-06-26' (DD-MM-YY)
  if (typeof dateInput === 'string' && dateInput.includes('-')) {
    const parts = dateInput.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      const fullYear = year < 100 ? 2000 + year : year;
      // Parse as DD-MM-YY
      const date = new Date(fullYear, month - 1, day);
      if (!isNaN(date.getTime())) return date;
    }
  }

  const date = new Date(dateInput);
  return isNaN(date.getTime()) ? null : date;
}

async function main() {
  const filePath = "C:\\Users\\nurja\\Desktop\\Install management Software\\Data.xlsx";
  const workbook = XLSX.readFile(filePath, { cellDates: false });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  console.log(`Found ${data.length} rows in the Excel file.`);

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.sale.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.engineer.deleteMany({});
  await prisma.salesPerson.deleteMany({});
  console.log('Data cleared.');

  // Get or Create Default Roles
  const roles = ['super-admin', 'coordinator', 'sales-executive'];
  const roleMap: Record<string, string> = {};

  for (const roleName of roles) {
    let role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      role = await prisma.role.create({
        data: { 
          name: roleName, 
          permissions: JSON.stringify(roleName === 'super-admin' ? ['all'] : ['manage']) 
        }
      });
    }
    roleMap[roleName] = role.id;
  }

  // Ensure super-admin exists
  let superAdmin = await prisma.user.findUnique({ where: { email: 'admin@ocms.com' } });
  if (!superAdmin) {
    superAdmin = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'admin@ocms.com',
        password: await bcrypt.hash('admin123', 10),
        roleId: roleMap['super-admin']
      }
    });
  }

  for (const row of data as any[]) {
    try {
      const customerName = row['Customer Name'] || 'Unknown';
      const businessName = row['Business Name'] || customerName;
      const phone = String(row['Number'] || '0000000000');
      const location = row['Location'] || 'N/A';
      
      const saleDate = parseDate(row['Date of Sale']) || new Date();
      const installDate = parseDate(row['Install Date']);
      
      const softwarePrice = parseFloat(row['Soft Price'] || 0);
      const monthlyCharge = parseFloat(row['M Charge'] || 0);
      const advanceAmount = parseFloat(row['Advance'] || 0);
      const dueAmount = softwarePrice - advanceAmount;
      
      const salesExecutiveName = row['Sold By'] || 'Admin';
      const engineerName = row['Name Of Eng'];
      const statusInput = String(row['Status'] || 'pending').toLowerCase();
      const deviceNames = row['Device'] || 'N/A';
      const followupNotes = row['UPDATE'] || '';

      // Normalize devices
      const deviceNameList = String(deviceNames || 'N/A')
        .split(/[,\/&]/)
        .map(d => d.trim())
        .filter(d => d && d.toLowerCase() !== 'n/a');

      const deviceConnectOrCreate = await Promise.all(
        deviceNameList.map(async (name) => {
          let device = await prisma.device.findUnique({ where: { name } });
          if (!device) {
            device = await prisma.device.create({ data: { name } });
          }
          return { id: device.id };
        })
      );

      // Normalize status
      let status = 'pending';
      if (statusInput.includes('done') || statusInput.includes('completed')) status = 'completed';
      else if (statusInput.includes('assigned')) status = 'assigned';
      else if (statusInput.includes('progress')) status = 'in-progress';
      else if (statusInput.includes('cancel')) status = 'cancelled';

      // 1. Sales Person (Standalone Entity)
      let salesPerson = await prisma.salesPerson.findFirst({ where: { name: salesExecutiveName } });
      if (!salesPerson) {
        salesPerson = await prisma.salesPerson.create({
          data: {
            salesPersonId: `SP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: salesExecutiveName,
          }
        });
      }

      // 2. Engineer
      let engineerId = null;
      if (engineerName) {
        let engineer = await prisma.engineer.findFirst({ where: { name: engineerName } });
        if (!engineer) {
          engineer = await prisma.engineer.create({
            data: {
              engineerId: `ENG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              name: engineerName,
              phone: '0000000000',
              joiningDate: new Date()
            }
          });
        }
        engineerId = engineer.id;
      }

      // 3. Sale (Unified)
      await prisma.sale.create({
        data: {
          saleNumber: `SALE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          saleDate: saleDate,
          customerName,
          businessName,
          phone,
          location,
          address: location,
          softwarePrice: softwarePrice,
          advanceAmount: advanceAmount,
          dueAmount: dueAmount,
          monthlyCharge: monthlyCharge,
          salesPersonId: salesPerson.id,
          engineerId: engineerId,
          installationDate: installDate,
          status: status,
          remarks: followupNotes,
          devices: {
            connect: deviceConnectOrCreate
          }
        }
      });

    } catch (err) {
      console.error('Error processing row:', row, err);
    }
  }

  console.log('Import completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
