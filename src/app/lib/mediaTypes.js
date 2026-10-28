/** Server-safe media type helpers (no React / client APIs). */

export function normalizeMediaTypeLabel(value) {
  if (!value) return null;
  const v = String(value).toLowerCase();
  if (v === 'video') return 'Video';
  if (v === 'photo' || v === 'image') return 'Photo';
  return null;
}

export function isVideoMedia(type) {
  return type === 'Video' || String(type || '').toLowerCase() === 'video';
}

export function detectMediaType(fileOrUrl, { allowAllFiles = false } = {}) {
  if (typeof File !== 'undefined' && fileOrUrl instanceof File) {
    if (fileOrUrl.type.startsWith('video/')) return 'Video';
    if (fileOrUrl.type.startsWith('image/')) return 'Photo';
    return allowAllFiles ? 'File' : 'Photo';
  }

  if (typeof fileOrUrl === 'string' && fileOrUrl) {
    if (
      fileOrUrl.includes('/video/upload/') ||
      /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(fileOrUrl)
    ) {
      return 'Video';
    }
    if (
      fileOrUrl.includes('/image/upload/') ||
      /\.(jpe?g|png|gif|webp|bmp|svg)(\?|$)/i.test(fileOrUrl)
    ) {
      return 'Photo';
    }
    if (allowAllFiles) return 'File';
  }

  return 'Photo';
}

export function isImageMediaType(type, url = '') {
  if (type === 'File' || isVideoMedia(type)) return false;
  if (type === 'Photo') return true;
  if (typeof url === 'string' && url) {
    return (
      url.includes('/image/upload/') ||
      /\.(jpe?g|png|gif|webp|bmp|svg)(\?|$)/i.test(url)
    );
  }
  return false;
}
