import { useState, useContext } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import AuthContext from "../context/AuthContext"
import "./Login.css"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showResend, setShowResend] = useState(false)

  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setShowResend(false)
    setLoading(true)

    try {
      await login(email, password)
      navigate("/")
    } catch (err) {
      // Since login() throws a simple Error object, we just need the message
      const message = err.message || "Login failed. Please try again."
      setError(message)

      if (message.toLowerCase().includes("verify your email")) {
        setShowResend(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setError("")
    try {
      const res = await axios.post("http://localhost:5000/api/auth/send-otp", { email })
      alert(res.data.message || "OTP resent successfully!")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP")
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to continue to FashionSwap</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-action">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          {showResend && (
            <div className="resend-container">
              <p>Need to verify your email?</p>
              <button type="button" className="btn-text" onClick={handleResendOtp}>
                Resend OTP
              </button>
            </div>
          )}
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
