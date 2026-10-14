import mongoose, { Schema, Document } from 'mongoose';

export interface IGalleryImage {
  url: string;
  isThumbnail: boolean;
  addInGallery: boolean;
  sortOrder: number;
  title: string;
  description: string;
}

export interface IGallery extends Document {
  title: string;
  description: string;
  sortOrder: number;
  status: boolean;
  images: IGalleryImage[];
}

const GalleryImageSchema = new Schema<IGalleryImage>(
  {
    url: { type: String, required: true, trim: true },
    isThumbnail: { type: Boolean, default: false },
    addInGallery: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    title: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const GallerySchema = new Schema<IGallery>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    sortOrder: { type: Number, default: 0 },
    status: { type: Boolean, default: true },
    images: { type: [GalleryImageSchema], default: [] },
  },
  { timestamps: true }
);

const Gallery =
  mongoose.models.Gallery || mongoose.model<IGallery>('Gallery', GallerySchema);

if (!Gallery.schema.path('sortOrder')) {
  Gallery.schema.add({ sortOrder: { type: Number, default: 0 } });
}

export default Gallery;
