import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Modal from '../ui/Modal';
import '../../styles/CounterOfferModal.css';

const CounterOfferModal = ({ isOpen, onClose, swap, onCounterOfferSubmit }) => {
  const [requesterItems, setRequesterItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchRequesterItems = async () => {
      if (!isOpen || !swap.requester?._id) return;

      try {
        setLoading(true);
        // Fetch the requester's items
        const response = await axios.get(
          `${API_URL}/api/users/${swap.requester._id}/items`,
          { withCredentials: true }
        );
        
        // Filter out the item that's already being offered
        const items = response.data.items.filter(
          item => item._id !== swap.offeredItem._id
        );
        
        setRequesterItems(items);
        setError(null);
      } catch (err) {
        console.error('Error fetching requester items:', err);
        setError('Could not load requester items. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchRequesterItems();
    }
  }, [isOpen, swap.requester?._id, swap.offeredItem._id, API_URL]);

  const handleSubmit = async () => {
    if (!selectedItemId) {
      setError('Please select an item for counter offer');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(
        `${API_URL}/api/swaps/counter-offer`,
        {
          swapId: swap._id,
          counterItemId: selectedItemId,
        },
        { withCredentials: true }
      );

      toast.success('Counter offer sent!');
      onCounterOfferSubmit();
    } catch (err) {
      console.error('Error sending counter offer:', err);
      setError(err.response?.data?.message || 'Failed to send counter offer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Counter Offer">
      <div className="counter-offer-container">
        <p className="counter-offer-description">
          Select an item from the requester's collection that you would prefer to swap with:
        </p>

        {loading ? (
          <div className="counter-offer-loading">
            <div className="spinner"></div>
            <p>Loading requester's items...</p>
          </div>
        ) : error ? (
          <div className="counter-offer-error">
            <svg className="error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>{error}</p>
            <button
              className="try-again-button"
              onClick={() => {
                setLoading(true);
                axios.get(
                  `${API_URL}/api/users/${swap.requester._id}/items`,
                  { withCredentials: true }
                )
                  .then(response => {
                    const items = response.data.items.filter(
                      item => item._id !== swap.offeredItem._id
                    );
                    setRequesterItems(items);
                    setError(null);
                  })
                  .catch(err => {
                    console.error('Error fetching requester items:', err);
                    setError('Could not load requester items. Please try again.');
                  })
                  .finally(() => setLoading(false));
              }}
            >
              Try Again
            </button>
          </div>
        ) : requesterItems.length === 0 ? (
          <div className="counter-offer-empty">
            <p>The requester doesn't have any other items available.</p>
          </div>
        ) : (
          <div className="counter-offer-items">
            {requesterItems.map((item) => (
              <div
                key={item._id}
                className={`counter-offer-item ${selectedItemId === item._id ? 'counter-offer-item-selected' : ''}`}
                onClick={() => setSelectedItemId(item._id)}
              >
                <div className="counter-offer-item-image">
                  <img
                    src={item.imageUrls[0] || "/placeholder.jpg"}
                    alt={item.name}
                  />
                </div>
                <div className="counter-offer-item-details">
                  <h3 className="counter-offer-item-name">{item.name}</h3>
                  <p className="counter-offer-item-meta">
                    {item.condition} • {item.size}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="counter-offer-actions">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={!selectedItemId || submitting || loading}
          >
            {submitting ? 'Sending...' : 'Send Counter Offer'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CounterOfferModal;