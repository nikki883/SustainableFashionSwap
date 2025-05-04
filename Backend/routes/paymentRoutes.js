import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js"
import { createOrder ,verifyPayment} from "../controllers/paymentController.js";

const router = express.Router();

// POST /api/payment/create-order
router.post("/create-order", protectRoute,createOrder);
// Verify payment
router.post('/verify', protectRoute, verifyPayment);

export default router;
 