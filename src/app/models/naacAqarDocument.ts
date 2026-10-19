import mongoose, { Schema, Document } from 'mongoose';

export interface INaacAqarDocument extends Document {
  title: string;
  description: string;
  status: boolean;
  sortOrder: number;
}

const NaacAqarDocumentSchema = new Schema<INaacAqarDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

if (mongoose.models.NaacAqarDocument) {
  delete mongoose.models.NaacAqarDocument;
}

const NaacAqarDocument = mongoose.model<INaacAqarDocument>(
  'NaacAqarDocument',
  NaacAqarDocumentSchema
);

export default NaacAqarDocument;
