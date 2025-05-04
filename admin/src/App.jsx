// import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
// import { AuthProvider } from "./context/AuthContext"
// import Login from "./pages/Login"
// import Dashboard from "./pages/Dashboard"
// import Users from "./pages/Users"
// // import UserDetail from "./pages/UserDetail"
// import Items from "./pages/Items"
// // import ItemDetail from "./pages/ItemDetail"
// import Reviews from "./pages/Reviews"
// import Settings from "./pages/Settings"
// // import NotFound from "./pages/NotFound"
// // import "./styles/App.css"

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/users" element={<Users />} />
//           {/* <Route path="/users/:id" element={<UserDetail />} /> */}
//           <Route path="/items" element={<Items />} />
//           {/* <Route path="/items/:id" element={<ItemDetail />} /> */}
//           <Route path="/reviews" element={<Reviews />} />
//           <Route path="/settings" element={<Settings />} />
//           <Route path="/" element={<Dashboard />} />
//           {/* <Route path="*" element={<NotFound />} /> */}
//         </Routes>
//       </Router>
//     </AuthProvider>
//   )
// }

// export default App
// App.jsx (updated with all routes)
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Users from "./pages/Users"
import UserDetail from "./pages/UserDetail"
import Items from "./pages/Items"
import ItemDetail from "./pages/ItemDetail"
import Reviews from "./pages/Reviews"
import Settings from "./pages/Settings"
import NotFound from "./pages/NotFound"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="/items" element={<Items />} />
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App