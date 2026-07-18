import { Navigate, useLocation } from "react-router-dom";
import Loader from "../ui/Loader";
import { useAuth } from "../../hooks/useAuth";
import { getDefaultAdminPath, hasRole } from "../../utils/permissions";

function ProtectedRoute({ children, roles = null }) {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <Loader />;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (!profile) return <Navigate to="/admin/login" replace state={{ authError: "Tu usuario no esta vinculado a Autoestetica Tucuman." }} />;
  if (profile.active === false) return <Navigate to="/admin/login" replace state={{ authError: "Tu usuario esta bloqueado. Pedile a un owner que reactive tu acceso." }} />;
  if (roles && !hasRole(profile, roles)) return <Navigate to={getDefaultAdminPath(profile)} replace />;
  return children;
}

export default ProtectedRoute;
