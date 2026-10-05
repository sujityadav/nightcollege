import mongoose, { Document, Schema } from 'mongoose';

export interface IPlacementPartner extends Document {
  title: string;
  image: string;
  sortNo: number;
}

const PlacementPartnerSchema = new Schema<IPlacementPartner>(
  {
    title: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    sortNo: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true }
);

const PlacementPartner =
  mongoose.models.PlacementPartner ||
  mongoose.model<IPlacementPartner>('PlacementPartner', PlacementPartnerSchema);

if (!PlacementPartner.schema.path('sortNo')) {
  PlacementPartner.schema.add({ sortNo: { type: Number, required: true, default: 0, min: 0 } });
}

export default PlacementPartner;
