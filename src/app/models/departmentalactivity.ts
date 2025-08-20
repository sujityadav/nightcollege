import mongoose, { Schema, Document } from "mongoose";

export interface IDynamicData extends Document {
  DepartmentlActivityData: any;
}

const DynamicDataSchema: Schema = new Schema(
  {
    DepartmentlActivityData: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  { timestamps: true }
);

const DepartmentlActivity=
  mongoose.models.DepartmentlActivity|| mongoose.model<IDynamicData>("DepartmentlActivity", DynamicDataSchema);

export default DepartmentlActivity
