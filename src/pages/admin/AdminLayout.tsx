import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/Logo';
import { Shield, Store, Users, Activity, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { label: 'Overview', to: '/admin', icon: Activity, end: true },
  { label: 'Stores', to: '/admin#stores', icon: Store },
  { label: 'Users', to: '/admin#users', icon: Users },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-canvas">
      <aside className="hidden md:flex w-60 flex-col border-r border-line bg-white shrink-0">
        <div className="p-5 border-b border-line">
          <Link to="/">
            <Logo size={28} />
          </Link>
          <p className="mt-2 text-xs text-accent font-medium uppercase tracking-wider flex items-center gap-1">
            <Shield size={12} /> Admin
          </p>
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
          <button onClick={handleSignOut} className="btn-ghost w-full text-sm">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="md:hidden flex h-14 items-center justify-between px-4 border-b border-line bg-white">
          <Link to="/"><Logo size={26} /></Link>
          <button onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
        {open && (
          <nav className="md:hidden border-b border-line p-4 space-y-1 bg-white">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-ink-muted"
              >
                <item.icon size={18} /> {item.label}
              </NavLink>
            ))}
            <button onClick={handleSignOut} className="btn-ghost w-full text-sm mt-2">
              <LogOut size={16} /> Sign out
            </button>
          </nav>
        )}
        <main className="p-6 lg:p-8 max-w-5xl mx-auto w-full pt-20 md:pt-8">
          {user && (
            <div className="mb-6 hidden md:block">
              <p className="text-sm text-ink-muted">Signed in as {user.email}</p>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
