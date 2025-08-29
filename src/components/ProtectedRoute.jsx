import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, redirectTo = '/login', requireAuth = true }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="bg-black/20 backdrop-blur-md rounded-3xl p-8 border border-white/20">
          <div className="flex items-center justify-center space-x-2">
            <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-white">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // If requireAuth is true, user must be authenticated to access
  if (requireAuth && !isAuthenticated()) {
    return <Navigate to={redirectTo} replace />;
  }

  // If requireAuth is false, user must NOT be authenticated to access (for login/register pages)
  if (!requireAuth && isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
