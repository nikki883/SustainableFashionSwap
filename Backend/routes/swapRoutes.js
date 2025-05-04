import express from "express"
import {
  requestSwap,
  getSwapRequests,
  updateSwapStatus,
  counterOffer,
  updateDeliveryMethod,
  completeSwap,
  confirmCompletion,
  getSwapHistory,
} from "../controllers/swapController.js"
import { protectRoute } from "../middleware/authMiddleware.js"

const router = express.Router()

// All routes are protected
router.use(protectRoute)

// Create a swap request
router.post("/request", requestSwap)

// Get all swap requests for the current user
router.get("/requests", getSwapRequests)

// Update swap status (accept, decline)
router.put("/update", updateSwapStatus)

// Send a counter offer
router.put("/counter", counterOffer)

// Update delivery method
router.put("/delivery", updateDeliveryMethod)

// Complete a swap (legacy endpoint - kept for backward compatibility)
router.put("/complete", completeSwap)

// New endpoint for confirming completion by one user
router.put("/confirm-completion", confirmCompletion)

// Get swap history
router.get("/history", getSwapHistory)

export default router
