import mongoose, { Schema, Document } from 'mongoose';

export type QuickLinkType = 'Content' | 'Link' | 'Document';

export interface IQuickLink extends Document {
  title: string;
  type: QuickLinkType;
  slug?: string;
  sortOrder: number;
  status: boolean;
  content?: string;
  linkUrl?: string;
  documentUrl?: string;
  documentName?: string;
}

const QuickLinkSchema = new Schema<IQuickLink>(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Content', 'Link', 'Document'],
      required: true,
    },
    slug: { type: String, trim: true },
    sortOrder: { type: Number, required: true, default: 0 },
    status: { type: Boolean, default: true },
    content: { type: String, default: '' },
    linkUrl: { type: String, default: '' },
    documentUrl: { type: String, default: '' },
    documentName: { type: String, default: '' },
  },
  { timestamps: true }
);

const QuickLink =
  mongoose.models.QuickLink || mongoose.model<IQuickLink>('QuickLink', QuickLinkSchema);

export default QuickLink;
