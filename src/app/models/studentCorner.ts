import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStudentCornerAttachment {
  url: string;
  fileName?: string;
  mediaType?: string;
}

export interface IStudentCorner extends Document {
  title: string;
  description: string;
  masterYearId: Types.ObjectId;
  attachments: IStudentCornerAttachment[];
  fileUrl: string;
  fileName: string;
  sortOrder: number;
  status: boolean;
}

const StudentCornerSchema = new Schema<IStudentCorner>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    masterYearId: { type: Schema.Types.ObjectId, ref: 'MasterYear', required: true },
    attachments: { type: [Schema.Types.Mixed], default: [] },
    fileUrl: { type: String, default: '', trim: true },
    fileName: { type: String, default: '', trim: true },
    sortOrder: { type: Number, required: true, default: 0 },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

if (mongoose.models.StudentCorner) {
  delete mongoose.models.StudentCorner;
}

const StudentCorner = mongoose.model<IStudentCorner>('StudentCorner', StudentCornerSchema);

export default StudentCorner;
