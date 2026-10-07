import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStoresByOwner, updateStore } from '../../services/catalog';
import { Check } from 'lucide-react';

export default function DashboardSettings() {
  const { user } = useAuth();
  const stores = user ? getStoresByOwner(user.id) : [];
  const primaryStore = stores[0];
  const [name, setName] = useState(primaryStore?.name ?? '');
  const [tagline, setTagline] = useState(primaryStore?.tagline ?? '');
  const [description, setDescription] = useState(primaryStore?.description ?? '');
  const [saved, setSaved] = useState(false);

  if (!primaryStore) {
    return (
      <div>
        <h1 className="text-3xl font-display font-semibold tracking-tighter2 mb-8">Settings</h1>
        <div className="card p-12 text-center">
          <p className="text-ink-muted">Create a store to manage settings.</p>
        </div>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStore(primaryStore.id, { name, tagline, description });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <h1 className="text-3xl font-display font-semibold tracking-tighter2 mb-8">Settings</h1>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        <div>
          <label className="label" htmlFor="store-name">Store name</label>
          <input
            id="store-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="store-tagline">Tagline</label>
          <input
            id="store-tagline"
            className="input"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="A short, memorable phrase"
          />
        </div>
        <div>
          <label className="label" htmlFor="store-desc">Description</label>
          <textarea
            id="store-desc"
            className="input min-h-[100px] resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Store URL</label>
          <p className="text-sm text-ink-muted">
            tryonix.app/stores/<span className="text-ink font-medium">{primaryStore.slug}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button type="submit" className="btn-primary">Save changes</button>
          {saved && (
            <span className="text-sm text-success flex items-center gap-1">
              <Check size={16} /> Saved
            </span>
          )}
        </div>
      </form>

      {/* Account info */}
      <div className="mt-12 pt-8 border-t border-line">
        <h2 className="text-lg font-display font-medium mb-4">Account</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between max-w-md">
            <span className="text-ink-muted">Email</span>
            <span className="text-ink">{user?.email}</span>
          </div>
          <div className="flex justify-between max-w-md">
            <span className="text-ink-muted">Role</span>
            <span className="text-ink capitalize">{user?.role.replace('_', ' ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
