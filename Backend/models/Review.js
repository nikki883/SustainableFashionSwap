import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  swapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SwapRequest',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: String
}, { timestamps: true });

// Ensure one review per user per swap
reviewSchema.index({ swapId: 1, reviewer: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);