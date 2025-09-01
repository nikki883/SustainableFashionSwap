import Razorpay from "razorpay"
import crypto from "crypto"
import dotenv from "dotenv"
import Payment from "../models/Payment.js"
import Swap from "../models/Swap.js"
import Buy from "../models/buy.js"
import Item from "../models/Item.js"
import User from "../models/User.js"

dotenv.config()

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Create a payment order for swap
export const createOrder = async (req, res) => {
  try {
    const { swapId, amount } = req.body
    const userId = req.user._id
    
    if (!swapId || !amount) {
      return res.status(400).json({ message: "Missing required fields" })
    }
     
    console.log(`Creating payment order for swap ${swapId} with amount ${amount}`)
    
    // Verify swap exists
    const swap = await Swap.findById(swapId)
    if (!swap) {
      return res.status(404).json({ message: "Swap not found" })
    }
    
    // Verify user is part of this swap
    if (swap.owner.toString() !== userId.toString() && swap.requester.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to create payment for this swap" })
    }
    
    // Create order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise for INR)
      currency: "INR",
      receipt: `swap_${swapId}`,
    })
    
    console.log(`Razorpay order created: ${order.id}`)
    
    const existingPayment = await Payment.findOne({ orderId: order.id });
    if (existingPayment) {
  return res.status(409).json({ message: "Payment already exists for this order" });
   }
   
    // Save payment details
    const payment = new Payment({
      swapId,
      userId,
      amount: amount, // Store in rupees
      currency: "INR",
      status: "created",
      orderId: order.id,
      type: "swap",
    })

    await payment.save()
    console.log(`Payment record saved: ${payment._id}`)

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error) {
    console.error("Error creating payment order:", error)
    res.status(500).json({
      message: "Failed to create payment order",
      error: error.message,
    })
  }
}

// Verify payment for swap
export const verifyPayment = async (req, res) => {
  try {
    const { swapId, paymentId, orderId, signature } = req.body
    const userId = req.user._id

    if (!swapId || !paymentId || !orderId || !signature) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    console.log(`Verifying payment for swap ${swapId}, payment ID: ${paymentId}`)

    // Verify the payment signature
    const body = orderId + "|" + paymentId
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body).digest("hex")

    if (expectedSignature !== signature) {
      console.log("Invalid signature")
      return res.status(400).json({ message: "Invalid payment signature" })
    }

    // Update payment status
    const payment = await Payment.findOne({ orderId })
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    payment.status = "captured"
    payment.paymentId = paymentId
    await payment.save()
    console.log(`Payment status updated to captured: ${payment._id}`)

    // Update swap delivery method
    const swap = await Swap.findById(swapId)
    if (!swap) {
      return res.status(404).json({ message: "Swap not found" })
    }

    swap.deliveryMethod = {
      ...swap.deliveryMethod,
      method: "platform",
      paymentCompleted: true,
    }
    await swap.save()
    console.log(`Swap delivery method updated: ${swap._id}`)

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    res.status(500).json({
      message: "Failed to verify payment",
      error: error.message,
    })
  }
}
 
// Get all buy requests for a user (both as buyer and seller)
export const getUserBuyRequests = async (req, res) => {
  try {
    const userId = req.user._id

    console.log(`Getting buy requests for user ${userId}`)

    // Find buy requests where user is either buyer or seller
    const buyRequests = await Buy.find({
      $or: [{ buyer: userId }, { seller: userId }],
    })
      .populate("item", "name description imageUrls price")
      .populate("buyer", "name profilePic")
      .populate("seller", "name profilePic")
      .sort({ createdAt: -1 })

    // Add a flag to indicate if the user is the buyer or seller
    const formattedRequests = buyRequests.map((request) => {
      const isBuyer = request.buyer._id.toString() === userId.toString()
      return {
        ...request.toObject(),
        isBuyer,
      }
    })

    console.log(`Found ${formattedRequests.length} buy requests`)

    res.status(200).json({
      success: true,
      buyRequests: formattedRequests,
    })
  } catch (error) {
    console.error("Error getting buy requests:", error)
    res.status(500).json({
      message: "Failed to get buy requests",
      error: error.message,
    })
  }
}

// Respond to a buy request (seller accepts or rejects)
export const respondToBuyRequest = async (req, res) => {
  try {
    const { buyId, action } = req.body
    const sellerId = req.user._id

    if (!buyId || !action) {
      return res.status(400).json({ message: "Buy ID and action are required" })
    }

    if (action !== "accept" && action !== "reject") {
      return res.status(400).json({ message: "Invalid action. Must be accept or reject" })
    }

    console.log(`Responding to buy request ${buyId} with action: ${action}`)

    // Find the buy request
    const buyRequest = await Buy.findById(buyId)
    if (!buyRequest) {
      return res.status(404).json({ message: "Buy request not found" })
    }

    // Verify the seller is the owner of the item
    if (buyRequest.seller.toString() !== sellerId.toString()) {
      return res.status(403).json({ message: "Not authorized to respond to this request" })
    }

    if (action === "accept") {
      buyRequest.status = "accepted"

      // If payment is already made, update to processing
      if (buyRequest.paymentStatus === "paid") {
        buyRequest.status = "processing"
      }
    } else {
      buyRequest.status = "rejected"

      // If payment was made, initiate refund process
      if (buyRequest.paymentStatus === "paid") {
        buyRequest.paymentStatus = "refunding"

        // Find the payment and mark for refund
        const payment = await Payment.findOne({ buyId: buyRequest._id })
        if (payment) {
          payment.status = "refunding"
          await payment.save()
          console.log(`Payment marked for refund: ${payment._id}`)
        }
      }

      // Remove pending sale status from item
      const item = await Item.findById(buyRequest.item)
      if (item && item.isPendingSale) {
        item.isPendingSale = false
        await item.save()
        console.log(`Item pending sale status removed: ${item._id}`)
      }
    }

    await buyRequest.save()
    console.log(`Buy request updated: ${buyRequest._id}`)

    res.status(200).json({
      success: true,
      message: `Buy request ${action}ed successfully`,
      buyRequest,
    })
  } catch (error) {
    console.error(`Error responding to buy request:`, error)
    res.status(500).json({
      message: "Failed to respond to buy request",
      error: error.message,
    })
  }
}
