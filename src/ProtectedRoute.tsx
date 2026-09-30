import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

export const ProtectedRoute: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-3 border-harvest-olive border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-headline text-lg font-bold text-charred-soil">
          Connecting to FarmHelper...
        </p>
        <p className="text-xs text-umber-brown mt-1">Verifying secure Firebase farmer credentials</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
