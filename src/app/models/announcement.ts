import mongoose, { Schema, Document } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  sortNo: number;
  description: string;
  fromDate: Date;
  toDate: Date;
  status: boolean;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    sortNo: { type: Number, required: true, default: 0 },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Announcement = mongoose.models.Announcement || mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);

// Keep the schema in sync during Next.js development hot reloads, where an
// already-compiled Mongoose model can otherwise omit newly added fields.
if (!Announcement.schema.path("sortNo")) {
  Announcement.schema.add({ sortNo: { type: Number, required: true, default: 0 } });
}

export default Announcement;
