/**
 * Utility to export data to CSV
 * @param data Array of objects to export
 * @param headers Map of property keys to CSV column headers
 * @param filename Name of the file to download
 */
export const exportToCSV = (data: any[], headers: Record<string, string>, filename: string) => {
  if (!data || data.length === 0) return;

  const columnKeys = Object.keys(headers);
  const csvHeaders = Object.values(headers).join(',');

  const csvRows = data.map(row => {
    return columnKeys.map(key => {
      // Handle nested properties (e.g., 'role.name')
      const value = key.split('.').reduce((obj, k) => obj?.[k], row) ?? '';
      
      // Escape commas and quotes
      const escapedValue = String(value).replace(/"/g, '""');
      return `"${escapedValue}"`;
    }).join(',');
  });

  const csvContent = [csvHeaders, ...csvRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().getTime()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
