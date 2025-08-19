import mongoose, { Schema, Document } from "mongoose";

export interface IDynamicData extends Document {
  SubAdministrationData: any;
}

const DynamicDataSchema: Schema = new Schema(
  {
    SubAdministrationData: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  { timestamps: true }
);

const SubAdministration=
  mongoose.models.SubAdministration|| mongoose.model<IDynamicData>("SubAdministration", DynamicDataSchema);

export default SubAdministration
