import { createContext, useState, useContext, useEffect } from "react"
import axios from "axios"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/auth/profile`, {
          withCredentials: true,
        })

        if (response.data.admin) {
          setAdmin(response.data.admin)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        setAdmin(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = (adminData) => {
    setAdmin(adminData)
  }

  const logout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/auth/logout`, {}, { withCredentials: true })
      setAdmin(null)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return <AuthContext.Provider value={{ admin, login, logout, loading }}>{children}</AuthContext.Provider>
}
