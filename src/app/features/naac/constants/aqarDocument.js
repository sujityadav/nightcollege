export const UNASSIGNED_SECTION_NAME = 'Unassigned';

export function isUnassignedSectionName(name) {
  return String(name || '').trim().toLowerCase() === UNASSIGNED_SECTION_NAME.toLowerCase();
}
