import {
  canViewQuickLinkDocumentOnSite,
  getQuickLinkDocumentViewType,
} from './quickLinkDocument';

export { canViewQuickLinkDocumentOnSite as canViewNaacLinkDocumentOnSite };
export { getQuickLinkDocumentViewType as getNaacLinkDocumentViewType };

export function getNaacLinkDocumentViewPath(id) {
  return `/naac/document/${id}`;
}

export function getNaacLinkDocumentFilePath(id) {
  return `/api/naac-links/document/${id}/file`;
}
