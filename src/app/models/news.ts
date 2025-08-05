import mongoose, { Schema, Document } from "mongoose";

export interface IDynamicData extends Document {
  Newsdata: any;
}

const DynamicDataSchema: Schema = new Schema(
  {
    Newsdata: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  { timestamps: true }
);

const News =
  mongoose.models.News || mongoose.model<IDynamicData>("News", DynamicDataSchema);

export default News;
