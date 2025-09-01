import { useState, useEffect } from "react"
import axios from "axios"
import { Users, ShoppingBag, Repeat, AlertTriangle } from "lucide-react"
import MainLayout from "../components/Layout/MainLayout"
import UserRegistrationChart from "../components/Charts/UserRegistrationChart"
import TransactionsChart from "../components/Charts/TransactionsChart"
import "../styles/Dashboard.css"

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [activeTab, setActiveTab] = useState("all")
  const [filteredActivity, setFilteredActivity] = useState([])

  // Process activity data into a unified format
  useEffect(() => {
    if (!activity) return

    const processedActivity = []

    // Process users
    if (activity.recentUsers) {
      activity.recentUsers.forEach((user) => {
        processedActivity.push({
          id: `user-${user._id}`,
          type: "users",
          message: `New user registered: ${user.name}`,
          time: new Date(user.createdAt).toLocaleString(),
          data: user,
        })
      })
    }

    // Process items
    if (activity.recentItems) {
      activity.recentItems.forEach((item) => {
        processedActivity.push({
          id: `item-${item._id}`,
          type: "items",
          message: `New item added: ${item.name} by ${item.owner?.name || "Unknown"}`,
          time: new Date(item.createdAt).toLocaleString(),
          data: item,
        })
      })
    }

    // Process swaps
    if (activity.recentSwaps) {
      activity.recentSwaps.forEach((swap) => {
        processedActivity.push({
          id: `swap-${swap._id}`,
          type: "swaps",
          message: `Swap request: ${swap.requester?.name || "Someone"} requested ${swap.requestedItem?.name || "an item"} from ${swap.owner?.name || "someone"}`,
          time: new Date(swap.createdAt).toLocaleString(),
          data: swap,
        })
      })
    }

    // Sort by date (newest first)
    processedActivity.sort((a, b) => new Date(b.time) - new Date(a.time))

    setFilteredActivity(processedActivity)
  }, [activity])

  // Filter activity based on active tab
  useEffect(() => {
    if (!activity) return

    if (activeTab === "all") {
      // No need to reprocess, just use the already processed data
      const allActivity = []

      if (activity.recentUsers) {
        activity.recentUsers.forEach((user) => {
          allActivity.push({
            id: `user-${user._id}`,
            type: "users",
            message: `New user registered: ${user.name}`,
            time: new Date(user.createdAt).toLocaleString(),
            data: user,
          })
        })
      }

      if (activity.recentItems) {
        activity.recentItems.forEach((item) => {
          allActivity.push({
            id: `item-${item._id}`,
            type: "items",
            message: `New item added: ${item.name} by ${item.owner?.name || "Unknown"}`,
            time: new Date(item.createdAt).toLocaleString(),
            data: item,
          })
        })
      }

      if (activity.recentSwaps) {
        activity.recentSwaps.forEach((swap) => {
          allActivity.push({
            id: `swap-${swap._id}`,
            type: "swaps",
            message: `Swap request: ${swap.requester?.name || "Someone"} requested ${swap.requestedItem?.name || "an item"} from ${swap.owner?.name || "someone"}`,
            time: new Date(swap.createdAt).toLocaleString(),
            data: swap,
          })
        })
      }

      // Sort by date (newest first)
      allActivity.sort((a, b) => new Date(b.time) - new Date(a.time))

      setFilteredActivity(allActivity)
    } else if (activeTab === "users" && activity.recentUsers) {
      const userActivity = activity.recentUsers.map((user) => ({
        id: `user-${user._id}`,
        type: "users",
        message: `New user registered: ${user.name}`,
        time: new Date(user.createdAt).toLocaleString(),
        data: user,
      }))
      setFilteredActivity(userActivity)
    } else if (activeTab === "items" && activity.recentItems) {
      const itemActivity = activity.recentItems.map((item) => ({
        id: `item-${item._id}`,
        type: "items",
        message: `New item added: ${item.name} by ${item.owner?.name || "Unknown"}`,
        time: new Date(item.createdAt).toLocaleString(),
        data: item,
      }))
      setFilteredActivity(itemActivity)
    } else if (activeTab === "transactions" && activity.recentSwaps) {
      const swapActivity = activity.recentSwaps.map((swap) => ({
        id: `swap-${swap._id}`,
        type: "swaps",
        message: `Swap request: ${swap.requester?.name || "Someone"} requested ${swap.requestedItem?.name || "an item"} from ${swap.owner?.name || "someone"}`,
        time: new Date(swap.createdAt).toLocaleString(),
        data: swap,
      }))
      setFilteredActivity(swapActivity)
    } else {
      setFilteredActivity([])
    }
  }, [activeTab, activity])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/admin/dashboard/stats`, {
            withCredentials: true,
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/admin/dashboard/activity`, {
            withCredentials: true,
          }),
        ])

        setStats(statsRes.data)
        setActivity(activityRes.data)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <MainLayout title="Dashboard">
        <div className="loading">Loading dashboard data...</div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout title="Dashboard">
        <div className="error">{error}</div>
      </MainLayout>
    )
  }

  return (
    <MainLayout title="Dashboard">
      <div className="dashboard-container">
        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon users">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3>Total Users</h3>
              <p className="stat-value">{stats?.users?.total || 0}</p>
              <p className="stat-label">{stats?.users?.active || 0} active in last 30 days</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon items">
              <ShoppingBag size={24} />
            </div>
            <div className="stat-content">
              <h3>Total Items</h3>
              <p className="stat-value">{stats?.items?.total || 0}</p>
              <p className="stat-label">{stats?.items?.available || 0} available</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon swaps">
              <Repeat size={24} />
            </div>
            <div className="stat-content">
              <h3>Swaps</h3>
              <p className="stat-value">{stats?.transactions?.swaps?.total || 0}</p>
              <p className="stat-label">{stats?.transactions?.swaps?.completed || 0} completed</p>
            </div>
          </div>

        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-container">
            <h3>User Registrations (Last 7 Days)</h3>
            <div className="chart">
              {stats?.users?.newRegistrations && <UserRegistrationChart data={stats.users.newRegistrations} />}
            </div>
          </div>

          <div className="chart-container">
            <h3>Transactions (Last 7 Days)</h3>
            <div className="chart">
              {stats?.transactions?.timeline && <TransactionsChart data={stats.transactions.timeline} />}
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="recent-activity">
          <h3>Recent Activity</h3>

          <div className="activity-tabs">
            <button className={activeTab === "all" ? "active" : ""} onClick={() => setActiveTab("all")}>
              All
            </button>
            <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>
              Users
            </button>
            <button className={activeTab === "items" ? "active" : ""} onClick={() => setActiveTab("items")}>
              Items
            </button>
            <button
              className={activeTab === "transactions" ? "active" : ""}
              onClick={() => setActiveTab("transactions")}
            >
              Transactions
            </button>
          </div>

          <div className="activity-list">
            {filteredActivity.length > 0 ? (
              filteredActivity.map((item) => (
                <div className="activity-item" key={item.id}>
                  <div className={`activity-icon ${item.type}`}>
                    {item.type === "users" && <Users size={16} />}
                    {item.type === "items" && <ShoppingBag size={16} />}
                    {item.type === "swaps" && <Repeat size={16} />}
                  </div>
                  <div className="activity-content">
                    <p>{item.message}</p>
                    <span className="activity-time">{item.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-activity">No activity found</div>
            )}
          </div>
        </div>

        {/* Issues Requiring Attention */}
        <div className="issues-section">
          <h3>Issues Requiring Attention</h3>

          <div className="issues-list">
            {stats?.reviews?.reported > 0 && (
              <div className="issue-item">
                <div className="issue-icon">
                  <AlertTriangle size={20} />
                </div>
                <div className="issue-content">
                  <h4>{stats.reviews.reported} Reported Reviews</h4>
                  <p>Reviews have been flagged for inappropriate content</p>
                </div>
                <button className="issue-action">Review</button>
              </div>
            )}

            {stats?.transactions?.swaps?.pending > 0 && (
              <div className="issue-item">
                <div className="issue-icon">
                  <Repeat size={20} />
                </div>
                <div className="issue-content">
                  <h4>{stats.transactions.swaps.pending} Pending Swaps</h4>
                  <p>Swap requests awaiting approval</p>
                </div>
                <button className="issue-action">View</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Dashboard
