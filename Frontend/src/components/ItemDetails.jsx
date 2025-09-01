import axios from "axios"
import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState, useContext } from "react"
import AuthContext from "../context/AuthContext"
import SwapOfferModal from "./SwapOfferModal"
import { Share2, MessageCircle } from "lucide-react"
import "./ItemDetails.css"

const ItemDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [similarItems, setSimilarItems] = useState([])
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const { user } = useContext(AuthContext)

  // Fetch item details
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/items/${id}`)
        const data = await res.json()
        setItem(data)
      } catch (err) {
        console.error("Error fetching item details:", err)
      }
    }

    fetchItem()
  }, [id])

  // Fetch similar items
  useEffect(() => {
    const fetchSimilarItems = async () => {
      if (!item) return

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/items/${item._id}/similar`)
        const data = await res.json()
        setSimilarItems(data)
      } catch (err) {
        console.error("Error fetching similar items:", err)
      }
    }

    fetchSimilarItems()
  }, [item])

  const handleSendSwapRequest = () => {
    setIsSwapModalOpen(true)
  }

  const handleSwapOfferSubmit = async (swapData) => {
    setIsProcessing(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/swaps/request`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(swapData), 
      })

      const data = await response.json() 

      if (!response.ok) throw new Error(data.error || "Failed to send request")

      alert("Swap offer sent successfully!")
      setIsSwapModalOpen(false)
    } catch (error) {
      console.error("Error sending swap offer:", error)
      alert(error.message || "Could not send swap offer.")
    } finally {
      setIsProcessing(false)
    }
  }


  const handleShare = () => {
    setShareModalOpen(true)
  }

  const handleStartChat = async () => {
    if (!user) {
      alert("Please log in to chat with the seller")
      navigate("/login")
      return
    }

    if (!item || !item.owner || !item._id) {
      alert("Item details not loaded")
      return
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/conversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          participantId: item.owner._id,
          itemId: item._id,
          initialMessage: `Hi, I'm interested in your item: ${item.name}`,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to start conversation: ${errorText}`)
      }

      const data = await response.json()
     navigate(`/chat/${data.conversationId}`);
      //  navigate("/chat")
    } catch (err) {
      console.error("Error starting chat:", err)
      alert("Could not start chat. Please try again.")
    }
  }

  const copyToClipboard = () => {
    const url = window.location.href
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert("Link copied to clipboard!")
        setShareModalOpen(false)
      })
      .catch((err) => {
        console.error("Failed to copy: ", err)
        alert("Failed to copy link")
      })
  }

  if (!item) return <p>Loading...</p>

  return (
    <div className="item-details">
      {/* Main item section with images and details */}
      <div className="item-detail-main">
        {/* Left side - Sticky images container */}
        <div className="item-images-container">
          {item.imageUrls && item.imageUrls.length > 0 && (
            <div className="item-images">
              {item.imageUrls.map((url, index) => (
                <img key={index} src={url || "/placeholder.svg"} alt={`${item.name} - Image ${index + 1}`} />
              ))}
            </div>
          )}
        </div>

        {/* Right side - Item details */}
        <div className="item-details-container">
          {/* Basic info section */}
          <div className="item-basic-info">
            <div className="item-title-share">
              <h2>{item.name}</h2>
              <button className="share-button" onClick={handleShare} title="Share this item">
                <Share2 size={20} />
              </button>
            </div>
            <p className="item-price">{item.price}</p>
            <div className="item-quick-info">
              {item.brand && <span>Brand: {item.brand}</span>}
              {item.size && <span>Size: {item.size}</span>}
              {item.condition && <span>Condition: {item.condition}</span>}
            </div>
          </div>

          {/* Action buttons */}
          {user && item.owner && user._id !== item.owner._id && (
            <div className="item-actions">
              {console.log(user)}
              {item.availableFor.includes("Swap") || item.availableFor.includes("Both")
? (
                <button className="swap-btn" onClick={handleSendSwapRequest} disabled={isProcessing}>
                  Request Swap
                </button>
              ) : null}

              {/* Chat button */}
              <button className="chat-with-seller" onClick={handleStartChat}>
                <MessageCircle size={20} />
                Chat with Seller
              </button>
            </div>
          )}

          {/* Detailed info section */}
          <div className="item-detailed-info">
            <h3>Item Details</h3>
            <div className="item-description">
              <p>{item.description}</p>
            </div>
            <div className="item-specs">
              {item.color && (
                <div className="spec-item">
                  <span className="spec-label">Color:</span>
                  <span className="spec-value">{item.color}</span>
                </div>
              )}
              {item.size && (
                <div className="spec-item">
                  <span className="spec-label">Size:</span>
                  <span className="spec-value">{item.size}</span>
                </div>
              )}
              {item.condition && (
                <div className="spec-item">
                  <span className="spec-label">Condition:</span>
                  <span className="spec-value">{item.condition}</span>
                </div>
              )}
              {item.brand && (
                <div className="spec-item">
                  <span className="spec-label">Brand:</span>
                  <span className="spec-value">{item.brand}</span>
                </div>
              )}
              <div className="spec-item">
                <span className="spec-label">Available For:</span>
                <span className="spec-value">{item.availableFor}</span>
              </div>
            </div>
          </div>

          {/* Owner profile section */}
          {user && item.owner && user._id !== item.owner._id && (
            <div className="owner-section">
              <h3>About the Seller</h3>
              <div className="owner-profile-box">
                <img src={item.owner.profilePic || "/default-avatar.png"} alt={item.owner.name} />
                <div style={{ flex: 1 }}>
                  <h4>{item.owner.name}</h4>
                  <p>{item.owner.location || "Location not specified"}</p>
                  <button className="view-profile-btn" onClick={() => navigate(`/users/${item.owner._id}`)}>
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Similar Items Section */}
      <div className="similar-items">
        <h3>Similar Items</h3>
        <div className="similar-grid">
          {similarItems.length > 0 ? (
            similarItems.map((similar) => (
              <div className="similar-card" key={similar._id} onClick={() => navigate(`/items/${similar._id}`)}>
                <img src={similar.imageUrls?.[0] || "/placeholder.svg"} alt={similar.name} />
                <div className="similar-info">
                  <p className="similar-name">{similar.name}</p>
                  <p className="similar-price">{similar.price}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No similar items found.</p>
          )}
        </div>
      </div>

      {/* Swap Offer Modal */}
      <SwapOfferModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        onSubmit={handleSwapOfferSubmit}
        itemId={item._id}
        ownerId={item.owner._id}
      />

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="modal-overlay">
          <div className="share-modal">
            <button className="close-button" onClick={() => setShareModalOpen(false)}>
              ×
            </button>
            <h3>Share This Item</h3>
            <div className="share-options">
              <button className="share-option" onClick={copyToClipboard}>
                Copy Link
              </button>
              <button
                className="share-option"
                onClick={() => {
                  window.open(`https://wa.me/?text=Check out this item: ${item.name} ${window.location.href}`, "_blank")
                  setShareModalOpen(false)
                }}
              >
                WhatsApp
              </button>
              <button 
                className="share-option"
                onClick={() => {
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                    "_blank",
                  )
                  setShareModalOpen(false)
                }}
              >
                Facebook
              </button>
              <button
                className="share-option"
                onClick={() => {
                  window.open(
                    `https://twitter.com/intent/tweet?text=Check out this item: ${item.name}&url=${encodeURIComponent(window.location.href)}`,
                    "_blank",
                  )
                  setShareModalOpen(false)
                }}
              >
                Twitter
              </button>
            </div>
          </div>
        </div>
      )}
     
    </div>
  )
}

export default ItemDetails