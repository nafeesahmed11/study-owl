import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth, UserRole } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

// Flag to temporarily disable forced login while preserving authentication system intact
export const TEMPORARY_DISABLE_FORCE_LOGIN = true;

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-medium">Verifying access...</p>
      </div>
    );
  }

  // Temporary login behavior: if forced login is temporarily disabled, allow access as guest/preview
  if (!user && !TEMPORARY_DISABLE_FORCE_LOGIN) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role restriction (only enforced if user is logged in)
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/app/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

// Dynamic dashboard router that selects exactly ONE dashboard based on user.role
export function RoleBasedDashboard() {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/app/dashboard" replace />;
}

