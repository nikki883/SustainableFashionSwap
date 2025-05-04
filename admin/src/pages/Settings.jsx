import { useState } from "react"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import MainLayout from "../components/Layout/MainLayout"
import "../styles/Settings.css"

const Settings = () => {
  const { admin } = useAuth()
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [message, setMessage] = useState({ text: "", type: "" })

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setMessage({ text: "", type: "" })

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: "New passwords do not match", type: "error" })
      return
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({
        text: "New password must be at least 8 characters long",
        type: "error",
      })
      return
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/auth/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { withCredentials: true },
      )

      setMessage({ text: "Password changed successfully", type: "success" })
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (err) {
      setMessage({
        text: err.response?.data?.error || "Failed to change password",
        type: "error",
      })
    }
  }

  return (
    <MainLayout title="Settings">
      <div className="settings-container">
        <div className="settings-section">
          <h2>Account Information</h2>
          <div className="account-info">
            <div className="info-group">
              <label>Name</label>
              <p>{admin?.name}</p>
            </div>
            <div className="info-group">
              <label>Email</label>
              <p>{admin?.email}</p>
            </div>
            <div className="info-group">
              <label>Role</label>
              <p>{admin?.role}</p>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Change Password</h2>
          {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
          <form onSubmit={handleChangePassword} className="password-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <button type="submit" className="change-password-btn">
              Change Password
            </button>
          </form>
        </div>

        <div className="settings-section">
          <h2>System Settings</h2>
          <div className="system-settings">
            <div className="setting-group">
              <label>Email Notifications</label>
              <div className="toggle-switch">
                <input type="checkbox" id="email-notifications" />
                <label htmlFor="email-notifications"></label>
              </div>
            </div>
            <div className="setting-group">
              <label>Dark Mode</label>
              <div className="toggle-switch">
                <input type="checkbox" id="dark-mode" />
                <label htmlFor="dark-mode"></label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Settings
