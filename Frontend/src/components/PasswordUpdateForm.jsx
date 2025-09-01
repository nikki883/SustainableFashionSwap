// import { useState } from "react"

// const PasswordUpdateForm = () => {
//   const [currentPassword, setCurrentPassword] = useState("")
//   const [newPassword, setNewPassword] = useState("")
//   const [confirmNewPassword, setConfirmNewPassword] = useState("")
//   const [errorMessage, setErrorMessage] = useState("")
//   const [successMessage, setSuccessMessage] = useState("")
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   const validatePassword = (password) => {
//     // At least 6 characters, at least one letter and one number
//     const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/
//     return regex.test(password)
//   }

//   const handleChangePassword = async (e) => {
//     e.preventDefault()
//     setErrorMessage("")
//     setSuccessMessage("")

//     // Validate passwords
//     if (newPassword !== confirmNewPassword) {
//       setErrorMessage("New passwords do not match")
//       return
//     }

//     if (!validatePassword(newPassword)) {
//       setErrorMessage("Password must be at least 6 characters long and contain at least one letter and one number")
//       return
//     }

//     setIsSubmitting(true)

//     try {
//       const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/change-password`, {
//         method: "PUT",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
//       })

//       const data = await res.json()

//       if (res.ok) {
//         setSuccessMessage("✅ Password updated successfully")
//         setCurrentPassword("")
//         setNewPassword("")
//         setConfirmNewPassword("")
//       } else {
//         setErrorMessage("❌ " + (data.error || "Failed to update password"))
//       }
//     } catch (err) {
//       console.error("Password update error:", err)
//       setErrorMessage("❌ Server error. Please try again later.")
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   return (
//     <form onSubmit={handleChangePassword} className="settings-form">
//       <div className="form-group">
//         <label htmlFor="currentPassword">Current Password</label>
//         <input
//           id="currentPassword"
//           type="password"
//           value={currentPassword}
//           onChange={(e) => setCurrentPassword(e.target.value)}
//           required
//           placeholder="Enter your current password"
//         />
//       </div>

//       <div className="form-group">
//         <label htmlFor="newPassword">New Password</label>
//         <input
//           id="newPassword"
//           type="password"
//           value={newPassword}
//           onChange={(e) => setNewPassword(e.target.value)}
//           required
//           placeholder="Enter new password"
//         />
//       </div>

//       <div className="form-group">
//         <label htmlFor="confirmNewPassword">Confirm New Password</label>
//         <input
//           id="confirmNewPassword"
//           type="password"
//           value={confirmNewPassword}
//           onChange={(e) => setConfirmNewPassword(e.target.value)}
//           required
//           placeholder="Confirm new password"
//         />
//       </div>

//       {errorMessage && <p className="error-message">{errorMessage}</p>}
//       {successMessage && <p className="success-message">{successMessage}</p>}

//       <button type="submit" className="update-btn" disabled={isSubmitting}>
//         {isSubmitting ? "Updating..." : "Update Password"}
//       </button>
//     </form>
//   )
// }

// export default PasswordUpdateForm


import { useState } from "react"
import { toast } from "react-toastify"

const PasswordUpdateForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  })
  const [message, setMessage] = useState({ text: "", type: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    return regex.test(password)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ text: "", type: "" })

    // Validate passwords
    if (formData.newPassword !== formData.confirmNewPassword) {
      setMessage({ text: "New passwords do not match", type: "error" })
      toast.error("New passwords do not match")
      return
    }

    if (!validatePassword(formData.newPassword)) {
      setMessage({
        text: "Password must be at least 8 characters and include uppercase, lowercase, and numbers",
        type: "error",
      })
      toast.error("Password must be at least 8 characters and include uppercase, lowercase, and numbers")
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (res.ok) {
        setMessage({ text: "Password updated successfully!", type: "success" })
        toast.success("Password updated successfully!")
        // Clear form
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        })
      } else {
        setMessage({ text: data.error || "Password update failed", type: "error" })
        toast.error(data.error || "Password update failed")
      }
    } catch (err) {
      console.error("Password update failed:", err)
      setMessage({ text: "Server error. Please try again later.", type: "error" })
      toast.error("Server error. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="settings-form">
      {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

      <div className="form-group">
        <label htmlFor="currentPassword">Current Password</label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          value={formData.currentPassword}
          onChange={handleChange}
          placeholder="Enter your current password"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="newPassword">New Password</label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={handleChange}
          placeholder="Enter your new password"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirmNewPassword">Confirm New Password</label>
        <input
          id="confirmNewPassword"
          name="confirmNewPassword"
          type="password"
          value={formData.confirmNewPassword}
          onChange={handleChange}
          placeholder="Confirm your new password"
          required
        />
      </div>

      <button type="submit" className="update-btn" disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Update Password"}
      </button>
    </form>
  )
}

export default PasswordUpdateForm
