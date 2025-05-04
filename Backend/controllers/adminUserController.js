import User from "../models/User.js"
import Item from "../models/Item.js"
import Swap from "../models/Swap.js"
import Buy from "../models/buy.js"
import Review from "../models/Review.js"

// Get all users with pagination
export const getAllUsers = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const search = req.query.search || ""

    // Build search query
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
          ],
        }
      : {}

    // Get total count for pagination
    const total = await User.countDocuments(searchQuery)

    // Get users with pagination
    const users = await User.find(searchQuery).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit)

    res.json({
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// Get user details with activity stats
export const getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id

    // Get user details
    const user = await User.findById(userId).select("-password")

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Get user stats
    const itemsCount = await Item.countDocuments({ owner: userId })
    const swapsCount = await Swap.countDocuments({
      $or: [{ requester: userId }, { owner: userId }],
    })
    const completedSwapsCount = await Swap.countDocuments({
      $or: [{ requester: userId }, { owner: userId }],
      status: "completed",
    })
    const buyCount = await Buy.countDocuments({
      buyer: userId,
    })
    const sellCount = await Buy.countDocuments({
      seller: userId,
      status: "completed",
    })
    const reviewsCount = await Review.countDocuments({
      reviewee: userId,
    })

    // Get average rating
    const reviews = await Review.find({ reviewee: userId })
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

    res.json({
      user,
      stats: {
        itemsCount, 
        swapsCount,
        completedSwapsCount,
        buyCount,
        sellCount,
        reviewsCount,
        avgRating: Number.parseFloat(avgRating.toFixed(1)),
      },
    })
  } catch (error) {
    console.error("Error fetching user details:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// Suspend/unsuspend user
export const toggleUserStatus = async (req, res) => {
  try {
    const userId = req.params.id
    const { isSuspended, reason } = req.body

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    user.isSuspended = isSuspended
    user.suspensionReason = isSuspended ? reason : null
    user.suspendedAt = isSuspended ? new Date() : null
    user.suspendedBy = isSuspended ? req.admin._id : null

    await user.save()

    res.json({
      message: isSuspended ? "User suspended successfully" : "User unsuspended successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isSuspended: user.isSuspended,
      },
    })
  } catch (error) {
    console.error("Error toggling user status:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// Delete user and all associated data
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Delete all user data
    await Item.deleteMany({ owner: userId })
    await Swap.deleteMany({ $or: [{ requester: userId }, { owner: userId }] })
    await Buy.deleteMany({ $or: [{ buyer: userId }, { seller: userId }] })
    await Review.deleteMany({ $or: [{ reviewer: userId }, { reviewee: userId }] })

    // Delete user
    await User.findByIdAndDelete(userId)

    res.json({ message: "User and all associated data deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({ error: "Server error" })
  }
}
