import { useState } from 'react';
import { Link, useNavigate } from '@/lib/router-compat';
import { supabase } from '@/integrations/supabase/client';
import { Logo } from '../../components/Logo';

export default function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) setError('This reset link has expired. Please request a new one.');
    else navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <Link to="/" className="mb-8">
        <Logo size={36} />
      </Link>
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-display font-semibold tracking-tighter2 text-center mb-2">Choose a new password</h1>
        <p className="text-ink-muted text-center text-sm mb-8">Enter a new password for your account.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="password">New password</label>
            <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Saving...' : 'Save password'}
          </button>
        </form>
      </div>
    </div>
  );
}
