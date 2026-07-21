import React from 'react';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  let token = null;
  try {
    token = localStorage.getItem('token');
  } catch {}

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
