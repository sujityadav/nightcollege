export function normalizePublicationAttachments(data) {
  if (!data) return [];
  if (Array.isArray(data.attachments) && data.attachments.length) {
    return data.attachments
      .map((entry) => {
        if (typeof entry === 'string') {
          const url = entry.trim();
          return url ? { url, fileName: '', mediaType: 'File' } : null;
        }
        const url = entry?.url?.trim();
        if (!url) return null;
        return {
          url,
          fileName: entry?.fileName?.trim() || '',
          mediaType: entry?.mediaType || 'File',
        };
      })
      .filter(Boolean);
  }
  if (data.photo?.trim()) {
    return [{ url: data.photo.trim(), fileName: '', mediaType: 'Photo' }];
  }
  return [];
}

export function validatePublicationData(data) {
  if (!data?.title?.trim() || !data?.description?.trim()) {
    return 'Title and description are required';
  }
  if (!data?.masterYearId) {
    return 'Year is required';
  }
  const sortOrder = Number(data.sortOrder);
  if (!Number.isFinite(sortOrder) || sortOrder < 0) {
    return 'A valid sort order is required';
  }
  if (!normalizePublicationAttachments(data).length) {
    return 'At least one file is required';
  }
  return null;
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
