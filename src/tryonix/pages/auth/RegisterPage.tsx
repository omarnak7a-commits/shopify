import { useState } from 'react';
import { Link, useNavigate } from '@/lib/router-compat';
import { useAuth, PENDING_STORE_KEY } from '../../context/AuthContext';
import { getStoresByOwner, createStore } from '../../services/catalog';
import { Logo } from '../../components/Logo';
import { ArrowRight, Check } from 'lucide-react';
import type { UserRole } from '../../types';

export default function RegisterPage() {
  const { signUp, user } = useAuth();
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [storeSaved, setStoreSaved] = useState(false);
  const navigate = useNavigate();
  const [step, setStep] = useState<'account' | 'store'>('account');
  const [role, setRole] = useState<UserRole>('store_owner');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Store fields
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [storeTagline, setStoreTagline] = useState('');
  const [storeDescription, setStoreDescription] = useState('');

  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error, needsConfirmation: nc } = await signUp(email, password, role, displayName);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setNeedsConfirmation(!!nc);
      if (nc && role !== 'store_owner') {
        setStoreSaved(true);
        return;
      }
      if (role === 'store_owner') {
        setStep('store');
      } else {
        navigate('/stores');
      }
    }
  };

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const storeData = {
      name: storeName,
      slug: storeSlug || slugify(storeName),
      tagline: storeTagline,
      description: storeDescription || storeTagline,
      logoText: storeName.charAt(0).toUpperCase(),
      bannerImage: 'https://images.pexels.com/photos/8581033/pexels-photo-8581033.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    };
    if (needsConfirmation || !user) {
      // Account not confirmed yet: the store is created right after the first sign-in.
      localStorage.setItem(PENDING_STORE_KEY, JSON.stringify({ email: email.trim().toLowerCase(), store: storeData }));
      setStoreSaved(true);
      return;
    }
    setLoading(true);
    try {
      if (getStoresByOwner(user.id).length === 0) await createStore(user.id, storeData);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong creating your store.');
    } finally {
      setLoading(false);
    }
  };

  if (storeSaved) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <Link to="/" className="mb-8">
          <Logo size={36} />
        </Link>
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex w-14 h-14 rounded-full bg-success/10 items-center justify-center mb-6">
            <Check size={28} className="text-success" />
          </div>
          <h1 className="text-2xl font-display font-semibold tracking-tighter2 mb-2">Check your email</h1>
          <p className="text-ink-muted text-sm mb-6">
            We sent a confirmation link to <span className="text-ink">{email}</span>. Confirm your email, then sign in
            {role === 'store_owner' ? ' — your store will be ready.' : '.'}
          </p>
          <Link to="/login" className="btn-primary w-full">Go to sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <Link to="/" className="mb-8">
        <Logo size={36} />
      </Link>

      <div className="w-full max-w-sm">
        {step === 'account' ? (
          <>
            <h1 className="text-3xl font-display font-semibold tracking-tighter2 text-center mb-2">Create your account</h1>
            <p className="text-ink-muted text-center text-sm mb-8">Start your store in minutes.</p>

            {/* Role selector */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button
                type="button"
                onClick={() => setRole('store_owner')}
                className={`p-3 border text-sm transition-all ${
                  role === 'store_owner' ? 'border-ink bg-canvas' : 'border-line text-ink-muted'
                }`}
              >
                Store owner
              </button>
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`p-3 border text-sm transition-all ${
                  role === 'customer' ? 'border-ink bg-canvas' : 'border-line text-ink-muted'
                }`}
              >
                Customer
              </button>
            </div>

            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="displayName">Name</label>
                <input
                  id="displayName"
                  className="input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>

              {error && <p className="text-sm text-error">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Creating account...' : <>Continue <ArrowRight size={18} /></>}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-ink-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-ink font-medium hover:text-accent transition-colors">
                Sign in
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-display font-semibold tracking-tighter2 text-center mb-2">Set up your store</h1>
            <p className="text-ink-muted text-center text-sm mb-8">You can change these later.</p>

            <form onSubmit={handleStoreSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="storeName">Store name</label>
                <input
                  id="storeName"
                  className="input"
                  value={storeName}
                  onChange={(e) => {
                    setStoreName(e.target.value);
                    setStoreSlug(slugify(e.target.value));
                  }}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="storeSlug">Store URL</label>
                <div className="flex items-center input gap-0">
                  <span className="text-ink-muted text-sm whitespace-nowrap">tryonix.app/stores/</span>
                  <input
                    id="storeSlug"
                    className="flex-1 border-0 outline-0 bg-transparent text-sm min-w-0"
                    value={storeSlug}
                    onChange={(e) => setStoreSlug(slugify(e.target.value))}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="storeTagline">Tagline</label>
                <input
                  id="storeTagline"
                  className="input"
                  value={storeTagline}
                  onChange={(e) => setStoreTagline(e.target.value)}
                  placeholder="Quiet essentials, made to last."
                />
              </div>
              <div>
                <label className="label" htmlFor="storeDescription">Description (optional)</label>
                <textarea
                  id="storeDescription"
                  className="input min-h-[80px] resize-y"
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-error">{error}</p>}

              <button type="submit" className="btn-primary w-full">
                <Check size={18} /> Create my store
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
