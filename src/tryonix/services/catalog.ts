// Real data layer backed by the database. Public catalog data (stores, products,
// variants) is loaded once into an in-memory cache so the original pages can keep
// their synchronous getters; every write goes to the database, then refreshes.
import { useSyncExternalStore } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AppUser, AnalyticsSummary, Product, ProductCategory, Store, TryOnSession, UserRole } from '../types';

interface Cache {
  stores: Store[];
  products: Product[];
  sessions: TryOnSession[];
  users: AppUser[];
}

let cache: Cache = { stores: [], products: [], sessions: [], users: [] };
let version = 0;
const listeners = new Set<() => void>();
function emit() {
  version++;
  listeners.forEach((l) => l());
}

/** Subscribe a component to catalog changes. */
export function useCatalog(): number {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => version,
    () => 0,
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapStore(s: any): Store {
  return {
    id: s.id,
    slug: s.slug,
    name: s.name,
    tagline: s.tagline,
    description: s.description,
    logoText: s.logo_text,
    bannerImage: s.banner_image,
    ownerId: s.owner_id ?? '',
    createdAt: s.created_at,
  };
}

export async function loadCatalog(role: UserRole | null): Promise<void> {
  const [st, pr] = await Promise.all([
    supabase.from('stores').select('*').order('created_at'),
    supabase.from('products').select('*, product_variants(*)').order('created_at'),
  ]);
  if (st.error) throw st.error;
  if (pr.error) throw pr.error;
  const next: Cache = {
    stores: (st.data ?? []).map(mapStore),
    products: (pr.data ?? []).map((p) => ({
      id: p.id,
      storeId: p.store_id,
      name: p.name,
      description: p.description,
      category: p.category as ProductCategory,
      price: p.price === null ? null : Number(p.price),
      image: p.image,
      createdAt: p.created_at,
      variants: [...(p.product_variants ?? [])]
        .sort((a, b) => a.position - b.position)
        .map((v) => ({ id: v.id, color: v.color, colorHex: v.color_hex, sizes: v.sizes })),
    })),
    sessions: [],
    users: [],
  };
  if (role === 'store_owner' || role === 'admin') {
    const { data } = await supabase.from('try_on_sessions').select('*').order('created_at', { ascending: false }).limit(1000);
    next.sessions = (data ?? []).map((s) => ({
      id: s.id,
      productId: s.product_id,
      storeId: s.store_id,
      personImage: '',
      resultImage: null,
      status: s.status as TryOnSession['status'],
      consent: s.consent,
      createdAt: s.created_at,
      completedAt: s.completed_at,
    }));
  }
  if (role === 'admin') {
    const [pf, rl] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at'),
      supabase.from('user_roles').select('user_id, role'),
    ]);
    next.users = (pf.data ?? []).map((p) => ({
      id: p.id,
      email: p.email,
      displayName: p.display_name,
      createdAt: p.created_at,
      disabled: p.disabled,
      role: topRole((rl.data ?? []).filter((r) => r.user_id === p.id).map((r) => r.role)),
    }));
  }
  cache = next;
  emit();
}

let currentRole: UserRole | null = null;
export function setCatalogRole(role: UserRole | null) {
  currentRole = role;
}
const refresh = () => loadCatalog(currentRole);

export function topRole(roles: string[]): UserRole {
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('store_owner')) return 'store_owner';
  return 'customer';
}

// ---- Stores ----
export const getStores = (): Store[] => cache.stores;
export const getStoreBySlug = (slug: string) => cache.stores.find((s) => s.slug === slug) ?? null;
export const getStoreById = (id: string) => cache.stores.find((s) => s.id === id) ?? null;
export const getStoresByOwner = (ownerId: string) => cache.stores.filter((s) => s.ownerId === ownerId);

