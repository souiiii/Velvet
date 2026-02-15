import dotenv from "dotenv";
dotenv.config();
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import randomBytes from "random-bytes";
import { pipeline, Readable } from "stream";
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

// console.log(process.env.API_KEY);

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
    try {
      if (!req.file) {
        return res.status(400).json({ err: "No file uploaded" });
      }

      const MAX_FILE_SIZE = 10_000_000;
      const MAX_STORAGE = 100_000_000;

      const { buffer, size, mimetype, originalname } = req.file;

      if (size > MAX_FILE_SIZE) {
        return res.status(400).json({ err: "File size exceeds limit" });
      }

      if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
        return res.status(400).json({ err: "File type not supported" });
      }

      const random = (await randomBytes(12)).toString("hex");
      const stream = Readable.from(buffer);

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: random,
            folder: `velvet/users/${req.user._id}`,
            resource_type: imageTypes.includes(mimetype) ? "image" : "raw",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        stream.pipe(uploadStream);
      });

      const uploadedBytes = uploadResult.bytes;

      console.log("Current DB storage:", req.user.storageUsed);
      console.log("Uploaded bytes:", uploadedBytes);
      console.log("Max allowed:", MAX_STORAGE);

      const updatedUser = await User.findOneAndUpdate(
        {
          _id: req.user._id,
          storageUsed: { $lte: MAX_STORAGE - uploadedBytes },
        },
        { $inc: { storageUsed: uploadedBytes } },
        { new: true },
      );
      console.log("DB update result:", updatedUser);
      if (!updatedUser) {
        await cloudinary.uploader.destroy(uploadResult.public_id, {
          resource_type: uploadResult.resource_type,
        });

        return res.status(400).json({ err: "Insufficient space" });
      }

      await File.create({
        storage: {
          publicId: uploadResult.public_id,
          secureUrl: uploadResult.secure_url,
          resourceType: uploadResult.resource_type,
        },
        userId: req.user._id,
        size: uploadedBytes,
        fileName: originalname,
        mimeType: mimetype,
      });

      return res.json({ msg: "uploaded" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ err: "Internal server error" });
    }
  },
);

router.delete("/delete-file/:id", checkAuthHard, async (req, res) => {
  try {
    const fileId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ err: "Invalid request" });
    }

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ err: "File not found" });
    }

    // Ensure ownership
    if (file.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ err: "Unauthorized" });
    }

    // Delete from Cloudinary
    await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        file.storage.publicId,
        {
          invalidate: true,
          resource_type: file.storage.resourceType,
        },
        (error, result) => {
          if (error) return reject(error);

          if (result.result === "ok" || result.result === "not found") {
            resolve(result);
          } else {
            reject(new Error("Cloudinary deletion failed"));
          }
        },
      );
    });

    // Delete file + links in parallel
    await Promise.all([
      File.deleteOne({ _id: file._id }),
      Link.deleteMany({ fileId: file._id }),
    ]);

    // 🔥 Recalculate storage safely
    const aggregation = await File.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: null, total: { $sum: "$size" } } },
    ]);

    const newStorageUsed = aggregation[0]?.total || 0;

    await User.findByIdAndUpdate(req.user._id, {
      storageUsed: newStorageUsed,
    });

    return res.status(200).json({
      msg: "File successfully deleted",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: "File cannot be deleted" });
  }
});

router.post("/create-link/:id", checkAuthHard, async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const isPassEnabled = req.body.isPassEnabled ?? false;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ err: "Invalid request" });
    }

    const maxDownloads = body.maxDownloads ?? null;
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
    if (isPassEnabled && (!password || password.length < 3)) {
      return res.status(400).json({
        err: "Password must be at least 3 characters",
      });
    }
    let hashedPassword;
    if (isPassEnabled) {
      const rounds = 10;
      hashedPassword = password ? await hash(password, rounds) : null;
    }

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

    if (isPassEnabled && hashedPassword) {
      payload.password = hashedPassword;
    } else {
      payload.password = null;
    }
    payload.isPassEnabled = isPassEnabled;
    if (maxDownloads) payload.maxDownloads = Number(maxDownloads);
    if (expiresAt) payload.expiresAt = new Date(expiresAt);

    await Link.create(payload);
    return res.status(201).json({ msg: "Link created" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ err: "Cannot create link" });
  }
});

router.post("/edit-link/:publicId", checkAuthHard, async (req, res) => {
  try {
    const publicId = req.params.publicId;

    const maxDownloads = req.body.maxDownloads ?? null;
    const expiresAt = req.body.expiresAt?.trim() ?? null;
    const password = req.body.password?.trim() ?? null;
    const isPassEnabled = req.body.isPassEnabled ?? false;

    if (!publicId) return res.status(400).json({ err: "Invalid Request" });

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

    const now = new Date();

    if (link.expiresAt && link.expiresAt < now) {
      return res.status(400).json({ err: "Invalid request" });
    }

    if (
      (expiresAt && isNaN(new Date(expiresAt))) ||
      (expiresAt && new Date(expiresAt) < now)
    ) {
      return res.status(400).json({ err: "Enter valid expiry" });
    }

    if (expiresAt && link.expiresAt && new Date(expiresAt) < link.expiresAt) {
      return res.status(400).json({ err: "Expiry can only be extended" });
    }

    if (
      maxDownloads &&
      (isNaN(maxDownloads) ||
        Number(maxDownloads) < 1 ||
        maxDownloads < link.downloads)
    ) {
      return res.status(400).json({ err: "Invalid max downloads" });
    }

    if (isPassEnabled && (!password || password.length < 3)) {
      return res.status(400).json({
        err: "Password must be at least 3 characters",
      });
    }

    let hashedPassword;
    if (isPassEnabled) {
      const rounds = 10;
      hashedPassword = password ? await hash(password, rounds) : null;
    }

    let payload = {};

    if (isPassEnabled && hashedPassword) payload.password = hashedPassword;
    else payload.password = null;
    payload.isPassEnabled = isPassEnabled;
    if (maxDownloads) payload.maxDownloads = Number(maxDownloads);
    if (expiresAt) payload.expiresAt = new Date(expiresAt);

    const updatedLink = await Link.findOneAndUpdate(
      { userId: req.user._id, _id: link._id },
      { $set: payload },
      { new: true, runValidators: true },
    );

    if (!updatedLink) {
      return res.status(400).json({ err: "Could not edit link" });
    }

    return res.status(200).json({ msg: "Link edited successfully" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ err: "Cannot create link" });
  }
});

