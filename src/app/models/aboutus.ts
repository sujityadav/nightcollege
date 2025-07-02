// models/DynamicData.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IDynamicData extends Document {
  data: any; // This allows any structure
}

const DynamicDataSchema: Schema = new Schema(
  {
    Aboutusdata: {
      type: Schema.Types.Mixed, // <--- this allows ANY structure (object, array, primitive)
      required: true
    }
  },
  { timestamps: true }
);

const AboutUs =
  mongoose.models.AboutUs || mongoose.model<IDynamicData>("AboutUs", DynamicDataSchema);

export default AboutUs;
