import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/Logo';
import { ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname ?? '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate(from);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <Link to="/" className="mb-8">
        <Logo size={36} />
      </Link>

      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-display font-semibold tracking-tighter2 text-center mb-2">Welcome back</h1>
        <p className="text-ink-muted text-center text-sm mb-8">Sign in to manage your store.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : <>Sign in <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-ink-muted">
          <Link to="/reset-password" className="hover:text-ink transition-colors">Forgot your password?</Link>
        </div>
        <div className="mt-4 text-center text-sm text-ink-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-ink font-medium hover:text-accent transition-colors">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
