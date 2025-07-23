import mongoose, { Schema, Document } from "mongoose";

export interface IDynamicData extends Document {
  Eventdata: any;
}

const DynamicDataSchema: Schema = new Schema(
  {
    Eventdata: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  { timestamps: true }
);

const Events =
  mongoose.models.Events || mongoose.model<IDynamicData>("Events", DynamicDataSchema);

export default Events;
