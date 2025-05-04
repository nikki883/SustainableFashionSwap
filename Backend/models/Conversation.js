import mongoose from "mongoose"

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: String,
      default: "",
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
  },
  { timestamps: true },
)

export default mongoose.model("Conversation", conversationSchema)
