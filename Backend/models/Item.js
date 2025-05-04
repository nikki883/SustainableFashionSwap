import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    default: "Not specified"
  },
  color: { 
    type: String,
    default: "Not specified"
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["Clothing", "Footwear", "Accessories", "Jewelry", "Bags", "Ethnic Wear", "Winter Wear"],
    required: true,
  },
  condition: {
    type: String,
    enum: ["New", "Like New", "Gently Used", "Well Used"],
    required: true,
  },
  size: {
    type: String,
    enum: ["XS", "S", "M", "L", "XL", "Free Size"],
    required: true,
  },
  price: {
    type: String,
    enum: ["Free", "Under ₹500", "₹500–₹1000", "Above ₹1000"],
    required: true,
  },
  imageUrls: {
    type: [String], // array of image URLs
    validate: [arr => arr.length >= 1 && arr.length <= 3, "Upload 1 to 3 images"],
    required: true,
  },
  availableFor: {
    type: String,
    enum: ["Buy", "Swap", "Both"],
    default: "Both",
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isSwapped: {
    type: Boolean,
    default: false,
  },
  isSold: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

export default mongoose.model('Item', itemSchema);
