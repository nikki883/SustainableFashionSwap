import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();

// Cloudinary storage engine for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "fashion_swap_items", // optional folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage });

// @route   POST /api/upload
// @desc    Upload image
// @access  Public or Protected (your choice)
router.post("/", upload.single("image"), (req, res) => {
  try {
    res.json({ imageUrl: req.file.path }); // this is the Cloudinary image URL
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
