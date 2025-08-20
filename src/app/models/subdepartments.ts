import mongoose, { Schema, Document } from "mongoose";

export interface IDynamicData extends Document {
  SubDepartmentsData: any;
}

const DynamicDataSchema: Schema = new Schema(
  {
    SubDepartmentsData: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  { timestamps: true }
);

const SubDepartments=
  mongoose.models.SubDepartments|| mongoose.model<IDynamicData>("SubDepartments", DynamicDataSchema);

export default SubDepartments
