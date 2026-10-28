import { detectMediaType } from './mediaTypes';
import { getQuickLinkDocumentViewType } from '../utils/quickLinkDocument';

export function getStudentCornerFileViewType(file) {
  const url = file?.url || '';
  const fileName = file?.fileName || '';
  const direct = getQuickLinkDocumentViewType(url, fileName);
  if (direct) return direct;
  if (url && !fileName) {
    return getQuickLinkDocumentViewType(url, fileDisplayName(file));
  }
  return null;
}

export function normalizeStudentCornerAttachments(item) {
  if (!item) return [];
  if (Array.isArray(item.attachments) && item.attachments.length) {
    return item.attachments
      .map((entry) => {
        if (typeof entry === 'string') {
          const url = entry.trim();
          if (!url) return null;
          return {
            url,
            fileName: '',
            mediaType: detectMediaType(url, { allowAllFiles: true }),
          };
        }
        const url = entry?.url?.trim();
        if (!url) return null;
        return {
          url,
          fileName: entry?.fileName?.trim() || '',
          mediaType: entry?.mediaType || detectMediaType(url, { allowAllFiles: true }),
        };
      })
      .filter(Boolean);
  }
  if (item.fileUrl?.trim()) {
    const url = item.fileUrl.trim();
    return [
      {
        url,
        fileName: item.fileName?.trim() || '',
        mediaType: detectMediaType(url, { allowAllFiles: true }),
      },
    ];
  }
  return [];
}

export function fileDisplayName(file) {
  if (file?.fileName) return file.fileName;
  try {
    const parts = file.url.split('/');
    return decodeURIComponent(parts[parts.length - 1] || 'Download file');
  } catch {
    return 'Download file';
  }
}

export function isStudentCornerFilePreviewable(file) {
  return Boolean(getStudentCornerFileViewType(file));
}

export function studentCornerInlineFileUrl(studentCornerId, fileIndex) {
  return `/api/student-corner/public/${studentCornerId}/file/${fileIndex}`;
}
