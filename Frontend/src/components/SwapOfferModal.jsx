import { useState, useEffect } from "react"
import "./SwapOfferModal.css"

const SwapOfferModal = ({ isOpen, onClose, onSubmit, itemId, ownerId }) => {
  const [userItems, setUserItems] = useState([])
  const [selectedItemId, setSelectedItemId] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchUserItems = async () => {
      if (!isOpen) return

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/items/my-items`, {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch your items")
        }

        const data = await response.json()
        setUserItems(data.items || [])
        setError("")
      } catch (err) {
        console.error("Error fetching user items:", err)
        setError("Could not load your items. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      setLoading(true)
      fetchUserItems()
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedItemId) {
      setError("Please select an item to offer")
      return
    }

    onSubmit({
      requestedItem: itemId,
      offeredItem: selectedItemId,
      ownerId,
    })
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="swap-offer-modal">
        <button className="close-button" onClick={onClose}>
          ×
        </button>

        <h2>Offer an Item for Swap</h2>

        {loading ? (
          <p className="loading-text">Loading your items...</p>
        ) : error ? (
          <div className="error-container">
            <p className="error-text">{error}</p>
            <button
              className="retry-btn"
              onClick={() => {
                setLoading(true)
                fetch(`${import.meta.env.VITE_API_URL}/api/items/my-items`, {
                  credentials: "include",
                })
                  .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch your items")
                    return res.json()
                  })
                  .then((data) => {
                    setUserItems(data.items || [])
                    setError("")
                  })
                  .catch((err) => {
                    console.error("Error fetching user items:", err)
                    setError("Could not load your items. Please try again.")
                  })
                  .finally(() => setLoading(false))
              }}
            >
              Try Again
            </button>
            <button className="add-item-btn" onClick={() => (window.location.href = "/add-item")}>
              Add an Item
            </button>
          </div>
        ) : userItems.length === 0 ? (
          <div className="no-items">
            <p>You don't have any items to offer.</p>
            <button className="add-item-btn" onClick={() => (window.location.href = "/add-item")}>
              Add an Item
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="instruction">Select an item from your collection to offer:</p>

            <div className="items-grid">
              {userItems.map((item) => (
                <div
                  key={item._id}
                  className={`item-card ${selectedItemId === item._id ? "selected" : ""}`}
                  onClick={() => setSelectedItemId(item._id)}
                >
                  <img src={item.imageUrls[0] || "/placeholder.svg"} alt={item.name} className="item-image" />
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <p>
                      {item.condition} • {item.size}
                    </p>
                  </div>
                  <div className="selection-indicator"></div>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="submit-btn" disabled={!selectedItemId}>
                Send Swap Offer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default SwapOfferModal
