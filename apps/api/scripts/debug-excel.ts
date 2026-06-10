import * as XLSX from 'xlsx';

async function main() {
  const filePath = "C:\\Users\\nurja\\Desktop\\Install management Software\\Data.xlsx";
  const workbook = XLSX.readFile(filePath, { cellDates: false });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  console.log('First 5 rows of raw Excel data:');
  (data as any[]).slice(0, 5).forEach((row, i) => {
    console.log(`Row ${i + 1}:`, {
      'Customer Name': row['Customer Name'],
      'Date of Sale': row['Date of Sale'],
      'Install Date': row['Install Date']
    });
  });
}

main().catch(console.error);
