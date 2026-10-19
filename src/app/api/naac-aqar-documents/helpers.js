import NaacAqarDocumentSection from '../../models/naacAqarDocumentSection';
import { toObjectId } from './partMigration';

export const UNASSIGNED_SECTION_NAME = 'Unassigned';

export function isUnassignedSectionName(name) {
  return String(name || '').trim().toLowerCase() === UNASSIGNED_SECTION_NAME.toLowerCase();
}

export function isUnassignedSection(section) {
  return section && isUnassignedSectionName(section.name);
}

export async function findSectionByName(documentId, partId, name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return null;

  const documentObjectId = toObjectId(documentId);
  if (!documentObjectId) return null;

  const query = {
    documentId: documentObjectId,
    name: { $regex: new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
  };

  const partObjectId = toObjectId(partId);
  if (partObjectId) {
    query.partId = partObjectId;
  }

  return NaacAqarDocumentSection.findOne(query);
}

export async function getOrCreateUnassignedSection(documentId, partId) {
  const documentObjectId = toObjectId(documentId);
  const partObjectId = toObjectId(partId);
  if (!documentObjectId || !partObjectId) {
    throw new Error('Invalid document or part for Unassigned section');
  }

  const existing = await findSectionByName(documentObjectId, partObjectId, UNASSIGNED_SECTION_NAME);
  if (existing) return existing;

  const count = await NaacAqarDocumentSection.countDocuments({
    documentId: documentObjectId,
    partId: partObjectId,
  });
  return NaacAqarDocumentSection.create({
    documentId: documentObjectId,
    partId: partObjectId,
    name: UNASSIGNED_SECTION_NAME,
    sortOrder: count,
  });
}
