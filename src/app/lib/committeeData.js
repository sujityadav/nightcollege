import { detectMediaType } from './mediaTypes';
import { getQuickLinkDocumentViewType } from '../utils/quickLinkDocument';

const DATA_PATH = 'CommitiesData.data';

export function getCommitteePayload(doc) {
  return doc?.CommitiesData?.data || {};
}

export function committeeTitleToSlug(title = '') {
  return String(title)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeMasterYearId(value) {
  if (!value) return '';
  if (typeof value === 'object' && value._id) return String(value._id);
  return String(value);
}

export function formatMasterYearLabel(year) {
  if (!year) return '';
  if (typeof year === 'object' && year.fromYear != null && year.toYear != null) {
    return `${year.fromYear} – ${year.toYear}`;
  }
  return '';
}

export function getCommitteeFile(data) {
  const url = data?.fileUrl?.trim();
  if (!url) return null;
  return {
    url,
    fileName: data?.fileName?.trim() || '',
    mediaType: data?.mediaType || detectMediaType(url, { allowAllFiles: true }),
  };
}

export function committeeFileDisplayName(file) {
  if (file?.fileName) return file.fileName;
  try {
    const parts = file.url.split('/');
    return decodeURIComponent(parts[parts.length - 1] || 'Download file');
  } catch {
    return 'Download file';
  }
}

export function getCommitteeFileViewType(file) {
  const url = file?.url || '';
  const fileName = file?.fileName || '';
  const direct = getQuickLinkDocumentViewType(url, fileName);
  if (direct) return direct;
  if (url && !fileName) {
    return getQuickLinkDocumentViewType(url, committeeFileDisplayName(file));
  }
  return null;
}

export function isCommitteeFilePreviewable(file) {
  return Boolean(getCommitteeFileViewType(file));
}

export function committeeInlineFileUrl(recordId) {
  return `/api/commities/public/record/${recordId}/file`;
}

export function validateCommitteeFormData(data) {
  if (!data?.title?.trim()) return 'Committee title is required';
  if (!data?.smallDescription?.trim()) return 'Small description is required';
  if (!data?.largeDescription?.trim()) return 'Large description is required';
  if (data?.sortOrder === undefined || data?.sortOrder === '') return 'Sort order is required';
  if (!data?.masterYearId) return 'Year is required';
  if (!data?.fileUrl?.trim()) return 'File is required';
  return null;
}

export { DATA_PATH };
