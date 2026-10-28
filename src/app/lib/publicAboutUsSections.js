/** Public About Us pages (mirrors admin sidebar; excludes College Statistics). */

export const PUBLIC_ABOUT_US_SECTIONS = [
  { slug: 'about', label: 'About Us', apiType: 'about', showPhoto: true },
  { slug: 'college-at-a-glance', label: 'College at a Glance', apiType: 'glance' },
  { slug: 'vision-mission', label: 'Vision & Mission', apiType: 'vision' },
  {
    slug: 'principal-desk',
    label: 'Principal Desk',
    apiType: 'desk',
    deskFallbackDesignation: 'Principal',
  },
  {
    slug: 'chairman-desk',
    label: 'Chairman Desk',
    apiType: 'chairman_desk',
    deskFallbackDesignation: 'Chairperson',
  },
  { slug: 'idp', label: 'IDP', apiType: 'idp' },
  {
    slug: 'institutional-distinctiveness',
    label: 'Institutional Distinctiveness',
    apiType: 'distinct',
  },
];

export function getPublicAboutUsSection(slug) {
  if (!slug) return null;
  const normalized = String(slug).toLowerCase();
  return PUBLIC_ABOUT_US_SECTIONS.find((item) => item.slug === normalized) || null;
}

export function getPublicAboutUsNavLinks() {
  return PUBLIC_ABOUT_US_SECTIONS.map((section) => ({
    label: section.label,
    href: `/about-us/${section.slug}`,
  }));
}
