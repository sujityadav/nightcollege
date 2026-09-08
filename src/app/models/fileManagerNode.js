import mongoose from "mongoose";

const FileManagerNodeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["folder", "file"], required: true },
    parentId: { type: String, default: null },
    yearId: { type: String, default: null, index: true },
    year: { type: String, default: "" },
    path: { type: String, default: "" },
    size: { type: Number, default: 0 },
    mimeType: { type: String, default: "" },
    url: { type: String, default: "" },
    isFolder: { type: Boolean, default: false },
    isStarred: { type: Boolean, default: false },
    isShared: { type: Boolean, default: false },
    isTrashed: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

FileManagerNodeSchema.index({ yearId: 1, parentId: 1, isTrashed: 1 });

export default mongoose.models.FileManagerNode ||
  mongoose.model("FileManagerNode", FileManagerNodeSchema);
