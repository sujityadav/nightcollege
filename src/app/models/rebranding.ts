import mongoose, { Schema, Document } from "mongoose";

export interface IDynamicData extends Document {
  RebrandingData: any;
}

const DynamicDataSchema: Schema = new Schema(
  {
    RebrandingData: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  { timestamps: true }
);

const Rebranding =
  mongoose.models.Rebranding || mongoose.model<IDynamicData>("Rebranding", DynamicDataSchema);

export default Rebranding;
