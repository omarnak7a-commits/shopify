import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SmartImage } from '../components/SmartImage';
import { heroImages } from '../data/seed';
import { Shirt, Camera, Sparkles, ArrowRight, Store as StoreIcon, Check } from 'lucide-react';

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-wide px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="max-w-xl"
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-semibold tracking-tighter2 leading-[1.05] text-balance">
                See yourself in it.
              </h1>
              <p className="mt-6 text-lg text-ink-muted leading-relaxed max-w-prose2">
                Try clothes virtually before you decide what to wear. Just upload a photo and see how any piece looks on you.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/stores" className="btn-primary btn-lg">
                  Try it now <ArrowRight size={18} />
                </Link>
                <Link to="/for-stores" className="btn-outline btn-lg">
                  For stores
                </Link>
              </div>
              <p className="mt-6 text-sm text-ink-muted">
                No sign-up needed to try. No payment. No checkout. Just see how it looks.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
              className="relative"
            >
              <div className="relative grid grid-cols-2 gap-4">
                <SmartImage
                  src={heroImages.model}
                  alt="Model wearing a relaxed white blouse and trousers"
                  aspectRatio="aspect-[3/4]"
                  className="rounded-sm"
                />
                <div className="pt-8">
                  <SmartImage
                    src={heroImages.editorial}
                    alt="Editorial fashion portrait in a checkered coat"
                    aspectRatio="aspect-[3/4]"
                    className="rounded-sm"
                  />
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 hidden sm:block bg-canvas border border-line px-5 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-50 flex items-center justify-center">
                    <Sparkles size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">See it on you</p>
                    <p className="text-xs text-ink-muted">In seconds</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-line bg-white">
        <div className="mx-auto max-w-wide px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-medium text-accent uppercase tracking-wider">How it works</p>
            <h2 className="mt-3 text-4xl sm:text-5xl font-display font-semibold tracking-tighter2">
              Three simple steps
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { num: '01', icon: Shirt, title: 'Choose a piece.', text: 'Browse a store and pick something you like.' },
              { num: '02', icon: Camera, title: 'Upload your photo.', text: 'Use a clear photo with your body visible.' },
              { num: '03', icon: Sparkles, title: 'See it on you.', text: 'Your look appears in seconds. That\u2019s it.' },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex w-14 h-14 rounded-full border border-line items-center justify-center mb-6">
                  <step.icon size={24} className="text-ink" />
                </div>
                <p className="text-sm font-medium text-ink-muted mb-2">{step.num}</p>
                <h3 className="text-xl font-display font-medium text-ink mb-2">{step.title}</h3>
                <p className="text-ink-muted leading-relaxed max-w-xs mx-auto">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview — before/after */}
      <section className="mx-auto max-w-wide px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-sm font-medium text-accent uppercase tracking-wider">TryOnix Preview</p>
            <h2 className="mt-3 text-4xl sm:text-5xl font-display font-semibold tracking-tighter2 leading-tight">
              From browsing to wearing.
            </h2>
            <p className="mt-6 text-lg text-ink-muted leading-relaxed max-w-prose2">
              See the difference before you commit. You pick a piece, upload a photo, and get a clear picture of how it looks on you — no guesswork, no dressing room.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                'Works on any phone',
                'Your photos stay private',
                'See results in seconds',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-ink-soft">
                  <Check size={18} className="text-success" /> {item}
                </li>
              ))}
            </ul>
            <Link to="/stores" className="mt-8 inline-flex btn-primary">
              Try a sample <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-ink-muted mb-2 uppercase tracking-wider">Before</p>
              <SmartImage
                src={heroImages.tryOnBefore}
                alt="Person before trying on clothing"
                aspectRatio="aspect-[3/4]"
                className="rounded-sm"
              />
            </div>
            <div className="pt-8">
              <p className="text-xs text-ink-muted mb-2 uppercase tracking-wider">After</p>
              <SmartImage
                src={heroImages.tryOnAfter}
                alt="Person wearing the selected clothing"
                aspectRatio="aspect-[3/4]"
                className="rounded-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* For Stores */}
      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-wide px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <SmartImage
                src={heroImages.storeRack}
                alt="Clothing arranged on hangers in a modern store"
                aspectRatio="aspect-[4/3]"
                className="rounded-sm"
              />
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-sm font-medium text-accent uppercase tracking-wider">For Stores</p>
              <h2 className="mt-3 text-4xl sm:text-5xl font-display font-semibold tracking-tighter2 leading-tight">
                Give your customers a better way to discover your clothes.
              </h2>
              <p className="mt-6 text-lg text-ink-muted leading-relaxed max-w-prose2">
                Let people see themselves in your pieces before they buy. It's simple to set up and easy to manage.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  { icon: StoreIcon, text: 'Create your store page in minutes' },
                  { icon: Shirt, text: 'Upload products with photos and details' },
                  { icon: Sparkles, text: 'Let customers try clothes virtually' },
                  { icon: Check, text: 'See which products customers try most' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full border border-line flex items-center justify-center shrink-0">
                      <item.icon size={18} className="text-ink" />
                    </div>
                    <span className="text-ink-soft">{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className="mt-8 inline-flex btn-accent btn-lg">
                Create your store <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-wide px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-display font-semibold tracking-tighter2">
            Ready to try something new?
          </h2>
          <p className="mt-4 text-lg text-ink-muted">
            Pick a piece and see how it looks on you. It takes less than a minute.
          </p>
          <Link to="/stores" className="mt-8 inline-flex btn-primary btn-lg">
            Try it now <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
