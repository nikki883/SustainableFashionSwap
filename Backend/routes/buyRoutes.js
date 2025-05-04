import express from "express"
import { protectRoute } from "../middleware/authMiddleware.js"
import {
  sendBuyRequest,
  respondToBuyRequest,
  getBuyRequests,
  getBuyRequestStatus,
  respondToCounterOffer,
  completeTransaction,
} from "../controllers/buyController.js"

const router = express.Router()

router.post("/request", protectRoute, sendBuyRequest)
router.post("/respond", protectRoute, respondToBuyRequest)
router.post("/counter-response", protectRoute, respondToCounterOffer)
router.post("/complete", protectRoute, completeTransaction)
router.get("/requests", protectRoute, getBuyRequests)
router.get("/request/:itemId", protectRoute, getBuyRequestStatus)

export default router
