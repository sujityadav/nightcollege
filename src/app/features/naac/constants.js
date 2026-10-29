export const NAAC_QUICK_LINK_SECTIONS = {
  'iqac-composition': 'IQAC Composition',
  aqar: 'AQAR (Annual Quality Assurance Report)',
  'iqac-meetings': 'IQAC Meetings: Minutes and Action Taken Report',
  aaa: 'AAA (Academic and Administrative Audit)',
  'green-energy-audit': 'Green Audit and Energy Audit',
  'gender-audit': 'Gender Audit',
};

export function isNaacQuickLinkSection(section) {
  return Boolean(section && NAAC_QUICK_LINK_SECTIONS[section]);
}

export const NAAC_IQAC_MEETINGS_SECTION = 'iqac-meetings';

export function isIqacMeetingsSection(section) {
  return section === NAAC_IQAC_MEETINGS_SECTION;
}
