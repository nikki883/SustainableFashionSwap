import mongoose from "mongoose";

const swapSchema = new mongoose.Schema({
  requester: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  requestedItem: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Item", 
    required: true 
  },
  offeredItem: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Item" ,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "declined", "completed", "countered", "in-progress"],
    default: "pending",
  },
  counterOffer: {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
  },
  deliveryMethod: {
    method: {
      type: String,
      enum: ["self", "platform", "undecided"],
      default: "undecided",
    },
    requesterConfirmed: {
      type: Boolean,
      default: false,
    },
    ownerConfirmed: {
      type: Boolean,
      default: false,
    },
  },
 
      // New fields for two-party completion
      requesterConfirmed: {
        type: Boolean,
        default: false,
      },
      ownerConfirmed: {
        type: Boolean,
        default: false,
      },
      completed: {
        type: Boolean,
        default: false,
      },

  deliveryFeePaidByRequester: { type: Boolean, default: false },  // Track if requester has paid
  deliveryFeePaidByOwner: { type: Boolean, default: false },      // Track if owner has paid
  
  completed: { 
    type: Boolean, 
    default: false 
  },
  messages: [{
    sender: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    content: String,
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  }]
}, { timestamps: true });

const Swap = mongoose.model("Swap", swapSchema);
export default Swap;