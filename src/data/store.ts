import type { Store, Product, TryOnSession, UsageEvent, AppUser } from '../types';
import { seedStores, seedProducts, seedUsers } from './seed';

const STORE_KEY = 'tryonix:db:v1';

interface DatabaseShape {
  users: AppUser[];
  stores: Store[];
  products: Product[];
  tryOnSessions: TryOnSession[];
  usageEvents: UsageEvent[];
}

function loadDb(): DatabaseShape {
  if (typeof localStorage === 'undefined') {
    return { users: [...seedUsers], stores: [...seedStores], products: [...seedProducts], tryOnSessions: [], usageEvents: [] };
  }
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      const initial: DatabaseShape = {
        users: [...seedUsers],
        stores: [...seedStores],
        products: [...seedProducts],
        tryOnSessions: [],
        usageEvents: [],
      };
      localStorage.setItem(STORE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as DatabaseShape;
    return {
      users: parsed.users ?? [...seedUsers],
      stores: parsed.stores ?? [...seedStores],
      products: parsed.products ?? [...seedProducts],
      tryOnSessions: parsed.tryOnSessions ?? [],
      usageEvents: parsed.usageEvents ?? [],
    };
  } catch {
    return { users: [...seedUsers], stores: [...seedStores], products: [...seedProducts], tryOnSessions: [], usageEvents: [] };
  }
}

function saveDb(db: DatabaseShape): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORE_KEY, JSON.stringify(db));
}

let db = loadDb();

export function getDb(): DatabaseShape {
  return db;
}

export function persist(): void {
  saveDb(db);
}

export function resetDb(): void {
  db = {
    users: [...seedUsers],
    stores: [...seedStores],
    products: [...seedProducts],
    tryOnSessions: [],
    usageEvents: [],
  };
  saveDb(db);
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
