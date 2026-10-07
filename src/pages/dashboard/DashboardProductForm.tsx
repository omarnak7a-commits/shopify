import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStoresByOwner, getProductById, createProduct, updateProduct } from '../../services/catalog';
import { CATEGORIES, STANDARD_SIZES, type ProductCategory } from '../../types';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';

interface VariantForm {
  color: string;
  colorHex: string;
  sizes: string[];
}

export default function DashboardProductForm() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const stores = user ? getStoresByOwner(user.id) : [];
  const primaryStore = stores[0];
  const existingProduct = productId ? getProductById(productId) : null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProductCategory>('T-Shirts');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [variants, setVariants] = useState<VariantForm[]>([
    { color: '', colorHex: '#000000', sizes: ['S', 'M', 'L'] },
  ]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setDescription(existingProduct.description);
      setCategory(existingProduct.category);
      setPrice(existingProduct.price?.toString() ?? '');
      setImage(existingProduct.image);
      setVariants(existingProduct.variants.map((v) => ({ color: v.color, colorHex: v.colorHex, sizes: v.sizes })));
    }
  }, [existingProduct]);

  if (!primaryStore) {
    return (
      <div>
        <h1 className="text-3xl font-display font-semibold tracking-tighter2 mb-8">Add product</h1>
        <div className="card p-12 text-center">
          <p className="text-ink-muted">Create a store first to add products.</p>
        </div>
      </div>
    );
  }

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image is too large. Please use one under 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const updateVariant = (idx: number, patch: Partial<VariantForm>) => {
    setVariants((prev) => prev.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  };

  const toggleSize = (idx: number, size: string) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== idx) return v;
        const has = v.sizes.includes(size);
        return { ...v, sizes: has ? v.sizes.filter((s) => s !== size) : [...v.sizes, size] };
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter a product name.');
      return;
    }
    if (!image) {
      setError('Please upload a product image.');
      return;
    }

    const cleanVariants = variants.filter((v) => v.color.trim());

    if (existingProduct) {
      updateProduct(existingProduct.id, {
        name: name.trim(),
        description: description.trim(),
        category,
        price: price ? parseFloat(price) : null,
        image,
        variants: cleanVariants.map((v) => ({ id: '', color: v.color, colorHex: v.colorHex, sizes: v.sizes })),
      });
    } else {
      createProduct({
        storeId: primaryStore.id,
        name: name.trim(),
        description: description.trim(),
        category,
        price: price ? parseFloat(price) : null,
        image,
        variants: cleanVariants,
      });
    }
    navigate('/dashboard/products');
  };

  return (
    <div>
      <Link to="/dashboard/products" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink transition-colors mb-6">
        <ArrowLeft size={16} /> Back to products
      </Link>

      <h1 className="text-3xl font-display font-semibold tracking-tighter2 mb-8">
        {existingProduct ? 'Edit product' : 'Add product'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Image upload */}
        <div>
          <label className="label">Product image</label>
          {image ? (
            <div className="relative inline-block">
              <img src={image} alt="Product" className="w-40 h-52 object-cover rounded-sm border border-line" />
              <button
                type="button"
                onClick={() => setImage('')}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ink text-canvas flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-line rounded-sm w-40 h-52 flex flex-col items-center justify-center gap-2 hover:border-ink transition-colors"
            >
              <Upload size={22} className="text-ink-muted" />
              <span className="text-xs text-ink-muted">Upload image</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
          />
        </div>

        {/* Name */}
        <div>
          <label className="label" htmlFor="name">Product name</label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Oversized Cotton Tee"
          />
        </div>

        {/* Category & Price */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="category">Category</label>
            <select
              id="category"
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="price">Price (optional)</label>
            <input
              id="price"
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="48"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea
            id="description"
            className="input min-h-[100px] resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the material, fit, and feel..."
          />
        </div>

        {/* Variants */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="label mb-0">Colors & sizes</label>
            <button
              type="button"
              onClick={() => setVariants([...variants, { color: '', colorHex: '#000000', sizes: ['S', 'M', 'L'] }])}
              className="btn-ghost text-xs"
            >
              <Plus size={14} /> Add color
            </button>
          </div>
          <div className="space-y-3">
            {variants.map((variant, idx) => (
              <div key={idx} className="card p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 grid grid-cols-[1fr_auto] gap-3">
                    <input
                      className="input"
                      placeholder="Color name (e.g. Black)"
                      value={variant.color}
                      onChange={(e) => updateVariant(idx, { color: e.target.value })}
                    />
                    <input
                      type="color"
                      className="w-12 h-12 border border-line cursor-pointer rounded"
                      value={variant.colorHex}
                      onChange={(e) => updateVariant(idx, { colorHex: e.target.value })}
                      aria-label="Color"
                    />
                  </div>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                      className="btn-ghost text-error p-2"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-xs text-ink-muted mb-2">Sizes</p>
                  <div className="flex flex-wrap gap-2">
                    {STANDARD_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(idx, size)}
                        className={`px-3 py-1.5 text-xs border transition-all ${
                          variant.sizes.includes(size)
                            ? 'border-ink bg-ink text-canvas'
                            : 'border-line text-ink-muted hover:border-ink'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-error">{error}</p>
        )}

        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn-primary">
            {existingProduct ? 'Save changes' : 'Add product'}
          </button>
          <Link to="/dashboard/products" className="btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
