export function validateRowLinkFields(body, { requireDocument = true } = {}) {
  const linkType = body.linkType === 'document' ? 'document' : 'link';
  const link = String(body.link || '').trim();
  const documentUrl = String(body.documentUrl || '').trim();
  const documentName = String(body.documentName || '').trim();

  if (linkType === 'link') {
    if (!link) {
      return { error: 'Link is required' };
    }
    try {
      const parsed = new URL(link);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return { error: 'Link should be a valid URL' };
      }
    } catch {
      return { error: 'Link should be a valid URL' };
    }
    return {
      linkType,
      link,
      documentUrl: '',
      documentName: '',
    };
  }

  if (requireDocument && !documentUrl) {
    return { error: 'Document is required' };
  }

  return {
    linkType,
    link: '',
    documentUrl,
    documentName,
  };
}
