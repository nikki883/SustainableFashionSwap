import Item from "../models/Item.js"

// Add a new item
export const addItem = async (req, res) => {
  try {
    const { name, description, category, condition, size, price, imageUrls, brand, color, availableFor } = req.body

    const ownerId = req.user._id

    // Validate required fields
    if (!name || !description || !category || !condition || !size || !imageUrls) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    if (!Array.isArray(imageUrls) || imageUrls.length < 1 || imageUrls.length > 3) {
      return res.status(400).json({ error: "Please upload 1 to 3 images." })
    }

    // Check if a similar item was recently added (within last 10 seconds) to prevent duplicates
    const recentItem = await Item.findOne({
      owner: ownerId,
      name: name,
      createdAt: { $gt: new Date(Date.now() - 10000) }, // 10 seconds ago
    })

    if (recentItem) {
      return res.status(409).json({
        error: "Similar item was just added. Please wait before adding another similar item.",
        item: recentItem,
      })
    }

    const newItem = new Item({
      name,
      description,
      category,
      condition,
      size,
      price,
      imageUrls,
      brand,
      color,
      availableFor,
      owner: ownerId,
    })

    await newItem.save()

    res.status(201).json({ message: "Item added successfully", item: newItem })
  } catch (error) {
    console.error("Error adding item:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// // Get all items not yet swapped
// export const getItems = async (req, res) => {
//   try {
//     const items = await Item.find({ isSwapped: false, isSold: { $ne: true } }).populate("owner", "email")
//     res.status(200).json(items)
//   } catch (error) {
//     console.error("Error fetching items:", error)
//     res.status(500).json({ error: "Failed to fetch items" })
//   }
// }

// Get all items not yet swapped
export const getItems = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null

    // Filter conditions: not swapped, not sold, and not owned by current user
    const filterConditions = {
      isSwapped: false,
      isSold: { $ne: true },
    }

    // Add owner filter only if user is logged in
    if (userId) {
      filterConditions.owner = { $ne: userId }
    }

    const items = await Item.find(filterConditions).populate("owner", "email")
    res.status(200).json(items)
  } catch (error) {
    console.error("Error fetching items:", error)
    res.status(500).json({ error: "Failed to fetch items" })
  }
}


// Get item by ID
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("owner", "name email profilePic location")

    if (!item) return res.status(404).json({ error: "Item not found" })
    res.status(200).json(item)
  } catch (error) {
    console.error("Error fetching item:", error)
    res.status(500).json({ error: "Failed to fetch item details" })
  }
}

// Get similar items based on category
export const getSimilarItems = async (req, res) => {
  const itemId = req.params.id

  try {
    const currentItem = await Item.findById(itemId)
    if (!currentItem) return res.status(404).json({ error: "Item not found" })

    const similarItems = await Item.find({
      _id: { $ne: itemId },
      category: currentItem.category,
      isSwapped: false,
      isSold: { $ne: true },
    })
      .limit(5)
      .lean()

    res.json(similarItems)
  } catch (err) {
    console.error("Error fetching similar items:", err)
    res.status(500).json({ error: "Server error" })
  }
}

export const getRecommendedItems = async (req, res) => {
  try {
    const items = await Item.find({ isSwapped: false, isSold: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(8)

    res.status(200).json({ items })
  } catch (error) {
    console.error("Error fetching recommended items:", error)
    res.status(500).json({ message: "Server error while fetching recommended items" })
  }
}

export const searchItems = async (req, res) => {
  try {
    const search = req.query.search || ""

    // Improved search query with better filtering
    const items = await Item.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { color: { $regex: search, $options: "i" } },
      ],
      isSwapped: false,
      isSold: { $ne: true },
    }).populate("owner", "name email profilePic location")

    res.status(200).json(items)
  } catch (err) {
    console.error("Search error:", err)
    res.status(500).json({ message: "Search failed." })
  }
}

// Get user's own items
export const getMyItems = async (req, res) => {
  try {
    const userId = req.user._id

    const items = await Item.find({
      owner: userId,
      isSwapped: false,
      isSold: false,
    })

    res.status(200).json({ items })
  } catch (error) {
    console.error("Error fetching user items:", error)
    res.status(500).json({ error: "Failed to fetch your items" })
  }
}

// Update item schema to support custom pricing
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, category, condition, size, price, brand, color, availableFor } = req.body
    const userId = req.user._id

    // Find the item
    const item = await Item.findById(id)

    if (!item) {
      return res.status(404).json({ error: "Item not found" })
    }

    // Check if the user is the owner
    if (item.owner.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not authorized to update this item" })
    }

    // Update the item
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      {
        name,
        description,
        category,
        condition,
        size,
        price,
        brand,
        color,
        availableFor,
      },
      { new: true },
    )

    res.status(200).json({ message: "Item updated successfully", item: updatedItem })
  } catch (error) {
    console.error("Error updating item:", error)
    res.status(500).json({ error: "Server error" })
  }
}
