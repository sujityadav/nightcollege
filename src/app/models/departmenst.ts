import mongoose, { Schema, Document } from "mongoose";

export interface IDynamicData extends Document {
  DepartmentsData: any;
}

const DynamicDataSchema: Schema = new Schema(
  {
    DepartmentsData: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  { timestamps: true }
);

const Departments=
  mongoose.models.Departments|| mongoose.model<IDynamicData>("Departments", DynamicDataSchema);

export default Departments
