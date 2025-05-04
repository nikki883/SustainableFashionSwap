import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import MainLayout from "../components/Layout/MainLayout"
import "../styles/Items.css"

const Items = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    category: "",
    condition: "",
    availableFor: "",
    isSwapped: "",
    isSold: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/items`, {
          params: {
            page,
            search,
            limit: 10,
            ...filters,
          },
          withCredentials: true,
        })

        setItems(response.data.items)
        setTotalPages(response.data.pagination.pages)
      } catch (err) {
        console.error("Error fetching items:", err)
        setError("Failed to load items")
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [page, search, filters])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1) // Reset to first page on new search
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const applyFilters = () => {
    setPage(1) // Reset to first page when applying filters
    setShowFilters(false)
  }

  const handleViewItem = (itemId) => {
    navigate(`/items/${itemId}`)
  }

  const handlePrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages))
  }

  return (
    <MainLayout title="Item Management">
      <div className="items-container">
        <div className="items-header">
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-container">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search items by name, description or brand..."
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

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Category</label>
              <select name="category" value={filters.category} onChange={handleFilterChange}>
                <option value="">All Categories</option>
                <option value="Clothing">Clothing</option>
                <option value="Footwear">Footwear</option>
                <option value="Accessories">Accessories</option>
                <option value="Jewelry">Jewelry</option>
                <option value="Bags">Bags</option>
                <option value="Ethnic Wear">Ethnic Wear</option>
                <option value="Winter Wear">Winter Wear</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Condition</label>
              <select name="condition" value={filters.condition} onChange={handleFilterChange}>
                <option value="">All Conditions</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Gently Used">Gently Used</option>
                <option value="Well Used">Well Used</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Available For</label>
              <select name="availableFor" value={filters.availableFor} onChange={handleFilterChange}>
                <option value="">All</option>
                <option value="Buy">Buy</option>
                <option value="Swap">Swap</option>
                <option value="Both">Both</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select name="isSwapped" value={filters.isSwapped} onChange={handleFilterChange}>
                <option value="">All</option>
                <option value="true">Swapped</option>
                <option value="false">Not Swapped</option>
              </select>
            </div>

            <button className="apply-filters" onClick={applyFilters}>
              Apply Filters
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading items...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <div className="items-grid">
              {items.length > 0 ? (
                items.map((item) => (
                  <div key={item._id} className="item-card">
                    <div className="item-image">
                      <img src={item.imageUrls?.[0] || "/placeholder.svg"} alt={item.name} />
                      {item.isSwapped && <span className="item-badge swapped">Swapped</span>}
                      {item.isSold && <span className="item-badge sold">Sold</span>}
                    </div>
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p className="item-category">{item.category}</p>
                      <div className="item-info">
                        <span className="item-condition">{item.condition}</span>
                        <span className="item-price">{item.price}</span>
                      </div>
                      <p className="item-owner">By: {item.owner?.name || "Unknown"}</p>
                      <button className="view-item-button" onClick={() => handleViewItem(item._id)}>
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">No items found</div>
              )}
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

export default Items
