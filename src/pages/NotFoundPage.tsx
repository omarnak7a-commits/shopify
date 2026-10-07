import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <Logo size={36} />
      <h1 className="mt-8 text-6xl font-display font-semibold tracking-tighter2">404</h1>
      <p className="mt-3 text-ink-muted">We couldn't find that page.</p>
      <Link to="/" className="mt-8 inline-flex btn-primary">
        <ArrowLeft size={18} /> Back home
      </Link>
    </div>
  );
}
