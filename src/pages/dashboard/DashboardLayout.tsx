import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/Logo';
import { LayoutDashboard, Package, BarChart3, Settings, LogOut, Plus, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Products', to: '/dashboard/products', icon: Package },
  { label: 'Analytics', to: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Settings', to: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-canvas">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex w-60 flex-col border-r border-line bg-white shrink-0">
        <div className="p-5 border-b border-line">
          <Link to="/">
            <Logo size={28} />
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-canvas text-ink font-medium' : 'text-ink-muted hover:text-ink hover:bg-canvas/60'
                }`
              }
            >
              <item.icon size={18} /> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-line">
          <Link to="/dashboard/products/new" className="btn-primary w-full text-sm">
            <Plus size={16} /> Add product
          </Link>
          <button onClick={handleSignOut} className="btn-ghost w-full text-sm mt-2">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-line">
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/">
            <Logo size={26} />
          </Link>
          <button onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {open && (
          <nav className="border-t border-line p-4 space-y-1 bg-white">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                    isActive ? 'bg-canvas text-ink font-medium' : 'text-ink-muted'
                  }`
                }
              >
                <item.icon size={18} /> {item.label}
              </NavLink>
            ))}
            <Link to="/dashboard/products/new" onClick={() => setOpen(false)} className="btn-primary w-full text-sm mt-2">
              <Plus size={16} /> Add product
            </Link>
            <button onClick={handleSignOut} className="btn-ghost w-full text-sm mt-2">
              <LogOut size={16} /> Sign out
            </button>
          </nav>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 md:pt-0 pt-14">
        <main className="p-6 lg:p-8 max-w-5xl mx-auto w-full">
          {user && (
            <div className="mb-6 hidden md:block">
              <p className="text-sm text-ink-muted">Welcome back, {user.displayName}</p>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
