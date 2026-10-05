import mongoose, { Schema, Document } from 'mongoose';

export interface IInfrastructureFacilities extends Document {
  InfrastructureFacilitiesData: Record<string, unknown>;
}

const InfrastructureFacilitiesSchema = new Schema<IInfrastructureFacilities>(
  {
    InfrastructureFacilitiesData: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

const InfrastructureFacilities =
  mongoose.models.InfrastructureFacilities ||
  mongoose.model<IInfrastructureFacilities>(
    'InfrastructureFacilities',
    InfrastructureFacilitiesSchema
  );

export default InfrastructureFacilities;
