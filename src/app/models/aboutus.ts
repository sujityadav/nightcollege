import mongoose, { Schema, Document } from "mongoose";

export interface IDynamicData extends Document {
  Aboutusdata: any;
  type: string;
}

const DynamicDataSchema: Schema = new Schema(
  {
    Aboutusdata: {
      type: Schema.Types.Mixed,
      required: true
    },
    type: {
      type: String,
      required: true // optional: add if it's mandatory
    },
    img:{
      type: String
    }
  },
  { timestamps: true }
);

const AboutUs =
  mongoose.models.AboutUs || mongoose.model<IDynamicData>("AboutUs", DynamicDataSchema);

export default AboutUs;
