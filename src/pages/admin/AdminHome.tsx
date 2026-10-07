import { Link } from 'react-router-dom';
import { getStores, getAllUsers, getAllSessions, getFailedSessions, getProducts, toggleUserDisabled } from '../../services/catalog';
import { SmartImage } from '../../components/SmartImage';
import { Store, Users, Package, Activity, AlertCircle, Ban, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function AdminHome() {
  const stores = getStores();
  const users = getAllUsers();
  const products = getProducts();
  const sessions = getAllSessions();
  const failed = getFailedSessions();
  const [version, setVersion] = useState(0);
  void version;

  const stats = [
    { label: 'Stores', value: stores.length, icon: Store },
    { label: 'Users', value: users.length, icon: Users },
    { label: 'Products', value: products.length, icon: Package },
    { label: 'Try-on sessions', value: sessions.length, icon: Activity },
  ];

  return (
    <div>
      <h1 className="text-3xl font-display font-semibold tracking-tighter2 mb-2">Admin overview</h1>
      <p className="text-ink-muted text-sm mb-8">Platform-wide view of stores, users, and activity.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <stat.icon size={18} className="text-ink-muted mb-3" />
            <p className="text-3xl font-display font-semibold tracking-tighter2">{stat.value}</p>
            <p className="text-sm text-ink-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Failed jobs */}
      <section className="mb-10">
        <h2 className="text-lg font-display font-medium mb-4 flex items-center gap-2">
          <AlertCircle size={18} className="text-error" /> Failed try-on jobs
        </h2>
        {failed.length === 0 ? (
          <div className="card p-6 text-center">
            <CheckCircle size={20} className="text-success mx-auto mb-2" />
            <p className="text-sm text-ink-muted">No failed jobs. Everything is running smoothly.</p>
          </div>
        ) : (
          <div className="card divide-y divide-line">
            {failed.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4 text-sm">
                <span className="text-ink-muted font-mono text-xs">{s.id}</span>
                <span className="text-ink-muted text-xs">{new Date(s.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Stores */}
      <section id="stores" className="mb-10">
        <h2 className="text-lg font-display font-medium mb-4">Stores</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {stores.map((store) => (
            <Link key={store.id} to={`/stores/${store.slug}`} className="card flex items-center gap-4 p-4 hover:border-ink transition-colors">
              <SmartImage src={store.bannerImage} alt={store.name} aspectRatio="aspect-square" className="w-12 h-12 rounded shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{store.name}</p>
                <p className="text-xs text-ink-muted truncate">{store.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Users */}
      <section id="users">
        <h2 className="text-lg font-display font-medium mb-4">Users</h2>
        <div className="card divide-y divide-line">
          <div className="grid grid-cols-4 px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wider">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span className="text-right">Action</span>
          </div>
          {users.map((u) => (
            <div key={u.id} className="grid grid-cols-4 px-4 py-3 text-sm items-center">
              <span className="text-ink truncate">{u.displayName}</span>
              <span className="text-ink-muted truncate text-xs">{u.email}</span>
              <span className="text-ink-muted capitalize text-xs">{u.role.replace('_', ' ')}</span>
              <div className="text-right">
                <button
                  onClick={() => {
                    toggleUserDisabled(u.id);
                    setVersion((v) => v + 1);
                  }}
                  className={`text-xs px-3 py-1.5 border transition-colors ${
                    u.disabled
                      ? 'border-success/30 text-success hover:bg-success/5'
                      : 'border-error/30 text-error hover:bg-error/5'
                  }`}
                >
                  {u.disabled ? (
                    <span className="flex items-center gap-1"><CheckCircle size={12} /> Enable</span>
                  ) : (
                    <span className="flex items-center gap-1"><Ban size={12} /> Disable</span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
