import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUserItems,
  getUserSwapHistory,
  getUserReviews
} from "../controllers/userController.js";
import { addUserReview } from "../controllers/reviewController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// More specific routes should come before generic ":id"
router.get("/:id/items", getUserItems);
router.get("/:id/swap-history", getUserSwapHistory);

// router.get("/reviews/:userId", getUserReviews); //old

// Get user reviews newwwwww
router.get('/:id/reviews', getUserReviews);

router.post("/reviews/:userId", protectRoute, addUserReview);

router.get("/:id", getUserProfile);
router.put("/profile", protectRoute, updateUserProfile);

//new


export default router;
