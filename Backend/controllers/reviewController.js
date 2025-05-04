import Review from '../models/Review.js';
import SwapRequest from '../models/Swap.js';

// Submit a review
export const submitReview = async (req, res) => {
  try {
    const { swapId, userId, rating, comment } = req.body;
    const reviewerId = req.user._id;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if swap exists and is completed
    const swap = await SwapRequest.findById(swapId);
    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    if (!swap.completed) {
      return res.status(400).json({ message: 'Cannot review an incomplete swap' });
    }

    // Verify reviewer is part of this swap
    if (swap.owner.toString() !== reviewerId.toString() && 
        swap.requester.toString() !== reviewerId.toString()) {
      return res.status(403).json({ message: 'Not authorized to review this swap' });
    }

    // Verify reviewee is the other party in the swap
    if (swap.owner.toString() !== userId.toString() && 
        swap.requester.toString() !== userId.toString()) {
      return res.status(400).json({ message: 'Invalid reviewee' });
    }

    // Check if user has already reviewed this swap
    const existingReview = await Review.findOne({
      swapId,
      reviewer: reviewerId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this swap' });
    }

    // Create review
    const review = new Review({
      swapId,
      reviewer: reviewerId,
      reviewee: userId,
      rating,
      comment
    });

    await review.save();

    res.status(201).json({ 
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Failed to submit review' });
  }
};

 export const addUserReview = async (req, res) => {
    try {
      const reviewer = req.user._id;
      const reviewee = req.params._id;
      const { rating, comment } = req.body;
  
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }
  
      let existingReview = await Review.findOne({ reviewer, reviewee });
  
      if (existingReview) {
        // Update the existing review
        existingReview.rating = rating;
        existingReview.comment = comment;
        await existingReview.save();
  
        return res.status(200).json({ message: "Review updated", review: existingReview });
      }
  
      const newReview = await Review.create({ reviewer, reviewee, rating, comment });
      res.status(201).json({ message: "Review submitted", review: newReview });
  
    } catch (error) {
      console.error("Error submitting review:", error);
      res.status(500).json({ error: "Server error" });
    }
  };