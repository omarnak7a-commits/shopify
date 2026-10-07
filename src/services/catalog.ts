import type {
  Store,
  Product,
  TryOnSession,
  UsageEvent,
  AppUser,
  AnalyticsSummary,
  ProductCategory,
} from '../types';
import { getDb, persist, uid } from '../data/store';

// ---- Stores ----

export function getStores(): Store[] {
  return getDb().stores;
}

export function getStoreBySlug(slug: string): Store | null {
  return getDb().stores.find((s) => s.slug === slug) ?? null;
}

export function getStoreById(id: string): Store | null {
  return getDb().stores.find((s) => s.id === id) ?? null;
}

export function getStoresByOwner(ownerId: string): Store[] {
  return getDb().stores.filter((s) => s.ownerId === ownerId);
}

export function createStore(ownerId: string, data: { name: string; slug: string; tagline: string; description: string; logoText: string; bannerImage: string }): Store {
  const db = getDb();
  const store: Store = {
    id: uid('s'),
    slug: data.slug,
    name: data.name,
    tagline: data.tagline,
    description: data.description,
    logoText: data.logoText || data.name.charAt(0).toUpperCase(),
    bannerImage: data.bannerImage,
    ownerId,
    createdAt: new Date().toISOString(),
  };
  db.stores.push(store);
  persist();
  return store;
}

export function updateStore(id: string, patch: Partial<Store>): Store | null {
  const db = getDb();
  const idx = db.stores.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  db.stores[idx] = { ...db.stores[idx], ...patch };
  persist();
  return db.stores[idx];
}

// ---- Products ----

export function getProducts(): Product[] {
  return getDb().products;
}

export function getProductsByStore(storeId: string): Product[] {
  return getDb().products.filter((p) => p.storeId === storeId);
}

export function getProductById(id: string): Product | null {
  return getDb().products.find((p) => p.id === id) ?? null;
}

export function createProduct(data: {
  storeId: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number | null;
  image: string;
  variants: { color: string; colorHex: string; sizes: string[] }[];
}): Product {
  const db = getDb();
  const product: Product = {
    id: uid('p'),
    storeId: data.storeId,
    name: data.name,
    description: data.description,
    category: data.category,
    price: data.price,
    image: data.image,
    variants: data.variants.map((v) => ({ id: uid('v'), ...v })),
    createdAt: new Date().toISOString(),
  };
  db.products.push(product);
  persist();
  return product;
}

export function updateProduct(id: string, patch: Partial<Product>): Product | null {
  const db = getDb();
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  db.products[idx] = { ...db.products[idx], ...patch };
  persist();
  return db.products[idx];
}

export function deleteProduct(id: string): boolean {
  const db = getDb();
  const before = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);
  persist();
  return db.products.length < before;
}

// ---- Try-On sessions & usage ----

export function createTryOnSession(data: {
  productId: string;
  storeId: string;
  personImage: string;
  consent: boolean;
}): TryOnSession {
  const db = getDb();
  const session: TryOnSession = {
    id: uid('t'),
    productId: data.productId,
    storeId: data.storeId,
    personImage: data.personImage,
    resultImage: null,
    status: 'processing',
    consent: data.consent,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  db.tryOnSessions.push(session);

  db.usageEvents.push({
    id: uid('e'),
    type: 'try_on_started',
    storeId: data.storeId,
    productId: data.productId,
    sessionId: session.id,
    createdAt: new Date().toISOString(),
  });
  persist();
  return session;
}

export function completeTryOnSession(id: string, resultImage: string): TryOnSession | null {
  const db = getDb();
  const idx = db.tryOnSessions.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  db.tryOnSessions[idx] = {
    ...db.tryOnSessions[idx],
    status: 'completed',
    resultImage,
    completedAt: new Date().toISOString(),
  };
  db.usageEvents.push({
    id: uid('e'),
    type: 'try_on_completed',
    storeId: db.tryOnSessions[idx].storeId,
    productId: db.tryOnSessions[idx].productId,
    sessionId: id,
    createdAt: new Date().toISOString(),
  });
  persist();
  return db.tryOnSessions[idx];
}

export function failTryOnSession(id: string): TryOnSession | null {
  const db = getDb();
  const idx = db.tryOnSessions.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  db.tryOnSessions[idx] = {
    ...db.tryOnSessions[idx],
    status: 'failed',
    completedAt: new Date().toISOString(),
  };
  db.usageEvents.push({
    id: uid('e'),
    type: 'try_on_failed',
    storeId: db.tryOnSessions[idx].storeId,
    productId: db.tryOnSessions[idx].productId,
    sessionId: id,
    createdAt: new Date().toISOString(),
  });
  persist();
  return db.tryOnSessions[idx];
}

export function getTryOnSession(id: string): TryOnSession | null {
  return getDb().tryOnSessions.find((s) => s.id === id) ?? null;
}

export function getSessionsByStore(storeId: string): TryOnSession[] {
  return getDb().tryOnSessions.filter((s) => s.storeId === storeId);
}

export function recordProductView(storeId: string, productId: string): void {
  const db = getDb();
  db.usageEvents.push({
    id: uid('e'),
    type: 'product_viewed',
    storeId,
    productId,
    sessionId: null,
    createdAt: new Date().toISOString(),
  });
  persist();
}

// ---- Analytics ----

export function getAnalyticsForStore(storeId: string): AnalyticsSummary {
  const db = getDb();
  const sessions = db.tryOnSessions.filter((s) => s.storeId === storeId);
  const totalTryOns = sessions.length;
  const successful = sessions.filter((s) => s.status === 'completed').length;
  const failed = sessions.filter((s) => s.status === 'failed').length;

  const productCounts = new Map<string, number>();
  for (const s of sessions) {
    productCounts.set(s.productId, (productCounts.get(s.productId) ?? 0) + 1);
  }
  let mostTriedProduct: AnalyticsSummary['mostTriedProduct'] = null;
  let maxCount = 0;
  for (const [pid, count] of productCounts) {
    if (count > maxCount) {
      maxCount = count;
      const product = db.products.find((p) => p.id === pid);
      mostTriedProduct = { id: pid, name: product?.name ?? 'Unknown', count };
    }
  }

  const recentSessions = [...sessions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10);

  return { totalTryOns, successful, failed, mostTriedProduct, recentSessions };
}

// ---- Users (admin) ----

export function getAllUsers(): AppUser[] {
  return getDb().users;
}

export function getUserById(id: string): AppUser | null {
  return getDb().users.find((u) => u.id === id) ?? null;
}

export function toggleUserDisabled(id: string): AppUser | null {
  const db = getDb();
  const idx = db.users.findIndex((u) => u.id === id);
  if (idx < 0) return null;
  db.users[idx] = { ...db.users[idx], disabled: !db.users[idx].disabled };
  persist();
  return db.users[idx];
}

export function getAllSessions(): TryOnSession[] {
  return getDb().tryOnSessions;
}

export function getFailedSessions(): TryOnSession[] {
  return getDb().tryOnSessions.filter((s) => s.status === 'failed');
}
