import { useState } from "react"

const PasswordUpdateForm = () => {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validatePassword = (password) => {
    // At least 6 characters, at least one letter and one number
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/
    return regex.test(password)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")

    // Validate passwords
    if (newPassword !== confirmNewPassword) {
      setErrorMessage("New passwords do not match")
      return
    }

    if (!validatePassword(newPassword)) {
      setErrorMessage("Password must be at least 6 characters long and contain at least one letter and one number")
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccessMessage("✅ Password updated successfully")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmNewPassword("")
      } else {
        setErrorMessage("❌ " + (data.error || "Failed to update password"))
      }
    } catch (err) {
      console.error("Password update error:", err)
      setErrorMessage("❌ Server error. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleChangePassword} className="settings-form">
      <div className="form-group">
        <label htmlFor="currentPassword">Current Password</label>
        <input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          placeholder="Enter your current password"
        />
      </div>

      <div className="form-group">
        <label htmlFor="newPassword">New Password</label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          placeholder="Enter new password"
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirmNewPassword">Confirm New Password</label>
        <input
          id="confirmNewPassword"
          type="password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          required
          placeholder="Confirm new password"
        />
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <button type="submit" className="update-btn" disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Update Password"}
      </button>
    </form>
  )
}

export default PasswordUpdateForm
