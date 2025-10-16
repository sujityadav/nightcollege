import mongoose, { Schema, Document } from "mongoose";

export interface IDynamicData extends Document {
  filename: any;
  referenceId: string;
  url: any;
  size: any;
}

const DynamicDataSchema: Schema = new Schema(
  {
    name: {
      type: Schema.Types.Mixed,
      required: true
    },
     url: {
      type: Schema.Types.Mixed,
      required: true
    },
    size: {
      type: Schema.Types.Mixed,
    },
    referenceId: {
      type: String,
      required: true // optional: add if it's mandatory
    },
  },
  { timestamps: true }
);

const Uploads =
  mongoose.models.Uploads || mongoose.model<IDynamicData>("Uploads", DynamicDataSchema);

export default Uploads;
