import FileManagerYear from '@/app/models/fileManagerYear';

export function formatMasterYearLabel(fromYear, toYear) {
  return `${fromYear} – ${toYear}`;
}

/** Build Mongo filter for nodes in a year bucket (label) or Other Files. */
export async function buildNodeYearScopeQuery(yearLabel) {
  const label = String(yearLabel || '').trim();
  if (!label) {
    return {
      $or: [{ year: { $in: [null, ''] } }, { year: { $exists: false } }],
    };
  }

  const legacyYears = await FileManagerYear.find({ name: label }).select('_id');
  const legacyIds = legacyYears.map((year) => String(year._id));

  if (legacyIds.length) {
    return {
      $or: [{ year: label }, { yearId: { $in: legacyIds } }],
    };
  }

  return { year: label };
}

export function yearLabelFromNode(node) {
  if (node?.year) return node.year;
  return '';
}
