import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewStars from './ReviewStars';
import '../../styles/UserReviews.css';

const UserReviews = ({ userId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  const fetchReviews = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/${userId}/reviews?page=${pageNum}&limit=5`
      );
      
      const data = response.data;

      if (pageNum === 1) {
        setReviews(data.reviews);
      } else {
        setReviews((prev) => [...prev, ...data.reviews]);
      }

      setHasMore(data.hasMore);
      setPage(pageNum);
      setError(null);
    } catch (err) {
      console.error('Error fetching user reviews:', err);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    fetchReviews(page + 1);
  };

  if (loading && page === 1) {
    return (
      <div className="loading-container">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  if (error && page === 1) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="retry-button" onClick={() => fetchReviews(1)}>
          Try Again
        </button>
      </div>
    );
  }

  if (reviews.length === 0 && page === 1) {
    return (
      <div className="empty-reviews">
        <p>No reviews yet.</p>
      </div>
    );
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <div className="reviews-title">
          <h3>Reviews ({reviews.length})</h3>
          <div className="rating-summary">
            <ReviewStars rating={Math.round(averageRating)} onRatingChange={() => {}} readOnly size={16} />
            <span>({averageRating.toFixed(1)})</span>
          </div>
        </div>
      </div>

      <div className="reviews-list">
        {reviews.map((review) => (
          <div key={review._id} className="review-card">
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-avatar">
                  <img
                    src={review.reviewer.profilePicture || "/placeholder.jpg"}
                    alt={review.reviewer.name}
                  />
                </div>
                <div className="reviewer-details">
                  <p className="reviewer-name">{review.reviewer.name}</p>
                  <p className="review-date">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <ReviewStars rating={review.rating} onRatingChange={() => {}} readOnly size={16} />
            </div>
            {review.comment && <p className="review-content">{review.comment}</p>}
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="load-more-container">
          <button className="load-more-button" onClick={loadMore} disabled={loading}>
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserReviews;