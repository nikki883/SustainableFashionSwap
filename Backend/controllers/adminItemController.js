import Item from "../models/Item.js"
import Swap from "../models/Swap.js"
import Buy from "../models/buy.js"

// Get all items with pagination and filters
export const getAllItems = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Filters
    const search = req.query.search || ""
    const category = req.query.category || ""
    const condition = req.query.condition || ""
    const availableFor = req.query.availableFor || ""
    const isSwapped = req.query.isSwapped === "true" ? true : req.query.isSwapped === "false" ? false : null
    const isSold = req.query.isSold === "true" ? true : req.query.isSold === "false" ? false : null

    // Build filter query
    const filterQuery = {}

    if (search) {
      filterQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ]
    }

    if (category) filterQuery.category = category
    if (condition) filterQuery.condition = condition
    if (availableFor) filterQuery.availableFor = availableFor
    if (isSwapped !== null) filterQuery.isSwapped = isSwapped
    if (isSold !== null) filterQuery.isSold = isSold

    // Get total count for pagination
    const total = await Item.countDocuments(filterQuery)

    // Get items with pagination
    const items = await Item.find(filterQuery)
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.json({
      items,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching items:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// Get item details
export const getItemDetails = async (req, res) => {
  try {
    const itemId = req.params.id

    const item = await Item.findById(itemId).populate("owner", "name email profilePicture")

    if (!item) {
      return res.status(404).json({ error: "Item not found" })
    }

    // Get related swaps and buys
    const swaps = await Swap.find({ requestedItem: itemId })
      .populate("requester", "name email")
      .populate("owner", "name email")

    const buys = await Buy.find({ item: itemId }).populate("buyer", "name email").populate("seller", "name email")

    res.json({
      item,
      swaps,
      buys,
    })
  } catch (error) {
    console.error("Error fetching item details:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// Remove item
export const removeItem = async (req, res) => {
  try {
    const itemId = req.params.id
    const { reason } = req.body

    const item = await Item.findById(itemId)

    if (!item) {
      return res.status(404).json({ error: "Item not found" })
    }

    // Check if item is part of completed swap or buy
    const isInCompletedSwap = await Swap.exists({
      $or: [{ requestedItem: itemId }, { offeredItem: itemId }],
      status: "completed",
    })

    const isInCompletedBuy = await Buy.exists({
      item: itemId,
      status: "completed",
    })

    if (isInCompletedSwap || isInCompletedBuy) {
      // Instead of deleting, mark as removed
      item.isRemoved = true
      item.removalReason = reason
      item.removedBy = req.admin._id
      item.removedAt = new Date()
      await item.save()

      res.json({ message: "Item marked as removed" })
    } else {
      // Delete related swaps and buys
      await Swap.deleteMany({
        $or: [{ requestedItem: itemId }, { offeredItem: itemId }],
      })

      await Buy.deleteMany({ item: itemId })

      // Delete item
      await Item.findByIdAndDelete(itemId)

      res.json({ message: "Item deleted successfully" })
    }
  } catch (error) {
    console.error("Error removing item:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// Get item statistics
export const getItemStats = async (req, res) => {
  try {
    // Total items
    const totalItems = await Item.countDocuments()

    // Items by category
    const categoryCounts = await Item.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    // Items by condition
    const conditionCounts = await Item.aggregate([
      { $group: { _id: "$condition", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    // Items by availability
    const availabilityCounts = await Item.aggregate([
      { $group: { _id: "$availableFor", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    // Swapped and sold items
    const swappedCount = await Item.countDocuments({ isSwapped: true })
    const soldCount = await Item.countDocuments({ isSold: true })

    // Items added in the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentItemsCount = await Item.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })

    res.json({
      totalItems,
      categoryCounts,
      conditionCounts,
      availabilityCounts,
      swappedCount,
      soldCount,
      recentItemsCount,
    })
  } catch (error) {
    console.error("Error fetching item stats:", error)
    res.status(500).json({ error: "Server error" })
  }
}
