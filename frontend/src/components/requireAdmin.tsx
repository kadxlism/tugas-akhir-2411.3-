import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { JSX } from "react";

const isAdmin = (user: any) => {
  return (
    user.role === "admin" ||
    user.is_admin === true ||
    user.is_admin === 1 ||
    user.is_admin === "1" ||
    user.is_admin === "true"
  );
};

const RequireAdmin = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log("user di RequireAdmin:", user);

  if (loading) return <div className="p-4 text-center">Checking access...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin(user)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireAdmin;
