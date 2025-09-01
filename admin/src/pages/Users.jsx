import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import MainLayout from "../components/Layout/MainLayout"
import "../styles/Users.css"

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const navigate = useNavigate()

  // Add these new state variables after the existing useState declarations
  const [status, setStatus] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filtersApplied, setFiltersApplied] = useState(false)

  // Update the useEffect to include filters
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
          params: {
            page,
            search,
            limit: 10,
            status: status || undefined,
            sortBy: sortBy || undefined,
          },
          withCredentials: true,
        })

        setUsers(response.data.users)
        setTotalPages(response.data.pagination.pages)
      } catch (err) {
        console.error("Error fetching users:", err)
        setError("Failed to load users")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [page, search, filtersApplied])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1) // Reset to first page on new search
  }

  const handleViewUser = (userId) => {
    navigate(`/users/${userId}`)
  }

  const handlePrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages))
  }

  // Add a function to apply filters
  const applyFilters = () => {
    setPage(1) // Reset to first page when applying filters
    setFiltersApplied(!filtersApplied) // Toggle to trigger useEffect
  }

  // Update the filters panel JSX
  const filtersPanel = (
    <div className="filters-panel">
      <div className="filter-group">
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Sort By</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">Name</option>
        </select>
      </div>

      <button className="apply-filters" onClick={applyFilters}>
        Apply Filters
      </button>
    </div>
  )

  return (
    <MainLayout title="User Management">
      <div className="users-container">
        <div className="users-header">
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-container">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search users by name, email or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="search-button">
              Search
            </button>
          </form>

          <button className="filter-button" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} />
            Filters
          </button>
        </div>

        {showFilters && filtersPanel}

        {loading ? (
          <div className="loading">Loading users...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Location</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div className="user-name-cell">
                            <div className="user-avatar">
                              {user.profilePicture ? (
                                <img src={user.profilePicture || "/placeholder.svg"} alt={user.name} />
                              ) : (
                                user.name.charAt(0)
                              )}
                            </div>
                            <span>{user.name}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.location || "Not specified"}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${user.isSuspended ? "suspended" : "active"}`}>
                            {user.isSuspended ? "Suspended" : "Active"}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="view-button" onClick={() => handleViewUser(user._id)}>
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-results">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button onClick={handlePrevPage} disabled={page === 1} className="pagination-button">
                <ChevronLeft size={18} />
                Previous
              </button>
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              <button onClick={handleNextPage} disabled={page === totalPages} className="pagination-button">
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}

export default Users
