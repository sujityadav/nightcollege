import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INaacAqarDocumentSection extends Document {
  documentId: Types.ObjectId;
  partId?: Types.ObjectId;
  name: string;
  sortOrder: number;
}

const NaacAqarDocumentSectionSchema = new Schema<INaacAqarDocumentSection>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'NaacAqarDocument', required: true, index: true },
    partId: {
      type: Schema.Types.ObjectId,
      ref: 'NaacAqarDocumentPart',
      index: true,
      required: true,
    },
    name: { type: String, required: true, trim: true },
    sortOrder: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

if (mongoose.models.NaacAqarDocumentSection) {
  delete mongoose.models.NaacAqarDocumentSection;
}

const NaacAqarDocumentSection = mongoose.model<INaacAqarDocumentSection>(
  'NaacAqarDocumentSection',
  NaacAqarDocumentSectionSchema
);

export default NaacAqarDocumentSection;
