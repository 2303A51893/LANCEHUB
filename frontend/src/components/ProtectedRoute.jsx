
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>

          <p className="text-sm text-slate-500 font-medium">
            Authenticating LanceHub Platform...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
