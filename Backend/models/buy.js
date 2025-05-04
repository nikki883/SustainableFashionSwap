import mongoose from "mongoose";

const buySchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "completed"],
      default: "pending",
    },
    counterOfferPrice: {
      type: Number,
      default: 0,
    },
    deliveryOption: {
      type: String,
      enum: ["self", "platform"],
      default: "self",
    }
  ,  
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid"],
    default: "unpaid",
  }
},
{ timestamps: true }
,
);

export default mongoose.model("Buy", buySchema);