export async function createStore(
  ownerId: string,
  data: { name: string; slug: string; tagline: string; description: string; logoText: string; bannerImage: string },
): Promise<void> {
  const { error } = await supabase.from('stores').insert({
    owner_id: ownerId,
    slug: data.slug,
    name: data.name,
    tagline: data.tagline,
    description: data.description,
    logo_text: data.logoText || data.name.charAt(0).toUpperCase(),
    banner_image: data.bannerImage,
  });
  if (error) throw new Error(error.code === '23505' ? 'That store address is already taken.' : error.message);
  await refresh();
}

export async function updateStore(id: string, patch: Partial<Pick<Store, 'name' | 'tagline' | 'description'>>) {
  const { error } = await supabase.from('stores').update(patch).eq('id', id);
  if (error) throw new Error(error.message);
  await refresh();
}

// ---- Products ----
export const getProducts = (): Product[] => cache.products;
export const getProductsByStore = (storeId: string) => cache.products.filter((p) => p.storeId === storeId);
export const getProductById = (id: string) => cache.products.find((p) => p.id === id) ?? null;

interface ProductInput {
  storeId: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number | null;
  image: string;
  variants: { color: string; colorHex: string; sizes: string[] }[];
}

async function writeVariants(productId: string, variants: ProductInput['variants']) {
  await supabase.from('product_variants').delete().eq('product_id', productId);
  if (variants.length) {
    const { error } = await supabase.from('product_variants').insert(
      variants.map((v, i) => ({ product_id: productId, color: v.color, color_hex: v.colorHex, sizes: v.sizes, position: i })),
    );
    if (error) throw new Error(error.message);
  }
}

export async function createProduct(data: ProductInput): Promise<void> {
  const { data: row, error } = await supabase
    .from('products')
    .insert({
      store_id: data.storeId,
      name: data.name,
      description: data.description,
      category: data.category,
      price: data.price,
      image: data.image,
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  await writeVariants(row.id, data.variants);
  await refresh();
}

export async function updateProduct(id: string, patch: Omit<ProductInput, 'storeId'>): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({
      name: patch.name,
      description: patch.description,
      category: patch.category,
      price: patch.price,
      image: patch.image,
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  await writeVariants(id, patch.variants);
  await refresh();
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
  await refresh();
}

/** Uploads a product photo to private storage and returns a long-lived link. */
export async function uploadProductImage(userId: string, file: File): Promise<string> {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('product-media').upload(path, file, { contentType: file.type });
  if (error) throw new Error(error.message);
  const { data, error: e2 } = await supabase.storage.from('product-media').createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (e2 || !data) throw new Error(e2?.message ?? 'Could not create image link.');
  return data.signedUrl;
}

// ---- Sessions & analytics ----
export const getSessionsByStore = (storeId: string) => cache.sessions.filter((s) => s.storeId === storeId);
export const getAllSessions = () => cache.sessions;
export const getFailedSessions = () => cache.sessions.filter((s) => s.status === 'failed');

export function getAnalyticsForStore(storeId: string): AnalyticsSummary {
  const sessions = getSessionsByStore(storeId);
  const counts = new Map<string, number>();
  for (const s of sessions) counts.set(s.productId, (counts.get(s.productId) ?? 0) + 1);
  let mostTriedProduct: AnalyticsSummary['mostTriedProduct'] = null;
  let max = 0;
  for (const [pid, count] of counts) {
    if (count > max) {
      max = count;
      mostTriedProduct = { id: pid, name: getProductById(pid)?.name ?? 'Unknown', count };
    }
  }
  return {
    totalTryOns: sessions.length,
    successful: sessions.filter((s) => s.status === 'completed').length,
    failed: sessions.filter((s) => s.status === 'failed').length,
    mostTriedProduct,
    recentSessions: sessions.slice(0, 10),
  };
}

// ---- Users (admin) ----
export const getAllUsers = () => cache.users;
export async function toggleUserDisabled(id: string): Promise<void> {
  const u = cache.users.find((x) => x.id === id);
  if (!u) return;
  const { error } = await supabase.from('profiles').update({ disabled: !u.disabled }).eq('id', id);
  if (error) throw new Error(error.message);
  await refresh();
}
