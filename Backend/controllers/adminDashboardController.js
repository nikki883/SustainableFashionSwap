import User from "../models/User.js"
import Item from "../models/Item.js"
import Swap from "../models/Swap.js"
import Buy from "../models/buy.js"
import Review from "../models/Review.js"

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // User stats
    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    })

    // Item stats
    const totalItems = await Item.countDocuments()
    const availableItems = await Item.countDocuments({ isSwapped: false, isSold: false })

    // Transaction stats
    const totalSwaps = await Swap.countDocuments()
    const completedSwaps = await Swap.countDocuments({ status: "completed" })
    const pendingSwaps = await Swap.countDocuments({ status: "pending" })

    const totalBuys = await Buy.countDocuments()
    const completedBuys = await Buy.countDocuments({ status: "completed" })
    const pendingBuys = await Buy.countDocuments({ status: "pending" })

    // Review stats
    const totalReviews = await Review.countDocuments()
    const reportedReviews = await Review.countDocuments({ isReported: true })

    // New registrations over time (last 7 days)
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      const count = await User.countDocuments({
        createdAt: { $gte: date, $lt: nextDay },
      })

      last7Days.push({
        date: date.toISOString().split("T")[0],
        count,
      })
    }

    // New items over time (last 7 days)
    const newItems7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      const count = await Item.countDocuments({
        createdAt: { $gte: date, $lt: nextDay },
      })

      newItems7Days.push({
        date: date.toISOString().split("T")[0],
        count,
      })
    }

    // Transactions over time (last 7 days)
    const transactions7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      const swapCount = await Swap.countDocuments({
        createdAt: { $gte: date, $lt: nextDay },
      })

      const buyCount = await Buy.countDocuments({
        createdAt: { $gte: date, $lt: nextDay },
      })

      transactions7Days.push({
        date: date.toISOString().split("T")[0],
        swaps: swapCount,
        buys: buyCount,
      })
    }

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        newRegistrations: last7Days,
      },
      items: {
        total: totalItems,
        available: availableItems,
        newItems: newItems7Days,
      },
      transactions: {
        swaps: {
          total: totalSwaps,
          completed: completedSwaps,
          pending: pendingSwaps,
        },
        buys: {
          total: totalBuys,
          completed: completedBuys,
          pending: pendingBuys,
        },
        timeline: transactions7Days,
      },
      reviews: {
        total: totalReviews,
        reported: reportedReviews,
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// Get recent activity for dashboard
export const getRecentActivity = async (req, res) => {
  try {
    const limit = Number.parseInt(req.query.limit) || 10

    // Recent users
    const recentUsers = await User.find().select("name email createdAt").sort({ createdAt: -1 }).limit(limit)

    // Recent items
    const recentItems = await Item.find()
      .select("name owner createdAt")
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .limit(limit)

    // Recent swaps
    const recentSwaps = await Swap.find()
      .select("requester owner requestedItem status createdAt")
      .populate("requester", "name email")
      .populate("owner", "name email")
      .populate("requestedItem", "name")
      .sort({ createdAt: -1 })
      .limit(limit)

    // Recent buys
    const recentBuys = await Buy.find()
      .select("buyer seller item status createdAt")
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .populate("item", "name")
      .sort({ createdAt: -1 })
      .limit(limit)

    // Recent reviews
    const recentReviews = await Review.find()
      .select("reviewer reviewee rating comment createdAt")
      .populate("reviewer", "name email")
      .populate("reviewee", "name email")
      .sort({ createdAt: -1 })
      .limit(limit)

    res.json({
      recentUsers,
      recentItems,
      recentSwaps,
      recentBuys,
      recentReviews,
    })
  } catch (error) {
    console.error("Error fetching recent activity:", error)
    res.status(500).json({ error: "Server error" })
  }
}
