import mongoose from "mongoose"

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    }, 
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    condition: {
      type: String,
      required: true,
      enum: ["New", "Like New", "Good", "Fair", "Poor"],
    },
    size: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      default: "Not specified"
    },
    color: {
      type: String,
      default: "Not specified",
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    imageUrls: {
      type: [String],
      validate: [arr => arr.length >= 1 && arr.length <= 3, "Upload 1 to 3 images"],
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isSwapped: {
      type: Boolean,
      default: false,
    },
    // isSold: {
    //   type: Boolean,
    //   default: false,
    // },
     availableFor: {
      type: [String], 
      // type:String,
    enum: ["Swap"],
    required: true,
  },
   
  },
  { timestamps: true },
)

// Create text index for search
// itemSchema.index({ name: "text", description: "text", brand: "text", category: "text", tags: "text" })

const Item = mongoose.models.Item || mongoose.model("Item", itemSchema)
export default Item
