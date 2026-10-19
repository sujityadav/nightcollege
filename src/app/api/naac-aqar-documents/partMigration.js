import mongoose from 'mongoose';
import NaacAqarDocument from '../../models/naacAqarDocument';
import NaacAqarDocumentPart from '../../models/naacAqarDocumentPart';
import NaacAqarDocumentSection from '../../models/naacAqarDocumentSection';

export function toObjectId(value) {
  if (!value) return null;
  if (value instanceof mongoose.Types.ObjectId) return value;
  if (!mongoose.Types.ObjectId.isValid(String(value))) return null;
  return new mongoose.Types.ObjectId(String(value));
}

const orphanSectionFilter = (documentId) => ({
  documentId,
  $or: [{ partId: null }, { partId: { $exists: false } }],
});

/**
 * Assign legacy sections (no partId) to an existing part, or create one default part if needed.
 * Safe to call on every read — will not create duplicate parts.
 */
export async function migrateLegacySectionsToDefaultPart(documentId, documentTitle) {
  const docObjectId = toObjectId(documentId); // document id
  if (!docObjectId) return null;

  const orphanCount = await NaacAqarDocumentSection.countDocuments(orphanSectionFilter(docObjectId));
  if (!orphanCount) return null;

  let part = await NaacAqarDocumentPart.findOne({ documentId: docObjectId })
    .sort({ sortOrder: 1, createdAt: 1 });

  if (!part) {
    const document = await NaacAqarDocument.findById(docObjectId).lean();
    const partCount = await NaacAqarDocumentPart.countDocuments({ documentId: docObjectId });
    part = await NaacAqarDocumentPart.create({
      documentId: docObjectId,
      title: documentTitle || document?.title || 'Part 1',
      description: document?.description || '',
      sortOrder: partCount,
    });
  }

  await NaacAqarDocumentSection.updateMany(orphanSectionFilter(docObjectId), {
    $set: { partId: part._id },
  });

  return part;
}
