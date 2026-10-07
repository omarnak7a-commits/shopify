import { Link, NavLink, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'How it works', to: '/#how-it-works' },
    { label: 'Stores', to: '/stores' },
    { label: 'For stores', to: '/for-stores' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-canvas/90 backdrop-blur-sm border-b border-line">
      <div className="mx-auto max-w-wide px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center" aria-label="TryOnix home">
            <Logo size={30} />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.to}
                className="text-sm text-ink-soft hover:text-ink transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {(user.role === 'store_owner' || user.role === 'admin') && (
                  <Link to="/dashboard" className="btn-ghost text-sm">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                )}
                <button onClick={signOut} className="btn-ghost text-sm">
                  <LogOut size={16} /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm">Get started</Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 -mr-2 text-ink"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-line bg-canvas animate-fade-in">
          <nav className="mx-auto max-w-wide px-4 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.to}
                onClick={() => setOpen(false)}
                className="py-3 text-sm text-ink-soft hover:text-ink transition-colors"
              >
                {item.label}
              </a>
            ))}
            <div className="border-t border-line my-2" />
            {user ? (
              <>
                {(user.role === 'store_owner' || user.role === 'admin') && (
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="py-3 text-sm text-ink-soft flex items-center gap-2">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                )}
                <button onClick={() => { signOut(); setOpen(false); }} className="py-3 text-sm text-ink-soft text-left flex items-center gap-2">
                  <LogOut size={16} /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="py-3 text-sm text-ink-soft">Sign in</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary text-sm mt-2">Get started</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-canvas mt-24">
      <div className="mx-auto max-w-wide px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="max-w-xs">
            <Logo size={28} />
            <p className="mt-3 text-sm text-ink-muted leading-relaxed">
              Try clothes virtually using your own photo. See yourself in it before you decide what to wear.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 text-sm">
            <div className="flex flex-col gap-2">
              <span className="text-ink font-medium mb-1">TryOnix</span>
              <a href="/#how-it-works" className="text-ink-muted hover:text-ink transition-colors">How it works</a>
              <Link to="/stores" className="text-ink-muted hover:text-ink transition-colors">Browse stores</Link>
              <Link to="/for-stores" className="text-ink-muted hover:text-ink transition-colors">For stores</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-ink font-medium mb-1">Account</span>
              <Link to="/login" className="text-ink-muted hover:text-ink transition-colors">Sign in</Link>
              <Link to="/register" className="text-ink-muted hover:text-ink transition-colors">Create account</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-line mt-10 pt-6 flex flex-col sm:flex-row justify-between gap-4 text-xs text-ink-muted">
          <span>© {new Date().getFullYear()} TryOnix. Try it. See it. Love it.</span>
          <span>Your photos are private and never used to train any model.</span>
        </div>
      </div>
    </footer>
  );
}
