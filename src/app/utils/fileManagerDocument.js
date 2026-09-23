import { getQuickLinkDocumentViewType } from './quickLinkDocument';

const MY_FILES_PREFIX = 'My Files/';
const OTHER_FILES_PREFIX = 'Other Files/';

export function getFileManagerPublicPathFromStoragePath(storagePath = '') {
  if (!storagePath) return '';

  let relative = storagePath;
  if (relative.startsWith(MY_FILES_PREFIX)) {
    relative = relative.slice(MY_FILES_PREFIX.length);
  } else if (relative.startsWith(OTHER_FILES_PREFIX)) {
    relative = `other/${relative.slice(OTHER_FILES_PREFIX.length)}`;
  } else {
    return '';
  }

  return `/file/${relative.split('/').map(encodeURIComponent).join('/')}`;
}

export function getFileManagerPublicPathFromItem(item) {
  if (!item || item.type !== 'file') return '';
  return getFileManagerPublicPathFromStoragePath(item.path);
}

export function getFileManagerContentApiPath(item) {
  const publicPath = getFileManagerPublicPathFromItem(item);
  if (!publicPath) return '';
  return `/api/file/content/${publicPath.slice('/file/'.length)}`;
}

export function getFileManagerFullUrl(item, origin = '') {
  const publicPath = getFileManagerPublicPathFromItem(item);
  if (!publicPath) return '';
  return origin ? `${origin}${publicPath}` : publicPath;
}

export function getFileManagerViewType(url = '', fileName = '') {
  return getQuickLinkDocumentViewType(url, fileName);
}

export function buildFileManagerViewApiPath(pathSegments = []) {
  const segments = Array.isArray(pathSegments) ? pathSegments : [pathSegments];
  return `/api/file/view/${segments.map(encodeURIComponent).join('/')}`;
}

const FILE_MANAGER_NAME_PATTERN = /^[a-zA-Z0-9.]+$/;

export function isValidFileManagerName(name = '') {
  const trimmed = String(name || '').trim();
  return Boolean(trimmed) && FILE_MANAGER_NAME_PATTERN.test(trimmed);
}

export function getFileManagerNameValidationError(name = '') {
  const trimmed = String(name || '').trim();
  if (!trimmed) return 'Name is required';
  if (!FILE_MANAGER_NAME_PATTERN.test(trimmed)) {
    return 'Name can only contain letters, numbers, and dots (.)';
  }
  return '';
}

export function sanitizeFileManagerNameInput(value = '') {
  return String(value || '').replace(/[^a-zA-Z0-9.]/g, '');
}
