import {
  canViewQuickLinkDocumentOnSite,
  getQuickLinkDocumentFilePath,
  getQuickLinkDocumentViewPath,
} from './quickLinkDocument';

export function getQuickLinkPublicHref(item) {
  if (!item) return '';

  if (item.type === 'Content') {
    const slug = String(item.slug || '').trim();
    return slug ? `/page/${slug}` : '';
  }

  if (item.type === 'Link') {
    return String(item.linkUrl || '').trim();
  }

  if (item.type === 'Document') {
    const id = item._id != null ? String(item._id) : item.id ? String(item.id) : '';
    if (id && canViewQuickLinkDocumentOnSite(item.documentUrl, item.documentName)) {
      return getQuickLinkDocumentViewPath(id);
    }
    if (id) {
      return getQuickLinkDocumentFilePath(id);
    }
    return String(item.documentUrl || '').trim();
  }

  return '';
}

export function splitQuickLinksIntoColumns(items, columnCount = 5) {
  const columns = Array.from({ length: columnCount }, () => []);
  items.forEach((item, index) => {
    columns[index % columnCount].push(item);
  });
  return columns;
}
