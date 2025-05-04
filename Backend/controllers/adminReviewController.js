import Review from "../models/Review.js"

// Get all reviews with pagination and filters
export const getAllReviews = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Filters
    const search = req.query.search || ""
    const minRating = Number.parseInt(req.query.minRating) || 1
    const maxRating = Number.parseInt(req.query.maxRating) || 5
    const isReported = req.query.isReported === "true" ? true : undefined

    // Build filter query
    const filterQuery = {
      rating: { $gte: minRating, $lte: maxRating },
    }

    if (isReported !== undefined) {
      filterQuery.isReported = isReported
    }

    if (search) {
      // Search in review comment
      filterQuery.comment = { $regex: search, $options: "i" }
    }

    // Get total count for pagination
    const total = await Review.countDocuments(filterQuery)

    // Get reviews with pagination
    const reviews = await Review.find(filterQuery)
      .populate("reviewer", "name email")
      .populate("reviewee", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.json({
      reviews,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// Remove review
export const removeReview = async (req, res) => {
  try {
    const reviewId = req.params.id
    const { reason } = req.body

    const review = await Review.findById(reviewId)

    if (!review) {
      return res.status(404).json({ error: "Review not found" })
    }

    // Delete review
    await Review.findByIdAndDelete(reviewId)

    // Log removal action
    const removalLog = {
      reviewId,
      reviewerId: review.reviewer,
      revieweeId: review.reviewee,
      rating: review.rating,
      comment: review.comment,
      removedBy: req.admin._id,
      removedAt: new Date(),
      reason,
    }

    // You could save this log to a separate collection if needed

    res.json({ message: "Review removed successfully" })
  } catch (error) {
    console.error("Error removing review:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// Mark review as appropriate (not violating guidelines)
export const markReviewAsAppropriate = async (req, res) => {
  try {
    const reviewId = req.params.id

    const review = await Review.findById(reviewId)

    if (!review) {
      return res.status(404).json({ error: "Review not found" })
    }

    // Update review
    review.isReported = false
    review.reportReason = null
    review.moderatedBy = req.admin._id
    review.moderatedAt = new Date()

    await review.save()

    res.json({ message: "Review marked as appropriate", review })
  } catch (error) {
    console.error("Error updating review:", error)
    res.status(500).json({ error: "Server error" })
  }
}
