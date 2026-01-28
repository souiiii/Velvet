import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import randomBytes from "random-bytes";
import { Readable } from "stream";
import File from "../models/File.js";
import { checkAuthHard } from "../middlewares/user.js";
import mongoose from "mongoose";

cloudinary.config({
  cloud_name: "velvet",
  api_key: "fsdfaddf",
  api_secret: "fsdfdasfdf",
});

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-rar",
  "application/x-7z-compressed",
];

const imageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/svg+xml",
];

router.post(
  "/add-file",
  checkAuthHard,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ err: "No file uploaded" });
    const fileBuffer = req.file.buffer;
    console.log(req.file);
    if (req.file.size > 10000000) {
      return res.status(400).json({ err: "File size exceeds limit" });
    }
    const mimeType = req.file.mimetype;
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return res.status(400).json({ err: "File type not supported" });
    }
    let uploadResult;
    try {
      const random = (await randomBytes(12)).toString("hex");
      const stream = Readable.from(fileBuffer);
      uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: random,
            folder: `velvet/users/${req.user._id}`,
            resource_type: imageTypes.includes(mimeType) ? "image" : "raw",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );
        stream.pipe(uploadStream);
      });

      const metadata = {
        storage: {
          publicId: uploadResult.public_id,
          secureUrl: uploadResult.secure_url,
          resourceType: uploadResult.resource_type,
        },
        userId: req.user._id,
        size: uploadResult.bytes,
        fileName: uploadResult.original_filename,
        mimeType,
      };
      await File.create(metadata);
      console.log("done");
      return res.json({ msg: "uploaded" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ err: "Internal server error" });
    }
  },
);

router.delete("/delete-file/:id", checkAuthHard, async (req, res) => {
  try {
    const fileId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(fileId))
      return res.status(400).json({ err: "Invalid request" });

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ err: "File not found" });
    }

    if (file.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ err: "Invalid request" });
    }

    await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        file.storage.publicId,
        {
          resource_type: file.storage.resourceType,
        },
        (error, result) => {
          if (error) {
            console.log(error);
            reject(error);
          } else if (result.result === "ok" || result.result === "not found") {
            resolve(result);
          } else {
            reject(new Error("File cannot be deleted"));
          }
        },
      );
    });

    await File.deleteOne({ _id: file._id });
    return res.status(200).json({ msg: "File is successfully deleted" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ err: "File cannot be deleted" });
  }
});

export default router;
