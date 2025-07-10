export const extractTableData = (htmlString) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;

  const table = tempDiv.querySelector('table');
  if (!table) return [];

  return Array.from(table.rows).map((row) =>
    Array.from(row.cells).map((cell) => cell.textContent?.trim() || '')
  );
};
