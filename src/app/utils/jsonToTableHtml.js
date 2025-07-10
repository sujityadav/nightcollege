export const jsonToTableHtml = (data) => {
  if (!Array.isArray(data)) return '';

  let tableHtml = '<table border="1" style="border-collapse:collapse;width:100%;">';

  data.forEach((row) => {
    tableHtml += '<tr>';
    row.forEach((cell) => {
      tableHtml += `<td style="padding: 8px; border: 1px solid #ccc;">${cell}</td>`;
    });
    tableHtml += '</tr>';
  });

  tableHtml += '</table>';
  return tableHtml;
};
