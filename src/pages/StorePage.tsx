import { useParams, Link } from 'react-router-dom';
import { getStoreBySlug, getProductsByStore } from '../services/catalog';
import { SmartImage } from '../components/SmartImage';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function StorePage() {
  const { slug } = useParams<{ slug: string }>();
  const store = slug ? getStoreBySlug(slug) : null;

  if (!store) {
    return (
      <div className="mx-auto max-w-wide px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-3xl font-display font-semibold">Store not found</h1>
        <p className="mt-3 text-ink-muted">The store you're looking for doesn't exist.</p>
        <Link to="/stores" className="mt-6 inline-flex btn-outline">
          <ArrowLeft size={18} /> Browse all stores
        </Link>
      </div>
    );
  }

  const products = getProductsByStore(store.id);

  return (
    <div>
      {/* Store banner */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <SmartImage
          src={store.bannerImage}
          alt={store.name}
          aspectRatio="aspect-auto"
          className="absolute inset-0 h-full"
          imgClassName="h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="mx-auto max-w-wide px-4 sm:px-6 lg:px-8">
        {/* Store header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-8 relative z-10 pb-8 border-b border-line">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-ink text-canvas flex items-center justify-center text-2xl font-display font-semibold border-4 border-canvas shrink-0">
              {store.logoText}
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-tighter2 text-white sm:text-ink drop-shadow-sm sm:drop-shadow-none">
                {store.name}
              </h1>
              <p className="text-white/90 sm:text-ink-muted text-sm sm:text-base">{store.tagline}</p>
            </div>
          </div>
          <Link to="/stores" className="text-sm text-ink-muted hover:text-ink hidden sm:flex items-center gap-1">
            <ArrowLeft size={16} /> All stores
          </Link>
        </div>

        {/* Description */}
        <p className="mt-8 text-ink-muted leading-relaxed max-w-prose2">{store.description}</p>

        {/* Products grid */}
        <div className="mt-10 mb-16">
          <h2 className="text-lg font-medium text-ink mb-6">All pieces</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/stores/${store.slug}/${product.id}`}
                className="group block"
              >
                <SmartImage
                  src={product.image}
                  alt={product.name}
                  aspectRatio="aspect-[3/4]"
                  className="rounded-sm"
                  imgClassName="group-hover:scale-105 transition-transform duration-500"
                />
                <div className="mt-3">
                  <h3 className="text-sm font-medium text-ink group-hover:text-accent transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="mt-1 flex items-center justify-between">
                    {product.price ? (
                      <span className="text-sm text-ink-muted">${product.price}</span>
                    ) : (
                      <span className="text-sm text-ink-muted">—</span>
                    )}
                    <span className="text-xs text-ink-muted flex items-center gap-0.5 group-hover:text-accent transition-colors">
                      Try it on <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
