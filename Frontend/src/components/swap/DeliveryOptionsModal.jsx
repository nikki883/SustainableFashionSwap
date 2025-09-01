import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import Modal from "../ui/Modal.jsx"
import RazorpayPaymentModal from "../payment/RazorpayPaymentModal"
import "../../styles/DeliveryOptionsModal.css"

const DeliveryOptionsModal = ({ isOpen, onClose, swap, onDeliverySelected }) => {
  const [deliveryMethod, setDeliveryMethod] = useState("self")
  const [submitting, setSubmitting] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [error, setError] = useState("")
  
  // Platform delivery fee
  const deliveryFee = 50
  const apiUrl = import.meta.env.VITE_API_URL 

  useEffect(() => {
    if (isOpen) {
      setError("")
      // Set initial delivery method based on existing selection if any
      if (swap.deliveryMethod && swap.deliveryMethod.method !== "undecided") {
        setDeliveryMethod(swap.deliveryMethod.method)
      }
    }
  }, [isOpen, swap.deliveryMethod])

  const handleSubmit = async () => {
    try {
      if (deliveryMethod === "platform") {
        // For platform delivery, show payment modal
        setShowPaymentModal(true)
      } else {
        // For self delivery, update directly
        await updateDeliveryDetails()
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err)
      setError("An unexpected error occurred. Please try again.")
      toast.error("An unexpected error occurred. Please try again.")
    }
  }

  const updateDeliveryDetails = async () => {
    try {
      setSubmitting(true)
      setError("")


      const response = await axios.put(
        `${apiUrl}/api/swaps/delivery`,
        {
          swapId: swap._id,
          method: deliveryMethod,
        },
        { withCredentials: true },
      )

      // Only send notification if this is the first time setting delivery method
      // or if the delivery method has changed
      const isFirstTimeOrChanged =
        !swap.deliveryMethod ||
        swap.deliveryMethod.method === "undecided" ||
        swap.deliveryMethod.method !== deliveryMethod

      if (isFirstTimeOrChanged) {
        try {
          await axios.post(
            `${apiUrl}/api/messages/conversation`,
            {
              participantId: swap.isRequester ? swap.owner._id : swap.requester._id,
              itemId: swap.requestedItem._id,
              initialMessage: `Swap delivery method selected: ${
                deliveryMethod === "self" ? "Self Delivery" : "Platform Delivery"
              }. ${deliveryMethod === "platform" ? "Delivery fee: ₹50" : "Please coordinate with the other user for exchange."}`,
            },
            { withCredentials: true },
          )
        } catch (chatErr) {
          console.error("Error sending chat notification:", chatErr)
          // Continue even if chat notification fails
        }
      }

      toast.success(`You have selected ${deliveryMethod === "self" ? "self delivery" : "platform delivery"}.`)
      onDeliverySelected()
    } catch (err) {
      console.error("Error updating delivery method:", err)
      setError(err.response?.data?.message || "Failed to update delivery method. Please try again.")
      toast.error(err.response?.data?.message || "Failed to update delivery method. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handlePaymentSuccess = async () => {
    await updateDeliveryDetails()
    setShowPaymentModal(false)
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Select Delivery Method">
        <div className="delivery-modal-container">
          <p className="delivery-description">Choose how you want to handle the delivery of the swapped items:</p>

          {error && <div className="delivery-error">{error}</div>}

          <div className="delivery-options">
            <div
              className={`delivery-option ${deliveryMethod === "self" ? "delivery-option-selected" : ""}`}
              onClick={() => setDeliveryMethod("self")}
            >
              <input
                type="radio"
                id="self-delivery"
                name="delivery-method"
                className="delivery-option-radio"
                checked={deliveryMethod === "self"}
                onChange={() => setDeliveryMethod("self")}
              />
              <div className="delivery-option-content">
                <h4 className="delivery-option-title">Self Delivery</h4>
                <p className="delivery-option-description">
                  You and the other user will arrange the exchange yourselves. No additional fees, but you'll need to
                  coordinate the meetup.
                </p>
              </div>
            </div>

            <div
              className={`delivery-option ${deliveryMethod === "platform" ? "delivery-option-selected" : ""}`}
              onClick={() => setDeliveryMethod("platform")}
            >
              <input
                type="radio"
                id="platform-delivery"
                name="delivery-method"
                className="delivery-option-radio"
                checked={deliveryMethod === "platform"}
                onChange={() => setDeliveryMethod("platform")}
              />
              <div className="delivery-option-content">
                <h4 className="delivery-option-title">Platform Delivery</h4>
                <p className="delivery-option-description">
                  We'll handle the pickup and delivery of both items.
                  <span className="delivery-fee">Delivery Fee: ₹{deliveryFee}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="delivery-actions">
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button className="confirm-button" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Processing..." : "Confirm Selection"}
            </button>
          </div>
        </div>
      </Modal>

      {showPaymentModal && (
        <RazorpayPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          swap={swap}
          amount={deliveryFee}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  )
}

export default DeliveryOptionsModal
