import express from "express"
import http from "http"
import { Server } from "socket.io"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"

// DB & Routes
import connectDB from "./config/db.js"
import authRoutes from "./routes/authRoutes.js"
import itemRoutes from "./routes/itemRoutes.js"
import swapRoutes from "./routes/swapRoutes.js"
import uploadRoute from "./routes/upload.js"
import userRoutes from "./routes/userRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import messageRoutes from "./routes/messageRoutes.js"
import adminAuthRoutes from "./routes/adminAuthRoutes.js" 
import adminRoutes from "./routes/adminRoutes.js"
import notificationRoutes from "./routes/notification.js";
import reviewRoutes from "./routes/reviewRoutes.js"
import supportRoutes from "./routes/support.js";

dotenv.config()
// Connect to MongoDB
connectDB()

const app = express()
const server = http.createServer(app) // Use HTTP server for Socket.io




// Middleware
app.use(express.json())
app.use(cookieParser())

const allowedOrigins = [process.env.CLIENT_URL, process.env.ADMIN_CLIENT_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);



const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by Socket.io CORS"));
      }
    },
    credentials: true,
  },
});


// Attach io to app
app.set("socketio", io)

// User socket mapping (socket id to user id)
const users = {}
app.set("users", users)

// Socket.io connection event
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id)

  // Store user ID to socket mapping
  socket.on("register", (userId) => {
    users[userId] = socket.id
    console.log(`User registered: ${userId} with socket ID: ${socket.id}`)
  })

  // Listen for messages
  socket.on("sendMessage", async ({ senderId, receiverId, text, itemId }) => {
    try {
      // Import Message model here to avoid circular dependencies
      const Message = (await import("./models/Message.js")).default
      const Conversation = (await import("./models/Conversation.js")).default

      // Find or create conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      })

      if (!conversation) {
        conversation = new Conversation({
          participants: [senderId, receiverId],
          lastMessage: text,
          itemId,
        })
      } else {
        conversation.lastMessage = text
      }

      // Increment unread count for recipient
      const currentCount = conversation.unreadCount.get(receiverId) || 0
      conversation.unreadCount.set(receiverId, currentCount + 1)

      await conversation.save()

      // Save message to DB
      const message = new Message({
        senderId,
        receiverId,
        text,
        itemId,
      })

      await message.save()

      // Emit to receiver if online
      const receiverSocket = users[receiverId]
      if (receiverSocket) {
        io.to(receiverSocket).emit("receiveMessage", {
          _id: message._id,
          senderId,
          receiverId,
          text,
          timestamp: message.createdAt,
          itemId,
        })
        console.log(`📩 Message from ${senderId} to ${receiverId}`)
      } else {
        console.log(`⚠️ Receiver ${receiverId} not connected.`)
      }
    } catch (err) {
      console.error("❌ Error saving message:", err)
    }
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    // Remove user from the users mapping when they disconnect
    for (const [userId, sid] of Object.entries(users)) {
      if (sid === socket.id) {
        delete users[userId]
        console.log(`🔌 User ${userId} disconnected`)
        break
      }
    }
  })
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/items", itemRoutes)
app.use("/api/swaps", swapRoutes)
app.use("/api/upload", uploadRoute)
app.use("/api/users", userRoutes)
app.use("/api/payment", paymentRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/admin/auth", adminAuthRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/notification", notificationRoutes);
app.use("/api/review",reviewRoutes) 
app.use("/api/support", supportRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" })
})

// Default route
app.get("/", (req, res) => {
  res.send("API is running...")
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!" })
})

// Start Server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`))
