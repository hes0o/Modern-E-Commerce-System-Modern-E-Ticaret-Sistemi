import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, Zap, Shield, Truck, RotateCcw,
  ChevronLeft, ChevronRight, Tag, Sparkles,
  TrendingUp, Star, Package
} from 'lucide-react'
import { productService } from '@/services/productService'
import ProductCard from '@/components/store/ProductCard'

const HERO_SLIDES = [
  {
    tag: '🔥 Summer Sale',
    title: 'Up to 70% Off',
    subtitle: 'Thousands of products at unbeatable prices. Limited time offer!',
    cta: 'Shop the Sale',
    ctaLink: '/shop?sort=discount',
    secondary: 'Explore All',
    secondaryLink: '/shop',
    bg: 'from-indigo-600 via-violet-600 to-purple-700',
    accent: 'from-yellow-400 to-orange-400',
  },
  {
    tag: '✨ Just Dropped',
    title: 'New Arrivals',
    subtitle: "Fresh styles and the latest tech — be the first to discover what's new.",
    cta: 'View New Arrivals',
    ctaLink: '/shop?sort=new',
    secondary: 'View All Products',
    secondaryLink: '/shop',
    bg: 'from-slate-800 via-slate-700 to-indigo-900',
    accent: 'from-emerald-400 to-cyan-400',
  },
  {
    tag: '🏆 Top Picks',
    title: 'Bestsellers',
    subtitle: "Products loved by thousands of customers. Trusted quality, proven performance.",
    cta: 'Shop Bestsellers',
    ctaLink: '/shop',
    secondary: 'Create Account',
    secondaryLink: '/login?tab=register',
    bg: 'from-rose-600 via-pink-600 to-rose-800',
    accent: 'from-yellow-300 to-amber-400',
  },
]

const FEATURES = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over ₺500' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '30-day hassle-free policy' },
  { icon: Shield, title: 'Secure Checkout', desc: 'SSL 256-bit encryption' },
  { icon: Zap, title: 'Fast Delivery', desc: 'Same-day in select cities' },
]

