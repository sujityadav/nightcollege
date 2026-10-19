import mongoose, { Schema, Document, Types } from 'mongoose';

export type AqarRowLinkType = 'link' | 'document';

export interface INaacAqarDocumentRow extends Document {
  documentId: Types.ObjectId;
  sectionId: Types.ObjectId;
  srNo: string;
  details: string;
  linkType: AqarRowLinkType;
  link: string;
  documentUrl: string;
  documentName: string;
  sortOrder: number;
}

const NaacAqarDocumentRowSchema = new Schema<INaacAqarDocumentRow>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'NaacAqarDocument', required: true, index: true },
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: 'NaacAqarDocumentSection',
      required: true,
      index: true,
    },
    srNo: { type: String, required: true, trim: true },
    details: { type: String, required: true, trim: true },
    linkType: { type: String, enum: ['link', 'document'], default: 'link' },
    link: { type: String, default: '', trim: true },
    documentUrl: { type: String, default: '', trim: true },
    documentName: { type: String, default: '', trim: true },
    sortOrder: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

if (mongoose.models.NaacAqarDocumentRow) {
  delete mongoose.models.NaacAqarDocumentRow;
}

const NaacAqarDocumentRow = mongoose.model<INaacAqarDocumentRow>(
  'NaacAqarDocumentRow',
  NaacAqarDocumentRowSchema
);

export default NaacAqarDocumentRow;
