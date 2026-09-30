import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStudentCorner extends Document {
  title: string;
  description: string;
  masterYearId: Types.ObjectId;
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
    fileUrl: { type: String, required: true, trim: true },
    fileName: { type: String, default: '', trim: true },
    sortOrder: { type: Number, required: true, default: 0 },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const StudentCorner =
  mongoose.models.StudentCorner ||
  mongoose.model<IStudentCorner>('StudentCorner', StudentCornerSchema);

export default StudentCorner;
