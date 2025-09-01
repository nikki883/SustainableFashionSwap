import Message from "../models/Message.js"
import Conversation from "../models/Conversation.js"
import User from "../models/User.js"

// Get all conversations for the current user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id

    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: userId,
    }).sort({ updatedAt: -1 })

    // For each conversation, get the other participant's details
    const populatedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        const otherParticipantId = conversation.participants.find((p) => p.toString() !== userId.toString())

        const otherParticipant = await User.findById(otherParticipantId).select("name email profilePicture lastActive")

        // Get unread count for this user
        const unreadCount = conversation.unreadCount.get(userId.toString()) || 0

        return {
          _id: conversation._id,
          participant: otherParticipant,
          lastMessage: conversation.lastMessage,
          updatedAt: conversation.updatedAt,
          unreadCount,
          itemId: conversation.itemId,
        }
      }),
    )

    res.status(200).json(populatedConversations)
  } catch (error) {
    console.error("Error getting conversations:", error)
    res.status(500).json({ message: "Server error" })
  }
}


// Get messages for a specific conversation
export const getMessages = async (req, res) => {
  try {
    const conversationId = req.params.conversationId
    const userId = req.user._id

    // Find the conversation
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" }) 
    }

    // Ensure the user is a participant
    if (!conversation.participants.some((p) => p.toString() === userId.toString())) {
      return res.status(403).json({ message: "Not authorized to view this conversation" })
    }

    // Get the other participant
    const otherParticipantId = conversation.participants.find((p) => p.toString() !== userId.toString())

    // Get messages between these users
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherParticipantId },
        { senderId: otherParticipantId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 })

    // Mark messages as read
    await Message.updateMany({ senderId: otherParticipantId, receiverId: userId, read: false }, { read: true })

    // Reset unread count for this user
    conversation.unreadCount.set(userId.toString(), 0)
    await conversation.save()

    res.status(200).json(messages)
  } catch (error) {
    console.error("Error getting messages:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Create or get a conversation with another user
export const createOrGetConversation = async (req, res) => {
  try {
    const userId = req.user._id
    const { participantId, itemId, initialMessage } = req.body

    if (!participantId) {
      return res.status(400).json({ message: "Participant ID is required" })
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, participantId] },
    })

    // If not, create a new conversation
    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, participantId],
        itemId: itemId || null,
      })
      await conversation.save()
    }

    // If there's an initial message, create it
    if (initialMessage) {
      const message = new Message({
        senderId: userId,
        receiverId: participantId,
        text: initialMessage,
        itemId: itemId || null,
      })
      await message.save()

      // Update conversation with last message
      conversation.lastMessage = initialMessage

      // Increment unread count for recipient
      const currentCount = conversation.unreadCount.get(participantId.toString()) || 0
      conversation.unreadCount.set(participantId.toString(), currentCount + 1)

      await conversation.save()

      // Emit socket event (handled in server.js)
      const io = req.app.get("socketio")
      const users = req.app.get("users") || {}

      if (users[participantId]) {
        // Check if the user is online before emitting
        io.to(users[participantId]).emit("receiveMessage", {
          _id: message._id,
          senderId: userId,
          receiverId: participantId,
          text: initialMessage,
          timestamp: message.createdAt,
        })
      }
    }

    res.status(200).json({ conversationId: conversation._id })
  } catch (error) {
    console.error("Error creating conversation:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get unread message count from a specific user
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id
    const senderId = req.params.senderId

    const count = await Message.countDocuments({
      senderId,
      receiverId: userId,
      read: false,
    })

    res.status(200).json({ count })
  } catch (error) {
    console.error("Error getting unread count:", error)
    res.status(500).json({ message: "Server error" })
  }
}
