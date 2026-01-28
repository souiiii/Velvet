import mongoose from "mongoose";

const linkSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "files",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
    },
    maxDownloads: {
      type: Number,
    },
    downloads: {
      type: Number,
      default: 0,
      required: true,
    },
    password: {
      type: String,
    },
    publicId: {
      type: String,
      required: true,
      unique: true,
    },
    isRevoked: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true },
);

const Link = mongoose.model("links", linkSchema);

export default Link;
