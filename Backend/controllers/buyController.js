import Buy from "../models/buy.js"
import Item from "../models/Item.js"
import User from "../models/User.js"

export const sendBuyRequest = async (req, res) => {
  const { itemId, sellerId } = req.body

  try {
    const item = await Item.findById(itemId)
    if (!item) return res.status(404).json({ message: "Item not found." })

    // Check if item is available for buying
    if (item.availableFor === "Swap") {
      return res.status(400).json({ message: "This item is only available for swap, not for purchase." })
    }

    const existingRequest = await Buy.findOne({ item: itemId, buyer: req.user._id, status: "pending" })
    if (existingRequest) {
      return res.status(400).json({ message: "You have already sent a buy request for this item." })
    }

    const newRequest = new Buy({
      item: itemId,
      buyer: req.user._id,
      seller: sellerId,
      status: "pending",
    })

    await newRequest.save()

    // Notify seller via socket
    const io = req.app.get("socketio")
    const sellerSocketId = req.app.get("users")[sellerId]

    if (sellerSocketId) {
      io.to(sellerSocketId).emit("newBuyRequest", {
        requestId: newRequest._id,
        itemId,
        buyerId: req.user._id,
      })
    }

    res.status(201).json({ message: "Buy request sent", request: newRequest })
  } catch (err) {
    console.error("Error sending buy request:", err)
    res.status(500).json({ message: "Error sending buy request", error: err.message })
  }
}

export const respondToBuyRequest = async (req, res) => {
  const { requestId, action, counterOfferPrice } = req.body // action: "accept", "decline", "counter"

  try {
    const request = await Buy.findById(requestId)
    if (!request) return res.status(404).json({ message: "Request not found" })

    // Verify the current user is the seller
    if (request.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to respond to this request" })
    }

    if (action === "accept") {
      request.status = "accepted"
    } else if (action === "decline") {
      request.status = "declined"
    } else if (action === "counter") {
      if (!counterOfferPrice) {
        return res.status(400).json({ message: "Counter offer price is required" })
      }
      request.status = "countered"
      request.counterOfferPrice = counterOfferPrice
    }

    await request.save()

    // Notify buyer via socket
    const io = req.app.get("socketio")
    const buyerSocketId = req.app.get("users")[request.buyer.toString()]

    if (buyerSocketId) {
      io.to(buyerSocketId).emit("buyRequestUpdated", {
        requestId: request._id,
        status: request.status,
        counterOfferPrice: request.counterOfferPrice,
      })
    }

    res.status(200).json({ message: "Request updated", request })
  } catch (err) {
    console.error("Error updating request:", err)
    res.status(500).json({ message: "Error updating request", error: err.message })
  }
}

export const respondToCounterOffer = async (req, res) => {
  const { requestId, action } = req.body // action: "accept", "decline"

  try {
    const request = await Buy.findById(requestId)
    if (!request) return res.status(404).json({ message: "Request not found" })

    // Verify the current user is the buyer
    if (request.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to respond to this counter offer" })
    }

    if (action === "accept") {
      request.status = "accepted"
    } else if (action === "decline") {
      request.status = "declined"
    }

    await request.save()

    // Notify seller via socket
    const io = req.app.get("socketio")
    const sellerSocketId = req.app.get("users")[request.seller.toString()]

    if (sellerSocketId) {
      io.to(sellerSocketId).emit("counterOfferResponse", {
        requestId: request._id,
        status: request.status,
      })
    }

    res.status(200).json({ message: "Response to counter offer sent", request })
  } catch (err) {
    console.error("Error responding to counter offer:", err)
    res.status(500).json({ message: "Error responding to counter offer", error: err.message })
  }
}

export const getBuyRequests = async (req, res) => {
  try {
    const myRequests = await Buy.find({
      $or: [{ buyer: req.user._id }, { seller: req.user._id }],
    })
      .populate("item")
      .populate("buyer", "name email profilePicture")
      .populate("seller", "name email profilePicture")

    res.status(200).json(myRequests)
  } catch (err) {
    console.error("Error fetching requests:", err)
    res.status(500).json({ message: "Error fetching requests", error: err.message })
  }
}

export const getBuyRequestStatus = async (req, res) => {
  const { itemId } = req.params
  try {
    const request = await Buy.findOne({
      item: itemId,
      buyer: req.user._id,
    })
    if (!request) {
      return res.status(404).json({ message: "Buy request not found." })
    }
    res.status(200).json(request)
  } catch (err) {
    console.error("Error fetching buy request:", err)
    res.status(500).json({ message: "Error fetching buy request", error: err.message })
  }
}

export const completeTransaction = async (req, res) => {
  const { requestId, paymentId } = req.body

  try {
    const request = await Buy.findById(requestId)
    if (!request) return res.status(404).json({ message: "Request not found" })

    // Verify the current user is the buyer
    if (request.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to complete this transaction" })
    }

    // Update request status
    request.status = "completed"
    request.paymentStatus = "paid"
    await request.save()

    // Mark item as sold
    await Item.findByIdAndUpdate(request.item, { isSold: true })

    // Update user stats
    await User.findByIdAndUpdate(request.seller, { $inc: { itemsSold: 1 } })

    // Notify seller via socket
    const io = req.app.get("socketio")
    const sellerSocketId = req.app.get("users")[request.seller.toString()]

    if (sellerSocketId) {
      io.to(sellerSocketId).emit("transactionCompleted", {
        requestId: request._id,
        itemId: request.item,
        buyerId: request.buyer,
      })
    }

    res.status(200).json({ message: "Transaction completed successfully", request })
  } catch (err) {
    console.error("Error completing transaction:", err)
    res.status(500).json({ message: "Error completing transaction", error: err.message })
  }
}
