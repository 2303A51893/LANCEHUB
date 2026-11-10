
export function exportToCSV(filename, rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    alert('No data to export.');
    return;
  }

  const keys = Object.keys(rows[0]);

  const escapeCell = (value) => {
    if (value === null || value === undefined) {
      return '""';
    }

    let cell = value;

    if (cell instanceof Date) {
      cell = cell.toLocaleString();
    } else if (Array.isArray(cell)) {
      cell = cell.join(', ');
    } else if (typeof cell === 'object') {
      cell = JSON.stringify(cell);
    }

    cell = String(cell);

    return `"${cell.replace(/"/g, '""')}"`;
  };

  const csvContent = [
    keys.map(escapeCell).join(','),
    ...rows.map(row =>
      keys.map(key => escapeCell(row[key])).join(',')
    )
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `${filename}_${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
