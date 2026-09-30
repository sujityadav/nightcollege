import mongoose, { Schema, Document } from 'mongoose';

export interface IMasterYear extends Document {
  fromYear: number;
  toYear: number;
  status: boolean;
}

const MasterYearSchema = new Schema<IMasterYear>(
  {
    fromYear: { type: Number, required: true, min: 1900, max: 2100 },
    toYear: { type: Number, required: true, min: 1900, max: 2100 },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

MasterYearSchema.index({ fromYear: 1, toYear: 1 }, { unique: true });

const MasterYear =
  mongoose.models.MasterYear || mongoose.model<IMasterYear>('MasterYear', MasterYearSchema);

export default MasterYear;
