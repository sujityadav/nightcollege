import mongoose, { Schema, Document } from "mongoose";

export interface IDynamicData extends Document {
  CommitiesData: any;
}

const DynamicDataSchema: Schema = new Schema(
  {
    CommitiesData: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  { timestamps: true }
);

const Commities=
  mongoose.models.Commities|| mongoose.model<IDynamicData>("Commities", DynamicDataSchema);

export default Commities
