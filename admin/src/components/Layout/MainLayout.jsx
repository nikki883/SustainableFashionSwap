import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Sidebar from "./Sidebar"
import Header from "./Header"
import "../../styles/MainLayout.css"

const MainLayout = ({ children, title }) => {
  const { admin, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !admin) {
      navigate("/login")
    }
  }, [admin, loading, navigate])

  if (loading) {
    return <div className="loading-screen">Loading...</div>
  }

  if (!admin) {
    return null // Will redirect to login
  }

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <Header title={title} />
        <main className="content-area">{children}</main>
      </div>
    </div>
  )
}

export default MainLayout
