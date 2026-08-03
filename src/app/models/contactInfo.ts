import mongoose, { Document, Schema } from "mongoose";

export interface IContactInfo extends Document {
  ContactInfoData: {
    data: {
      googleLocation: string;
      contactInfo: string;
    };
  };
}

const ContactInfoSchema = new Schema(
  {
    ContactInfoData: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

const ContactInfo =
  mongoose.models.ContactInfo ||
  mongoose.model<IContactInfo>("ContactInfo", ContactInfoSchema);

export default ContactInfo;
