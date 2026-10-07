import { useAuth } from '../../context/AuthContext';
import { getStoresByOwner, getAnalyticsForStore } from '../../services/catalog';

export default function DashboardAnalytics() {
  const { user } = useAuth();
  const stores = user ? getStoresByOwner(user.id) : [];
  const primaryStore = stores[0];

  if (!primaryStore) {
    return (
      <div>
        <h1 className="text-3xl font-display font-semibold tracking-tighter2 mb-8">Analytics</h1>
        <div className="card p-12 text-center">
          <p className="text-ink-muted">Create a store to see analytics.</p>
        </div>
      </div>
    );
  }

  const analytics = getAnalyticsForStore(primaryStore.id);
  const successRate = analytics.totalTryOns > 0
    ? Math.round((analytics.successful / analytics.totalTryOns) * 100)
    : 0;

  return (
    <div>
      <h1 className="text-3xl font-display font-semibold tracking-tighter2 mb-2">Analytics</h1>
      <p className="text-ink-muted text-sm mb-8">
        {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
      </p>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <p className="text-3xl font-display font-semibold tracking-tighter2">{analytics.totalTryOns.toLocaleString()}</p>
          <p className="text-sm text-ink-muted mt-1">Try-ons</p>
        </div>
        <div className="card p-5">
          <p className="text-3xl font-display font-semibold tracking-tighter2">{analytics.successful.toLocaleString()}</p>
          <p className="text-sm text-ink-muted mt-1">Successful</p>
        </div>
        <div className="card p-5">
          <p className="text-3xl font-display font-semibold tracking-tighter2">{successRate}%</p>
          <p className="text-sm text-ink-muted mt-1">Success rate</p>
        </div>
        <div className="card p-5">
          <p className="text-3xl font-display font-semibold tracking-tighter2">{analytics.failed.toLocaleString()}</p>
          <p className="text-sm text-ink-muted mt-1">Failed</p>
        </div>
      </div>

      {/* Most tried */}
      {analytics.mostTriedProduct && (
        <div className="card p-6 mb-8">
          <p className="text-sm text-ink-muted mb-1">Most tried</p>
          <p className="text-xl font-display font-medium">{analytics.mostTriedProduct.name}</p>
          <p className="text-sm text-ink-muted mt-1">
            {analytics.mostTriedProduct.count} of {analytics.totalTryOns} try-ons
          </p>
          {/* Simple bar */}
          <div className="mt-4 h-2 bg-line rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${analytics.totalTryOns > 0 ? (analytics.mostTriedProduct.count / analytics.totalTryOns) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Recent sessions table */}
      <div>
        <h2 className="text-lg font-display font-medium mb-4">Recent activity</h2>
        {analytics.recentSessions.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-ink-muted text-sm">No try-on activity yet.</p>
          </div>
        ) : (
          <div className="card divide-y divide-line">
            <div className="grid grid-cols-3 px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wider">
              <span>Product</span>
              <span>Date</span>
              <span>Status</span>
            </div>
            {analytics.recentSessions.map((session) => {
              const product = primaryStore;
              void product;
              return (
                <div key={session.id} className="grid grid-cols-3 px-4 py-3 text-sm items-center">
                  <span className="text-ink truncate">{session.productId}</span>
                  <span className="text-ink-muted text-xs">
                    {new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full inline-block w-fit ${
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
    </div>
  );
}
