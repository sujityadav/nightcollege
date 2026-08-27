const SLUG_PATTERN = /^[a-zA-Z-]+$/;

export const slugify = (text) =>
  text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export const validateSlug = (value) => {
  const trimmed = (value || '').trim();

  if (!trimmed) {
    return 'Slug is required';
  }

  if (!SLUG_PATTERN.test(trimmed)) {
    return 'Slug can contain only alphabets and hyphens';
  }

  return '';
};

export const normalizeSlug = (value) => (value || '').trim().toLowerCase();
