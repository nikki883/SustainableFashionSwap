import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import Modal from "../ui/Modal"
import "../../styles/RazorpayPaymentModal.css"

const RazorpayPaymentModal = ({ isOpen, onClose, swap, amount, onPaymentSuccess }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    if (isOpen) {
      loadRazorpayScript()
    }
  }, [isOpen])

  useEffect(() => { 
    if (isOpen && !orderId) {
      createOrder()
    }
  }, [isOpen, orderId])

  const loadRazorpayScript = () => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => {
      setLoading(false)
    }
    script.onerror = () => {
      setError("Failed to load Razorpay. Please try again.")
      setLoading(false)
    }
    document.body.appendChild(script)
  }

  const createOrder = async () => {
    try {
      setLoading(true)
      const response = await axios.post( 
        `${API_URL}/api/payment/create-order`,
        {
          swapId: swap._id,
          amount: amount * 100, // Razorpay expects amount in paise
        },
        { withCredentials: true },
      )

      setOrderId(response.data.orderId)
      setError(null)
    } catch (err) {
      console.error("Error creating payment order:", err)
      setError("Failed to create payment order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = () => {
    if (!window.Razorpay || !orderId) {
      setError("Payment gateway not loaded. Please try again.")
      return
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amount * 100, // in paise
      currency: "INR",
      name: "Fashion Swap",
      description: "Payment for platform delivery",
      order_id: orderId,
      handler: async (response) => {
        try {
          setLoading(true)
          await axios.post(
            `${API_URL}/api/payment/verify`,
            {
              swapId: swap._id,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            },
            { withCredentials: true },
          )

          setSuccess(true)
          toast.success("Your payment has been processed successfully.")
          setTimeout(() => {
            onPaymentSuccess()
          }, 2000)
        } catch (err) {
          console.error("Error verifying payment:", err)
          setError("Payment verification failed. Please contact support.")
        } finally {
          setLoading(false)
        }
      },
      prefill: {
        name: "User Name", // You can pass user's name here
        email: "user@example.com", // You can pass user's email here
        contact: "9999999999", // You can pass user's phone here
      },
      theme: {
        color: "#16a34a",
      },
      modal: {
        ondismiss: () => {
          setError("Payment cancelled. Please try again.")
        },
      },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment for Platform Delivery">
      <div className="payment-modal-container">
        {loading ? (
          <div className="payment-loading">
            <div className="loader">Loading...</div>
            <p className="payment-loading-text">Preparing payment...</p>
          </div>
        ) : error ? (
          <div className="payment-error">
            <svg
              className="error-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p className="error-message">{error}</p>
            <button className="try-again-button" onClick={createOrder}>
              Try Again
            </button>
          </div>
        ) : success ? (
          <div className="payment-success">
            <svg
              className="success-icon"
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
            <p className="success-title">Payment Successful!</p>
            <p className="success-message">Your delivery has been scheduled.</p>
          </div>
        ) : (
          <div>
            <div className="payment-summary">
              <h3 className="summary-title">Payment Summary</h3>
              <div className="summary-row">
                <span>Platform Delivery Fee:</span>
                <span>₹{amount.toFixed(2)}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-total">
                <span>Total Amount:</span>
                <span>₹{amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="payment-actions">
              <button className="pay-button" onClick={handlePayment}>
                Pay ₹{amount.toFixed(2)}
              </button>
              <p className="secured-by">
                Secured by <span className="secured-by-name">Razorpay</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default RazorpayPaymentModal
