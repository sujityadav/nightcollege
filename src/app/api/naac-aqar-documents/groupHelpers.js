import NaacAqarDocumentSection from '../../models/naacAqarDocumentSection';
import NaacAqarDocumentRow from '../../models/naacAqarDocumentRow';
import { isUnassignedSectionName } from '../../features/naac/constants/aqarDocument';
import { migrateLegacySectionsToDefaultPart, toObjectId } from './partMigration';

function compareSrNoAscending(a, b) {
  return String(a.srNo || '').localeCompare(String(b.srNo || ''), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

export function buildSectionGroups(sections, rows, { includeEmptySections = false, publicView = false } = {}) {
  const rowsBySection = new Map();
  for (const row of rows) {
    const key = String(row.sectionId);
    if (!rowsBySection.has(key)) rowsBySection.set(key, []);
    rowsBySection.get(key).push(row);
  }

  let filteredSections = sections;
  if (publicView) {
    filteredSections = sections.filter((section) => !isUnassignedSectionName(section.name));
  }

  const groups = filteredSections
    .map((section) => ({
      section,
      rows: (rowsBySection.get(String(section._id)) || []).sort(compareSrNoAscending),
    }))
    .filter((group) => includeEmptySections || group.rows.length > 0)
    .sort(
      (a, b) =>
        (Number(a.section.sortOrder) || 0) - (Number(b.section.sortOrder) || 0) ||
        new Date(a.section.createdAt) - new Date(b.section.createdAt)
    );

  const sectionIds = new Set(sections.map((s) => String(s._id)));
  const orphanRows = rows.filter((row) => !sectionIds.has(String(row.sectionId)));
  if (orphanRows.length && !publicView) {
    groups.push({
      section: { _id: 'orphan', name: 'Unknown section', sortOrder: 9999 },
      rows: orphanRows.sort(compareSrNoAscending),
    });
  }

  return groups;
}

export async function getGroupsForPart(documentId, partId, options = {}) {
  await migrateLegacySectionsToDefaultPart(documentId);

  const docObjectId = toObjectId(documentId);
  const partObjectId = toObjectId(partId);
  if (!docObjectId || !partObjectId) return [];

  const sections = await NaacAqarDocumentSection.find({
    documentId: docObjectId,
    partId: partObjectId,
  })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  const sectionIds = sections.map((s) => s._id);
  const rows = sectionIds.length
    ? await NaacAqarDocumentRow.find({
        documentId: docObjectId,
        sectionId: { $in: sectionIds },
      })
        .sort({ sortOrder: 1, createdAt: 1 })
        .lean()
    : [];

  return buildSectionGroups(sections, rows, options);
}
