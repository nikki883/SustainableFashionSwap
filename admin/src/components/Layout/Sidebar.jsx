import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { Users, ShoppingBag, Star, BarChart2, Settings, LogOut, Menu, X } from "lucide-react"
import "../../styles/Sidebar.css"

const Sidebar = () => {
  const { admin, logout } = useAuth()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const handleLogout = () => {
    logout()
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <BarChart2 size={20} />,
    },
    {
      name: "Users",
      path: "/users",
      icon: <Users size={20} />,
    },
    {
      name: "Items",
      path: "/items",
      icon: <ShoppingBag size={20} />,
    },
    {
      name: "Reviews",
      path: "/reviews",
      icon: <Star size={20} />,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings size={20} />,
    },
  ]

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="mobile-toggle" onClick={toggleMobileSidebar}>
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isCollapsed ? "collapsed" : ""} ${isMobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            {!isCollapsed && <h2>FashionSwap</h2>}
            {!isCollapsed && <span>Admin Panel</span>}
          </div>
          <button className="collapse-btn" onClick={toggleSidebar}>
            {isCollapsed ? "→" : "←"}
          </button>
        </div>

        <div className="sidebar-content">
          <div className="admin-info">
            {!isCollapsed && (
              <>
                <div className="admin-avatar">{admin?.name?.charAt(0) || "A"}</div>
                <div className="admin-details">
                  <h4>{admin?.name || "Admin"}</h4>
                  <span>{admin?.role || "Administrator"}</span>
                </div>
              </>
            )}
          </div>

          <nav className="sidebar-nav">
            <ul>
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className={isActive(item.path) ? "active" : ""}>
                    <span className="nav-icon">{item.icon}</span>
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
