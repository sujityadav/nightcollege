function stripHtml(html) {
  if (!html) return '';
  if (typeof document === 'undefined') {
    return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const el = document.createElement('div');
  el.innerHTML = html;
  return (el.textContent || el.innerText || '').replace(/\s+/g, ' ').trim();
}

const PDF_LINK_NEW_WINDOW_PATTERN =
  /(\/Subtype \/Link[\s\S]*?\/URI \((?:[^()\\]|\\.)*\) >>)( >>)/g;

function addNewWindowFlagToPdf(arrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(arrayBuffer);
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  const updated = binary.replace(PDF_LINK_NEW_WINDOW_PATTERN, '$1 /NewWindow true$2');
  const out = new Uint8Array(updated.length);
  for (let i = 0; i < updated.length; i += 1) {
    out[i] = updated.charCodeAt(i);
  }
  return out;
}

function savePdfWithNewWindowLinks(doc, filename) {
  const patched = addNewWindowFlagToPdf(doc.output('arraybuffer'));
  const blob = new Blob([patched], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.click();
  URL.revokeObjectURL(url);
}

function resolveRowLink(row) {
  const linkType = row.linkType === 'document' ? 'document' : 'link';
  if (linkType === 'document' && row._id) {
    const path = `/naac/aqar/document/${row._id}`;
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${path}`;
    }
    return path;
  }
  return String(row.link || '').trim();
}

function buildTableRows(groups) {
  const tableRows = [];
  (groups || []).forEach((group) => {
    tableRows.push({ type: 'section', details: group.section?.name || '' });
    (group.rows || []).forEach((row) => {
      tableRows.push({
        type: 'data',
        srNo: row.srNo || '',
        details: row.details || '',
        link: resolveRowLink(row),
      });
    });
  });
  return tableRows;
}

export async function downloadAqarPdf(blocks, filename = 'AQAR-Documents.pdf') {
  if (!blocks?.length) return;

  const { jsPDF } = await import('jspdf');
  const { autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;
  const marginX = 12;
  const contentWidth = pageWidth - marginX * 2;

  blocks.forEach((block, blockIndex) => {
    if (blockIndex > 0) {
      doc.addPage();
    }

    let y = 16;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(17, 17, 17);
    const iqacLines = doc.splitTextToSize('Internal Quality Assurance Cell (IQAC)', contentWidth);
    doc.text(iqacLines, centerX, y, { align: 'center' });
    y += iqacLines.length * 7 + 4;

    const title = String(block.document?.title || 'AQAR').toUpperCase();
    doc.setFontSize(13);
    doc.setTextColor(255, 0, 0);
    const titleLines = doc.splitTextToSize(title, contentWidth);
    doc.text(titleLines, centerX, y, { align: 'center' });
    const titleBlockHeight = titleLines.length * 6.5;
    const underlineY = y + titleBlockHeight - 1;
    const underlineWidth = Math.min(
      contentWidth,
      Math.max(...titleLines.map((line) => doc.getTextWidth(line)))
    );
    doc.setDrawColor(255, 0, 0);
    doc.line(centerX - underlineWidth / 2, underlineY, centerX + underlineWidth / 2, underlineY);
    y += titleBlockHeight + 10;

    const parts = block.parts || [];
    parts.forEach((partBlock, partIndex) => {
      if (partIndex > 0) {
        y += 10;
      }

      const description = stripHtml(partBlock.part?.description);
      if (description) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(91, 44, 111);
        const descLines = doc.splitTextToSize(description, contentWidth);
        doc.text(descLines, centerX, y, { align: 'center' });
        y += descLines.length * 5 + 6;
      }

      const tableRows = buildTableRows(partBlock.groups);
      const body = tableRows.map((row) => {
        if (row.type === 'section') {
          return ['', row.details, ''];
        }
        return [row.srNo, row.details, 'View Link'];
      });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(255, 0, 0);
      doc.text('INDEX', centerX, y, { align: 'center' });
      y += 8;

      autoTable(doc, {
        startY: y,
        margin: { left: marginX, right: marginX },
        head: [['Sr. No.', 'Details', 'Link']],
        body,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 1.5,
          lineColor: [51, 51, 51],
          lineWidth: 0.1,
          valign: 'top',
        },
        headStyles: {
          fillColor: [146, 208, 80],
          textColor: [17, 17, 17],
          fontStyle: 'bold',
          halign: 'left',
        },
        columnStyles: {
          0: { cellWidth: 16 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 22 },
        },
        didParseCell: (data) => {
          if (data.section !== 'body') return;
          const row = tableRows[data.row.index];
          if (!row) return;
          if (row.type === 'section' && data.column.index === 1) {
            data.cell.styles.textColor = [255, 0, 0];
            data.cell.styles.fontStyle = 'bold';
          }
          if (row.type === 'data' && data.column.index === 2) {
            data.cell.styles.textColor = [5, 99, 193];
            data.cell.styles.fontStyle = 'normal';
          }
        },
        didDrawCell: (data) => {
          if (data.section !== 'body' || data.column.index !== 2) return;
          const row = tableRows[data.row.index];
          if (row?.type === 'data' && row.link) {
            doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: row.link });
          }
        },
      });

      y = doc.lastAutoTable.finalY + 8;
    });
  });

  savePdfWithNewWindowLinks(doc, filename);
}
