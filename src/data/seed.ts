import type { Store, Product, AppUser } from '../types';

export const seedUsers: AppUser[] = [
  {
    id: 'u-owner-1',
    email: 'store@north.co',
    role: 'store_owner',
    displayName: 'Mara Linden',
    createdAt: '2025-08-12T10:00:00Z',
  },
  {
    id: 'u-owner-2',
    email: 'hello@studio-nine.co',
    role: 'store_owner',
    displayName: 'Theo Vance',
    createdAt: '2025-09-01T14:30:00Z',
  },
  {
    id: 'u-admin-1',
    email: 'admin@tryonix.com',
    role: 'admin',
    displayName: 'Admin',
    createdAt: '2025-07-01T00:00:00Z',
  },
];

export const seedStores: Store[] = [
  {
    id: 's-north',
    slug: 'north-studio',
    name: 'North Studio',
    tagline: 'Quiet essentials, made to last.',
    description:
      'North Studio makes considered wardrobe staples in natural fabrics — pieces designed to be worn often and kept for years.',
    logoText: 'N',
    bannerImage:
      'https://images.pexels.com/photos/8581033/pexels-photo-8581033.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ownerId: 'u-owner-1',
    createdAt: '2025-08-12T10:00:00Z',
  },
  {
    id: 's-nine',
    slug: 'studio-nine',
    name: 'Studio Nine',
    tagline: 'Considered pieces for everyday wear.',
    description:
      'Studio Nine is a small collection of modern basics and soft tailoring — clothing that feels easy and lived-in from the first wear.',
    logoText: '9',
    bannerImage:
      'https://images.pexels.com/photos/9594685/pexels-photo-9594685.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ownerId: 'u-owner-2',
    createdAt: '2025-09-01T14:30:00Z',
  },
];

