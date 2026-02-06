import dotenv from "dotenv";
dotenv.config();
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import randomBytes from "random-bytes";
import { Readable } from "stream";
import File from "../models/File.js";
import { checkAuthHard } from "../middlewares/user.js";
import mongoose from "mongoose";
import Link from "../models/Link.js";
import { compare, hash } from "bcrypt";
import request from "request";
import path from "path";
import User from "../models/User.js";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

console.log(process.env.API_KEY);

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
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/aac",
  "audio/flac",
  "audio/mp4",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/x-matroska",
  "video/quicktime",
  "application/zip",
  "application/x-rar",
  "application/x-7z-compressed",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/octet-stream",
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
    if (
      mimeType === "application/octet-stream" &&
      imageTypes.includes(mimeType)
    ) {
      return res.status(400).json({ err: "Invalid image upload" });
    }

    if (req.user.storageUsed + req.file.size > 100000000) {
      return res.status(400).json({ err: "Insufficent space" });
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
        fileName: req.file.originalname,
        mimeType,
      };
      await Promise.all([
        File.create(metadata),
        User.findByIdAndUpdate(req.user._id, {
          $inc: { storageUsed: uploadResult.bytes },
        }),
      ]);
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
      User.findByIdAndUpdate(req.user._id, {
        $inc: { storageUsed: 0 - file.size },
      }),
    ]);
    return res.status(200).json({
      msg: "File is successfully deleted",
    });
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

    const random = (await randomBytes(10)).toString("base64url");
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
      f.storage = {};
    });

    // console.log(relevantFiles);

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
      .populate(
        "fileId",
        "_id userId fullName size mimeType maxDownloads downloads",
      )
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

router.get("/download-public/:publicId", async (req, res) => {
  try {
    const publicId = req.params.publicId;
    const password = req.query.password?.trim();

    const link = await Link.findOne({ publicId }).populate("fileId").lean();

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

    if (link.password && !password) {
      return res.status(411).json({ err: "Password required" });
    }

    if (link.password && !(await compare(password, link.password))) {
      return res.status(412).json({ err: "Wrong password" });
    }

    if (link.maxDownloads !== undefined && link.maxDownloads <= 0) {
      return res.status(413).json({ err: "Invalid max downloads value" });
    }

    if (link.maxDownloads) {
      const updatedLink = await Link.findOneAndUpdate(
        {
          publicId,
          downloads: { $lt: link.maxDownloads },
        },
        { $inc: { downloads: 1 } },
        { runValidators: true, new: true },
      ).lean();

      if (!updatedLink)
        return res.status(414).json({ err: "Download limit reached" });
    }

    const originalUrl = link.fileId.storage.secureUrl;

    if (!originalUrl) {
      return res.status(415).json({ err: "Missing Cloudinary URL parameter" });
    }

    const customDownloadName = link.fileId.fullName;
    const cloudinaryUrl = originalUrl.replace(
      "/upload/",
      `/upload/fl_attachment:${encodeURIComponent(customDownloadName)}/`,
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${customDownloadName}"`,
    );
    res.setHeader("Content-Type", link.fileId.mimeType);

    const downloadStream = request.get(cloudinaryUrl);
    downloadStream.on("error", (err) => {
      console.error("Cloudinary Stream Error:", err);
      if (!res.headersSent) {
        return res
          .status(500)
          .json({ err: "Failed to fetch file from storage" });
      }
    });

    return downloadStream.pipe(res).on("error", (err) => {
      console.error("Browser Pipe Error:", err);
      res.end();
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ err: "Download failed" });
  }
});

router.get("/download-private/:fileId", checkAuthHard, async (req, res) => {
  try {
    const fileId = req.params.fileId;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ err: "Invalid request" });
    }

    const file = await File.findOne({
      _id: fileId,
      userId: req.user._id,
    }).lean();

    if (!file) {
      return res.status(404).json({ err: "Invalid request" });
    }

    const originalUrl = file.storage.secureUrl;

    if (!originalUrl) {
      return res.status(415).json({ err: "Missing Cloudinary URL parameter" });
    }

    const customDownloadName = file.fullName;
    const cloudinaryUrl = originalUrl.replace(
      "/upload/",
      `/upload/fl_attachment:${encodeURIComponent(customDownloadName)}/`,
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${customDownloadName}"`,
    );
    res.setHeader("Content-Type", file.mimeType);

    const downloadStream = request.get(cloudinaryUrl);
    downloadStream.on("error", (err) => {
      console.error("Cloudinary Stream Error:", err);
      if (!res.headersSent) {
        return res
          .status(500)
          .json({ err: "Failed to fetch file from storage" });
      }
    });

    return downloadStream.pipe(res).on("error", (err) => {
      console.error("Browser Pipe Error:", err);
      res.end();
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ err: "Download failed" });
  }
});

export default router;
