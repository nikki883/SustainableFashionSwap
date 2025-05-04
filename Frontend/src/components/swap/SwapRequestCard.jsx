import { useState, useMemo } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import CounterOfferModal from "./CounterOfferModal"
import DeliveryOptionsModal from "./DeliveryOptionsModal"
import SwapCompletionModal from "./SwapCompletionModal"
import "../../styles/SwapRequestCard.css"

const SwapRequestCard = ({ swap, isOwner, onUpdate }) => {
  const [processing, setProcessing] = useState(false)
  const [showCounterOffer, setShowCounterOffer] = useState(false)
  const [showDeliveryOptions, setShowDeliveryOptions] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL

  // Determine if current user is requester or owner
  const isRequester = swap.isRequester

  // Check if current user has confirmed delivery
  const hasUserConfirmed = isRequester ? swap.deliveryMethod?.requesterConfirmed : swap.deliveryMethod?.ownerConfirmed

  // Check if both users have confirmed the same delivery method
  const bothConfirmedSameMethod =
    swap.deliveryMethod?.requesterConfirmed &&
    swap.deliveryMethod?.ownerConfirmed &&
    swap.deliveryMethod?.method !== "undecided"

  // Get delivery method selections for display
  const ownerDeliveryMethod = swap.deliveryMethod?.ownerConfirmed ? swap.deliveryMethod?.method : null
  const requesterDeliveryMethod = swap.deliveryMethod?.requesterConfirmed ? swap.deliveryMethod?.method : null

  // Format delivery method for display
  const formatDeliveryMethod = (method) => {
    if (!method) return "Not selected"
    return method === "self" ? "Self Delivery" : "Platform Delivery"
  }

  // Memoize the status badge to prevent unnecessary re-renders
  const statusBadge = useMemo(() => {
    switch (swap.status) {
      case "pending":
        return <span className="badge badge-pending">Pending</span>
      case "approved":
        return <span className="badge badge-approved">Approved</span>
      case "declined":
        return <span className="badge badge-declined">Declined</span>
      case "countered":
        return <span className="badge badge-countered">Counter Offered</span>
      case "completed":
        return <span className="badge badge-completed">Completed</span>
      default:
        return <span className="badge">{swap.status}</span>
    }
  }, [swap.status])

  // Memoize the action buttons based on swap status and user role
  const actionButtons = useMemo(() => {
    if (swap.status === "pending" && isOwner) {
      return (
        <>
          <button
            className="action-button accept-button"
            onClick={() => handleUpdateStatus("approved")}
            disabled={processing}
          >
            <svg
              className="action-button-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Accept
          </button>

          <button
            className="action-button decline-button"
            onClick={() => handleUpdateStatus("declined")}
            disabled={processing}
          >
            <svg
              className="action-button-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Decline
          </button>

          <button
            className="action-button counter-button"
            onClick={() => setShowCounterOffer(true)}
            disabled={processing}
          >
            <svg
              className="action-button-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="1 4 1 10 7 10"></polyline>
              <polyline points="23 20 23 14 17 14"></polyline>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
            Counter Offer
          </button>
        </>
      )
    }

    if (swap.status === "approved") {
      // If both users confirmed the same delivery method, show "Mark as Completed" button
      if (bothConfirmedSameMethod) {
        return (
          <button className="action-button complete-button" onClick={() => setShowCompletionModal(true)}>
            <svg
              className="action-button-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Mark as Completed
          </button>
        )
      }

      // If current user hasn't confirmed yet, show "Select Delivery" button
      if (!hasUserConfirmed) {
        return (
          <button className="action-button delivery-button" onClick={() => setShowDeliveryOptions(true)}>
            Select Delivery
          </button>
        )
      }

      // If current user has confirmed but waiting for other user
      if (hasUserConfirmed) {
        return <div className="waiting-confirmation">Waiting for other user to confirm delivery method...</div>
      }
    }

    if (swap.status === "countered" && !isOwner) {
      return (
        <>
          <button
            className="action-button accept-button"
            onClick={() => handleUpdateStatus("approved")}
            disabled={processing}
          >
            <svg
              className="action-button-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Accept Counter
          </button>

          <button
            className="action-button decline-button"
            onClick={() => handleUpdateStatus("declined")}
            disabled={processing}
          >
            <svg
              className="action-button-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Decline
          </button>
        </>
      )
    }

    return null
  }, [swap.status, swap.deliveryMethod, isOwner, processing, hasUserConfirmed, bothConfirmedSameMethod])

  const handleUpdateStatus = async (status) => {
    try {
      setProcessing(true)
      await axios.put(
        `${API_URL}/api/swaps/update`,
        {
          swapId: swap._id,
          status,
        },
        { withCredentials: true },
      )

      toast.success(`You have ${status} the swap request.`)
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error(`Error ${status} swap:`, err)
      toast.error(err.response?.data?.message || `Failed to ${status} the swap. Please try again.`)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="swap-card">
      <div className="swap-items-container">
        <div className="swap-item">
          <p className="swap-item-label">Requested Item</p>
          <div className="swap-item-image">
            <img
              src={swap.requestedItem?.imageUrls?.[0] || "/placeholder.jpg"}
              alt={swap.requestedItem?.name || "Requested Item"}
              loading="lazy" // Add lazy loading for images
            />
          </div>
          <h3 className="swap-item-name">{swap.requestedItem?.name}</h3>
          <p className="swap-item-owner">Owner: {swap.owner?.name || "Unknown"}</p>
        </div>

        <div className="swap-item">
          <p className="swap-item-label">Offered Item</p>
          <div className="swap-item-image">
            <img
              src={swap.offeredItem?.imageUrls?.[0] || "/placeholder.jpg"}
              alt={swap.offeredItem?.name || "Offered Item"}
              loading="lazy"
            />
          </div>
          <h3 className="swap-item-name">{swap.offeredItem?.name}</h3>
          <p className="swap-item-owner">Requester: {swap.requester?.name || "Unknown"}</p>
        </div>
      </div>

      <div className="swap-status-container">
        <div className="swap-status">
          <span className="swap-status-label">Status:</span>
          {statusBadge}
        </div>

        <p className="swap-date">{new Date(swap.createdAt).toLocaleDateString()}</p>
      </div>

      {/* Delivery Method Selection Information - Compact Version */}
      {swap.status === "approved" && (
        <div className="delivery-selections">
          <div className="delivery-selections-title">Delivery Preferences</div>
          <div className="delivery-selection-item">
            <span className="delivery-selection-user">Owner:</span>
            <span className={`delivery-selection-method ${ownerDeliveryMethod ? "selected" : "not-selected"}`}>
              {formatDeliveryMethod(ownerDeliveryMethod)}
            </span>
          </div>
          <div className="delivery-selection-item">
            <span className="delivery-selection-user">Requester:</span>
            <span className={`delivery-selection-method ${requesterDeliveryMethod ? "selected" : "not-selected"}`}>
              {formatDeliveryMethod(requesterDeliveryMethod)}
            </span>
          </div>
          {ownerDeliveryMethod && requesterDeliveryMethod && ownerDeliveryMethod !== requesterDeliveryMethod && (
            <div className="delivery-mismatch-warning">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="warning-icon"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>Delivery methods don't match. Both users need to select the same method.</span>
            </div>
          )}
        </div>
      )}

      <div className="swap-actions">
        {actionButtons}

        {swap?.deliveryMethod?.method && swap.deliveryMethod.method !== "undecided" && bothConfirmedSameMethod && (
          <div className="delivery-info">
            <p>
              Delivery Method:{" "}
              <span className="delivery-method">
                {swap.deliveryMethod.method === "self" ? "Self Delivery" : "Platform Delivery"}
              </span>
              {swap.deliveryMethod.method === "platform" && <span className="delivery-fee">(Fee: ₹50)</span>}
            </p>
          </div>
        )}
      </div>

      {showCounterOffer && (
        <CounterOfferModal
          isOpen={showCounterOffer}
          onClose={() => setShowCounterOffer(false)}
          swap={swap}
          onCounterOfferSubmit={() => {
            setShowCounterOffer(false)
            if (onUpdate) onUpdate()
          }}
        />
      )}

      {showDeliveryOptions && (
        <DeliveryOptionsModal
          isOpen={showDeliveryOptions}
          onClose={() => setShowDeliveryOptions(false)}
          swap={swap}
          onDeliverySelected={() => {
            setShowDeliveryOptions(false)
            if (onUpdate) onUpdate()
          }}
        />
      )}

      {showCompletionModal && (
        <SwapCompletionModal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          swap={swap}
          onComplete={() => {
            setShowCompletionModal(false)
            if (onUpdate) onUpdate()
          }}
        />
      )}
    </div>
  )
}

export default SwapRequestCard
