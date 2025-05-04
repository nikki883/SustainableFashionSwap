import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from "react-router-dom"
import axios from 'axios';
import ItemCard from "../components/ItemCard";
import UserReviews from '../components/swap/UserReviews';
import AuthContext from "../context/AuthContext"
import '../styles/UserProfilePage.css';

const UserProfilePage = () => {
  const { id: userId } = useParams();
  const { user: currentUser } = useContext(AuthContext)

  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('items');

  const API_URL = import.meta.env.VITE_API_URL;
  
  const isOwnProfile = currentUser && userId === currentUser._id

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userRes = await axios.get(`${API_URL}/api/users/${userId}`);
        const itemsRes = await axios.get(`${API_URL}/api/users/${userId}/items`);
        
        setUser(userRes.data);
        setItems(Array.isArray(itemsRes.data.items) ? itemsRes.data.items : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  },[userId, API_URL]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container">
        <p className="error-message">{error || 'User not found'}</p>
      </div>
    );
  }

  return (
    <div className="container">
    <div className="profile-card">
      <div className="profile-content">
        <div className="profile-avatar">
          <img src={user.profilePicture || "/placeholder.jpg"} alt={user.name} />
        </div>

        <div className="profile-info">
          <h1 className="profile-name">{user.name}</h1>

          <div className="profile-meta">
            {user.location && (
              <div className="profile-meta-item">
                <svg
                  className="meta-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{user.location}</span>
              </div>
            )}
            <div className="profile-meta-item">
              <svg
                className="meta-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {user.bio && <p className="profile-bio">{user.bio}</p>}

          {/* Add Edit Profile button if viewing own profile */}
          {isOwnProfile && (
            <Link to="/settings" className="edit-profile-button">
              <svg
                className="edit-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit Profile
            </Link>
          )}
        </div>
      </div>
    </div>

    <div className="tabs-container">
      <div className="tabs-list">
        <div className={`tab ${activeTab === "items" ? "tab-active" : ""}`} onClick={() => setActiveTab("items")}>
          Items
        </div>
        <div className={`tab ${activeTab === "reviews" ? "tab-active" : ""}`} onClick={() => setActiveTab("reviews")}>
          Reviews
        </div>
      </div>
    </div>

    {activeTab === "reviews" ? (
      <UserReviews userId={userId} />
    ) : (
      <div className="items-grid">
        {items.length > 0 ? (
          items.map((item) => ( 
            <ItemCard
              key={item._id}
              _id={item._id}
              img={item.imageUrls?.[0]}
              title={item.name}
              size={item.size}
              price={item.price}
            />
          ))
        ) : (
          <p>No items listed by this user.</p>
        )}
      </div>
    )}
  </div>
  );
};

export default UserProfilePage;