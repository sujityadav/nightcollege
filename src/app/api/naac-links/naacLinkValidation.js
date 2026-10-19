import NaacLink from '../../models/naacLink';
import { normalizeSlug, validateSlug } from '../../utils/quickLinkSlug';
import { isNaacQuickLinkSection } from '../../features/naac/constants';

const checkDuplicateSlug = async (slug, excludeId = null) => {
  const query = { slug: normalizeSlug(slug), type: 'Content' };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return NaacLink.findOne(query);
};

export const validateNaacLinkPayload = async (data, isUpdate = false, excludeId = null) => {
  if (!isUpdate && (!data.title || data.sortOrder === undefined || data.sortOrder === '' || !data.type)) {
    return 'Title, type and sort order are required';
  }

  if (!isUpdate && !isNaacQuickLinkSection(data.section)) {
    return 'Invalid NAAC section';
  }

  if (data.section && !isNaacQuickLinkSection(data.section)) {
    return 'Invalid NAAC section';
  }

  if (data.sortOrder !== undefined && data.sortOrder !== '' && Number.isNaN(Number(data.sortOrder))) {
    return 'Sort order must be a number';
  }

  if (data.type === 'Content') {
    const slugError = validateSlug(data.slug);
    if (slugError) return slugError;
    if (!data.content?.trim()) return 'Content is required for Content type';

    const duplicate = await checkDuplicateSlug(data.slug, excludeId);
    if (duplicate) return 'This slug is already in use';
  }

  if (data.type === 'Link') {
    const trimmed = data.linkUrl?.trim() || '';
    if (!trimmed) return 'Link URL is required for Link type';

    try {
      const parsed = new URL(trimmed);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return 'Link should be valid';
      }
    } catch {
      return 'Link should be valid';
    }
  }

  if (data.type === 'Document' && !data.documentUrl?.trim()) {
    return 'Document is required for Document type';
  }

  return null;
};

export function buildNaacLinkWriteData(data) {
  return {
    title: data.title.trim(),
    type: data.type,
    section: data.section.trim(),
    slug: data.type === 'Content' ? normalizeSlug(data.slug) : '',
    sortOrder: Number(data.sortOrder),
    status: data.status ?? false,
    content: data.type === 'Content' ? data.content : '',
    linkUrl: data.type === 'Link' ? data.linkUrl.trim() : '',
    documentUrl: data.type === 'Document' ? data.documentUrl : '',
    documentName: data.type === 'Document' ? data.documentName || '' : '',
  };
}
