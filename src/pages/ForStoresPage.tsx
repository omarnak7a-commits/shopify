import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SmartImage } from '../components/SmartImage';
import { Store as StoreIcon, Upload, BarChart3, Shield, ArrowRight, Check } from 'lucide-react';
import { heroImages } from '../data/seed';

export default function ForStoresPage() {
  return (
    <div>
      <section className="mx-auto max-w-wide px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <p className="text-sm font-medium text-accent uppercase tracking-wider">For Stores</p>
            <h1 className="mt-3 text-5xl sm:text-6xl font-display font-semibold tracking-tighter2 leading-[1.05] text-balance">
              Let customers try your clothes before they buy.
            </h1>
            <p className="mt-6 text-lg text-ink-muted leading-relaxed">
              Give your customers a better way to discover your clothes. Set up your store, upload your products, and let people see themselves wearing them.
            </p>
            <Link to="/register" className="mt-8 inline-flex btn-accent btn-lg">
              Create your store <ArrowRight size={18} />
            </Link>
          </motion.div>
          <SmartImage
            src={heroImages.storeRack}
            alt="Clothing rack in a modern boutique"
            aspectRatio="aspect-[4/3]"
            className="rounded-sm"
          />
        </div>
      </section>

      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-wide px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl sm:text-4xl font-display font-semibold tracking-tighter2 text-center mb-12">
            Everything you need to get started
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: StoreIcon, title: 'Create your store page', text: 'Set up your store with your name, logo, and description in minutes.' },
              { icon: Upload, title: 'Upload products', text: 'Add product photos, descriptions, colors, and sizes — all in one simple form.' },
              { icon: BarChart3, title: 'See what people try', text: 'Track which pieces get tried on most and what catches attention.' },
              { icon: Shield, title: 'Stay in control', text: 'Manage your products anytime. Your store, your rules.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div className="w-12 h-12 rounded-full border border-line flex items-center justify-center mb-4">
                  <item.icon size={22} className="text-ink" />
                </div>
                <h3 className="text-lg font-display font-medium text-ink mb-2">{item.title}</h3>
                <p className="text-ink-muted leading-relaxed text-sm">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-wide px-4 sm:px-6 lg:px-8 py-20">
        <div className="card p-8 sm:p-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-display font-semibold tracking-tighter2">
                Simple to start
              </h2>
              <ul className="mt-6 space-y-3">
                {[
                  'No technical setup required',
                  'Add your first product in under a minute',
                  'Customers can try without creating an account',
                  'Your store is ready to share instantly',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-ink-soft">
                    <Check size={18} className="text-success shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-4 lg:items-end">
              <Link to="/register" className="btn-accent btn-lg">
                Create your store <ArrowRight size={18} />
              </Link>
              <Link to="/stores" className="btn-ghost">
                See an example store
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
