import express from "express"
import { protectRoute } from "../middleware/authMiddleware.js"
import {
  getConversations,
  getMessages,
  createOrGetConversation,
  getUnreadCount,
  // unreadMessages
} from "../controllers/messageController.js"

const router = express.Router()

// Get all conversations for the current user
router.get("/conversations", protectRoute, getConversations)

// Get messages for a specific conversation
router.get("/:conversationId", protectRoute, getMessages)

// Create or get a conversation with another user
router.post("/conversation", protectRoute, createOrGetConversation)

// Get unread message count from a specific user
router.get("/unread/:senderId", protectRoute, getUnreadCount)
// router.get("unread-total",protectRoute,unreadMessages)
export default router
 