import { Suspense, lazy } from "react"
import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import SocketProvider from "./context/SocketContext"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

// Components
import ProtectedRoute from "./components/ProtectedRoute"
import Navbar from "./components/Navbar/Navbar"
import Footer from "./components/Footer/Footer"
import LoadingSpinner from "./components/LoadingSpinner"


// Lazy-loaded components
import SupportForm from "./pages/SupportForm";
const Home = lazy(() => import("./pages/Home"))
const ItemListing = lazy(() => import("./pages/ItemListing"))
const Login = lazy(() => import("./pages/Login"))
const Register = lazy(() => import("./pages/Register"))
const AddItem = lazy(() => import("./pages/AddItem"))
const Dashboard = lazy(() => import("./pages/Dashboard"))
const SwapHistory = lazy(() => import("./pages/SwapHistory"))
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"))
const Settings = lazy(() => import("./pages/Settings"))
const SearchResults = lazy(() => import("./pages/SearchResults"))
const Chat = lazy(() => import("./pages/Chat"))
const SwapRequestPage = lazy(() => import("./pages/SwapRequestPage"))
const ItemDetails = lazy(() => import("./components/ItemDetails"))
const NotFound = lazy(() => import("./pages/NotFound"))

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <div className="app-layout">
          <Navbar />
          <main className="main-content">
          <Suspense fallback={<LoadingSpinner size="large" message="Loading page..." />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/items" element={<ItemListing />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/items/:id" element={<ItemDetails />} />
              <Route path="/users/:id" element={<UserProfilePage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/items" element={<SearchResults />} />
              <Route path="/support" element={<SupportForm />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/add-item" element={<AddItem />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/swap-history" element={<SwapHistory />} />
                <Route path="/swap-requests" element={<SwapRequestPage />} />
                <Route path="/chat" element={<Chat />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
        <ToastContainer position="bottom-right" />
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
 