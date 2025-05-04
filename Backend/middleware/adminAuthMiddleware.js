import jwt from "jsonwebtoken"
import Admin from "../models/Admin.js"

const JWT_SECRET = process.env.JWT_SECRET || "admin_jwt_secret"

export const protectAdminRoute = async (req, res, next) => {
  const token = req.cookies.admin_token

  if (!token) return res.status(401).json({ error: "Unauthorized" })

  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    // Find admin by ID
    const admin = await Admin.findById(decoded.adminId).select("-password")

    if (!admin) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    // Update last active timestamp
    await Admin.findByIdAndUpdate(decoded.adminId, { lastActive: new Date() })

    // Attach admin to request
    req.admin = admin
    next()
  } catch (error) {
    console.error("Admin auth error:", error)
    res.status(401).json({ error: "Invalid token" })
  }
}

export const requireSuperAdmin = (req, res, next) => {
  if (!req.admin || req.admin.role !== "super_admin") {
    return res.status(403).json({ error: "Access denied. Super admin privileges required." })
  }
  next()
}
