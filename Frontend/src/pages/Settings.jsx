import { useContext, useState, useEffect } from "react"
import AuthContext from "../context/AuthContext"
import PasswordUpdateForm from "../components/PasswordUpdateForm"
import "./Settings.css"

const Settings = () => {
  const { setUser, user, logout } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
  })
  const [emailChangeData, setEmailChangeData] = useState({
    newEmail: "",
    password: "",
  })
  const [showEmailChange, setShowEmailChange] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        location: user.location || "",
      })
      setEmailChangeData({
        ...emailChangeData,
        newEmail: user.email || "",
      })
    }
  }, [user])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleEmailChange = (e) => {
    setEmailChangeData({ ...emailChangeData, [e.target.name]: e.target.value })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setMessage({ text: "", type: "" })

    try {
      const res = await fetch("http://localhost:5000/api/auth/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (res.ok) {
        setMessage({ text: "Profile updated successfully!", type: "success" })
        if (data.user) {
          setUser(data.user)
        }
      } else {
        setMessage({ text: data.message || "Update failed", type: "error" })
      }
    } catch (err) {
      console.error("Update failed:", err)
      setMessage({ text: "Server error. Please try again later.", type: "error" })
    }
  }

  const handleEmailUpdate = async (e) => {
    e.preventDefault()
    setMessage({ text: "", type: "" })

    if (emailChangeData.newEmail === user.email) {
      setMessage({ text: "New email is the same as current email", type: "error" })
      return
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/update-email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(emailChangeData),
      })
      const data = await res.json()

      if (res.ok) {
        setMessage({ text: "Email updated successfully! You may need to verify your new email.", type: "success" })
        setShowEmailChange(false)
        if (data.user) {
          setUser({ ...user, ...data.user })
        }
      } else {
        setMessage({ text: data.message || "Email update failed", type: "error" })
      }
    } catch (err) {
      console.error("Email update failed:", err)
      setMessage({ text: "Server error. Please try again later.", type: "error" })
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return

    try {
      const res = await fetch("http://localhost:5000/api/auth/delete", {
        method: "DELETE",
        credentials: "include",
      })
      const data = await res.json()

      if (res.ok) {
        alert(data.message)
        logout()
      } else {
        setMessage({ text: data.error || "Account deletion failed", type: "error" })
      }
    } catch (err) {
      console.error("Deletion failed:", err)
      setMessage({ text: "Server error. Please try again later.", type: "error" })
    }
  }

  return (
    <div className="settings-container">
      <h2>Account Settings</h2>

      {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

      <div className="settings-section">
        <h3>Profile Information</h3>
        <form onSubmit={handleUpdate} className="settings-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Your location"
            />
          </div>

          <button type="submit" className="update-btn">
            Update Profile
          </button>
        </form>
      </div>

      <div className="settings-section">
        <h3>Email Settings</h3>
        <div className="current-email">
          <p>
            <strong>Current Email:</strong> {user?.email}
          </p>
          <button className="change-email-btn" onClick={() => setShowEmailChange(!showEmailChange)}>
            {showEmailChange ? "Cancel" : "Change Email"}
          </button>
        </div>

        {showEmailChange && (
          <form onSubmit={handleEmailUpdate} className="settings-form">
            <div className="form-group">
              <label htmlFor="newEmail">New Email</label>
              <input
                id="newEmail"
                name="newEmail"
                type="email"
                value={emailChangeData.newEmail}
                onChange={handleEmailChange}
                placeholder="New email address"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Current Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={emailChangeData.password}
                onChange={handleEmailChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="update-btn">
              Update Email
            </button>
          </form>
        )}
      </div>

      <div className="settings-section">
        <h3>Password</h3>
        <PasswordUpdateForm />
      </div>

      <div className="settings-section danger-zone">
        <h3>Danger Zone</h3>
        <p>Once you delete your account, there is no going back. Please be certain.</p>
        <button onClick={handleDeleteAccount} className="delete-account-btn">
          Delete My Account
        </button>
      </div>
    </div>
  )
}

export default Settings
