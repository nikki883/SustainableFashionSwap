import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p>Loading...</p>; // Prevents flickering

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
