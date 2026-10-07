import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AppUser, UserRole } from '../types';
import { getDb, persist, uid } from '../data/store';

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  signUp: (email: string, password: string, role: UserRole, displayName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = 'tryonix:auth:v1';
const PASS_KEY = 'tryonix:pass:v1';

interface StoredAccount {
  userId: string;
  email: string;
  password: string;
}

function loadAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(PASS_KEY);
    return raw ? (JSON.parse(raw) as StoredAccount[]) : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: StoredAccount[]): void {
  localStorage.setItem(PASS_KEY, JSON.stringify(accounts));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const userId = JSON.parse(raw) as string;
        const found = getDb().users.find((u) => u.id === userId && !u.disabled);
        if (found) setUser(found);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  function setSession(u: AppUser | null) {
    if (u) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(u.id));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
    setUser(u);
  }

  async function signUp(email: string, password: string, role: UserRole, displayName: string): Promise<{ error: string | null }> {
    const normalized = email.trim().toLowerCase();
    const db = getDb();
    if (db.users.some((u) => u.email === normalized)) {
      return { error: 'An account with this email already exists.' };
    }
    const newUser: AppUser = {
      id: uid('u'),
      email: normalized,
      role,
      displayName: displayName.trim() || normalized.split('@')[0],
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    persist();

    const accounts = loadAccounts();
    accounts.push({ userId: newUser.id, email: normalized, password });
    saveAccounts(accounts);

    setSession(newUser);
    return { error: null };
  }

  async function signIn(email: string, password: string): Promise<{ error: string | null }> {
    const normalized = email.trim().toLowerCase();
    const accounts = loadAccounts();
    const account = accounts.find((a) => a.email === normalized && a.password === password);
    if (!account) {
      return { error: 'Incorrect email or password.' };
    }
    const found = getDb().users.find((u) => u.id === account.userId && !u.disabled);
    if (!found) {
      return { error: 'This account has been disabled.' };
    }
    setSession(found);
    return { error: null };
  }

  function signOut() {
    setSession(null);
  }

  async function resetPassword(email: string): Promise<{ error: string | null }> {
    const normalized = email.trim().toLowerCase();
    const accounts = loadAccounts();
    const exists = accounts.some((a) => a.email === normalized);
    if (!exists) {
      return { error: 'No account found with this email.' };
    }
    // In a real backend this would send a reset link via email.
    return { error: null };
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
