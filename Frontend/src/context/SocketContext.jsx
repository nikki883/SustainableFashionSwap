import { createContext, useContext, useEffect, useMemo, useState } from "react";
import io from "socket.io-client";

// Create the context
export const SocketContext = createContext(null);

// Custom hook to use the socket context easily
export const useSocket = () => {
  return useContext(SocketContext);
};

export default function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  // Memoize socket instance
  const socketInstance = useMemo(() => {
    return io("http://localhost:5000", {
      withCredentials: true,
      reconnectionAttempts: 5,     // Retry connection 5 times
      reconnectionDelay: 1000,     // 1 second between retries
    });
  }, []);

  useEffect(() => {
    setSocket(socketInstance);

    // Debugging events (optional, great during dev)
    socketInstance.on("connect", () => {
      console.log("✅ Socket connected:", socketInstance.id);
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    return () => {
      socketInstance.disconnect();
      console.log("🔌 Socket connection closed");
    };
  }, [socketInstance]);

  // Prevent rendering children until socket is ready
  if (!socket) return null;

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

