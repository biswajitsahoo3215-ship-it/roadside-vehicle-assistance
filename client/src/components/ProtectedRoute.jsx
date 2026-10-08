import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({
  children,
  allowedRoles
}) {
  const { user, isAuthenticated } =
    useAuth();

  // User is not logged in
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Role restriction
  if (
    allowedRoles &&
    !allowedRoles.includes(user?.role)
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;