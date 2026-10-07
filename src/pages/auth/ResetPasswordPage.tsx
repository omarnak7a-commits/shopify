import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/Logo';
import { Check, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <Link to="/" className="mb-8">
        <Logo size={36} />
      </Link>

      <div className="w-full max-w-sm">
        {sent ? (
          <div className="text-center">
            <div className="inline-flex w-14 h-14 rounded-full bg-success/10 items-center justify-center mb-6">
              <Check size={28} className="text-success" />
            </div>
            <h1 className="text-2xl font-display font-semibold tracking-tighter2 mb-2">Check your email</h1>
            <p className="text-ink-muted text-sm mb-6">
              If an account exists for {email}, we've sent a link to reset your password.
            </p>
            <Link to="/login" className="btn-outline">
              <ArrowLeft size={16} /> Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-display font-semibold tracking-tighter2 text-center mb-2">Reset password</h1>
            <p className="text-ink-muted text-center text-sm mb-8">
              Enter your email and we'll send you a reset link.
            </p>

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

              {error && <p className="text-sm text-error">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-ink-muted">
              <Link to="/login" className="hover:text-ink transition-colors">Back to sign in</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
