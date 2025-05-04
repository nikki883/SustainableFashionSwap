import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Modal from '../ui/Modal';
import ReviewStars from './ReviewStars';
import '../../styles/SwapReviewModal.css';

const SwapReviewModal = ({ isOpen, onClose, swap, partnerToReview, onReviewSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      await axios.post(`${import.meta.env.VITE_API_URL}/api/review/submit`, {
        swapId: swap._id,
        userId: partnerToReview._id,
        rating,
        comment,
      }, {
        withCredentials: true
      });

      toast.success('Thank you for your feedback!');
      onReviewSubmit();
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rate Your Swap Experience">
      <div className="review-modal-container">
        <div className="review-section">
          <p className="review-label">
            How was your experience swapping with {partnerToReview.name}?
          </p>
          <div className="stars-container">
            <ReviewStars rating={rating} onRatingChange={setRating} />
          </div>
        </div>

        <div className="review-section">
          <p className="review-label">Share your experience (optional):</p>
          <textarea
            className="comment-textarea"
            placeholder="Tell us about your swap experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>

        <div className="modal-footer">
          <button className="skip-button" onClick={onClose}>
            Skip
          </button>
          <button 
            className="submit-button" 
            onClick={handleSubmit} 
            disabled={submitting}
          >
            {submitting && (
              <span className="loader">⟳</span>
            )}
            Submit Review
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SwapReviewModal;