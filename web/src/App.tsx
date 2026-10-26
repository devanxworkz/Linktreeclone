import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './context/AuthProvider';
import { MarketingLayout } from './components/MarketingLayout';
import { AppShell } from './components/AppShell';
import { Spinner } from './components/ui';

import Landing from './pages/marketing/Landing';
import Features from './pages/marketing/Features';
import Pricing from './pages/marketing/Pricing';
import StaticPage from './pages/marketing/StaticPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Overview from './pages/dashboard/Overview';
import ProfileEditor from './pages/dashboard/ProfileEditor';
import LinksManager from './pages/dashboard/LinksManager';
import ProductsManager from './pages/dashboard/ProductsManager';
import Appearance from './pages/dashboard/Appearance';
import PreviewPublish from './pages/dashboard/PreviewPublish';
import Account from './pages/dashboard/Account';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStorefronts from './pages/admin/AdminStorefronts';
import AdminModeration from './pages/admin/AdminModeration';
import AdminBilling from './pages/admin/AdminBilling';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminAudit from './pages/admin/AdminAudit';
import AdminPlanned from './pages/admin/AdminPlanned';
import PublicPage from './pages/PublicPage';
import NotFound from './pages/NotFound';

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center text-text-muted">
      <Spinner className="h-6 w-6" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Marketing */}
      <Route path="/" element={<MarketingLayout><Landing /></MarketingLayout>} />
      <Route path="/features" element={<MarketingLayout><Features /></MarketingLayout>} />
      <Route path="/pricing" element={<MarketingLayout><Pricing /></MarketingLayout>} />
      <Route path="/about" element={<MarketingLayout><StaticPage /></MarketingLayout>} />
      <Route path="/contact" element={<MarketingLayout><StaticPage /></MarketingLayout>} />
      <Route path="/privacy" element={<MarketingLayout><StaticPage /></MarketingLayout>} />
      <Route path="/terms" element={<MarketingLayout><StaticPage /></MarketingLayout>} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Creator dashboard */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <AppShell variant="creator" />
          </RequireAuth>
        }
      >
        <Route index element={<Overview />} />
        <Route path="profile" element={<ProfileEditor />} />
        <Route path="links" element={<LinksManager />} />
        <Route path="products" element={<ProductsManager />} />
        <Route path="appearance" element={<Appearance />} />
        <Route path="preview" element={<PreviewPublish />} />
        <Route path="account" element={<Account />} />
      </Route>

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AppShell variant="admin" />
          </RequireAdmin>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="creators" element={<AdminUsers />} />
        <Route path="storefronts" element={<AdminStorefronts />} />
        <Route
          path="themes"
          element={
            <AdminPlanned
              title="Templates & Themes"
              description="Browse every storefront template and theme, see adoption across the platform, and curate which designs creators can pick."
              bullets={[
                'Template and theme adoption counts across all storefronts',
                'Preview each design with a sample creator',
                'Curate the catalogue and retire outdated templates',
              ]}
            />
          }
        />
        <Route
          path="content"
          element={
            <AdminPlanned
              title="Products & Content"
              description="Review the products and links creators publish across the platform, and act on anything that breaks the rules."
              bullets={[
                'Search every published product and link across tenants',
                'Filter by price, active state and destination host',
                'Hide a product or link that breaks the content policy',
              ]}
            />
          }
        />
        <Route path="moderation" element={<AdminModeration />} />
        <Route path="billing" element={<AdminBilling />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route
          path="announcements"
          element={
            <AdminPlanned
              title="Announcements"
              description="Broadcast in-product announcements to creators from a single place."
              bullets={[
                'Draft announcements with a title, body and severity',
                'Schedule and publish to all creators or a segment',
                'Archive past announcements',
              ]}
            />
          }
        />
        <Route path="roles" element={<AdminAudit />} />
        <Route
          path="settings"
          element={
            <AdminPlanned
              title="Settings"
              description="Platform-wide configuration, applied and enforced by the backend."
              bullets={[
                'Toggle new creator sign-ups',
                'Set platform name, support email and public base URL',
                'Configure session and data-retention policies',
              ]}
            />
          }
        />
      </Route>

      {/* Public creator page */}
      <Route path="/u/:username" element={<PublicPage />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
