import express from "express"
import { protectRoute } from "../middleware/authMiddleware.js"
import {
    submitReview
  } from "../controllers/reviewController.js"

const router = express.Router()

router.post('/submit',protectRoute,submitReview)

export default router 