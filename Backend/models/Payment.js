// import mongoose from 'mongoose';

// const paymentSchema = new mongoose.Schema({
//   swapId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'SwapRequest',
//     required: true
//   },
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   amount: {
//     type: Number,
//     required: true
//   },
//   currency: {
//     type: String,
//     default: 'INR'
//   },
//   status: {
//     type: String,
//     enum: ['created', 'authorized', 'captured', 'refunded', 'failed'],
//     default: 'created'
//   },
//   paymentId: String,
//   orderId: String,
//   paymentMethod: String
// }, { timestamps: true });

// export default mongoose.model('Payment', paymentSchema);
import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema(
  {
    swapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Swap",
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
    buyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buy",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["created", "captured", "refunding", "refunded", "failed", "completed"],
      default: "created",
    },
    orderId: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
    },
    type: {
      type: String,
      enum: ["swap", "buy"],
      required: true,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema)
export default Payment
