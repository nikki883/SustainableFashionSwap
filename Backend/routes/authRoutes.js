// import express from "express";
// import {sendOtp, verifyOtp, registerUser, loginUser, logoutUser,updateProfile,updateEmail, getUserProfile,resendOtp ,deleteUser,changePassword  } from "../controllers/authController.js";
// import { protectRoute } from "../middleware/authMiddleware.js";



// const router = express.Router();

// router.post('/send-otp', sendOtp); 
// router.post('/verify-otp', verifyOtp);
// router.post('/resend-otp', resendOtp); 
// router.post('/register', registerUser);
// router.post("/login", loginUser);
// router.post("/logout", logoutUser);
// router.get("/profile", protectRoute, getUserProfile);
// router.delete("/delete",protectRoute, deleteUser); 
// // Update user profile
// router.put("/update",  protectRoute, updateProfile)
// router.put("/update-email",  protectRoute, updateEmail)

// router.put("/change-password", protectRoute,changePassword);

  

// export default router;


import express from "express"
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateProfile,
  updateEmail,
  deleteUser,
  changePassword,
  sendOtp,
  verifyOtp,
  resendOtp,
  uploadProfilePicture,
} from "../controllers/authController.js"
import { protectRoute } from "../middleware/authMiddleware.js"
import upload from "../middleware/cloudinaryUpload.js"

const router = express.Router()

// Public routes
router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/logout", logoutUser)
router.post("/send-otp", sendOtp)
router.post("/verify-otp", verifyOtp)
router.post("/resend-otp", resendOtp)

// Protected routes
router.get("/profile", protectRoute, getUserProfile)
router.put("/update", protectRoute, updateProfile)
router.put("/update-email", protectRoute, updateEmail)
router.delete("/delete", protectRoute, deleteUser)
router.post("/change-password", protectRoute, changePassword)
router.post("/upload-profile-picture", protectRoute, upload.single("profilePic"), uploadProfilePicture)

export default router
