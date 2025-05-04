import React from "react";
import { formatDistanceToNow } from "date-fns";
import "../pages/UserProfile.css";
import ItemCard from "./ItemCard";
const ProfileInfo = ({ user, items, reviews }) => {
  //used for debuging
  // console.log("ProfileInfo received items:", items);

  return (
    <div className="profile-info">
      <div className="user-box">
        <img
          src={user.profilePicture || "/default-avatar.png"}
          alt="User"
          className="profile-pic"
        />
        <div className="user-details">
          <h2>{user.name}</h2>
          {user.bio && <p>{user.bio}</p>}
          <p>📍 {user.location || "Unknown Location"}</p>
          {user.lastActive ? (
            <span>
              Last active:{" "}
              {formatDistanceToNow(new Date(user.lastActive), {
                addSuffix: true,
              })}
            </span>
          ) : (
            <span>Last active: Unknown</span>
          )}
          {user.createdAt && !isNaN(new Date(user.createdAt).getTime()) ? (
            <p>
              Joined:{" "}
              {formatDistanceToNow(new Date(user.createdAt), {
                addSuffix: true,
              })}
            </p>
          ) : (
            <p>Joined: Not available</p>
          )}
          {user.social && (
            <div className="social-links">
              {user.social.website && (
                <a
                  href={user.social.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🌐 Website
                </a>
              )}
              {/* Add other social links similarly */}
            </div>
          )}
        </div>
      </div>

      <hr />

      <div className="uploaded-items">
        <h3>Uploaded Items</h3>
        {items.length === 0 ? (
          <p>No items uploaded yet.</p>
        ) : (
          <div className="items-grid">
            {items.map((item) => (
              <ItemCard
                key={item._id}
                _id={item._id}
                img={item.imageUrls?.[0]}
                title={item.name}
                size={item.size}
                price={item.price}
              />
            ))}
          </div>
        )}
      </div>

      <hr />

      <div className="user-reviews">
        <h3>Reviews</h3>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="review-box">
              <strong>{review.reviewer.name}</strong> - ⭐ {review.rating}
              <p>{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;

{
  /* <Link to={`/items/${item._id}`}>
<h3>{item.name}</h3>
<img
    src={item.imageUrls?.[0]} 
    alt={item.name}
    style={{
      width: "100%",
      height: "200px",
      objectFit: "cover",
      borderRadius: "8px",
      cursor: "pointer",
    }}
  />
</Link> */
}
