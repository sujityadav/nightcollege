import mongoose, { Schema, Document } from "mongoose";

export interface IDynamicData extends Document {
  StaffData: any;
}

const DynamicDataSchema: Schema = new Schema(
  {
    StaffData: {
      type: Schema.Types.Mixed,
      required: true
    },
  },
  { timestamps: true }
);

const Staff =
  mongoose.models.Staff || mongoose.model<IDynamicData>("Staff", DynamicDataSchema);

export default Staff;
