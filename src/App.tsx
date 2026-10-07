import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SiteHeader, SiteFooter } from './components/SiteChrome';
import { lazy, Suspense, type ComponentType } from 'react';
import type { UserRole } from './types';
import { Logo } from './components/Logo';

// Lazy-load pages for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const ForStoresPage = lazy(() => import('./pages/ForStoresPage'));
const StoresListPage = lazy(() => import('./pages/StoresListPage'));
const StorePage = lazy(() => import('./pages/StorePage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const TryOnPage = lazy(() => import('./pages/TryOnPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'));
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const DashboardProducts = lazy(() => import('./pages/dashboard/DashboardProducts'));
const DashboardProductForm = lazy(() => import('./pages/dashboard/DashboardProductForm'));
const DashboardAnalytics = lazy(() => import('./pages/dashboard/DashboardAnalytics'));
const DashboardSettings = lazy(() => import('./pages/dashboard/DashboardSettings'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminHome = lazy(() => import('./pages/admin/AdminHome'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Logo size={36} />
        <div className="w-8 h-8 border-2 border-line border-t-ink rounded-full animate-spin" />
      </div>
    </div>
  );
}

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}

function RequireAuth({ roles, children }: { roles?: UserRole[]; children: ComponentType }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  const Page = children;
  return <Page />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/for-stores" element={<ForStoresPage />} />
            <Route path="/stores" element={<StoresListPage />} />
            <Route path="/stores/:slug" element={<StorePage />} />
            <Route path="/stores/:slug/:productId" element={<ProductPage />} />
            <Route path="/stores/:slug/:productId/try-on" element={<TryOnPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          <Route path="/dashboard" element={<RequireAuth roles={['store_owner', 'admin']} children={DashboardLayout} />}>
            <Route index element={<DashboardHome />} />
            <Route path="products" element={<DashboardProducts />} />
            <Route path="products/new" element={<DashboardProductForm />} />
            <Route path="products/:productId/edit" element={<DashboardProductForm />} />
            <Route path="analytics" element={<DashboardAnalytics />} />
            <Route path="settings" element={<DashboardSettings />} />
          </Route>

          <Route path="/admin" element={<RequireAuth roles={['admin']} children={AdminLayout} />}>
            <Route index element={<AdminHome />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
