import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
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
    default:
      "https://res.cloudinary.com/demo/image/upload/v123456789/default_profile.png",
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
  swaps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Swap' }],
  purchases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Buy' }],
  successfulSwaps: { type: Number, default: 0 },
itemsSold: { type: Number, default: 0 },
},
//  { timestamps: true },
{ timestamps: true, toJSON: { virtuals: true } }
);

// Hide password when sending user object as JSON
userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  }
});

// Password hashing
userSchema.pre("save", async function (next) {
  console.log("Pre-save hook running, isModified:", this.isModified("password"), "isNew:", this.isNew);
  
  if (!this.isModified("password")) return next();  // Only hash if password is modified
  
  try {
    console.log("Hashing password...");
    this.password = await bcrypt.hash(this.password, 10);
    console.log("Password hashed successfully");
    next();
  } catch (error) {
    console.error("Error hashing password:", error);
    next(error);
  }
});


// 🔄 Virtual: Reviews received by this user
userSchema.virtual("myReviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "reviewee",
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
