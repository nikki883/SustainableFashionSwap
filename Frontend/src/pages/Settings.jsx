// import { useContext, useState, useEffect } from "react"
// import AuthContext from "../context/AuthContext"
// import PasswordUpdateForm from "../components/PasswordUpdateForm"
// import "./Settings.css"

// const Settings = () => {
//   const { setUser, user, logout } = useContext(AuthContext)
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     location: "",
//   })
//   const [emailChangeData, setEmailChangeData] = useState({
//     newEmail: "",
//     password: "",
//   })
//   const [showEmailChange, setShowEmailChange] = useState(false)
//   const [message, setMessage] = useState({ text: "", type: "" })

//   useEffect(() => {
//     if (user) {
//       setFormData({
//         name: user.name || "",
//         location: user.location || "",
//       })
//       setEmailChangeData({
//         ...emailChangeData,
//         newEmail: user.email || "",
//       })
//     }
//   }, [user])

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value })
//   }

//   const handleEmailChange = (e) => {
//     setEmailChangeData({ ...emailChangeData, [e.target.name]: e.target.value })
//   }

//   const handleUpdate = async (e) => {
//     e.preventDefault()
//     setMessage({ text: "", type: "" })

//     try {
//       const res = await fetch(`http://localhost:5000/api/auth/update`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(formData),
//       })
//       const data = await res.json()

//       if (res.ok) {
//         setMessage({ text: "Profile updated successfully!", type: "success" })
//         if (data.user) {
//           setUser(data.user)
//         }
//       } else {
//         setMessage({ text: data.message || "Update failed", type: "error" })
//       }
//     } catch (err) {
//       console.error("Update failed:", err)
//       setMessage({ text: "Server error. Please try again later.", type: "error" })
//     }
//   }

//   const handleEmailUpdate = async (e) => {
//     e.preventDefault()
//     setMessage({ text: "", type: "" })

//     if (emailChangeData.newEmail === user.email) {
//       setMessage({ text: "New email is the same as current email", type: "error" })
//       return
//     }

//     try {
//       const res = await fetch(`http://localhost:5000/api/auth/update-email`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(emailChangeData),
//       })
//       const data = await res.json()

//       if (res.ok) {
//         setMessage({ text: "Email updated successfully! You may need to verify your new email.", type: "success" })
//         setShowEmailChange(false)
//         if (data.user) {
//           setUser({ ...user, ...data.user })
//         }
//       } else {
//         setMessage({ text: data.message || "Email update failed", type: "error" })
//       }
//     } catch (err) {
//       console.error("Email update failed:", err)
//       setMessage({ text: "Server error. Please try again later.", type: "error" })
//     }
//   }

//   const handleDeleteAccount = async () => {
//     if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return

//     try {
//       const res = await fetch(`http://localhost:5000/api/auth/delete`, {
//         method: "DELETE",
//         credentials: "include",
//       })
//       const data = await res.json()

//       if (res.ok) {
//         alert(data.message)
//         logout()
//       } else {
//         setMessage({ text: data.error || "Account deletion failed", type: "error" })
//       }
//     } catch (err) {
//       console.error("Deletion failed:", err)
//       setMessage({ text: "Server error. Please try again later.", type: "error" })
//     }
//   }

//   return (
//     <div className="settings-container">
//       <h2>Account Settings</h2>

//       {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

//       <div className="settings-section">
//         <h3>Profile Information</h3>
//         <form onSubmit={handleUpdate} className="settings-form">
//           <div className="form-group">
//             <label htmlFor="name">Name</label>
//             <input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" />
//           </div>

//           <div className="form-group">
//             <label htmlFor="location">Location</label>
//             <input
//               id="location"
//               name="location"
//               value={formData.location}
//               onChange={handleChange}
//               placeholder="Your location"
//             />
//           </div>

//           <button type="submit" className="update-btn">
//             Update Profile
//           </button>
//         </form>
//       </div>

//       <div className="settings-section">
//         <h3>Email Settings</h3>
//         <div className="current-email">
//           <p>
//             <strong>Current Email:</strong> {user?.email}
//           </p>
//           <button className="change-email-btn" onClick={() => setShowEmailChange(!showEmailChange)}>
//             {showEmailChange ? "Cancel" : "Change Email"}
//           </button>
//         </div>

//         {showEmailChange && (
//           <form onSubmit={handleEmailUpdate} className="settings-form">
//             <div className="form-group">
//               <label htmlFor="newEmail">New Email</label>
//               <input
//                 id="newEmail"
//                 name="newEmail"
//                 type="email"
//                 value={emailChangeData.newEmail}
//                 onChange={handleEmailChange}
//                 placeholder="New email address"
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="password">Current Password</label>
//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 value={emailChangeData.password}
//                 onChange={handleEmailChange}
//                 placeholder="Enter your password"
//                 required
//               />
//             </div>

//             <button type="submit" className="update-btn">
//               Update Email
//             </button>
//           </form>
//         )}
//       </div>

