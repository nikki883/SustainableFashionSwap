// import { useState, useEffect } from "react"
// import axios from "axios"
// import { Users, ShoppingBag, Repeat, DollarSign, AlertTriangle } from "lucide-react"
// import MainLayout from "../components/Layout/MainLayout"
// import "../styles/Dashboard.css"

// // Chart components would be imported here
// // import { LineChart, BarChart } from "../components/Charts";

// const Dashboard = () => {
//   const [stats, setStats] = useState(null)
//   const [activity, setActivity] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState("")

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         const [statsRes, activityRes] = await Promise.all([
//           axios.get(`${import.meta.env.VITE_API_URL}/api/admin/dashboard/stats`, {
//             withCredentials: true,
//           }),
//           axios.get(`${import.meta.env.VITE_API_URL}/api/admin/dashboard/activity`, {
//             withCredentials: true,
//           }),
//         ])

//         setStats(statsRes.data)
//         setActivity(activityRes.data)
//       } catch (err) {
//         console.error("Error fetching dashboard data:", err)
//         setError("Failed to load dashboard data")
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchDashboardData()
//   }, [])

//   if (loading) {
//     return (
//       <MainLayout title="Dashboard">
//         <div className="loading">Loading dashboard data...</div>
//       </MainLayout>
//     )
//   }

//   if (error) {
//     return (
//       <MainLayout title="Dashboard">
//         <div className="error">{error}</div>
//       </MainLayout>
//     )
//   }

//   return (
//     <MainLayout title="Dashboard">
//       <div className="dashboard-container">
//         {/* Stats Cards */}
//         <div className="stats-cards">
//           <div className="stat-card">
//             <div className="stat-icon users">
//               <Users size={24} />
//             </div>
//             <div className="stat-content">
//               <h3>Total Users</h3>
//               <p className="stat-value">{stats?.users?.total || 0}</p>
//               <p className="stat-label">{stats?.users?.active || 0} active in last 30 days</p>
//             </div>
//           </div>

//           <div className="stat-card">
//             <div className="stat-icon items">
//               <ShoppingBag size={24} />
//             </div>
//             <div className="stat-content">
//               <h3>Total Items</h3>
//               <p className="stat-value">{stats?.items?.total || 0}</p>
//               <p className="stat-label">{stats?.items?.available || 0} available</p>
//             </div>
//           </div>

//           <div className="stat-card">
//             <div className="stat-icon swaps">
//               <Repeat size={24} />
//             </div>
//             <div className="stat-content">
//               <h3>Swaps</h3>
//               <p className="stat-value">{stats?.transactions?.swaps?.total || 0}</p>
//               <p className="stat-label">{stats?.transactions?.swaps?.completed || 0} completed</p>
//             </div>
//           </div>

//           <div className="stat-card">
//             <div className="stat-icon buys">
//               <DollarSign size={24} />
//             </div>
//             <div className="stat-content">
//               <h3>Purchases</h3>
//               <p className="stat-value">{stats?.transactions?.buys?.total || 0}</p>
//               <p className="stat-label">{stats?.transactions?.buys?.completed || 0} completed</p>
//             </div>
//           </div>
//         </div>

//         {/* Charts Section */}
//         <div className="charts-section">
//           <div className="chart-container">
//             <h3>User Registrations (Last 7 Days)</h3>
//             <div className="chart">
//               {/* <LineChart data={stats?.users?.newRegistrations} /> */}
//               <p className="chart-placeholder">User registration chart would be here</p>
//             </div>
//           </div>

//           <div className="chart-container">
//             <h3>Transactions (Last 7 Days)</h3>
//             <div className="chart">
//               {/* <BarChart data={stats?.transactions?.timeline} /> */}
//               <p className="chart-placeholder">Transactions chart would be here</p>
//             </div>
//           </div>
//         </div>

//         {/* Recent Activity Section */}
//         <div className="recent-activity">
//           <h3>Recent Activity</h3>

//           <div className="activity-tabs">
//             <button className="active">All</button>
//             <button>Users</button>
//             <button>Items</button>
//             <button>Transactions</button>
//           </div>

//           <div className="activity-list">
//             {activity?.recentUsers?.slice(0, 5).map((user) => (
//               <div className="activity-item" key={user._id}>
//                 <div className="activity-icon users">
//                   <Users size={16} />
//                 </div>
//                 <div className="activity-content">
//                   <p>
//                     New user registered: <strong>{user.name}</strong>
//                   </p>
//                   <span className="activity-time">{new Date(user.createdAt).toLocaleString()}</span>
//                 </div>
//               </div>
//             ))}

//             {activity?.recentItems?.slice(0, 5).map((item) => (
//               <div className="activity-item" key={item._id}>
//                 <div className="activity-icon items">
//                   <ShoppingBag size={16} />
//                 </div>
//                 <div className="activity-content">
//                   <p>
//                     New item added: <strong>{item.name}</strong> by {item.owner?.name}
//                   </p>
//                   <span className="activity-time">{new Date(item.createdAt).toLocaleString()}</span>
//                 </div>
//               </div>
//             ))}

//             {activity?.recentSwaps?.slice(0, 3).map((swap) => (
//               <div className="activity-item" key={swap._id}>
//                 <div className="activity-icon swaps">
//                   <Repeat size={16} />
//                 </div>
//                 <div className="activity-content">
//                   <p>
//                     Swap request: <strong>{swap.requester?.name}</strong> requested{" "}
//                     <strong>{swap.requestedItem?.name}</strong> from {swap.owner?.name}
//                   </p>
//                   <span className="activity-time">{new Date(swap.createdAt).toLocaleString()}</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Issues Requiring Attention */}
//         <div className="issues-section">
//           <h3>Issues Requiring Attention</h3>

//           <div className="issues-list">
//             {stats?.reviews?.reported > 0 && (
//               <div className="issue-item">
//                 <div className="issue-icon">
//                   <AlertTriangle size={20} />
//                 </div>
//                 <div className="issue-content">
//                   <h4>{stats.reviews.reported} Reported Reviews</h4>
//                   <p>Reviews have been flagged for inappropriate content</p>
//                 </div>
//                 <button className="issue-action">Review</button>
//               </div>
//             )}

//             {stats?.transactions?.swaps?.pending > 0 && (
//               <div className="issue-item">
//                 <div className="issue-icon">
//                   <Repeat size={20} />
//                 </div>
//                 <div className="issue-content">
//                   <h4>{stats.transactions.swaps.pending} Pending Swaps</h4>
//                   <p>Swap requests awaiting approval</p>
//                 </div>
//                 <button className="issue-action">View</button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   )
// }

// export default Dashboard

// pages/Dashboard.jsx (updated with charts)
import { useState, useEffect } from "react"
import axios from "axios"
import { Users, ShoppingBag, Repeat, DollarSign, AlertTriangle } from 'lucide-react'
import MainLayout from "../components/Layout/MainLayout"
import UserRegistrationChart from "../components/Charts/UserRegistrationChart"
import TransactionsChart from "../components/Charts/TransactionsChart"
import "../styles/Dashboard.css"

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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

          <div className="stat-card">
            <div className="stat-icon buys">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <h3>Purchases</h3>
              <p className="stat-value">{stats?.transactions?.buys?.total || 0}</p>
              <p className="stat-label">{stats?.transactions?.buys?.completed || 0} completed</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-container">
            <h3>User Registrations (Last 7 Days)</h3>
            <div className="chart">
              {stats?.users?.newRegistrations && (
                <UserRegistrationChart data={stats.users.newRegistrations} />
              )}
            </div>
          </div>

          <div className="chart-container">
            <h3>Transactions (Last 7 Days)</h3>
            <div className="chart">
              {stats?.transactions?.timeline && (
                <TransactionsChart data={stats.transactions.timeline} />
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="recent-activity">
          <h3>Recent Activity</h3>

          <div className="activity-tabs">
            <button className="active">All</button>
            <button>Users</button>
            <button>Items</button>
            <button>Transactions</button>
          </div>

          <div className="activity-list">
            {activity?.recentUsers?.slice(0, 5).map((user) => (
              <div className="activity-item" key={user._id}>
                <div className="activity-icon users">
                  <Users size={16} />
                </div>
                <div className="activity-content">
                  <p>
                    New user registered: <strong>{user.name}</strong>
                  </p>
                  <span className="activity-time">{new Date(user.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}

            {activity?.recentItems?.slice(0, 5).map((item) => (
              <div className="activity-item" key={item._id}>
                <div className="activity-icon items">
                  <ShoppingBag size={16} />
                </div>
                <div className="activity-content">
                  <p>
                    New item added: <strong>{item.name}</strong> by {item.owner?.name}
                  </p>
                  <span className="activity-time">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}

            {activity?.recentSwaps?.slice(0, 3).map((swap) => (
              <div className="activity-item" key={swap._id}>
                <div className="activity-icon swaps">
                  <Repeat size={16} />
                </div>
                <div className="activity-content">
                  <p>
                    Swap request: <strong>{swap.requester?.name}</strong> requested{" "}
                    <strong>{swap.requestedItem?.name}</strong> from {swap.owner?.name}
                  </p>
                  <span className="activity-time">{new Date(swap.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
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