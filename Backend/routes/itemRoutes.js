import express from "express";
import {
  addItem,
  getItems,
  getItemById,
  getSimilarItems,
  getRecommendedItems,
  searchItems,
  getMyItems,
} from "../controllers/itemController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", protectRoute, addItem);
router.get("/list", getItems);
router.get("/recommended", getRecommendedItems);
router.get("/my-items", protectRoute, getMyItems)
router.get("/:id", getItemById);
router.get("/:id/similar", getSimilarItems);
router.get("/search", searchItems);


export default router;
