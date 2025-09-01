import express from "express"
import {
  createOrder,
  verifyPayment,
} from "../controllers/paymentController.js"
import { protectRoute } from "../middleware/authMiddleware.js"

const router = express.Router()

// Swap payment routes
router.post("/create-order", protectRoute, createOrder)
router.post("/verify", protectRoute, verifyPayment)

export default router
