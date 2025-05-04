import Admin from "../models/Admin.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET || "admin_jwt_secret"

const generateToken = (adminId) => {
  return jwt.sign({ adminId }, JWT_SECRET, { expiresIn: "7d" })
}

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body
  console.log(email,password)
  try {
    const admin = await Admin.findOne({ email })

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" })
    }
    const isMatch = await bcrypt.compare(password, admin.password)

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Update last active timestamp
    admin.lastActive = new Date()
    await admin.save()

    // Generate token
    const token = generateToken(admin._id)

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 24 hours
    })

    res.status(200).json({
      message: "Login successful",
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    })
  } catch (err) {
    console.error("Error during admin login:", err)
    res.status(500).json({ message: "Server error during login" })
  }
}

export const logoutAdmin = (req, res) => {
  res.clearCookie("admin_token")
  res.json({ message: "Logged out successfully" })
}

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-password")
    if (!admin) return res.status(404).json({ error: "Admin not found" })

    res.json({ admin })
  } catch (error) {
    res.status(500).json({ error: "Server error" })
  }
}
 
export const createAdmin = async (req, res) => {
  try {
    // Only super_admin can create new admins
    if (req.admin.role !== "super_admin") {
      return res.status(403).json({ message: "Not authorized to create admins" })
    }

    const { name, email, password, role } = req.body

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email })
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin with this email already exists" })
    }

    // Create new admin
    const newAdmin = new Admin({
      name,
      email,
      password,
      role: role || "admin",
    })

    await newAdmin.save()

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    })
  } catch (error) {
    console.error("Error creating admin:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "All fields are required" })
  }

  try {
    const admin = await Admin.findById(req.admin._id)
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" })
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password)
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect" })
    }

    const salt = await bcrypt.genSalt(10)
    admin.password = await bcrypt.hash(newPassword, salt)
    await admin.save()

    res.json({ message: "Password updated successfully" })
  } catch (err) {
    console.error("Password change error:", err)
    res.status(500).json({ error: "Server error" })
  }
}
