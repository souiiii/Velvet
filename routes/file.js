import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import randomBytes from "random-bytes";
import { Readable } from "stream";
import File from "../models/File";
import { checkAuthHard } from "../middlewares/user";

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

export default router;
