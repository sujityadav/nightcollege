const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|bmp|svg|avif)(\?|$)/i;
const PDF_EXTENSION = /\.pdf(\?|$)/i;

export function getQuickLinkDocumentViewType(documentUrl = '', documentName = '') {
  const url = String(documentUrl || '').toLowerCase();
  const name = String(documentName || '').toLowerCase();

  if (PDF_EXTENSION.test(name) || PDF_EXTENSION.test(url)) {
    return 'pdf';
  }

  if (url.includes('/image/upload/') && name.endsWith('.pdf')) {
    return 'pdf';
  }

  if (IMAGE_EXTENSIONS.test(name) || IMAGE_EXTENSIONS.test(url) || url.includes('/image/upload/')) {
    return 'image';
  }

  if (url.includes('/raw/upload/') && name.endsWith('.pdf')) {
    return 'pdf';
  }

  return null;
}

export function canViewQuickLinkDocumentOnSite(documentUrl, documentName) {
  return Boolean(getQuickLinkDocumentViewType(documentUrl, documentName));
}

export function getQuickLinkDocumentViewPath(id) {
  return `/quick-links/document/${id}`;
}

export function getQuickLinkDocumentFilePath(id) {
  return `/api/quick-links/document/${id}/file`;
}
