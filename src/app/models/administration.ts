import mongoose, { Schema, Document } from "mongoose";

export interface IDynamicData extends Document {
  AdministrationData: any;
}

const DynamicDataSchema: Schema = new Schema(
  {
    AdministrationData: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  { timestamps: true }
);

const Administration=
  mongoose.models.Administration|| mongoose.model<IDynamicData>("Administration", DynamicDataSchema);

export default Administration
