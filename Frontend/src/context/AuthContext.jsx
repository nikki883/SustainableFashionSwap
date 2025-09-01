import { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  //fetching user bhaiiiiiiiiiiiiiii
  useEffect(() => {
    let isMounted = true;
  
    const fetchUser = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
          method: "GET",
          credentials: "include", // Send cookies
        });
  
        if (response.status === 401) {
          if (isMounted) setUser(null);
          return;
        }
  
        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }
  
        const data = await response.json();
        if (isMounted) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Auth check failed:", error); 
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
  
    fetchUser();
  
    return () => {
      isMounted = false;
    };
  }, []);
  

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
   
      const data = await response.json();
  
      if (response.ok) {
        setUser(data.user);
      } else {
        // Catch both `message` or `error` keys returned by backend
        throw new Error(data.message || data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };
  
  

  // Logout function
  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      window.location.href = "/login"; 
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
