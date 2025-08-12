import mongoose, { Schema, Document } from "mongoose";

export interface IDynamicData extends Document {
  InnerDepartmentsData: any;
}

const DynamicDataSchema: Schema = new Schema(
  {
    InnerDepartmentsData: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  { timestamps: true }
);

const InnerDepartments=
  mongoose.models.InnerDepartments|| mongoose.model<IDynamicData>("InnerDepartments", DynamicDataSchema);

export default InnerDepartments
