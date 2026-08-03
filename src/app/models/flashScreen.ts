import mongoose, { Document, Schema } from "mongoose";

export interface IFlashScreen extends Document {
  FlashScreenData: {
    data: {
      photo?: string;
      fromDate?: string | Date;
      toDate?: string | Date;
      status?: number;
    };
  };
}

const FlashScreenSchema = new Schema(
  {
    FlashScreenData: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

const FlashScreen =
  mongoose.models.FlashScreen ||
  mongoose.model<IFlashScreen>("FlashScreen", FlashScreenSchema);

export default FlashScreen;
