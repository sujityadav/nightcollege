import mongoose, { Schema, Document } from "mongoose";

export interface IDynamicData extends Document {
  AlumniData: any;
}

const DynamicDataSchema: Schema = new Schema(
  {
    AlumniData: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  { timestamps: true }
);

const Alumni=
  mongoose.models.Alumni|| mongoose.model<IDynamicData>("Alumni", DynamicDataSchema);

export default Alumni
