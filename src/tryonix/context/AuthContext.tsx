import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AppUser, UserRole } from '../types';
import { createStore, getStoresByOwner, loadCatalog, setCatalogRole, topRole } from '../services/catalog';

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    role: UserRole,
    displayName: string,
  ) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
export const PENDING_STORE_KEY = 'tryonix:pending-store';

async function loadAppUser(id: string, email: string): Promise<AppUser | null> {
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).maybeSingle(),
    supabase.from('user_roles').select('role').eq('user_id', id),
  ]);
  if (profile?.disabled) return null;
  return {
    id,
    email: profile?.email ?? email,
    displayName: profile?.display_name ?? email.split('@')[0] ?? '',
    createdAt: profile?.created_at ?? new Date().toISOString(),
    disabled: false,
    role: topRole((roles ?? []).map((r) => r.role)),
  };
}

/** Creates a store saved during sign-up once the account is confirmed and signed in. */
async function createPendingStore(u: AppUser) {
  const raw = localStorage.getItem(PENDING_STORE_KEY);
  if (!raw || u.role === 'customer') return;
  try {
    const pending = JSON.parse(raw);
    if (pending.email === u.email && getStoresByOwner(u.id).length === 0) {
      await createStore(u.id, pending.store);
    }
    localStorage.removeItem(PENDING_STORE_KEY);
  } catch {
    // keep it for the next attempt
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const applyRef = useRef<(s: { user: { id: string; email?: string } } | null) => Promise<void>>(async () => {});

  useEffect(() => {
    let active = true;
    async function apply(session: { user: { id: string; email?: string } } | null) {
      let u: AppUser | null = null;
      if (session) {
        u = await loadAppUser(session.user.id, session.user.email ?? '');
        if (!u) await supabase.auth.signOut();
      }
      if (!active) return;
      setCatalogRole(u?.role ?? null);
      try {
        await loadCatalog(u?.role ?? null);
      } catch (e) {
        console.error('Catalog load failed', e);
      }
      if (u) await createPendingStore(u);
      if (!active) return;
      setUser(u);
      setLoading(false);
    }
    applyRef.current = apply;
    supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        setTimeout(() => apply(session), 0);
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signUp(email: string, password: string, role: UserRole, displayName: string) {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: { role, display_name: displayName.trim() },
      },
    });
    if (error) return { error: error.message };
    if (data.user && data.user.identities?.length === 0) {
      return { error: 'An account with this email already exists.' };
    }
    return { error: null, needsConfirmation: !data.session };
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) {
      return {
        error: error.message.includes('Email not confirmed')
          ? 'Please confirm your email first — check your inbox for the link.'
          : 'Incorrect email or password.',
      };
    }
    const u = await loadAppUser(data.user.id, data.user.email ?? '');
    if (!u) return { error: 'This account has been disabled.' };
    await applyRef.current(data.session);
    return { error: null };
  }

  function signOut() {
    supabase.auth.signOut();
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/update-password`,
    });
    return { error: error ? error.message : null };
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
