import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function RequireHost({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/host/login?next=${next}`} replace />;
  }
  if (!profile?.is_host) {
    return <Navigate to="/host/upgrade" replace />;
  }
  return <>{children}</>;
}
