import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import "./Home.css";

export default function Home() {
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  

  const API_URL = import.meta.env.VITE_API_URL 

  useEffect(() => {
    const fetchRecommended = async () => { 
      try {
        const res = await fetch(`${API_URL}/api/items/recommended`);
        const data = await res.json();
        setRecommended(data.items || []);
      } catch (error) {
        console.error("Failed to fetch recommended items", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommended();
  }, []);

  return (
    <main className="main-content">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <h1 className="hero-title">Sustainable Fashion Swap</h1>
              <p className="hero-subtitle">
                Discover unique pre-loved fashion. Swap or buy styles that suit you, and support a circular economy.
              </p>
              <div className="hero-buttons">
                <Link to="/items" className="btn btn-primary">
                  Browse Items
                </Link>
                <Link to="/add-item" className="btn btn-outline">
                  Add Your Items
                </Link>
              </div>
            </div>
            <div className="hero-image">
              {/* <img
                src="/images/hero-image.jpg"
                alt="Sustainable Fashion"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/500x500?text=Sustainable+Fashion"
                }}
              /> */}
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Items */}
      <section className="recommendation-section">
        <div className="container">
          <h2 className="section-title">Recommended for You</h2>
          <div className="recommendation-grid">
            {loading ? (
              <p className="loading-text">Loading recommendations...</p>
            ) : recommended.length > 0 ? (
              recommended.map((item) => (
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
              <p>NO items available</p>
            )}
          </div>
          <div className="view-all-container">
            <Link to="/items" className="btn btn-outline">
              View All Items
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            {/* Step 1 */}
            <div className="step">
              {/* <div className="step-icon">
                <img src="/icons/upload.svg" alt="Upload" />
              </div> */}
              <h3 className="step-title">1. Upload Items</h3>
              <p className="step-description">
                Add items from your closet that you no longer wear but are in great condition.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step">
              {/* <div className="step-icon">
                <img src="/icons/swap.svg" alt="Swap" />
              </div> */}
              <h3 className="step-title">2. Swap or Sell</h3>
              <p className="step-description">Browse other users' listings and send swap or buy requests seamlessly.</p>
            </div>

            {/* Step 3 */}
            <div className="step">
              {/* <div className="step-icon">
                <img src="/icons/review.svg" alt="Review" />
              </div> */}
              <h3 className="step-title">3. Rate and Repeat</h3>
              <p className="step-description">Once completed, leave a review and continue discovering new gems!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Community Section */}
      {/* <section className="join-section">
        <div className="container">
          <div className="join-content">
            <h2 className="section-title">Join Our Sustainable Fashion Community</h2>
            <p className="join-description">
              Be part of the movement to reduce fashion waste and discover unique styles that tell a story.
            </p>
            <Link to="/register" className="btn btn-primary">
              Sign Up Now
            </Link>
          </div>
        </div>
      </section> */}
    </main>
  );
}
