import NaacAqarDocumentPart from '../../../models/naacAqarDocumentPart';
import NaacAqarDocumentSection from '../../../models/naacAqarDocumentSection';
import NaacAqarDocumentRow from '../../../models/naacAqarDocumentRow';
import { isUnassignedSectionName } from '../../../features/naac/constants/aqarDocument';
import { getGroupsForPart } from '../groupHelpers';
import { migrateLegacySectionsToDefaultPart } from '../partMigration';

export async function getPublicAqarDocumentWithParts(documentId, documentTitle) {
  await migrateLegacySectionsToDefaultPart(documentId, documentTitle);

  const parts = await NaacAqarDocumentPart.find({ documentId })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  const partBlocks = [];
  for (const part of parts) {
    const groups = await getGroupsForPart(documentId, part._id, { publicView: true });
    if (groups.length > 0) {
      partBlocks.push({ part, groups });
    }
  }

  return partBlocks;
}

export async function filterDocumentsWithPublicIndexData(documents) {
  if (!documents?.length) return [];

  const documentIds = documents.map((doc) => doc._id);
  const parts = await NaacAqarDocumentPart.find({ documentId: { $in: documentIds } }).lean();
  if (!parts.length) return [];

  const partIds = parts.map((part) => part._id);
  const sections = await NaacAqarDocumentSection.find({ partId: { $in: partIds } }).lean();
  const rows = await NaacAqarDocumentRow.find({ documentId: { $in: documentIds } }).lean();

  const sectionById = new Map(sections.map((section) => [String(section._id), section]));
  const documentIdsWithRows = new Set();

  for (const row of rows) {
    const section = sectionById.get(String(row.sectionId));
    if (section && !isUnassignedSectionName(section.name)) {
      documentIdsWithRows.add(String(row.documentId));
    }
  }

  return documents.filter((doc) => documentIdsWithRows.has(String(doc._id)));
}
