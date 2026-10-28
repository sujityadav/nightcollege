import mongoose, { Document, Schema } from 'mongoose';

export interface ICollegeStatistic extends Document {
  title: string;
  count: string;
  sortOrder: number;
  status: boolean;
}

const CollegeStatisticSchema = new Schema<ICollegeStatistic>(
  {
    title: { type: String, required: true, trim: true },
    count: { type: String, required: true, trim: true },
    sortOrder: { type: Number, required: true, default: 0, min: 0 },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CollegeStatistic =
  mongoose.models.CollegeStatistic ||
  mongoose.model<ICollegeStatistic>('CollegeStatistic', CollegeStatisticSchema);

export default CollegeStatistic;
