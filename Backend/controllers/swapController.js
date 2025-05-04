    import Swap from "../models/Swap.js"
    import Item from "../models/Item.js"
    
    // Create a swap request
    export const requestSwap = async (req, res) => {
  try {
    const { requestedItem, offeredItem } = req.body
    const requester = req.user._id

    // Validate that items exist and are available
    const [requestedItemDoc, offeredItemDoc] = await Promise.all([
      Item.findById(requestedItem),
      Item.findById(offeredItem),
    ])
    
    if (!requestedItemDoc || !offeredItemDoc) {
      return res.status(404).json({ message: "One or both items not found" })
    }

    if (requestedItemDoc.isSwapped || offeredItemDoc.isSwapped) {
      return res.status(400).json({ message: "One or both items are already swapped" })
    }
    
    const owner = requestedItemDoc.owner
    if (!owner) {
      return res.status(400).json({ message: "Requested item has no owner" })
    }

    // Create swap request
    const swapRequest = new Swap({
      requester,
      owner,
      requestedItem,
      offeredItem,
      status: "pending",
      requesterConfirmed: false,
      ownerConfirmed: false,
    })
    
    await swapRequest.save()
    
    res.status(201).json({
      message: "Swap request created successfully",
      swapRequest,
    })
  } catch (error) {
    console.error("Error creating swap request:", error)
    res.status(500).json({ message: "Failed to create swap request" })
  }
}

// Get all swap requests for the current user
export const getSwapRequests = async (req, res) => {
  try {
    const userId = req.user._id

    // Find all swaps where user is either requester or owner
    const swaps = await Swap.find({
      $or: [{ requester: userId }, { owner: userId }],
    })
    .populate("requester", "name email profilePicture")
    .populate("owner", "name email profilePicture")
    .populate("requestedItem")
    .populate("offeredItem")
    .populate("counterOffer.item")
    .sort({ createdAt: -1 })
    
    // Add isRequester field to each swap
    const swapsWithRole = swaps.map((swap) => {
      const swapObj = swap.toObject()

      // Set isRequester only if requester is populated
      if (swap.requester && swap.requester._id) {
        swapObj.isRequester = swap.requester._id.toString() === userId.toString()
      } else {
        swapObj.isRequester = false
        console.warn("Swap with missing requester:", swap._id)
      }

      return swapObj
    })
    
    res.status(200).json({ swaps: swapsWithRole })
  } catch (error) {
    console.error("Error fetching swap requests:", error)
    res.status(500).json({ message: "Failed to fetch swap requests" })
  }
}

