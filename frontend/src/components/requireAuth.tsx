// src/components/RequireAuth.tsx
import { useAuth } from '@/contexts/useAuth';
import { Navigate } from 'react-router-dom';
import { JSX } from 'react';

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

const PublicOnly = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};


export default RequireAuth;
