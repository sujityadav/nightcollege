import {
  canViewQuickLinkDocumentOnSite,
  getQuickLinkDocumentViewType,
} from './quickLinkDocument';

export { canViewQuickLinkDocumentOnSite as canViewAqarRowDocumentOnSite };
export { getQuickLinkDocumentViewType as getAqarRowDocumentViewType };

export function getAqarRowDocumentViewPath(rowId) {
  return `/naac/aqar/document/${rowId}`;
}

export function getAqarRowDocumentFilePath(rowId) {
  return `/api/naac-aqar-documents/rows/${rowId}/file`;
}

export function getAqarRowViewHref(row) {
  if (!row) return '';
  const linkType = row.linkType === 'document' ? 'document' : 'link';
  if (linkType === 'document') {
    if (!row._id || !row.documentUrl) return '';
    return getAqarRowDocumentViewPath(row._id);
  }
  return String(row.link || '').trim();
}
