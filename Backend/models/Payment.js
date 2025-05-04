import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  swapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SwapRequest',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'refunded', 'failed'],
    default: 'created'
  },
  paymentId: String,
  orderId: String,
  paymentMethod: String
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
