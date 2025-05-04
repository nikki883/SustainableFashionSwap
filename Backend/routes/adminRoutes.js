import express from "express"
import { protectAdminRoute, requireSuperAdmin } from "../middleware/adminAuthMiddleware.js"
import * as userController from "../controllers/adminUserController.js"
import * as itemController from "../controllers/adminItemController.js"
import * as reviewController from "../controllers/adminReviewController.js"
import * as dashboardController from "../controllers/adminDashboardController.js"

const router = express.Router()

// Dashboard routes
router.get("/dashboard/stats", protectAdminRoute, dashboardController.getDashboardStats)
router.get("/dashboard/activity", protectAdminRoute, dashboardController.getRecentActivity)

// User management routes
router.get("/users", protectAdminRoute, userController.getAllUsers)
router.get("/users/:id", protectAdminRoute, userController.getUserDetails)
router.put("/users/:id/status", protectAdminRoute, userController.toggleUserStatus)
router.delete("/users/:id", protectAdminRoute, requireSuperAdmin, userController.deleteUser)

// Item management routes
router.get("/items", protectAdminRoute, itemController.getAllItems)
router.get("/items/:id", protectAdminRoute, itemController.getItemDetails)
router.delete("/items/:id", protectAdminRoute, itemController.removeItem)
router.get("/items-stats", protectAdminRoute, itemController.getItemStats)

// Review management routes
router.get("/reviews", protectAdminRoute, reviewController.getAllReviews)
router.delete("/reviews/:id", protectAdminRoute, reviewController.removeReview)
router.put("/reviews/:id/approve", protectAdminRoute, reviewController.markReviewAsAppropriate)

export default router
