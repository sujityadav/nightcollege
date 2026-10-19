import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INaacAqarDocumentPart extends Document {
  documentId: Types.ObjectId;
  title: string;
  description: string;
  sortOrder: number;
}

const NaacAqarDocumentPartSchema = new Schema<INaacAqarDocumentPart>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'NaacAqarDocument',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    sortOrder: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

if (mongoose.models.NaacAqarDocumentPart) {
  delete mongoose.models.NaacAqarDocumentPart;
}

const NaacAqarDocumentPart = mongoose.model<INaacAqarDocumentPart>(
  'NaacAqarDocumentPart',
  NaacAqarDocumentPartSchema
);

export default NaacAqarDocumentPart;
