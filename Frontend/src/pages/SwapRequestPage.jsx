import { useState, useEffect } from "react";
import axios from "axios";
import SwapRequestCard from "../components/swap/SwapRequestCard";
import "../styles/SwapRequestsPage.css";

const SwapRequestsPage = () => {
  const [swapRequests, setSwapRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchSwapRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/swaps/requests`, {
        withCredentials: true,
      });

      setSwapRequests(response.data.swaps || []);
    } catch (err) {
      console.error("Error in fetchSwapRequests:", err);
      setError("Failed to load swap requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwapRequests();
  }, []);

  // Filter swap requests
  const receivedSwapRequests = (swapRequests || []).filter(
    (swap) => !swap.isRequester
  );
  const sentSwapRequests = (swapRequests || []).filter(
    (swap) => swap.isRequester
  );
  const pendingSwapRequests = (swapRequests || []).filter(
    (swap) => swap.status === "pending"
  );
  const approvedSwapRequests = (swapRequests || []).filter(
    (swap) => swap.status === "approved"
  );
  const completedSwapRequests = (swapRequests || []).filter(
    (swap) => swap.status === "completed"
  );

  const getFilteredRequests = () => {
    switch (activeTab) {
      case "received":
        return receivedSwapRequests;
      case "sent":
        return sentSwapRequests;
      case "pending":
        return pendingSwapRequests;
      case "approved":
        return approvedSwapRequests;
      case "completed":
        return completedSwapRequests;
      default:
        return swapRequests;
    }
  };

  const filteredRequests = getFilteredRequests();

  return (
    <div className="container">
      <h1 className="page-title">Requests</h1>

      {loading ? (
        <div className="loading-container">
          <div className="loader">Loading...</div>
        </div>
      ) : error ? (
        <div className="error-alert">
          <svg
            className="error-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="16"
            height="16"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p className="error-message">{error}</p>
        </div>
      ) : (
        <>
          <div className="tabs-container">
            <div className="tabs-list">
              <div
                className={`tab ${activeTab === "all" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                All ({swapRequests.length})
              </div>
              <div
                className={`tab ${
                  activeTab === "received" ? "tab-active" : ""
                }`}
                onClick={() => setActiveTab("received")}
              >
                Received ({receivedSwapRequests.length})
              </div>
              <div
                className={`tab ${activeTab === "sent" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("sent")}
              >
                Sent ({sentSwapRequests.length})
              </div>
              <div
                className={`tab ${activeTab === "pending" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("pending")}
              >
                Pending ({pendingSwapRequests.length})
              </div>

              <div
                className={`tab ${
                  activeTab === "approved" ? "tab-active" : ""
                }`}
                onClick={() => setActiveTab("approved")}
              >
                Approved ({approvedSwapRequests.length})
              </div>

              <div
                className={`tab ${
                  activeTab === "completed" ? "tab-active" : ""
                }`}
                onClick={() => setActiveTab("completed")}
              >
                Completed ({completedSwapRequests.length})
              </div>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="empty-state">
              <p>
                No {activeTab !== "all" ? activeTab : ""} swap requests found.
              </p>
            </div>
          ) : (
            <div className="swaps-grid">
              {filteredRequests.map((swap) => (
                <SwapRequestCard
                  key={swap._id}
                  swap={swap}
                  isOwner={!swap.isRequester}
                  onUpdate={fetchSwapRequests}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SwapRequestsPage;
