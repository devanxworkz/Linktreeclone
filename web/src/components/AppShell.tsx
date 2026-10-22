import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { Badge, Button, Input, cx } from './ui';
import {
  IconBag,
  IconCard,
  IconChart,
  IconClose,
  IconEye,
  IconFlag,
  IconGear,
  IconGlobe,
  IconHome,
  IconLink,
  IconLogo,
  IconMegaphone,
  IconMenu,
  IconPalette,
  IconShield,
  IconUser,
  IconUsers,
} from './icons';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

export function AppShell({ variant = 'creator' }: { variant?: 'creator' | 'admin' }) {
  const { user, logout, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [adminQuery, setAdminQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const publicHref = profile ? `/u/${profile.username}` : '/';

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const creatorNav: NavItem[] = [
    { to: '/dashboard', label: 'Overview', icon: <IconHome />, end: true },
    { to: '/dashboard/profile', label: 'Profile', icon: <IconUser /> },
    { to: '/dashboard/links', label: 'Links', icon: <IconLink /> },
    { to: '/dashboard/products', label: 'Products', icon: <IconBag /> },
    { to: '/dashboard/appearance', label: 'Appearance', icon: <IconPalette /> },
    { to: '/dashboard/preview', label: 'Preview & publish', icon: <IconEye /> },
    { to: '/dashboard/account', label: 'Account', icon: <IconGear /> },
  ];
  const adminNav: NavItem[] = [
    { to: '/admin', label: 'Overview', icon: <IconHome />, end: true },
    { to: '/admin/creators', label: 'Creators & Users', icon: <IconUsers /> },
    { to: '/admin/storefronts', label: 'Storefronts', icon: <IconGlobe /> },
    { to: '/admin/themes', label: 'Templates & Themes', icon: <IconPalette /> },
    { to: '/admin/content', label: 'Products & Content', icon: <IconBag /> },
    { to: '/admin/moderation', label: 'Reports & Moderation', icon: <IconFlag /> },
    { to: '/admin/billing', label: 'Plans & Billing', icon: <IconCard /> },
    { to: '/admin/analytics', label: 'Analytics', icon: <IconChart /> },
    { to: '/admin/announcements', label: 'Announcements', icon: <IconMegaphone /> },
    { to: '/admin/roles', label: 'Admin Roles & Audit Logs', icon: <IconShield /> },
    { to: '/admin/settings', label: 'Settings', icon: <IconGear /> },
  ];

  const isAdmin = variant === 'admin' && user?.role === 'admin';
  const nav = isAdmin ? adminNav : creatorNav;

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  function onAdminSearch(e: FormEvent) {
    e.preventDefault();
    const q = adminQuery.trim();
    navigate(q ? `/admin/creators?q=${encodeURIComponent(q)}` : '/admin/creators');
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <span className="text-accent" style={{ fontSize: 22 }}><IconLogo /></span>
        <span className="text-lg font-extrabold">Pehchaan</span>
        {isAdmin && <Badge tone="info">Admin</Badge>}
      </div>
      <nav
        aria-label={isAdmin ? 'Admin' : 'Dashboard'}
        className="flex-1 space-y-0.5 overflow-y-auto p-3"
      >
        {isAdmin && (
          <p className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wide text-text-muted">Platform</p>
        )}
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cx(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition',
                isActive ? 'bg-accent-soft text-accent' : 'text-text-muted hover:bg-surface hover:text-text',
              )
            }
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
        {user?.role === 'admin' && !isAdmin && (
          <>
            <p className="px-3 pb-1 pt-4 text-xs font-bold uppercase tracking-wide text-text-muted">Platform</p>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cx(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition',
                  isActive ? 'bg-accent-soft text-accent' : 'text-text-muted hover:bg-surface hover:text-text',
                )
              }
            >
              <span style={{ fontSize: 18 }}><IconShield /></span>
              Admin console
            </NavLink>
          </>
        )}
      </nav>
      <div className="border-t border-border p-3">
        <p className="truncate px-2 text-xs text-text-muted" title={user?.email}>{user?.email}</p>
        <Button variant="ghost" size="sm" className="mt-1 w-full justify-start" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-bg lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/45" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-64 bg-bg shadow-pop">{sidebarContent}</div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-bg/90 px-4 backdrop-blur">
          <button
            type="button"
            className="rounded-md border border-border p-2 lg:hidden"
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span style={{ fontSize: 20 }}>{open ? <IconClose /> : <IconMenu />}</span>
          </button>
          <h1 className="text-base font-bold">{isAdmin ? 'Admin console' : 'Dashboard'}</h1>
          <div className="ml-auto flex items-center gap-2">
            {isAdmin ? (
              <form onSubmit={onAdminSearch} className="hidden sm:block" role="search">
                <Input
                  type="search"
                  aria-label="Search creators"
                  placeholder="Search creators…"
                  value={adminQuery}
                  onChange={(e) => setAdminQuery(e.target.value)}
                  className="h-9 w-56"
                />
              </form>
            ) : (
              <a
                href={publicHref}
                target="_blank"
                rel="noreferrer"
                className="hidden rounded-md border border-border px-3 py-2 text-sm font-semibold text-text hover:bg-surface sm:inline-block"
              >
                View public page
              </a>
            )}
          </div>
        </header>
        <main
          className={cx(
            'mx-auto w-full p-4 sm:p-6',
            isAdmin ? 'max-w-[1200px]' : 'max-w-[var(--content-width)]',
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
