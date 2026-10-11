import type { ComponentType } from 'react';
import { Outlet, Navigate, useLocation } from '@/lib/router-compat';
import { SiteHeader, SiteFooter } from './SiteChrome';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Logo size={36} />
        <div className="w-8 h-8 border-2 border-line border-t-ink rounded-full animate-spin" />
      </div>
    </div>
  );
}

export function PublicLayout() {
  const { loading } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">{loading ? <PageLoader /> : <Outlet />}</main>
      <SiteFooter />
    </div>
  );
}

export function RequireAuth({ roles, children: Page }: { roles?: UserRole[]; children: ComponentType }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={user.role === 'customer' ? '/stores' : '/dashboard'} replace />;
  return <Page />;
}
