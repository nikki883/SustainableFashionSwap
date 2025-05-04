import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
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
    role: {
      type: String,
      enum: ["admin", "super_admin"],
      default: "admin",
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

// Hide password when sending admin object as JSON
adminSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password
    return ret
  },
})

// Password hashing
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    this.password = await bcrypt.hash(this.password, 10)
    next()
  } catch (error) {
    console.error("Error hashing password:", error)
    next(error)
  }
})

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema)
export default Admin
