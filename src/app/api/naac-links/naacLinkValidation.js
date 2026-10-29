import NaacLink from '../../models/naacLink';
import { normalizeSlug, validateSlug } from '../../utils/quickLinkSlug';
import { isNaacQuickLinkSection, isIqacMeetingsSection } from '../../features/naac/constants';

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

  if (isIqacMeetingsSection(data.section)) {
    if (!data.meetingDate) {
      return 'Meeting date is required';
    }
    if (!data.minutesDocumentUrl?.trim()) {
      return 'Minutes of action file is required';
    }
    if (!data.actionTakenReportUrl?.trim()) {
      return 'Action taken report file is required';
    }
    return null;
  }

  if (data.type === 'Document' && !data.documentUrl?.trim()) {
    return 'Document is required for Document type';
  }

  return null;
};

export function buildNaacLinkWriteData(data) {
  const base = {
    title: data.title.trim(),
    type: isIqacMeetingsSection(data.section) ? 'Document' : data.type,
    section: data.section.trim(),
    slug: data.type === 'Content' ? normalizeSlug(data.slug) : '',
    sortOrder: Number(data.sortOrder),
    status: data.status ?? false,
    content: data.type === 'Content' ? data.content : '',
    linkUrl: data.type === 'Link' ? data.linkUrl.trim() : '',
    documentUrl: '',
    documentName: '',
    meetingDate: null,
    minutesDocumentUrl: '',
    minutesDocumentName: '',
    actionTakenReportUrl: '',
    actionTakenReportName: '',
  };

  if (isIqacMeetingsSection(data.section)) {
    const minutesUrl = data.minutesDocumentUrl?.trim() || '';
    return {
      ...base,
      type: 'Document',
      documentUrl: minutesUrl,
      documentName: data.minutesDocumentName?.trim() || '',
      meetingDate: data.meetingDate ? new Date(data.meetingDate) : null,
      minutesDocumentUrl: minutesUrl,
      minutesDocumentName: data.minutesDocumentName?.trim() || '',
      actionTakenReportUrl: data.actionTakenReportUrl?.trim() || '',
      actionTakenReportName: data.actionTakenReportName?.trim() || '',
    };
  }

  return {
    ...base,
    documentUrl: data.type === 'Document' ? data.documentUrl : '',
    documentName: data.type === 'Document' ? data.documentName || '' : '',
  };
}
