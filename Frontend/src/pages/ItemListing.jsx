import { useState, useEffect, useMemo, useCallback } from "react"
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

   const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

    useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_URL}/api/items/list`)

        if (!response.ok) {
          throw new Error("Failed to fetch items")
        }

        const data = await response.json()
        setItems(data)
        setError(null)
      } catch (error) {
        console.error("Error fetching items:", error)
        setError("Failed to load items. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [API_URL])


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
      return items.filter((item) => {
        if (filter.category && item.category !== filter.category) return false
        if (filter.condition && item.condition !== filter.condition) return false
        if (filter.price && item.price !== filter.price) return false
        return true
      })
    }, [items, filter])
  
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
  
    if (loading) {
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

  // return (
  //   <div className="item-listing-container main">
  //     <h2>Available Items</h2>
  //     <div className="item-grid">
  //       {
  //         items.map((item)=>(
            
  //           <ItemCard  key={item._id}  _id={item._id}  img={item.imageUrls?.[0]} title={item.name} size={item.size} price={item.price} />
  
  //         ))
  //       }
  //     </div>
  //   </div>
  // );

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
          <p className="no-items-message">No items found matching your filters.</p>
        )}
      </div>
    </div>
  )
};

export default ItemListing;
