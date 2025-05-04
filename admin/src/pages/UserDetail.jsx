import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import MainLayout from "../components/Layout/MainLayout"
import "../styles/UserDetail.css"

const UserDetail = () => {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [suspensionReason, setSuspensionReason] = useState("")

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}`, {
          withCredentials: true,
        })

        setUser(response.data.user)
        setStats(response.data.stats)
      } catch (err) {
        console.error("Error fetching user details:", err)
        setError("Failed to load user details")
      } finally {
        setLoading(false)
      }
    }

    fetchUserDetails()
  }, [id])

  const handleToggleStatus = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${id}/status`,
        {
          isSuspended: !user.isSuspended,
          reason: suspensionReason,
        },
        { withCredentials: true }
      )

      setUser({ ...user, isSuspended: !user.isSuspended })
      setShowSuspendModal(false)
      setSuspensionReason("")
    } catch (err) {
      console.error("Error toggling user status:", err)
      alert("Failed to update user status")
    }
  }

  if (loading) {
    return (
      <MainLayout title="User Details">
        <div className="loading">Loading user details...</div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout title="User Details">
        <div className="error">{error}</div>
      </MainLayout>
    )
  }

  return (
    <MainLayout title={`User: ${user?.name || 'Details'}`}>
      <div className="user-detail-container">
        <div className="user-profile-section">
          <div className="user-header">
            <div className="user-avatar-large">
              {user?.profilePicture ? (
                <img src={user.profilePicture || "/placeholder.svg"} alt={user.name} />
              ) : (
                user?.name?.charAt(0) || "U"
              )}
            </div>
            <div className="user-info">
              <h2>{user?.name}</h2>
              <p className="user-email">{user?.email}</p>
              <p className="user-location">{user?.location || "No location specified"}</p>
              <p className="user-joined">Joined: {new Date(user?.createdAt).toLocaleDateString()}</p>
              <div className="user-status">
                <span className={`status-badge ${user?.isSuspended ? "suspended" : "active"}`}>
                  {user?.isSuspended ? "Suspended" : "Active"}
                </span>
              </div>
            </div>
            <div className="user-actions">
              <button 
                className={user?.isSuspended ? "unsuspend-button" : "suspend-button"}
                onClick={() => setShowSuspendModal(true)}
              >
                {user?.isSuspended ? "Unsuspend User" : "Suspend User"}
              </button>
            </div>
          </div>

          <div className="user-stats-grid">
            <div className="stat-card">
              <h3>Items</h3>
              <p className="stat-value">{stats?.itemsCount || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Swaps</h3>
              <p className="stat-value">{stats?.swapsCount || 0}</p>
              <p className="stat-label">{stats?.completedSwapsCount || 0} completed</p>
            </div>
            <div className="stat-card">
              <h3>Purchases</h3>
              <p className="stat-value">{stats?.buyCount || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Sales</h3>
              <p className="stat-value">{stats?.sellCount || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Reviews</h3>
              <p className="stat-value">{stats?.reviewsCount || 0}</p>
              <p className="stat-label">Avg Rating: {stats?.avgRating || 0}/5</p>
            </div>
          </div>
        </div>

        {/* User Activity Section - Can be expanded with tabs for items, swaps, etc. */}
        <div className="user-activity-section">
          <h3>Recent Activity</h3>
          <div className="activity-tabs">
            <button className="active">All</button>
            <button>Items</button>
            <button>Swaps</button>
            <button>Purchases</button>
            <button>Reviews</button>
          </div>
          
          <div className="activity-list">
            {/* This would be populated with actual activity data */}
            <div className="no-activity">
              <p>No recent activity to display</p>
            </div>
          </div>
        </div>
      </div>

      {/* Suspension Modal */}
      {showSuspendModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{user?.isSuspended ? "Unsuspend User" : "Suspend User"}</h3>
            {!user?.isSuspended && (
              <div className="form-group">
                <label>Reason for suspension</label>
                <textarea 
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="Enter reason for suspension"
                  required
                ></textarea>
              </div>
            )}
            <div className="modal-actions">
              <button className="cancel-button" onClick={() => setShowSuspendModal(false)}>
                Cancel
              </button>
              <button 
                className={user?.isSuspended ? "unsuspend-button" : "suspend-button"}
                onClick={handleToggleStatus}
                disabled={!user?.isSuspended && !suspensionReason.trim()}
              >
                {user?.isSuspended ? "Confirm Unsuspend" : "Confirm Suspend"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default UserDetail