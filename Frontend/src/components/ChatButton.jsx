import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import { MessageCircle } from "lucide-react"
import AuthContext from "../context/AuthContext"
import { SocketContext } from "../context/SocketContext"
import "./ChatButton.css"

const ChatButton = ({ userId, itemId, itemName }) => {
  const { user } = useContext(AuthContext)
  const socket = useContext(SocketContext)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!socket || !user) return

    // Listen for new messages to update unread count
    socket.on("receiveMessage", (message) => {
      if (message.senderId === userId) {
        setUnreadCount((prev) => prev + 1)
      }
    })

    // Fetch unread count on mount
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/messages/unread/${userId}`, {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          setUnreadCount(data.count)
        }
      } catch (err) {
        console.error("Error fetching unread count:", err)
      }
    }

    fetchUnreadCount()

    return () => {
      socket.off("receiveMessage")
    }
  }, [socket, user, userId])

  const handleStartChat = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/messages/conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          participantId: userId,
          itemId,
          initialMessage: `Hi, I'm interested in your item: ${itemName}`,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to start conversation")
      }

      setUnreadCount(0)
    } catch (err) {
      console.error("Error starting chat:", err)
    }
  }

  return (
    <Link to="/chat" className="chat-button" onClick={handleStartChat} title="Chat with seller">
      <MessageCircle size={20} />
      {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
    </Link>
  )
}

export default ChatButton
