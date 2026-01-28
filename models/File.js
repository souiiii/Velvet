import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
    },
    storage: {
      type: {
        provider: {
          type: String,
          default: "cloudinary",
          enum: ["cloudinary"],
          required: true,
        },
        publicId: { type: String, required: true },
        secureUrl: { type: String, required: true },
        resourceType: { type: String, required: true, enum: ["raw", "image"] },
      },
      required: true,
    },
  },
  { timestamps: true },
);

const File = mongoose.model("files", fileSchema);

export default File;
