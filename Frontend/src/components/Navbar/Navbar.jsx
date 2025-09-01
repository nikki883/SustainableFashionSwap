import { useState, useContext } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import AuthContext from "../../context/AuthContext"
import "./Navbar.css"

function Navbar() {
  const { logout, user: currentUser } = useContext(AuthContext)
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/items?search=${searchQuery}`)
      setMobileMenuOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
    setProfileMenuOpen(false)
    setMobileMenuOpen(false)
  }

  const getInitials = (name) => {
    if (!name) return "U" // fallback
    const parts = name.trim().split(" ")
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
    if (profileMenuOpen) setProfileMenuOpen(false)
  }

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen)
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/" className="logo-link">
            FashionSwap
          </Link>
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <span className="sr-only">Menu</span>
            <div className={`hamburger ${mobileMenuOpen ? "open" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>

        {/* Search Bar - Desktop */}
        {/* <form className="search-form desktop-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search items"
          />
          <button type="submit" className="search-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="search-icon"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form> */}

        {/* Navigation Links - Desktop */}
        <nav className={`navbar-nav ${mobileMenuOpen ? "mobile-open" : ""}`}>
          {/* Search Bar - Mobile */}
          <form className="search-form mobile-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search items"
            />
            <button type="submit" className="search-button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="search-icon"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>

          <ul className="nav-links">
            <li>
              <Link to="/" className={isActive("/") ? "active" : ""} onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/items" className={isActive("/items") ? "active" : ""} onClick={() => setMobileMenuOpen(false)}>
                Browse Items
              </Link>
            </li>
            {currentUser ? (
              <>
                <li>
                  <Link
                    to="/add-item"
                    className={isActive("/add-item") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Add Item
                  </Link>
                </li>
                {/* <li>
                  <Link
                    to="/swap-history"
                    className={isActive("/swap-history") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Swap History
                  </Link>
                </li> */}
                <li>
                  <Link
                    to="/swap-requests"
                    className={isActive("/swap-requests") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Swap Requests
                  </Link>
                </li>
                <li className="mobile-only">
                  <Link
                    to="/chat"
                    className={isActive("/chat") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Messages
                  </Link>
                </li>
                <li className="mobile-only">
                  <Link
                    to={`/users/${currentUser._id}`}
                    className={isActive(`/users/${currentUser._id}`) ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                </li>
                <li className="mobile-only">
                  <button onClick={handleLogout} className="logout-link">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="mobile-only">
                  <Link
                    to="/login"
                    className={isActive("/login") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                </li>
                <li className="mobile-only">
                  <Link
                    to="/register"
                    className={isActive("/register") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* User Actions */}
        <div className="user-actions">
          {currentUser ? (
            <>
              {/* Chat Icon */}
              <Link to="/chat" className="icon-button chat-icon" title="Messages">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                {/* {unreadCount > 0 && <span className="chat-badge">{unreadCount}</span>} */}
              </Link>

              {/* Profile Menu */}
              <div className="profile-menu-container">
                <button
                  className="profile-button"
                  onClick={toggleProfileMenu}
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="true"
                >
                  {currentUser?.profilePic? (
                    <img
                      src={currentUser?.profilePic || "/placeholder.svg"}
                      alt="Profile"
                      className="profile-image"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/32x32?text=User"
                      }}
                    />
                  ) : (
                    <div className="profile-initials">{getInitials(currentUser.name)}</div>
                  )}
                </button>

                {profileMenuOpen && (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">My Account</div>
                    <Link
                      to={`/users/${currentUser._id}`}
                      className="dropdown-item"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="dropdown-icon"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      Profile
                    </Link>
                    <button onClick={handleLogout} className="dropdown-item logout-item">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="dropdown-icon"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
    
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-button">
                Login
              </Link>
              <Link to="/register" className="register-button">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
