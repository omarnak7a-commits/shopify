import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStoresByOwner, getProductsByStore, getAnalyticsForStore } from '../../services/catalog';
import { Package, Sparkles, TrendingUp, Plus, ArrowRight } from 'lucide-react';

export default function DashboardHome() {
  const { user } = useAuth();
  const stores = user ? getStoresByOwner(user.id) : [];
  const primaryStore = stores[0];

  if (!primaryStore) {
    return (
      <div>
        <h1 className="text-3xl font-display font-semibold tracking-tighter2 mb-2">Overview</h1>
        <div className="card p-12 text-center mt-8">
          <h2 className="text-xl font-display font-medium mb-2">You don't have a store yet</h2>
          <p className="text-ink-muted mb-6">Create your store to start adding products.</p>
          <p className="text-sm text-ink-muted">Store creation is part of the sign-up flow — register as a store owner to get started.</p>
        </div>
      </div>
    );
  }

  const products = getProductsByStore(primaryStore.id);
  const analytics = getAnalyticsForStore(primaryStore.id);

  const stats = [
    { label: 'Products', value: products.length, icon: Package },
    { label: 'Try-ons', value: analytics.totalTryOns, icon: Sparkles },
    { label: 'Successful', value: analytics.successful, icon: TrendingUp },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-semibold tracking-tighter2">{primaryStore.name}</h1>
          <p className="text-ink-muted text-sm mt-1">{primaryStore.tagline}</p>
        </div>
        <Link to="/dashboard/products/new" className="btn-primary text-sm hidden sm:flex">
          <Plus size={16} /> Add product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <stat.icon size={18} className="text-ink-muted" />
            </div>
            <p className="text-3xl font-display font-semibold tracking-tighter2">{stat.value.toLocaleString()}</p>
            <p className="text-sm text-ink-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Most tried */}
      {analytics.mostTriedProduct && (
        <div className="card p-6 mb-8">
          <p className="text-sm text-ink-muted mb-1">Most tried</p>
          <p className="text-xl font-display font-medium">{analytics.mostTriedProduct.name}</p>
          <p className="text-sm text-ink-muted mt-1">{analytics.mostTriedProduct.count} try-ons</p>
        </div>
      )}

      {/* Recent sessions */}
      <div>
        <h2 className="text-lg font-display font-medium mb-4">Recent try-on activity</h2>
        {analytics.recentSessions.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-ink-muted text-sm">No try-ons yet. When customers try your products, they'll appear here.</p>
          </div>
        ) : (
          <div className="card divide-y divide-line">
            {analytics.recentSessions.map((session) => {
              const product = products.find((p) => p.id === session.productId);
              return (
                <div key={session.id} className="flex items-center justify-between p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{product?.name ?? 'Unknown product'}</p>
                    <p className="text-xs text-ink-muted">
                      {new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${
                    session.status === 'completed' ? 'bg-success/10 text-success' :
                    session.status === 'failed' ? 'bg-error/10 text-error' :
                    'bg-warning/10 text-warning'
                  }`}>
                    {session.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View store link */}
      <div className="mt-8">
        <Link to={`/stores/${primaryStore.slug}`} className="btn-outline text-sm">
          View your store <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
