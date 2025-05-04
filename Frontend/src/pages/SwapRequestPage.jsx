import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SwapRequestCard from '../components/swap/SwapRequestCard';
import '../styles/SwapRequestsPage.css';

const SwapRequestsPage = () => {
  const [swapRequests, setSwapRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchSwapRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/swaps/requests`,
        { withCredentials: true }
      );

      setSwapRequests(response.data.swaps || []); // Ensure it's always an array
    } catch (err) {
      console.error('Error in fetchSwapRequests:', err);
      setError('Failed to load swap requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwapRequests();
  }, []);

  // Ensure `swapRequests` is an array before filtering
  const receivedRequests = (swapRequests || []).filter((swap) => !swap.isRequester);
  const sentRequests = (swapRequests || []).filter((swap) => swap.isRequester);
  const pendingRequests = (swapRequests || []).filter((swap) => swap.status === 'pending');
  const approvedRequests = (swapRequests || []).filter((swap) => swap.status === 'approved');
  const completedRequests = (swapRequests || []).filter((swap) => swap.status === 'completed');

  const getFilteredRequests = () => {
    switch (activeTab) {
      case 'received':
        return receivedRequests;
      case 'sent':
        return sentRequests;
      case 'pending':
        return pendingRequests;
      case 'approved':
        return approvedRequests;
      case 'completed':
        return completedRequests;
      default:
        return swapRequests;
    }
  };

  const filteredRequests = getFilteredRequests();

  return (
    <div className="container">
      <h1 className="page-title">Swap Requests</h1>

      {loading ? (
        <div className="loading-container">
          <div className="loader">Loading...</div>
        </div>
      ) : error ? (
        <div className="error-alert">
          <svg className="error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p className="error-message">{error}</p>
          <button className="try-again-button" onClick={fetchSwapRequests}>
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="tabs-container">
            <div className="tabs-list">
              <div className={`tab ${activeTab === 'all' ? 'tab-active' : ''}`} onClick={() => setActiveTab('all')}>
                All ({swapRequests.length})
              </div>
              <div className={`tab ${activeTab === 'received' ? 'tab-active' : ''}`} onClick={() => setActiveTab('received')}>
                Received ({receivedRequests.length})
              </div>
              <div className={`tab ${activeTab === 'sent' ? 'tab-active' : ''}`} onClick={() => setActiveTab('sent')}>
                Sent ({sentRequests.length})
              </div>
              <div className={`tab ${activeTab === 'pending' ? 'tab-active' : ''}`} onClick={() => setActiveTab('pending')}>
                Pending ({pendingRequests.length})
              </div>
              <div className={`tab ${activeTab === 'approved' ? 'tab-active' : ''}`} onClick={() => setActiveTab('approved')}>
                Approved ({approvedRequests.length})
              </div>
              <div className={`tab ${activeTab === 'completed' ? 'tab-active' : ''}`} onClick={() => setActiveTab('completed')}>
                Completed ({completedRequests.length})
              </div>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="empty-state">
              <p>No {activeTab !== 'all' ? activeTab : ''} swap requests found.</p>
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
