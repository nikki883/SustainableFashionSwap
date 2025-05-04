import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import MainLayout from "../components/Layout/MainLayout"
import "../styles/ItemDetail.css"

const ItemDetail = () => {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [swaps, setSwaps] = useState([])
  const [buys, setBuys] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [removalReason, setRemovalReason] = useState("")

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/items/${id}`, {
          withCredentials: true,
        })

        setItem(response.data.item)
        setSwaps(response.data.swaps)
        setBuys(response.data.buys)
      } catch (err) {
        console.error("Error fetching item details:", err)
        setError("Failed to load item details")
      } finally {
        setLoading(false)
      }
    }

    fetchItemDetails()
  }, [id])

  const handleRemoveItem = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/items/${id}`, {
        data: { reason: removalReason },
        withCredentials: true,
      })

      // Update UI to show item is removed
      setItem({ ...item, isRemoved: true, removalReason })
      setShowRemoveModal(false)
    } catch (err) {
      console.error("Error removing item:", err)
      alert("Failed to remove item")
    }
  }

  if (loading) {
    return (
      <MainLayout title="Item Details">
        <div className="loading">Loading item details...</div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout title="Item Details">
        <div className="error">{error}</div>
      </MainLayout>
    )
  }

  return (
    <MainLayout title={`Item: ${item?.name || 'Details'}`}>
      <div className="item-detail-container">
        {item?.isRemoved && (
          <div className="item-removed-banner">
            <p>This item has been removed. Reason: {item.removalReason}</p>
          </div>
        )}
        
        <div className="item-detail-grid">
          <div className="item-images-section">
            <div className="main-image">
              <img 
                src={item?.imageUrls?.[activeImageIndex] || "/placeholder.svg"} 
                alt={item?.name} 
              />
            </div>
            {item?.imageUrls?.length > 1 && (
              <div className="image-thumbnails">
                {item.imageUrls.map((url, index) => (
                  <div 
                    key={index} 
                    className={`thumbnail ${index === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img src={url || "/placeholder.svg"} alt={`${item.name} - view ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="item-info-section">
            <div className="item-header">
              <h2>{item?.name}</h2>
              <div className="item-badges">
                {item?.isSwapped && <span className="badge swapped">Swapped</span>}
                {item?.isSold && <span className="badge sold">Sold</span>}
                <span className="badge category">{item?.category}</span>
              </div>
            </div>
            
            <div className="item-details">
              <div className="detail-row">
                <span className="detail-label">Condition:</span>
                <span className="detail-value">{item?.condition}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Price:</span>
                <span className="detail-value">${item?.price}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Available For:</span>
                <span className="detail-value">{item?.availableFor}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Listed On:</span>
                <span className="detail-value">{new Date(item?.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="item-description">
              <h3>Description</h3>
              <p>{item?.description}</p>
            </div>
            
            <div className="item-owner">
              <h3>Owner</h3>
              <div className="owner-info">
                <div className="owner-avatar">
                  {item?.owner?.profilePicture ? (
                    <img src={item.owner.profilePicture || "/placeholder.svg"} alt={item.owner.name} />
                  ) : (
                    item?.owner?.name?.charAt(0) || "U"
                  )}
                </div>
                <div>
                  <p className="owner-name">{item?.owner?.name}</p>
                  <p className="owner-email">{item?.owner?.email}</p>
                </div>
              </div>
            </div>
            
            {!item?.isRemoved && (
              <div className="item-actions">
                <button className="remove-button" onClick={() => setShowRemoveModal(true)}>
                  Remove Item
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="item-transactions">
          <div className="transactions-tabs">
            <button className="active">Swap Requests ({swaps.length})</button>
            <button>Purchase Requests ({buys.length})</button>
          </div>
          
          <div className="transactions-list">
            {swaps.length > 0 ? (
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Requester</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {swaps.map(swap => (
                    <tr key={swap._id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-small">
                            {swap.requester?.name?.charAt(0) || "U"}
                          </div>
                          <span>{swap.requester?.name}</span>
                        </div>
                      </td>
                      <td>{new Date(swap.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${swap.status}`}>
                          {swap.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-transactions">
                <p>No swap requests for this item</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Remove Item Modal */}
      {showRemoveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Remove Item</h3>
            <p>Are you sure you want to remove this item?</p>
            <div className="form-group">
              <label>Reason for removal</label>
              <textarea 
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
                placeholder="Enter reason for removal"
                required
              ></textarea>
            </div>
            <div className="modal-actions">
              <button className="cancel-button" onClick={() => setShowRemoveModal(false)}>
                Cancel
              </button>
              <button 
                className="remove-button"
                onClick={handleRemoveItem}
                disabled={!removalReason.trim()}
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default ItemDetail