import User from "../models/User.js"
import Item from "../models/Item.js"
import Swap from "../models/Swap.js"
import Review from "../models/Review.js"
import OtpVerification from "../models/OtpVerification.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import nodemailer from "nodemailer"
import otpGenerator from "otp-generator"
import cloudinary from "../config/cloudinary.js"

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export const sendOtp = async (req, res) => {
  const email = req.body.email.toLowerCase()

  // Check if email already exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return res.status(400).json({ message: "This email is already in use" })
  }

  // Generate OTP
  const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false })

  // Send OTP via email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Verify Your Email",
    text: `Your OTP is ${otp}`,
  }

  try {
    await transporter.sendMail(mailOptions)

    // Save OTP and email in the database for later verification
    await OtpVerification.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins from now
        verified: false,
      },
      { upsert: true, new: true },
    )

    res.json({ message: "OTP sent to your email" })
  } catch (err) {
    console.error("Error sending OTP:", err)
    res.status(500).json({ message: "Error sending OTP. Please try again" })
  }
}

// Controller for resending OTP
export const resendOtp = async (req, res) => {
  const { email } = req.body

  // Check if email exists in the database
  const existingUser = await User.findOne({ email })
  if (!existingUser) {
    return res.status(400).json({ message: "This email is not registered" })
  }

  // Find the OTP record
  const otpRecord = await OtpVerification.findOne({ email })

  // If OTP record doesn't exist or is expired, generate new OTP
  let otp
  let expiresAt

  if (!otpRecord || otpRecord.isOtpExpired()) {
    otp = otpGenerator.generate(6, { upperCase: false, specialChars: false })
    expiresAt = new Date(Date.now() + 10 * 60 * 1000) // New expiration (10 mins)

    // Save or update the OTP record
    await OtpVerification.findOneAndUpdate({ email }, { otp, expiresAt, verified: false }, { upsert: true, new: true })
  } else {
    otp = otpRecord.otp // Use the existing OTP if it's still valid
    expiresAt = otpRecord.expiresAt
  }

  // Send OTP to the email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Verify Your Email",
    text: `Your OTP is ${otp}`,
  }

  try {
    await transporter.sendMail(mailOptions)
    res.json({ message: `OTP has been sent to your email again` })
  } catch (err) {
    console.error("Error sending OTP:", err)
    res.status(500).json({ message: "Error sending OTP. Please try again." })
  }
}

// OTP verification controller
export const verifyOtp = async (req, res) => {
  let { email, otp } = req.body
  email = email.toLowerCase()

  // Ensure email and OTP are provided
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" })
  }

  // Find OTP record by email
  const otpRecord = await OtpVerification.findOne({ email })

  // Check if OTP record exists
  if (!otpRecord) {
    return res.status(404).json({ message: "OTP record not found for this email" })
  }

  // Check if OTP has expired
  if (otpRecord.isOtpExpired()) {
    return res.status(400).json({ message: "OTP has expired. Please request a new one." })
  }

  // Check if the OTP is correct
  if (otpRecord.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP. Please try again." })
  }

  // If OTP is valid, mark it as verified
  otpRecord.verifyOtp()

  // Optional: You can proceed with user registration logic here, e.g., creating the user
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return res.status(409).json({ message: "User already exists" })
  }

  // Proceed to create the user if needed (or return success message)
  res.status(200).json({ message: "Email verified successfully" })
}

