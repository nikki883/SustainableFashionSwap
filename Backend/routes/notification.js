import express from "express";
import Notification from "../models/Notification.js";

const router = express.Router();

// ➕ Send notification
router.post("/", async (req, res) => {
  try {
    const { senderId, receiverId, text, itemId } = req.body;

    const newNotification = new Notification({
      sender: senderId,
      receiver: receiverId,
      text,
      item: itemId,
    });

    await newNotification.save();
    res.status(201).json({ message: "Notification sent" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 📥 Get notifications for a user
router.get("/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("sender", "name profilePic")
      .populate("item", "name imageUrls");

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch notifications" });
  }
});

// ✅ Mark one as read
router.put("/:id/read", async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update" });
  }
});

export default router;
