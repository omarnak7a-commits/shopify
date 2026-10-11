export type UserRole = 'customer' | 'store_owner' | 'admin';

export type ProductCategory =
  | 'T-Shirts'
  | 'Shirts'
  | 'Hoodies'
  | 'Jackets'
  | 'Dresses'
  | 'Pants'
  | 'Skirts'
  | 'Other';

export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  createdAt: string;
  disabled?: boolean;
}

export interface Store {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  logoText: string;
  bannerImage: string;
  ownerId: string;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  color: string;
  colorHex: string;
  sizes: string[];
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number | null;
  image: string;
  variants: ProductVariant[];
  createdAt: string;
}

export interface TryOnSession {
  id: string;
  productId: string;
  storeId: string;
  personImage: string;
  resultImage: string | null;
  status: 'processing' | 'completed' | 'failed';
  consent: boolean;
  createdAt: string;
  completedAt: string | null;
}

export interface UsageEvent {
  id: string;
  type: 'try_on_started' | 'try_on_completed' | 'try_on_failed' | 'product_viewed';
  storeId: string;
  productId: string | null;
  sessionId: string | null;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalTryOns: number;
  successful: number;
  failed: number;
  mostTriedProduct: { id: string; name: string; count: number } | null;
  recentSessions: TryOnSession[];
}

export const CATEGORIES: ProductCategory[] = [
  'T-Shirts',
  'Shirts',
  'Hoodies',
  'Jackets',
  'Dresses',
  'Pants',
  'Skirts',
  'Other',
];

export const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
