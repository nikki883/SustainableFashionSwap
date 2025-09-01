import { useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import Modal from "../ui/Modal"
import SwapReviewModal from "./SwapReviewModal"
import "../../styles/SwapCompletionModal.css"

const SwapCompletionModal = ({ isOpen, onClose, swap, onComplete }) => {
  const [submitting, setSubmitting] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [completed, setCompleted] = useState(false)

  // Determine if current user is the requester or owner
  const isRequester = swap.isRequester
  const partnerToReview = isRequester ? swap.owner : swap.requester

  const handleComplete = async () => {
    try {
      setSubmitting(true) 

      // Update the API endpoint to mark user's confirmation
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/swaps/confirm-completion`,
        {
          swapId: swap._id,
          userType: isRequester ? "requester" : "owner",
        },
        { withCredentials: true },
      )

     // Check if both users have confirmed completion
      const bothConfirmed = isRequester
        ? swap.ownerConfirmed // Current user is requester, check if owner already confirmed
        : swap.requesterConfirmed // Current user is owner, check if requester already confirmed

      // Send notification to chat
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/notification`,
        {
          senderId: isRequester ? swap.requester._id : swap.owner._id,
          receiverId: isRequester ? swap.owner._id : swap.requester._id,
          text: bothConfirmed
            ? `🎉 Swap completed successfully! Thank you for using Fashion Swap.`
            : `${isRequester ? swap.requester.name : swap.owner.name} has marked the swap as completed. Please confirm when you've received your item.`,
          itemId: swap.requestedItem._id,
        },
        { withCredentials: true },
      )

      if (bothConfirmed) {

        toast.success("The swap has been completed successfully!")
      } else {
        toast.success("You have marked the swap as completed. Waiting for the other user to confirm.")
      }

      setCompleted(true)
      // Show review modal after completion
      setShowReviewModal(true)
    } catch (err) {
      console.error("Error completing swap:", err)
      toast.error(err.response?.data?.message || "Failed to complete the swap. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleReviewSubmit = () => {
    setShowReviewModal(false)
    onComplete()
  }

  return (
    <>
      <Modal isOpen={isOpen && !showReviewModal} onClose={onClose} title="Complete Swap">
        <div className="completion-modal-container">
          <svg
            className="completion-icon"
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

          <p className="completion-title">Confirm Swap Completion</p>

          <p className="completion-description">
            By confirming, you acknowledge that you have received the item and the swap is complete.
            {!swap.requesterConfirmed && !swap.ownerConfirmed
              ? " Both you and your swap partner must confirm completion."
              : isRequester && !swap.requesterConfirmed
                ? " The item owner has already confirmed completion."
                : !isRequester && !swap.ownerConfirmed
                  ? " The requester has already confirmed completion."
                  : " This action cannot be undone."}
          </p>

          <div className="completion-actions">
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button className="confirm-button" onClick={handleComplete} disabled={submitting}>
              {submitting ? "Processing..." : "Confirm Completion"}
            </button>
          </div>
        </div>
      </Modal>

      {showReviewModal && (
        <SwapReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false)
            onComplete()
          }}
          swap={swap}
          partnerToReview={partnerToReview}
          onReviewSubmit={handleReviewSubmit}
        />
      )}
    </>
  )
}

export default SwapCompletionModal
