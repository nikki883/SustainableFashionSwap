import { useState, useEffect, useMemo, useCallback, useContext } from "react"
import AuthContext from "../context/AuthContext" // Import your AuthContext
import "./ItemListing.css";
import ItemCard from "../components/ItemCard";
import LoadingSpinner from "../components/LoadingSpinner"

const ItemListing = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState({
    category: "",
    condition: "",
    price: "",
  })

  // Get auth context to check if user is loaded
  const { user, loading: authLoading } = useContext(AuthContext)
  const API_URL = import.meta.env.VITE_API_URL 

  useEffect(() => {
    // Don't fetch items until auth loading is complete
    if (authLoading) {
      console.log("Auth still loading, waiting...")
      return
    }

    console.log("Auth loaded, user:", user)

    const fetchItems = async () => {
      try {
        setLoading(true)
        console.log("Fetching items from:", `${API_URL}/api/items/list`)

        const response = await fetch(`${API_URL}/api/items/list`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          }
        })

        console.log("Response status:", response.status)
        console.log("Response headers:", [...response.headers.entries()])

        if (!response.ok) {
          throw new Error(`Failed to fetch items: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Fetched items:", data)
        console.log("Number of items:", data.length)
        
        // Debug: Log items that belong to current user (should be filtered out by backend)
        if (user) {
          const userItems = data.filter(item => item.owner === user._id || item.owner?._id === user._id)
          console.log("Items belonging to current user (should be empty):", userItems)
        }

        setItems(data)
        setError(null)
      } catch (error) {
        console.error("Error fetching items:", error)
        setError(`Failed to load items: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [API_URL, authLoading, user?._id]) // Also depend on user._id to refetch when user changes

  // Use callback for filter change to prevent unnecessary re-renders
  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target
    setFilter((prev) => ({
      ...prev,
      [name]: value,
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilter({
      category: "",
      condition: "",
      price: "",
    })
  }, [])

  // Apply filters using useMemo to avoid unnecessary recalculations
  const filteredItems = useMemo(() => {
    const filtered = items.filter((item) => {
      // Additional frontend filter to ensure no user's own items show up
      if (user && (item.owner === user._id || item.owner?._id === user._id)) {
        console.log("Frontend filtering out user's own item:", item)
        return false
      }
      
      if (filter.category && item.category !== filter.category) return false
      if (filter.condition && item.condition !== filter.condition) return false
      if (filter.price && item.price !== filter.price) return false
      return true
    })
    
    console.log("Filtered items count:", filtered.length)
    return filtered
  }, [items, filter, user])

  // Memoize the unique categories, conditions, and prices
  const categories = useMemo(() => {
    return [...new Set(items.map((item) => item.category))].filter(Boolean)
  }, [items])

  const conditions = useMemo(() => {
    return [...new Set(items.map((item) => item.condition))].filter(Boolean)
  }, [items])

  const prices = useMemo(() => {
    return [...new Set(items.map((item) => item.price))].filter(Boolean)
  }, [items])

  // Show loading while auth is loading OR items are loading
  if (authLoading || loading) {
    return <LoadingSpinner message="Loading items..." />
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="item-listing-container main">
      <h2>Available Items</h2>

      <div className="filters-container">
        <div className="filter-group">
          <label htmlFor="category">Category:</label>
          <select id="category" name="category" value={filter.category} onChange={handleFilterChange}>
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="condition">Condition:</label>
          <select id="condition" name="condition" value={filter.condition} onChange={handleFilterChange}>
            <option value="">All Conditions</option>
            {conditions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="price">Price:</label>
          <select id="price" name="price" value={filter.price} onChange={handleFilterChange}>
            <option value="">All Prices</option>
            {prices.map((price) => (
              <option key={price} value={price}>
                {price}
              </option>
            ))}
          </select>
        </div>

        <button className="clear-filters-btn" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      <div className="item-grid">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <ItemCard
              key={item._id}
              _id={item._id}
              img={item.imageUrls?.[0]}
              title={item.name}
              size={item.size}
              price={item.price}
            />
          ))
        ) : (
          <div>
            <p className="no-items-message">No items found matching your filters.</p>
            {!user && (
              <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                Note: You may need to log in to see personalized results.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
};

export default ItemListing;