import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getStoreBySlug, getProductById, recordProductView } from '../services/catalog';
import { SmartImage } from '../components/SmartImage';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

export default function ProductPage() {
  const { slug, productId } = useParams<{ slug: string; productId: string }>();
  const store = slug ? getStoreBySlug(slug) : null;
  const product = productId ? getProductById(productId) : null;
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    if (store && product) {
      recordProductView(store.id, product.id);
      if (product.variants.length > 0) {
        setSelectedSize(product.variants[0].sizes[0] ?? '');
      }
    }
  }, [store, product]);

  if (!store || !product) {
    return (
      <div className="mx-auto max-w-wide px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-3xl font-display font-semibold">Product not found</h1>
        <Link to="/stores" className="mt-6 inline-flex btn-outline">
          <ArrowLeft size={18} /> Browse stores
        </Link>
      </div>
    );
  }

  const variant = product.variants[selectedVariant];

  return (
    <div className="mx-auto max-w-wide px-4 sm:px-6 lg:px-8 py-8">
      <Link to={`/stores/${store.slug}`} className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink transition-colors mb-6">
        <ArrowLeft size={16} /> Back to {store.name}
      </Link>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Product image */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <SmartImage
            src={product.image}
            alt={product.name}
            aspectRatio="aspect-[3/4]"
            className="rounded-sm"
          />
        </div>

        {/* Product details */}
        <div>
          <p className="text-sm text-ink-muted uppercase tracking-wider">{product.category}</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-semibold tracking-tighter2">
            {product.name}
          </h1>
          {product.price && (
            <p className="mt-3 text-xl text-ink-soft">${product.price}</p>
          )}

          <p className="mt-6 text-ink-soft leading-relaxed">{product.description}</p>

          {/* Colors */}
          {product.variants.length > 0 && (
            <div className="mt-8">
              <p className="label">
                Color — <span className="text-ink-muted font-normal">{variant?.color}</span>
              </p>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((v, i) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVariant(i);
                      setSelectedSize(v.sizes[0] ?? '');
                    }}
                    className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                      selectedVariant === i ? 'border-ink' : 'border-line'
                    }`}
                    style={{ backgroundColor: v.colorHex }}
                    aria-label={v.color}
                    title={v.color}
                  >
                    {selectedVariant === i && (
                      <Check
                        size={14}
                        className="absolute inset-0 m-auto"
                        style={{
                          color: ['#F3F1EC', '#EFEAE2', '#D8CFC0', '#D4C5A9', '#F0EDE8'].includes(v.colorHex) ? '#171717' : '#FAFAF8',
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {variant && variant.sizes.length > 0 && (
            <div className="mt-6">
              <p className="label">Size</p>
              <div className="flex flex-wrap gap-2">
                {variant.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[3rem] px-3 py-2 text-sm border transition-all ${
                      selectedSize === size
                        ? 'border-ink bg-ink text-canvas'
                        : 'border-line text-ink-soft hover:border-ink'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Try it on CTA */}
          <div className="mt-10 pt-8 border-t border-line">
            <Link
              to={`/stores/${store.slug}/${product.id}/try-on`}
              className="btn-primary btn-lg w-full sm:w-auto"
            >
              Try it on <ArrowRight size={18} />
            </Link>
            <p className="mt-4 text-sm text-ink-muted">
              Just upload a photo and see how it looks on you. No sign-up needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
