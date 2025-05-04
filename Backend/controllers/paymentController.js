import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from "dotenv";
import Payment from '../models/Payment.js';
import Swap from '../models/Swap.js';

dotenv.config();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create a payment order
export const createOrder = async (req, res) => {
  try {
    const { swapId, amount } = req.body;
    const userId = req.user._id;

    if (!swapId || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify swap exists
    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    // Verify user is part of this swap
    if (swap.owner.toString() !== userId.toString() && 
        swap.requester.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to create payment for this swap' });
    }

    // Create order
    const order = await razorpay.orders.create({
      amount: amount, // amount in the smallest currency unit (paise for INR)
      currency: 'INR',
      receipt: `swap_${swapId}`,
    });

    // Save payment details
    const payment = new Payment({
      swapId,
      userId,
      amount: amount / 100, // Convert back to rupees for storage
      currency: 'INR',
      status: 'created',
      orderId: order.id,
    });

    await payment.save();

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const { swapId, paymentId, orderId, signature } = req.body;
    const userId = req.user._id;

    if (!swapId || !paymentId || !orderId || !signature) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify the payment signature
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update payment status
    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.status = 'captured';
    payment.paymentId = paymentId;
    await payment.save();

    // Update swap delivery method
    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    swap.deliveryMethod = {
      ...swap.deliveryMethod,
      method: 'platform',
      paymentCompleted: true,
    };
    await swap.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
};