import { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import AuthContext from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import {
  Send,
  Paperclip,
  MoreVertical,
  ArrowLeft,
  ImageIcon,
  File,
} from "lucide-react";
import "./Chat.css";

const Chat = () => {
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const messagesEndRef = useRef(null);
  const [showMobileConversations, setShowMobileConversations] = useState(true);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      console.log("fetching----------------------00");
      try {
        const response = await fetch(
          "http://localhost:5000/api/messages/conversations",
          {
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("Failed to fetch conversations");

        const data = await response.json();
        setConversations(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setError("Failed to load conversations");
        setLoading(false);
      }
    };

    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Fetch messages for active conversation
  useEffect(() => {
    const fetchMessages = async () => {
      console.log("fetching----------------------00=");

      if (!activeConversation) return;

      try {
        const response = await fetch(
          `http://localhost:5000/api/messages/${activeConversation._id}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("Failed to fetch messages");

        const data = await response.json();
        setMessages(data);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages");
      }
    };

    if (activeConversation) {
      fetchMessages();
      setShowMobileConversations(false);
    }
  }, [activeConversation]);

  // Socket.io event listeners
  useEffect(() => {
    if (!socket || !user) return;

    // Register user with socket
    socket.emit("register", user._id);

    // Listen for new messages
    socket.on("receiveMessage", (message) => {
      if (
        activeConversation &&
        (message.senderId === activeConversation.participant._id ||
          message.receiverId === activeConversation.participant._id)
      ) {
        setMessages((prev) => [...prev, message]);
      }

      // Update conversation list
      setConversations((prev) => {
        const updatedConversations = [...prev];
        const conversationIndex = updatedConversations.findIndex(
          (conv) =>
            conv.participant._id === message.senderId ||
            conv.participant._id === message.receiverId
        );

        if (conversationIndex !== -1) {
          const updatedConversation = {
            ...updatedConversations[conversationIndex],
            lastMessage: message.text,
            updatedAt: new Date().toISOString(),
            unreadCount:
              activeConversation &&
              activeConversation.participant._id === message.senderId
                ? 0
                : (updatedConversations[conversationIndex].unreadCount || 0) +
                  1,
          };

          updatedConversations.splice(conversationIndex, 1);
          updatedConversations.unshift(updatedConversation);
        }

        return updatedConversations;
      });
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [socket, user, activeConversation]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const messageData = {
      senderId: user._id,
      receiverId: activeConversation.participant._id,
      text: newMessage,
    };

    // Emit message to server
    socket.emit("sendMessage", messageData);

    // Optimistically add message to UI
    setMessages((prev) => [
      ...prev,
      {
        ...messageData,
        _id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      },
    ]);

    setNewMessage("");
  };

  const handleFileUpload = async (file, type) => {
    if (!file || !activeConversation) return;

    setUploading(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "chat_attachments");

      // Upload to Cloudinary
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dgmeakxlk/auto/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload file");
      }

      // Create message with attachment
      const fileUrl = data.secure_url;
      const fileName = file.name;
      const fileSize = file.size;

      const messageText =
        type === "image"
          ? `[Image] ${fileName}`
          : `[File] ${fileName} (${(fileSize / 1024).toFixed(1)} KB)`;

      const messageData = {
        senderId: user._id,
        receiverId: activeConversation.participant._id,
        text: messageText,
        attachment: {
          type,
          url: fileUrl,
          name: fileName,
          size: fileSize,
        },
      };

      // Send message with attachment
      socket.emit("sendMessage", messageData);

      // Optimistically add message to UI
      setMessages((prev) => [
        ...prev,
        {
          ...messageData,
          _id: Date.now().toString(),
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
      setShowAttachmentOptions(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file, "image");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file, "file");
    }
  };

  const selectConversation = (conversation) => {
    setActiveConversation(conversation);

    // Mark conversation as read
    setConversations((prev) =>
      prev.map((conv) =>
        conv._id === conversation._id ? { ...conv, unreadCount: 0 } : conv
      )
    );
  };

  const backToConversations = () => {
    setShowMobileConversations(true);
  };

  const renderMessageContent = (message) => {
    if (message.attachment) {
      if (message.attachment.type === "image") {
        return (
          <div className="message-attachment image">
            <a
              href={message.attachment.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={message.attachment.url || "/placeholder.svg"}
                alt="Attached image"
              />
            </a>
          </div>
        );
      } else {
        return (
          <div className="message-attachment file">
            <a
              href={message.attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="file-link"
            >
              <File size={24} />
              <div className="file-info">
                <span className="file-name">{message.attachment.name}</span>
                <span className="file-size">
                  {(message.attachment.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </a>
          </div>
        );
      }
    }

    return <p>{message.text}</p>;
  };

  if (loading)
    return <div className="chat-loading">Loading conversations...</div>;
  if (error) return <div className="chat-error">{error}</div>;

  return (
    <div className="chat-container">
      {/* Conversations List */}
      <div
        className={`conversations-list ${
          showMobileConversations ? "show-mobile" : "hide-mobile"
        }`}
      >
        <div className="conversations-header">
          <h2>Messages</h2>
        </div>

        {conversations.length === 0 ? (
          <div className="no-conversations">
            <p>No conversations yet</p>
            <p>Browse items to start chatting with sellers</p>
            <Link to="/items" className="browse-items-btn">
              Browse Items
            </Link>
          </div>
        ) : (
          <ul>
            {conversations.map((conversation) => (
              <li
                key={conversation._id}
                className={`conversation-item ${
                  activeConversation?._id === conversation._id ? "active" : ""
                }`}
                onClick={() => selectConversation(conversation)}
              >
                <div className="conversation-avatar">
                  <img
                    src={
                      conversation.participant?.profilePicture ||
                      "/default-avatar.png"
                    }
                    alt={conversation.participant?.name || "user"}
                  />
                  {conversation.unreadCount > 0 && (
                    <span className="unread-badge">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
                <div className="conversation-info">
                  <div className="conversation-name-time">
                    <h3>{conversation.participant?.name || "user"}</h3>
                    <span className="conversation-time">
                      {formatDistanceToNow(new Date(conversation.updatedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="conversation-preview">
                    {conversation.lastMessage}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chat Messages */}
      <div
        className={`chat-messages ${
          !showMobileConversations ? "show-mobile" : "hide-mobile"
        }`}
      >
        {activeConversation ? (
          <>
            <div className="chat-header">
              <button className="back-button" onClick={backToConversations}>
                <ArrowLeft size={20} />
              </button>
              <div className="chat-user-info">

                <img
                  src={
                    activeConversation.participant?.profilePicture ||
                    "/default-avatar.png"
                  }
                  alt={activeConversation.participant?.name || "User"}
                />
                <div>
                  <h3>
                    {activeConversation.participant?.name ||
                      "may delete account"}
                  </h3>
                  <span className="user-status">
                    {activeConversation.participant?.lastActive
                      ? `Last seen ${formatDistanceToNow(
                          new Date(activeConversation.participant.lastActive),
                          {
                            addSuffix: true,
                          }
                        )}`
                      : "Offline"}
                  </span>
                </div>
              </div>
              <button className="more-options">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <p>No messages yet</p>
                  <p>Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`message ${
                      message.senderId === user._id ? "sent" : "received"
                    }`}
                  >
                    <div className="message-content">
                      {renderMessageContent(message)}
                      <span className="message-time">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="message-input" onSubmit={handleSendMessage}>
              <div className="attachment-container">
                <button
                  type="button"
                  className="attach-button"
                  onClick={() =>
                    setShowAttachmentOptions(!showAttachmentOptions)
                  }
                >
                  <Paperclip size={20} />
                </button>

                {showAttachmentOptions && (
                  <div className="attachment-options">
                    <button
                      type="button"
                      className="attachment-option"
                      onClick={() => imageInputRef.current.click()}
                    >
                      <ImageIcon size={20} />
                      <span>Image</span>
                    </button>
                    <button
                      type="button"
                      className="attachment-option"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <File size={20} />
                      <span>File</span>
                    </button>
                  </div>
                )}

                <input
                  type="file"
                  ref={imageInputRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageSelect}
                />

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />
              </div>

              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={uploading}
              />

              <button
                type="submit"
                className="send-button"
                disabled={!newMessage.trim() || uploading}
              >
                {uploading ? "Uploading..." : <Send size={20} />}
              </button>
            </form>
          </>
        ) : (
          <div className="no-conversation-selected">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
