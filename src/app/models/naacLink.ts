import mongoose, { Schema, Document } from 'mongoose';

export type NaacLinkType = 'Content' | 'Link' | 'Document';

export interface INaacLink extends Document {
  title: string;
  type: NaacLinkType;
  section: string;
  slug?: string;
  sortOrder: number;
  status: boolean;
  content?: string;
  linkUrl?: string;
  documentUrl?: string;
  documentName?: string;
  meetingDate?: Date | null;
  minutesDocumentUrl?: string;
  minutesDocumentName?: string;
  actionTakenReportUrl?: string;
  actionTakenReportName?: string;
}

const NaacLinkSchema = new Schema<INaacLink>(
  {
    title: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true, index: true },
    type: {
      type: String,
      enum: ['Content', 'Link', 'Document'],
      required: true,
    },
    slug: { type: String, trim: true, lowercase: true, default: '' },
    sortOrder: { type: Number, required: true, default: 0 },
    status: { type: Boolean, default: true },
    content: { type: String, default: '' },
    linkUrl: { type: String, default: '' },
    documentUrl: { type: String, default: '' },
    documentName: { type: String, default: '' },
    meetingDate: { type: Date, default: null },
    minutesDocumentUrl: { type: String, default: '' },
    minutesDocumentName: { type: String, default: '' },
    actionTakenReportUrl: { type: String, default: '' },
    actionTakenReportName: { type: String, default: '' },
  },
  { timestamps: true }
);

NaacLinkSchema.index(
  { slug: 1 },
  {
    unique: true,
    partialFilterExpression: { type: 'Content', slug: { $gt: '' } },
  }
);

const NaacLink =
  mongoose.models.NaacLink || mongoose.model<INaacLink>('NaacLink', NaacLinkSchema);

export default NaacLink;