const CATEGORY_CARDS = [
  { name: 'Electronics', emoji: '💻', color: 'bg-blue-50 hover:bg-blue-100', text: 'text-blue-700', slug: 'electronics' },
  { name: 'Clothing', emoji: '👗', color: 'bg-pink-50 hover:bg-pink-100', text: 'text-pink-700', slug: 'clothing' },
  { name: 'Home & Garden', emoji: '🏠', color: 'bg-green-50 hover:bg-green-100', text: 'text-green-700', slug: 'home-garden' },
  { name: 'Sports', emoji: '⚽', color: 'bg-orange-50 hover:bg-orange-100', text: 'text-orange-700', slug: 'sports' },
  { name: 'Books', emoji: '📚', color: 'bg-purple-50 hover:bg-purple-100', text: 'text-purple-700', slug: 'books' },
]

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const res = await productService.getAll({ page: 1, limit: 16 })
        const items = res.items || []
        setProducts(items)
        setFeatured(items.filter(p => p.is_featured || p.is_new || p.is_bestseller).slice(0, 8) || items.slice(0, 8))
      } catch { setProducts([]) } finally { setLoading(false) }
    }
    load()
  }, [])

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5500)
    return () => clearInterval(t)
  }, [])

  const hero = HERO_SLIDES[slide]

  return (
    <div className="flex flex-col">

      {/* ── Hero Slider ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          className={`bg-gradient-to-br ${hero.bg} transition-all duration-700`}
          style={{ minHeight: '480px' }}
        >
          {/* Background decorations */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/3 blur-3xl" />
          </div>

          <div className="relative max-w-screen-xl mx-auto px-6 lg:px-8 py-20 lg:py-28 flex flex-col items-center text-center">
            {/* Tag */}
            <span className={`inline-flex items-center gap-2 bg-gradient-to-r ${hero.accent} text-slate-900 text-xs font-black px-4 py-2 rounded-full mb-6 shadow-lg`}>
              {hero.tag}
            </span>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-5 max-w-3xl">
              {hero.title}
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/75 max-w-2xl leading-relaxed mb-10">
              {hero.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to={hero.ctaLink}
                className="inline-flex items-center gap-2.5 bg-white text-slate-900 font-bold px-8 py-4 rounded-2xl hover:bg-gray-50 active:scale-[0.98] transition-all shadow-xl shadow-black/20 hover:shadow-2xl text-sm"
              >
                {hero.cta} <ArrowRight size={17} />
              </Link>
              <Link
                to={hero.secondaryLink}
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 active:scale-[0.98] transition-all text-sm"
              >
                {hero.secondary}
              </Link>
            </div>

            {/* Slide dots */}
            <div className="flex items-center gap-2 mt-12">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  className={`rounded-full transition-all duration-300 ${i === slide ? 'w-8 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/60'}`}
                />
              ))}
            </div>
          </div>

          {/* Side arrows */}
          {['left', 'right'].map(dir => (
            <button
              key={dir}
              onClick={() => setSlide(s => dir === 'left' ? (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length : (s + 1) % HERO_SLIDES.length)}
              className={`absolute ${dir === 'left' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center transition-all border border-white/20`}
            >
              {dir === 'left' ? <ChevronLeft size={20} className="text-white" /> : <ChevronRight size={20} className="text-white" />}
            </button>
          ))}
        </div>
      </section>

      {/* ── Features bar ─────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 py-5 px-6 first:pl-0 last:pr-0">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Grid ─────────────────────────────────────────────────── */}
      <section className="max-w-screen-xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Shop by Category</h2>
            <p className="text-gray-400 text-sm mt-0.5">Find exactly what you're looking for</p>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {CATEGORY_CARDS.map(cat => (
            <Link
              key={cat.slug}
              to={`/shop?category=${cat.slug}`}
              className={`${cat.color} ${cat.text} rounded-2xl p-4 text-center transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer border border-transparent hover:border-current/10 group`}
            >
              <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{cat.emoji}</span>
              <p className="text-xs font-bold leading-tight">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────────────── */}
      <section className="max-w-screen-xl mx-auto px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles size={22} className="text-indigo-500" />
              Featured Products
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">Handpicked just for you</p>
          </div>
          <Link to="/shop" className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 group">
            View All <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 lg:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-gray-100 animate-pulse" style={{ aspectRatio: '3/4' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-300">
            <Package size={60} className="mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-500">No products yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
            {products.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* ── Deals Banner ─────────────────────────────────────────────────── */}
      <section className="max-w-screen-xl mx-auto px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Deal card 1 */}
          <div className="relative bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl overflow-hidden p-8 text-white">
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 border border-white/20">
                <TrendingUp size={12} /> Today's Deal
              </span>
              <h3 className="text-2xl font-black mb-2">Electronics Sale</h3>
              <p className="text-indigo-200 text-sm mb-5">Up to 40% off on headphones, TVs, and more.</p>
              <Link to="/shop?category=electronics" className="inline-flex items-center gap-2 bg-white text-indigo-700 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-all">
                Shop Electronics <ArrowRight size={15} />
              </Link>
            </div>
          </div>
          {/* Deal card 2 */}
          <div className="relative bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl overflow-hidden p-8 text-white">
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 border border-white/20">
                <Star size={12} fill="currentColor" /> New Season
              </span>
              <h3 className="text-2xl font-black mb-2">Fashion & Style</h3>
              <p className="text-rose-200 text-sm mb-5">Discover the latest trends in clothing and footwear.</p>
              <Link to="/shop?category=clothing" className="inline-flex items-center gap-2 bg-white text-rose-600 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-rose-50 transition-all">
                Shop Fashion <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── More Products ─────────────────────────────────────────────────── */}
      {products.length > 8 && (
        <section className="max-w-screen-xl mx-auto px-6 lg:px-8 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">More Products</h2>
            <Link to="/shop" className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 group">
              View All <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
            {products.slice(8, 16).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── Sign-up CTA ───────────────────────────────────────────────────── */}
      <section className="max-w-screen-xl mx-auto px-6 lg:px-8 pb-16">
        <div className="relative bg-slate-900 rounded-3xl overflow-hidden p-10 md:p-14 text-white text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 left-1/4 w-72 h-72 rounded-full bg-indigo-600/20 blur-3xl" />
            <div className="absolute -bottom-16 right-1/4 w-72 h-72 rounded-full bg-violet-600/20 blur-3xl" />
          </div>
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-full mb-5 border border-indigo-500/30">
              <Sparkles size={12} /> Exclusive Offer
            </span>
            <h2 className="text-3xl md:text-4xl font-black mb-3">Join & Save 10%</h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-8 text-base">
              Create a free account today and get 10% off your first order, early access to deals, and personalised recommendations.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/login?tab=register"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-indigo-900/50 hover:shadow-indigo-900/70 hover:-translate-y-0.5 text-sm"
              >
                Create Free Account <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white font-semibold px-8 py-4 rounded-2xl transition-all text-sm"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
