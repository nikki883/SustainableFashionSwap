import User from "../models/User.js";
import Item from "../models/Item.js";
import Swap from "../models/Swap.js";
import Review from '../models/Review.js';

  export const getUserItems = async (req, res) => {
    try {
      const userId = req.params.id;
      const items = await Item.find({ owner: userId }).sort({ createdAt: -1 });
      res.status(200).json({items});
    } catch (error) {
      console.error("Error fetching user items:", error);
      res.status(500).json({ error: "Server error" });
    }
  };

  export const getUserSwapHistory = async (req, res) => {
    try {
      const userId = req.params.id;
  
      const swaps = await Swap.find({
        status: "Completed",
        $or: [{ requester: userId }, { owner: userId }]
      })
        .populate({
          path: "item",
          select: "name imageUrls"
        })
        .populate({
          path: "requester",
          select: "name"
        })
        .populate({
          path: "owner",
          select: "name"
        })
        .sort({ updatedAt: -1 });
  
      const formattedSwaps = swaps.map((swap) => {
        const isRequester = swap.requester._id.toString() === userId;
  
        const seller = isRequester ? swap.requester : swap.owner;
        const receiver = isRequester ? swap.owner : swap.requester;
  
        return {
          _id: swap._id,
          itemName: swap.item?.name || "Unnamed Item",
          itemId: swap.item?._id,
          thumbnail: swap.item?.imageUrls?.[0] || null,
          sellerName: seller.name,
          sellerId: seller._id,
          receiverName: receiver.name,
          receiverId: receiver._id,
          date: swap.updatedAt
        };
      });
  
      res.status(200).json(formattedSwaps);
    } catch (error) {
      console.error("Error fetching swap history:", error);
      res.status(500).json({ error: "Server error" });
    }
  };
  

  //new
  // Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
};

// Get user reviews
export const getUserReviews = async (req, res) => {
  try {
    const userId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Find reviews where user is the reviewee
    const reviews = await Review.find({ reviewee: userId })
      .populate('reviewer', 'name profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments({ reviewee: userId });
    const hasMore = skip + reviews.length < totalReviews;

    res.status(200).json({
      reviews,
      hasMore
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ message: 'Failed to fetch user reviews' });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, location, bio } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (location) user.location = location;
    if (bio) user.bio = bio;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        location: user.location,
        bio: user.bio,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};