// Update swap status (accept, decline, complete)
export const updateSwapStatus = async (req, res) => {
  try {
    const { swapId, status } = req.body
    const userId = req.user._id
    
    if (!["approved", "declined", "completed", "in-progress"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }
    
    const swap = await Swap.findById(swapId).populate("requestedItem").populate("offeredItem")
    
    if (!swap) {
      return res.status(404).json({ message: "Swap request not found" })
    }
    
    // Verify user is authorized to update this swap
    if (swap.owner.toString() !== userId.toString() && swap.requester.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to update this swap" })
    }
    
    // Update swap status
    swap.status = status

    // If approved, mark items as swapped
    if (status === "approved") {
      await Promise.all([
        Item.findByIdAndUpdate(swap.requestedItem._id, { isSwapped: true }),
        Item.findByIdAndUpdate(swap.offeredItem._id, { isSwapped: true }),
      ])
    }

    await swap.save()
    
    res.status(200).json({
      message: `Swap ${status} successfully`,
      swap,
    })
  } catch (error) {
    console.error(`Error updating swap status:`, error)
    res.status(500).json({ message: "Failed to update swap status" })
  }
}

// Confirm completion by one user
export const confirmCompletion = async (req, res) => {
  try {
    const { swapId, userType } = req.body
    const userId = req.user._id
    
    if (!["requester", "owner"].includes(userType)) {
      return res.status(400).json({ message: "Invalid user type" })
    }
    
    const swap = await Swap.findById(swapId)
    
    if (!swap) {
      return res.status(404).json({ message: "Swap request not found" })
    }
    
    // Verify user is authorized to update this swap
    const isRequester = swap.requester.toString() === userId.toString()
    const isOwner = swap.owner.toString() === userId.toString()
    
    if (!isRequester && !isOwner) {
      return res.status(403).json({ message: "Not authorized to update this swap" })
    }

    // Verify the userType matches the actual user role
    if ((userType === "requester" && !isRequester) || (userType === "owner" && !isOwner)) {
      return res.status(403).json({ message: "User type does not match your role in this swap" })
    }
    
    // Update the appropriate confirmation field
    if (userType === "requester") {
      swap.requesterConfirmed = true
    } else {
      swap.ownerConfirmed = true
    }
    
    // If both users have confirmed, mark the swap as completed
    if (swap.requesterConfirmed && swap.ownerConfirmed) {
      swap.status = "completed"
      swap.completed = true
    } else {
      // If only one user has confirmed, mark as in-progress
      swap.status = "in-progress"
    }
    
    await swap.save()
    
    res.status(200).json({
      message: "Completion confirmation updated successfully",
      swap,
    })
  } catch (error) {
    console.error("Error confirming completion:", error)
    res.status(500).json({ message: "Failed to confirm completion" })
  }
}

// Send a counter offer
export const counterOffer = async (req, res) => {
  try {
    const { swapId, counterItemId } = req.body
    const userId = req.user._id

    const swap = await Swap.findById(swapId)
    
    if (!swap) {
      return res.status(404).json({ message: "Swap request not found" })
    }
    
    // Verify user is the owner of the requested item
    if (swap.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to counter this swap" })
    }
    
    // Validate counter item
    const counterItem = await Item.findById(counterItemId)
    if (!counterItem) {
      return res.status(404).json({ message: "Counter item not found" })
    }
    
    // Check if the counter item belongs to the requester
    if (counterItem.owner.toString() !== swap.requester.toString()) {
      return res.status(403).json({ message: "Counter item must belong to the requester" })
    }
    
    if (counterItem.isSwapped) {
      return res.status(400).json({ message: "This item is already swapped" })
    }
    
    // Update swap with counter offer
    swap.counterOffer = {
      item: counterItemId,
    }
    swap.status = "countered"
    
    await swap.save()

    res.status(200).json({
      message: "Counter offer sent successfully",
      swap,
    })
  } catch (error) {
    console.error("Error sending counter offer:", error)
    res.status(500).json({ message: "Failed to send counter offer" })
  }
}

// Update delivery method
export const updateDeliveryMethod = async (req, res) => {
  try {
    const { swapId, method } = req.body
    const userId = req.user._id
    
    if (!["self", "platform"].includes(method)) {
      return res.status(400).json({ message: "Invalid delivery method" })
    }
    
    const swap = await Swap.findById(swapId)
    
    if (!swap) {
      return res.status(404).json({ message: "Swap request not found" })
    }
    
    // Verify user is part of this swap
    if (swap.owner.toString() !== userId.toString() && swap.requester.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to update this swap" })
    }

    // Update delivery method
    // Check if delivery method already exists
    const existingMethod = swap.deliveryMethod?.method || "undecided"
    const isOwner = swap.owner.toString() === userId.toString()
    
    // Update delivery method based on who is setting it
    if (!swap.deliveryMethod || swap.deliveryMethod.method === "undecided") {
      // First time setting delivery method
      swap.deliveryMethod = {
        method,
        requesterConfirmed: !isOwner,
        ownerConfirmed: isOwner,
      }
    } else {
      // Update existing delivery method
      if (isOwner) {
        swap.deliveryMethod.ownerConfirmed = true
      } else {
        swap.deliveryMethod.requesterConfirmed = true
      }

      // If methods don't match, update to the new method and reset confirmations
      if (existingMethod !== method) {
        swap.deliveryMethod.method = method
        swap.deliveryMethod.requesterConfirmed = !isOwner
        swap.deliveryMethod.ownerConfirmed = isOwner
      }
    }
    
    await swap.save()
    
    res.status(200).json({
      message: "Delivery method updated successfully",
      swap,
    })
  } catch (error) {
    console.error("Error updating delivery method:", error)
    res.status(500).json({ message: "Failed to update delivery method" })
  }
}

// Get swap history
export const getSwapHistory = async (req, res) => {
  try {
    const userId = req.user._id
    
    const swaps = await Swap.find({
      $and: [
        { $or: [{ owner: userId }, { requester: userId }] },
        { $or: [{ status: "completed" }, { status: "declined" }, { status: "in-progress" }] },
      ],
    })
    .populate("requester", "name email profilePicture")
    .populate("owner", "name email profilePicture")
    .populate("requestedItem", "name imageUrls")
    .populate("offeredItem", "name imageUrls")
    .sort({ updatedAt: -1 })
    
    res.json(swaps)
  } catch (error) {
    console.error("Error fetching swap history:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// Complete a swap
export const completeSwap = async (req, res) => {
  try {
    const { swapId } = req.body;
    const userId = req.user._id;

    const swap = await Swap.findById(swapId);

    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Verify user is part of this swap
    if (swap.owner.toString() !== userId.toString() && 
        swap.requester.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to complete this swap' });
    }

    // Mark swap as completed
    swap.status = 'completed';
    swap.completed = true;

    await swap.save();

    res.status(200).json({ 
      message: 'Swap completed successfully',
      swap
    });
  } catch (error) {
    console.error('Error completing swap:', error);
    res.status(500).json({ message: 'Failed to complete swap' });
  }
};