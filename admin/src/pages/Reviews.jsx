import { useState, useEffect } from "react"
import axios from "axios"
import { Search, Filter, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react"
import MainLayout from "../components/Layout/MainLayout"
import "../styles/Reviews.css"

const Reviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    minRating: "",
    maxRating: "",
    isReported: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/reviews`, {
          params: {
            page,
            search,
            limit: 10,
            ...filters,
          },
          withCredentials: true,
        })

        setReviews(response.data.reviews)
        setTotalPages(response.data.pagination.pages)
      } catch (err) {
        console.error("Error fetching reviews:", err)
        setError("Failed to load reviews")
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
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

  const handleRemoveReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to remove this review?")) {
      return
    }

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/reviews/${reviewId}`, {
        data: { reason: "Violated community guidelines" },
        withCredentials: true,
      })

      // Remove the review from the state
      setReviews(reviews.filter((review) => review._id !== reviewId))
    } catch (err) {
      console.error("Error removing review:", err)
      alert("Failed to remove review")
    }
  }

  const handleApproveReview = async (reviewId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/reviews/${reviewId}/approve`,
        {},
        { withCredentials: true },
      )

      // Update the review in the state
      setReviews(reviews.map((review) => (review._id === reviewId ? { ...review, isReported: false } : review)))
    } catch (err) {
      console.error("Error approving review:", err)
      alert("Failed to approve review")
    }
  }

  const handlePrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages))
  }

  return (
    <MainLayout title="Review Management">
      <div className="reviews-container">
        <div className="reviews-header">
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-container">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search reviews by content..."
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
              <label>Min Rating</label>
              <select name="minRating" value={filters.minRating} onChange={handleFilterChange}>
                <option value="">Any</option>
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Max Rating</label>
              <select name="maxRating" value={filters.maxRating} onChange={handleFilterChange}>
                <option value="">Any</option>
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select name="isReported" value={filters.isReported} onChange={handleFilterChange}>
                <option value="">All</option>
                <option value="true">Reported</option>
                <option value="false">Not Reported</option>
              </select>
            </div>

            <button className="apply-filters" onClick={applyFilters}>
              Apply Filters
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading reviews...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <div className="reviews-list">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review._id} className={`review-card ${review.isReported ? "reported" : ""}`}>
                    {review.isReported && (
                      <div className="reported-badge">
                        <AlertTriangle size={16} />
                        Reported
                      </div>
                    )}
                    <div className="review-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                          {review.reviewer?.profilePicture ? (
                            <img
                              src={review.reviewer.profilePicture || "/placeholder.svg"}
                              alt={review.reviewer.name}
                            />
                          ) : (
                            review.reviewer?.name?.charAt(0) || "U"
                          )}
                        </div>
                        <div>
                          <h4>{review.reviewer?.name || "Unknown User"}</h4>
                          <p>reviewing {review.reviewee?.name || "Unknown User"}</p>
                        </div>
                      </div>
                      <div className="review-rating">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </div>
                    </div>
                    <div className="review-content">
                      <p>{review.comment}</p>
                    </div>
                    <div className="review-footer">
                      <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                      <div className="review-actions">
                        {review.isReported && (
                          <button className="approve-button" onClick={() => handleApproveReview(review._id)}>
                            Approve
                          </button>
                        )}
                        <button className="remove-button" onClick={() => handleRemoveReview(review._id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">No reviews found</div>
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

export default Reviews
