import { Navigate, useLocation } from "react-router-dom";
import Loader from "../ui/Loader";
import { useAuth } from "../../hooks/useAuth";

function ProtectedRoute({ children }) {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <Loader />;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (!profile) return <Navigate to="/admin/login" replace state={{ authError: "Tu usuario no está vinculado a un negocio." }} />;
  return children;
}

export default ProtectedRoute;
