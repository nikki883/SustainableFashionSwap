import { useState } from "react"
import { Bell, Search } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import "../../styles/Header.css"

const Header = ({ title }) => {
  const { admin } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications, setNotifications] = useState([
    // {
    //   id: 1,
    //   message: "New user registered",
    //   time: "5 minutes ago",
    //   read: false,
    // },
    // {
    //   id: 2,
    //   message: "New item reported",
    //   time: "1 hour ago",
    //   read: false,
    // },
    // {
    //   id: 3,
    //   message: "Review flagged for moderation",
    //   time: "3 hours ago",
    //   read: true,
    // },
  ])
  const [showNotifications, setShowNotifications] = useState(false)

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    // Implement search functionality
    console.log("Searching for:", searchQuery)
  }

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="admin-header">
      <div className="header-title">
        <h1>{title}</h1>
      </div>

      <div className="header-actions">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <div className="search-input-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
        </form>

        <div className="notifications-container">
          <button className="notifications-button" onClick={toggleNotifications} aria-label="Notifications">
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h3>Notifications</h3>
                <button className="mark-all-read">Mark all as read</button>
              </div>
              <ul className="notifications-list">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <li
                      key={notification.id}
                      className={`notification-item ${notification.read ? "read" : "unread"}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <p className="notification-message">{notification.message}</p>
                      <span className="notification-time">{notification.time}</span>
                    </li>
                  ))
                ) : (
                  <li className="no-notifications">No notifications</li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="admin-profile">
          <div className="admin-avatar">{admin?.name?.charAt(0) || "A"}</div>
        </div>
      </div>
    </header>
  )
}

export default Header
