import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import randomBytes from "random-bytes";
import { Readable } from "stream";
import File from "../models/File.js";
import { checkAuthHard } from "../middlewares/user.js";
import mongoose from "mongoose";
import Link from "../models/Link.js";
import { hash } from "bcrypt";

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

    await Promise.all([
      File.deleteOne({ _id: file._id }),
      Link.deleteMany({ fileId: file._id }),
    ]);
    return res.status(200).json({ msg: "File is successfully deleted" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ err: "File cannot be deleted" });
  }
});

router.post("/create-link/:id", checkAuthHard, async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ err: "Invalid request" });
    }

    const maxDownloads = body.maxDownloads?.trim() ?? null;
    if (
      maxDownloads === "" ||
      (maxDownloads && !isFinite(maxDownloads)) ||
      (maxDownloads && Number(maxDownloads) <= 0)
    ) {
      return res.status(400).json({ err: "Enter valid download limit" });
    }

    const now = new Date();

    const expiresAt = body.expiresAt?.trim() ?? null;
    if (
      (expiresAt && isNaN(new Date(expiresAt))) ||
      (expiresAt && new Date(expiresAt) < now)
    ) {
      return res.status(400).json({ err: "Enter valid expiry" });
    }

    const password = body.password?.trim() ?? null;
    if (password && password.length < 3) {
      return res
        .status(400)
        .json({ err: "Password cannot be smaller than 3 characters" });
    }

    const rounds = 10;
    const hashedPassword = password ? await hash(password, rounds) : null;

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ err: "Invalid request" });
    }

    if (file.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ err: "Invalid request" });
    }

    const random = (await randomBytes(20)).toString("hex");
    let payload = {
      fileId: file._id,
      publicId: random,
      userId: req.user._id,
    };

    if (hashedPassword) payload.password = hashedPassword;
    if (maxDownloads) payload.maxDownloads = Number(maxDownloads);
    if (expiresAt) payload.expiresAt = new Date(expiresAt);

    await Link.create(payload);
    return res.status(201).json({ msg: "Link created" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ err: "Cannot create link" });
  }
});

router.post("/revoke-link/:publicId", checkAuthHard, async (req, res) => {
  try {
    const publicId = req.params.publicId;

    const link = await Link.findOne({ publicId })
      .populate("fileId", "_id userId")
      .lean();

    if (!link) {
      return res.status(404).json({ err: "Invalid request" });
    }

    if (link.fileId.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ err: "Invalid request" });
    }

    if (link.isRevoked) return res.status(400).json({ err: "Invalid request" });

    const updatedLink = await Link.findOneAndUpdate(
      { publicId },
      { $set: { isRevoked: true } },
      { runValidators: true, new: true },
    );

    if (!updatedLink) {
      return res.status(400).json({ err: "Link cannot be revoked" });
    }

    return res.status(200).json({ msg: "Link revoked" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ err: "Link cannot be revoked" });
  }
});

router.get("/all", checkAuthHard, async (req, res) => {
  try {
    const [relevantFiles, relevantLinks] = await Promise.all([
      File.find({ userId: req.user._id }).lean(),
      Link.find({ userId: req.user._id }).lean(),
    ]);

    const fileLink = Object.create(null);

    relevantLinks.forEach((l) => {
      const fileId = l.fileId.toString();
      if (!fileLink[fileId]) fileLink[fileId] = [];
      fileLink[fileId].push(l);
    });

    relevantFiles.forEach((f) => {
      f.links = fileLink[f._id.toString()] || [];
    });

    return res.status(200).json({
      msg: "All user files and links returned successfully",
      filesAndLinks: relevantFiles,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ err: "Could not fetch files and links" });
  }
});

router.get("/link/:publicId", async (req, res) => {
  try {
    const publicId = req.params.publicId;

    const link = await Link.findOne({ publicId })
      .populate("fileId", "_id userId fileName size mimeType")
      .populate("userId", "_id fullName")
      .lean();

    if (!link) {
      return res.status(404).json({ err: "Invalid request" });
    }

    const now = new Date();

    if (link.expiresAt && link.expiresAt < now) {
      return res.status(410).json({ err: "Invalid request" });
    }

    if (link.isRevoked) {
      return res.status(403).json({ err: "Invalid request" });
    }

    return res.status(200).json({ msg: "Link metadata sent", link });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ err: "Cannot fetch link metadata" });
  }
});

export default router;
