import React, { useState } from 'react';
import '../../styles/ReviewStars.css';

const Star = ({ filled, onClick, onMouseEnter, onMouseLeave, size = 24, readOnly = false }) => {
  const className = `star ${filled ? 'star-filled' : 'star-empty'} ${readOnly ? 'star-readonly' : 'star-clickable'}`;
  
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
};

const ReviewStars = ({ rating, onRatingChange, size = 24, readOnly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (index) => {
    if (!readOnly) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  const handleClick = (index) => {
    if (!readOnly) {
      onRatingChange(index);
    }
  };

  return (
    <div className="stars-row">
      {[1, 2, 3, 4, 5].map((index) => (
        <Star
          key={index}
          filled={index <= (hoverRating || rating)}
          onClick={() => handleClick(index)}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          size={size}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
};

export default ReviewStars;