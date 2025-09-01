import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: "https://res.cloudinary.com/demo/image/upload/v123456789/default_profile.png",
    },
    location: {
      type: String,
      default: "Not specified",
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    lastActive: {
      type: Date,
      default: Date.now,
    },
    swaps: [{ type: mongoose.Schema.Types.ObjectId, ref: "Swap" }],
    purchases: [{ type: mongoose.Schema.Types.ObjectId, ref: "Buy" }],
    successfulSwaps: { type: Number, default: 0 },
    itemsSold: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true } },
)

// Hide password when sending user object as JSON
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password
    return ret
  },
})

// Password hashing middleware
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next()

  try {
    console.log("Hashing password...")
    // Generate a salt
    const salt = await bcrypt.genSalt(10)
    // Hash the password along with the new salt
    this.password = await bcrypt.hash(this.password, salt)
    console.log("Password hashed successfully")
    next()
  } catch (error) {
    console.error("Error hashing password:", error)
    next(error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Virtual: Reviews received by this user
userSchema.virtual("myReviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "reviewee",
})

const User = mongoose.models.User || mongoose.model("User", userSchema)
export default User
