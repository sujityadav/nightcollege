import mongoose, { Document, Schema } from 'mongoose';

export interface ICollegePublication extends Document {
  PublicationData: {
    data: {
      title: string;
      description: string;
      photo?: string;
    };
  };
}

const CollegePublicationSchema = new Schema(
  {
    PublicationData: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

const CollegePublication =
  mongoose.models.CollegePublication ||
  mongoose.model<ICollegePublication>('CollegePublication', CollegePublicationSchema);

export default CollegePublication;