export const registerUser = async (req, res) => {
  try {
    const { email, name, password, confirmPassword } = req.body

    // Check if all fields are provided
    if (!email || !name || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" })
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" })
    }

    // Check if email is verified via OTP
    const otpRecord = await OtpVerification.findOne({ email })
    if (!otpRecord || !otpRecord.verified) {
      return res.status(403).json({ message: "Email not verified via OTP" })
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" })
    }

    // Create the new user
    const newUser = new User({
      name,
      email,
      password,
      isVerified: true, 
    })

    // Save the user to the database
    await newUser.save()

    // Optionally, delete the OTP record to avoid reuse (already verified)
    await OtpVerification.deleteOne({ email })

    // Respond with a success message
    res.status(201).json({ message: "User registered successfully!" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error, please try again later" })
  }
}

export const loginUser = async (req, res) => {
  const { email, password } = req.body
  console.log("Received login details:", { email }) // Don't log passwords

  try {
    const user = await User.findOne({ email })
    console.log("User found:", user ? "Yes" : "No")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in." })
    }

    if (!password || !user.password) {
      return res.status(400).json({ message: "Password or user data is missing" })
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password)
    console.log("Password match:", isMatch)

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate token
    const token = generateToken(user._id)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        profilePic: user.profilePic,
      },
    })
  } catch (err) {
    console.error("Error during login:", err)
    res.status(500).json({ message: "Server error during login" })
  }
}

export const logoutUser = (req, res) => {
  res.clearCookie("token")
  res.json({ message: "Logged out successfully" })
}

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")
    if (!user) return res.status(404).json({ error: "User not found" })

    res.json({ user })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    res.status(500).json({ error: "Server error" })
  }
}

export const updateLastActive = async (req, res, next) => {
  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, { lastActive: new Date() })
  }
  next()
}

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id
    const { name, location, profilePic } = req.body

    console.log("Update profile request:", { name, location, profilePic: profilePic ? "Image provided" : "No image" })

    const updatedFields = {}
    if (name) updatedFields.name = name
    if (location) updatedFields.location = location
    if (profilePic) updatedFields.profilePic = profilePic

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedFields },
      { new: true, runValidators: true },
    ).select("-password")

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" })
    }

    console.log("User updated successfully:", updatedUser)

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    res.status(500).json({ message: "Failed to update profile" })
  }
}

export const updateEmail = async (req, res) => {
  try {
    const userId = req.user._id
    const { newEmail, password } = req.body

    if (!newEmail || !password) {
      return res.status(400).json({ message: "Email and password are required." })
    }

    // Find the user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found." })
    }

    // Compare the provided password with the hashed one
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password." })
    }

    // Check if new email is different
    if (user.email === newEmail) {
      return res.status(400).json({ message: "New email is the same as the current one." })
    }

    // Check if new email already exists
    const emailExists = await User.findOne({ email: newEmail })
    if (emailExists) {
      return res.status(409).json({ message: "This email is already in use." })
    }

    // Update email
    user.email = newEmail
    user.isVerified = false
    await user.save()

    res.status(200).json({ message: "Email updated successfully", user: { email: user.email } })
  } catch (error) {
    console.error("Error updating email:", error)
    res.status(500).json({ message: "Server error while updating email." })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const userId = req.user._id
    console.log("User ID to delete:", userId)

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    await Item.deleteMany({ owner: userId })
    await Swap.deleteMany({ $or: [{ requester: userId }, { owner: userId }] })
    await Review.deleteMany({ $or: [{ reviewer: userId }, { reviewee: userId }] })

    await User.findByIdAndDelete(userId)
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
    })

    res.json({ message: "User and all related data deleted successfully." })
  } catch (err) {
    console.error("Error deleting user and related data:", err)
    res.status(500).json({ error: "Failed to delete user" })
  }
}

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body

  // Validate inputs
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ error: "All fields are required" })
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ error: "New passwords do not match" })
  }

  try {
    // Find the user
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Compare current password
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect" })
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Update password directly
    user.password = hashedPassword
    await user.save()

    console.log("Password updated successfully for user:", user._id)

    res.json({ message: "Password updated successfully" })
  } catch (err) {
    console.error("Password change error:", err)
    res.status(500).json({ error: "Server error" })
  }
}

// Upload profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "profile_pictures",
      transformation: [{ width: 400, height: 400, crop: "fill" }],
    })

    // Update user profile with the new image URL
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic: result.secure_url },
      { new: true },
    ).select("-password")

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      profilePic: result.secure_url,
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error uploading profile picture:", error)
    res.status(500).json({ message: "Failed to upload profile picture" })
  }
}