router.post("/revoke-link/:publicId", checkAuthHard, async (req, res) => {
  try {
    const publicId = req.params.publicId;

    if (!publicId) return res.status(400).json({ err: "Invalid Request" });

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

    const now = new Date();

    if (link.expiresAt && link.expiresAt < now) {
      return res.status(400).json({ err: "Invalid request" });
    }

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
      f.storage = null;
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
      .populate("fileId", "fileName size mimeType")
      .populate("userId", "fullName")
      .lean();

    if (!link) {
      return res.status(404).json({ err: "Invalid request" });
    }

    const now = new Date();

    if (link.expiresAt && link.expiresAt < now) {
      return res.status(404).json({ err: "Invalid request" });
    }

    if (link.isRevoked) {
      return res.status(404).json({ err: "Invalid request" });
    }

    if (link.isAnonymous) {
      link.userId = null;
    }

    return res.status(200).json({ msg: "Link metadata sent", link });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ err: "Cannot fetch link metadata" });
  }
});

router.get("/download-public/:publicId", async (req, res) => {
  try {
    const { publicId } = req.params;
    const password = req.query.password?.trim();

    const link = await Link.findOne({ publicId }).populate("fileId").lean();

    if (!link)
      return res.redirect(
        `${process.env.CLIENT_URL}/link/${publicId}?error=Invalid%20request`,
      );

    const now = new Date();

    if (link.expiresAt && link.expiresAt < now)
      return res.redirect(
        `${process.env.CLIENT_URL}/link/${publicId}?error=Invalid%20request`,
      );

    if (link.isRevoked)
      return res.redirect(
        `${process.env.CLIENT_URL}/link/${publicId}?error=Invalid%20request`,
      );

    if (link.password && !password)
      return res.redirect(
        `${process.env.CLIENT_URL}/link/${publicId}?error=Password%20required`,
      );

    if (link.password && !(await compare(password, link.password)))
      return res.redirect(
        `${process.env.CLIENT_URL}/link/${publicId}?error=Wrong%20password`,
      );

    const cloudinaryUrl = link.fileId?.storage?.secureUrl;
    if (!cloudinaryUrl)
      return res.status(500).json({ err: "Missing storage URL" });

    if (link.maxDownloads !== undefined) {
      const updated = await Link.findOneAndUpdate(
        {
          publicId,
          downloads: { $lt: link.maxDownloads },
        },
        { $inc: { downloads: 1 } },
        { new: true },
      );

      if (!updated)
        return res.redirect(
          `${process.env.CLIENT_URL}/link/${publicId}?error=Download%20limit%20reached`,
        );
    } else {
      await Link.updateOne({ publicId }, { $inc: { downloads: 1 } });
    }

    const originalName = link.fileId.fileName || "download";

    const asciiName = originalName
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    const encodedName = encodeURIComponent(originalName);

    const cloudStream = request.get(cloudinaryUrl);

    cloudStream.on("response", (cloudRes) => {
      if (cloudRes.statusCode !== 200) {
        return res.status(502).json({ err: "Failed to fetch file" });
      }

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${asciiName}"; filename*=UTF-8''${encodedName}`,
      );

      res.setHeader(
        "Content-Type",
        link.fileId.mimeType || "application/octet-stream",
      );

      pipeline(cloudRes, res, (err) => {
        if (err) {
          console.error("Stream pipeline failed:", err.message);
          if (!res.headersSent) {
            res.status(500).json({ err: "Download failed" });
          }
        }
      });
    });

    cloudStream.on("error", (err) => {
      console.error("Cloudinary stream error:", err.message);
      if (!res.headersSent) {
        res.status(500).json({ err: "Download failed" });
      }
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ err: "Download failed" });
  }
});

router.get("/download-private/:fileId", checkAuthHard, async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ err: "Invalid request" });
    }

    const file = await File.findOne({
      _id: fileId,
      userId: req.user._id,
    }).lean();

    if (!file) {
      return res.status(404).json({ err: "File not found" });
    }

    const cloudinaryUrl = file.storage?.secureUrl;

    if (!cloudinaryUrl) {
      return res.status(415).json({ err: "Missing storage URL" });
    }

    const originalName = file.fileName || "download";
    const asciiName = originalName
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    const encodedName = encodeURIComponent(originalName);

    const cloudStream = request.get(cloudinaryUrl);

    cloudStream.on("response", (cloudRes) => {
      if (cloudRes.statusCode !== 200) {
        return res.status(502).json({
          err: "Failed to fetch file from storage",
        });
      }

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${asciiName}"; filename*=UTF-8''${encodedName}`,
      );

      res.setHeader(
        "Content-Type",
        file.mimeType || "application/octet-stream",
      );

      cloudRes.pipe(res);
    });

    cloudStream.on("error", (err) => {
      console.error("Cloudinary stream error:", err.message);
      if (!res.headersSent) {
        return res.status(500).json({ err: "Download failed" });
      }
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ err: "Download failed" });
  }
});
export default router;
