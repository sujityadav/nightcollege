export const DESK_ROLE_SLUGS = {
  principal: {
    apiType: 'desk',
    fallbackDesignation: 'Principal',
    pageTitle: 'Principal Desk',
  },
  chairperson: {
    apiType: 'chairman_desk',
    fallbackDesignation: 'Chairperson',
    pageTitle: 'Chairperson Desk',
  },
};

export function getDeskRoleConfig(slug) {
  if (!slug || typeof slug !== 'string') return null;
  return DESK_ROLE_SLUGS[slug.toLowerCase()] || null;
}

export function formatOurDesignation(designation, fallback) {
  const value = designation?.trim() || fallback?.trim() || '';
  if (!value) return '';
  return `Our ${value}`;
}

export function getDeskDetailPath(slug) {
  return `/from-the-desk/${slug}`;
}
