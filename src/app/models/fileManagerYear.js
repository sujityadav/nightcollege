import mongoose from "mongoose";

const FileManagerYearSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    isCurrent: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.models.FileManagerYear ||
  mongoose.model("FileManagerYear", FileManagerYearSchema);