export const seedProducts: Product[] = [
  // North Studio
  {
    id: 'p-001',
    storeId: 's-north',
    name: 'Oversized Cotton Tee',
    description:
      'A relaxed-fit tee cut from heavyweight organic cotton. Slightly dropped shoulders and a clean, boxy silhouette that pairs with everything.',
    category: 'T-Shirts',
    price: 48,
    image:
      'https://images.pexels.com/photos/5746098/pexels-photo-5746098.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    variants: [
      { id: 'v-001-a', color: 'Off White', colorHex: '#F3F1EC', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'v-001-b', color: 'Stone', colorHex: '#B0A89E', sizes: ['S', 'M', 'L'] },
      { id: 'v-001-c', color: 'Black', colorHex: '#1C1C1C', sizes: ['S', 'M', 'L', 'XL'] },
    ],
    createdAt: '2025-08-15T09:00:00Z',
  },
  {
    id: 'p-002',
    storeId: 's-north',
    name: 'Linen Camp Shirt',
    description:
      'A lightweight linen shirt with an open collar and relaxed body. Breathable and soft, made for warm days and slow mornings.',
    category: 'Shirts',
    price: 89,
    image:
      'https://images.pexels.com/photos/8408556/pexels-photo-8408556.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    variants: [
      { id: 'v-002-a', color: 'Sand', colorHex: '#D4C5A9', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'v-002-b', color: 'Olive', colorHex: '#6B6B4A', sizes: ['M', 'L'] },
    ],
    createdAt: '2025-08-18T12:00:00Z',
  },
  {
    id: 'p-003',
    storeId: 's-north',
    name: 'Heavyweight Hoodie',
    description:
      'A brushed-fleece hoodie with a generous hood and ribbed cuffs. Warm without bulk, with a clean finish that holds its shape.',
    category: 'Hoodies',
    price: 120,
    image:
      'https://images.pexels.com/photos/9594087/pexels-photo-9594087.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    variants: [
      { id: 'v-003-a', color: 'Heather Grey', colorHex: '#A8A8A4', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'v-003-b', color: 'Black', colorHex: '#1C1C1C', sizes: ['S', 'M', 'L', 'XL'] },
    ],
    createdAt: '2025-08-20T10:00:00Z',
  },
  {
    id: 'p-004',
    storeId: 's-north',
    name: 'Quilted Field Jacket',
    description:
      'A lightweight quilted jacket with a stand collar and zip front. Designed for transitional weather and easy layering.',
    category: 'Jackets',
    price: 195,
    image:
      'https://images.pexels.com/photos/6044143/pexels-photo-6044143.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    variants: [
      { id: 'v-004-a', color: 'Black', colorHex: '#1C1C1C', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'v-004-b', color: 'Khaki', colorHex: '#8B7E5E', sizes: ['M', 'L', 'XL'] },
    ],
    createdAt: '2025-08-25T08:00:00Z',
  },
  // Studio Nine
  {
    id: 'p-005',
    storeId: 's-nine',
    name: 'Slip Midi Dress',
    description:
      'A bias-cut slip dress in a soft, flowing fabric. Adjustable straps and a gentle drape that moves with you.',
    category: 'Dresses',
    price: 135,
    image:
      'https://images.pexels.com/photos/31674953/pexels-photo-31674953.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    variants: [
      { id: 'v-005-a', color: 'Ivory', colorHex: '#EFEAE2', sizes: ['XS', 'S', 'M', 'L'] },
      { id: 'v-005-b', color: 'Black', colorHex: '#1C1C1C', sizes: ['XS', 'S', 'M', 'L'] },
    ],
    createdAt: '2025-09-03T11:00:00Z',
  },
  {
    id: 'p-006',
    storeId: 's-nine',
    name: 'Wide-Leg Trouser',
    description:
      'High-waisted trousers with a wide, flowing leg. A tailored waistband and a fluid drape for an easy, polished look.',
    category: 'Pants',
    price: 110,
    image:
      'https://images.pexels.com/photos/36856704/pexels-photo-36856704.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    variants: [
      { id: 'v-006-a', color: 'Camel', colorHex: '#B89B78', sizes: ['XS', 'S', 'M', 'L'] },
      { id: 'v-006-b', color: 'Charcoal', colorHex: '#3A3A3A', sizes: ['S', 'M', 'L'] },
    ],
    createdAt: '2025-09-05T13:00:00Z',
  },
  {
    id: 'p-007',
    storeId: 's-nine',
    name: 'Soft Tailored Blazer',
    description:
      'An unstructured blazer with a relaxed shoulder and natural drape. Wear it open over a tee or buttoned for a cleaner line.',
    category: 'Jackets',
    price: 175,
    image:
      'https://images.pexels.com/photos/19778358/pexels-photo-19778358.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    variants: [
      { id: 'v-007-a', color: 'Check', colorHex: '#7A6E5E', sizes: ['XS', 'S', 'M', 'L'] },
      { id: 'v-007-b', color: 'Black', colorHex: '#1C1C1C', sizes: ['S', 'M', 'L'] },
    ],
    createdAt: '2025-09-08T09:30:00Z',
  },
  {
    id: 'p-008',
    storeId: 's-nine',
    name: 'Merino Knit Top',
    description:
      'A fine-gauge merino top with a close, comfortable fit. Lightweight warmth and a smooth, matte finish.',
    category: 'Shirts',
    price: 95,
    image:
      'https://images.pexels.com/photos/36646353/pexels-photo-36646353.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    variants: [
      { id: 'v-008-a', color: 'Black', colorHex: '#1C1C1C', sizes: ['XS', 'S', 'M', 'L'] },
      { id: 'v-008-b', color: 'Oat', colorHex: '#D8CFC0', sizes: ['XS', 'S', 'M'] },
    ],
    createdAt: '2025-09-10T10:00:00Z',
  },
];

export const heroImages = {
  model: 'https://images.pexels.com/photos/7945547/pexels-photo-7945547.jpeg?auto=compress&cs=tinysrgb&h=1200&w=800',
  editorial: 'https://images.pexels.com/photos/3378893/pexels-photo-3378893.jpeg?auto=compress&cs=tinysrgb&h=1200&w=800',
  tryOnBefore:
    'https://images.pexels.com/photos/19222080/pexels-photo-19222080.jpeg?auto=compress&cs=tinysrgb&h=1000&w=750',
  tryOnAfter:
    'https://images.pexels.com/photos/31444898/pexels-photo-31444898.jpeg?auto=compress&cs=tinysrgb&h=1000&w=750',
  storeRack:
    'https://images.pexels.com/photos/5706277/pexels-photo-5706277.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
};