//       <div className="settings-section">
//         <h3>Password</h3>
//         <PasswordUpdateForm />
//       </div>

//       <div className="settings-section danger-zone">
//         <h3>Danger Zone</h3>
//         <p>Once you delete your account, there is no going back. Please be certain.</p>
//         <button onClick={handleDeleteAccount} className="delete-account-btn">
//           Delete My Account
//         </button>
//       </div>
//     </div>
//   )
// }

// export default Settings
"use client"

import { useContext, useState, useEffect, useRef } from "react"
import AuthContext from "../context/AuthContext"
import PasswordUpdateForm from "../components/PasswordUpdateForm"
import { toast } from "react-toastify"
import "./Settings.css"

const Settings = () => {
  const { setUser, user, logout } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
  })
  const [emailChangeData, setEmailChangeData] = useState({
    newEmail: "",
    password: "",
  })
  const [showEmailChange, setShowEmailChange] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })
  const [profilePic, setProfilePic] = useState(null)
  const [profilePicPreview, setProfilePicPreview] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        location: user.location || "",
      })
      setProfilePicPreview(user.profilePic || null)
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

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfilePic(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadProfilePic = async () => {
    if (!profilePic) return null

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("profilePic", profilePic)

      const response = await fetch(`${API_URL}/api/auth/upload-profile-picture`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload profile picture")
      }

      // Update user in context with new profile pic
      setUser((prevUser) => ({
        ...prevUser,
        profilePic: data.profilePic,
      }))

      toast.success("Profile picture updated successfully")
      return data.profilePic
    } catch (error) {
      console.error("Error uploading profile picture:", error)
      toast.error(error.message || "Failed to upload profile picture")
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setMessage({ text: "", type: "" })

    try {
      // Upload profile pic if changed
      if (profilePic) {
        await uploadProfilePic()
      }

      const res = await fetch(`${API_URL}/api/auth/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (res.ok) {
        setMessage({ text: "Profile updated successfully!", type: "success" })
        toast.success("Profile updated successfully!")
        if (data.user) {
          setUser((prevUser) => ({
            ...prevUser,
            ...data.user,
          }))
        }
      } else {
        setMessage({ text: data.message || "Update failed", type: "error" })
        toast.error(data.message || "Update failed")
      }
    } catch (err) {
      console.error("Update failed:", err)
      setMessage({ text: "Server error. Please try again later.", type: "error" })
      toast.error("Server error. Please try again later.")
    }
  }

  const handleEmailUpdate = async (e) => {
    e.preventDefault()
    setMessage({ text: "", type: "" })

    if (emailChangeData.newEmail === user.email) {
      setMessage({ text: "New email is the same as current email", type: "error" })
      toast.error("New email is the same as current email")
      return
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/update-email`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(emailChangeData),
      })
      const data = await res.json()

      if (res.ok) {
        setMessage({ text: "Email updated successfully! You may need to verify your new email.", type: "success" })
        toast.success("Email updated successfully! You may need to verify your new email.")
        setShowEmailChange(false)
        if (data.user) {
          setUser({ ...user, ...data.user })
        }
      } else {
        setMessage({ text: data.message || "Email update failed", type: "error" })
        toast.error(data.message || "Email update failed")
      }
    } catch (err) {
      console.error("Email update failed:", err)
      setMessage({ text: "Server error. Please try again later.", type: "error" })
      toast.error("Server error. Please try again later.")
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return

    try {
      const res = await fetch(`${API_URL}/api/auth/delete`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || "Account deleted successfully")
        logout()
      } else {
        setMessage({ text: data.error || "Account deletion failed", type: "error" })
        toast.error(data.error || "Account deletion failed")
      }
    } catch (err) {
      console.error("Deletion failed:", err)
      setMessage({ text: "Server error. Please try again later.", type: "error" })
      toast.error("Server error. Please try again later.")
    }
  }

  return (
    <div className="settings-container">
      <h2>Account Settings</h2>

      {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

      <div className="settings-section">
        <h3>Profile Information</h3>
        <form onSubmit={handleUpdate} className="settings-form">
          <div className="profile-pic-section">
            <div className="profile-pic-container">
              <img
                src={profilePicPreview || user?.profilePic || "/default-avatar.png"}
                alt="Profile"
                className="profile-pic-preview"
              />
              <div className="profile-pic-actions">
                <button
                  type="button"
                  className="change-pic-btn"
                  onClick={() => fileInputRef.current.click()}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Change Picture"}
                </button>
                {profilePic && (
                  <button type="button" className="upload-pic-btn" onClick={uploadProfilePic} disabled={isUploading}>
                    Upload Now
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleProfilePicChange}
                accept="image/*"
                style={{ display: "none" }}
              />
            </div>
          </div>
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

      {/* <div className="settings-section">
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
      </div> */}

      {/* <div className="settings-section">
        <h3>Password</h3>
        <PasswordUpdateForm />
      </div> */}

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
