import express from "express"
import {
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
  createAdmin,
  changePassword,
} from "../controllers/adminAuthController.js"
import { protectAdminRoute, requireSuperAdmin } from "../middleware/adminAuthMiddleware.js"

const router = express.Router()

router.post("/login", loginAdmin)
router.post("/logout", logoutAdmin)
router.get("/profile", protectAdminRoute, getAdminProfile)
router.post("/create", protectAdminRoute, requireSuperAdmin, createAdmin)
router.put("/change-password", protectAdminRoute, changePassword)

export default router
