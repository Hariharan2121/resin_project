import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import {
  Search, X, Loader2, AlertCircle,
  MessageCircle, Star, Palette, Package, Heart,
  ArrowRight, Filter, ChevronDown, LayoutGrid, Sparkles
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getFavourites, addFavourite, removeFavourite, getProducts } from '../services/api'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Search & Filter State
  const [search, setSearch] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [sortBy, setSortBy] = useState('Default')
  const [priceFilter, setPriceFilter] = useState('All Prices')
  const [availabilityFilter, setAvailabilityFilter] = useState('All Items')
  const [collectionFilter, setCollectionFilter] = useState('All')

  // Interaction State
  const [favouriteIds, setFavouriteIds] = useState(new Set())
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const searchInputRef = useRef(null)

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        console.log('✅ Data received in Home.jsx:', data);
        console.log('📊 Is valid array?', Array.isArray(data));
        console.log('🔢 Length:', data?.length);

        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          console.log('🚀 State successfully updated with', data.length, 'products');
        } else {
          console.warn('⚠️ Received empty or invalid data in Home.jsx');
          setProducts([]);
        }
      } catch (error) {
        console.error('❌ Error loading products:', error);
        setProducts([]);
        setError('Failed to load products. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [])

  // Fetch favourites — server if logged in, localStorage if guest
  useEffect(() => {
    if (!user) {
      // Load guest favourites from localStorage
      const guestFavs = JSON.parse(localStorage.getItem('rkltrove_guest_favourites') || '[]');
      setFavouriteIds(new Set(guestFavs));
      return;
    }
    const fetchFavs = async () => {
      try {
        const res = await getFavourites();
        const ids = new Set((res.data.data || []).map((p) => p.id));
        setFavouriteIds(ids);
      } catch (err) {
        console.error('❌ Failed to fetch favourites:', err);
      }
    };
    fetchFavs();
  }, [user])

  const toggleFavourite = useCallback(async (prodId) => {
    const productId = prodId;
    const isFav = favouriteIds.has(productId);

    setFavouriteIds((prev) => {
      const next = new Set(prev)
      isFav ? next.delete(productId) : next.add(productId)
      return next
    })

    if (!user) {
      // Guest: sync to localStorage
      const guestFavs = JSON.parse(localStorage.getItem('rkltrove_guest_favourites') || '[]');
      if (isFav) {
        const updated = guestFavs.filter(id => id !== String(productId));
        localStorage.setItem('rkltrove_guest_favourites', JSON.stringify(updated));
      } else {
        guestFavs.push(String(productId));
        localStorage.setItem('rkltrove_guest_favourites', JSON.stringify(guestFavs));
      }
      return;
    }

    // Logged in: sync to server
    try {
      if (isFav) {
        await removeFavourite(productId);
      } else {
        await addFavourite(productId);
      }
    } catch (err) {
      console.error('❌ Backend sync failed:', err);
      setFavouriteIds((prev) => {
        const next = new Set(prev)
        isFav ? next.add(productId) : next.delete(productId)
        return next
      })
    }
  }, [favouriteIds, user])

  const handleProductHover = (product) => {
    setRecentlyViewed(prev => {
      // Don't add if already the most recent
      if (prev.length > 0 && prev[0].id === product.id) return prev
      const filtered = prev.filter(p => p.id !== product.id)
      return [product, ...filtered].slice(0, 3)
    })
  }

  // Derive unique collection list from fetched products
  const collections = [
    'All',
    ...new Set(
      products
        .map(p => p.collection)
        .filter(c => c && c.trim() !== '')
    )
  ]

  // Filter & Sort Logic
  const filteredProducts = products.filter(p => {
    const query = search.toLowerCase()
    const matchesSearch =
      p.name.toLowerCase().includes(query) ||
      (p.collection && p.collection.toLowerCase().includes(query)) ||
      (p.description && p.description.toLowerCase().includes(query))

    const price = parseFloat(p.price)
    let matchesPrice = true
    if (priceFilter === 'Under ₹500') matchesPrice = price < 500
    else if (priceFilter === '₹500 - ₹1000') matchesPrice = price >= 500 && price <= 1000
    else if (priceFilter === '₹1000 - ₹2000') matchesPrice = price >= 1000 && price <= 2000
    else if (priceFilter === 'Above ₹2000') matchesPrice = price > 2000

    // Availability filter
    const isAvailable = p.is_available !== false;
    let matchesAvailability = true;
    if (availabilityFilter === 'Available') matchesAvailability = isAvailable;
    else if (availabilityFilter === 'Out of Stock') matchesAvailability = !isAvailable;

    // Collection filter
    let matchesCollection = true
    if (collectionFilter !== 'All') matchesCollection = p.collection === collectionFilter

    return matchesSearch && matchesPrice && matchesAvailability && matchesCollection
  }).sort((a, b) => {
    if (sortBy === 'Price: Low to High') return a.price - b.price
    if (sortBy === 'Price: High to Low') return b.price - a.price
    if (sortBy === 'Name: A-Z') return a.name.localeCompare(b.name)
    return 0
  })

  const clearSearch = () => {
    setSearch('')
    searchInputRef.current?.focus()
  }

  return (
    <div className="min-h-screen bg-[#FBF5EE] text-[#2C1810] font-sans selection:bg-[#C87941]/20" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Background Dot Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.12]"
        style={{ backgroundImage: 'radial-gradient(#C87941 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <Navbar favouriteCount={favouriteIds.size} />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 text-center overflow-hidden">
        <div className="max-w-4xl mx-auto animate-fade-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5E6D3] text-[#C87941] text-xs font-bold tracking-widest uppercase mb-6 shadow-sm border border-[#EDD9C0]/50">
            <Star size={12} className="fill-current" /> Artisanal Excellence
          </div>
          <h1 className="text-4xl md:text-7xl font-sans font-extrabold text-[#2C1810] leading-[1.1] mb-6 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Handcrafted Resin <br /> keepsakes made to  <span className="text-[#C87941] italic">Preserve Your Moments</span>
          </h1>
          <p className="text-lg md:text-xl text-[#7A5542] max-w-2xl mx-auto font-light leading-relaxed mb-10">
            Exclusive resin art pieces, meticulously created to bring a touch of cosmic beauty into your everyday life.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <button
              onClick={() => {
                const el = document.getElementById('collection-header');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-3.5 rounded-full bg-[#C87941] text-white font-bold shadow-[0_8px_24px_rgba(200,121,65,0.3)] hover:scale-105 transition-all active:scale-95"
            >
              Shop Collection
            </button>
            <button
              onClick={() => navigate('/customize')}
              className="px-8 py-3.5 rounded-full bg-white text-[#C87941] border-2 border-[#C87941] font-bold hover:bg-[#FEF0E3] transition-all active:scale-95 flex items-center gap-2"
            >
              <Palette size={18} /> Design Studio
            </button>
          </div>

          {/* Join nudge strip — only for guests */}
          {!user && (
            <div style={{
              background: 'rgba(200,121,65,0.08)',
              border: '1px solid rgba(200,121,65,0.15)',
              borderRadius: '12px',
              padding: '12px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginTop: '16px', maxWidth: '500px', margin: '16px auto 0'
            }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: '0.82rem', color: '#5C3D2A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={15} color="#C87941" />
                Sign up to save favourites and track your orders
              </span>
              <span
                style={{ fontFamily: "var(--font-body)", fontSize: '0.82rem', fontWeight: 600, color: '#C87941', cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: '12px' }}
                onClick={() => navigate('/signup')}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >
                Join Free →
              </span>
            </div>
          )}
        </div>

        {/* TASK 1 — CINEMATIC SEARCH BAR */}
        <div className="max-w-[600px] mx-auto relative z-20 animate-search-reveal mt-4">
          <div className={`
            relative flex items-center bg-white rounded-full border-[1.5px] p-1.5 transition-all duration-500
            ${isSearchFocused
              ? 'border-[#C87941] shadow-[0_6px_32px_rgba(200,121,65,0.18),0_0_0_4px_rgba(200,121,65,0.08)] -translate-y-0.5'
              : 'border-[#DEC5A8] shadow-[0_4px_24px_rgba(200,121,65,0.10),0_1px_4px_rgba(44,26,14,0.06)]'}
          `}>
            <div className="pl-4 pr-3 flex-shrink-0">
              <Search
                size={20}
                className={`transition-colors duration-300 ${isSearchFocused ? 'text-[#C87941]' : 'text-[#B08060]'}`}
              />
            </div>

            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search handcrafted resin products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="flex-1 bg-transparent border-none outline-none font-medium text-[#2C1810] placeholder:text-[#C4A882] placeholder:italic text-[0.95rem] py-2"
            />

            {search && (
              <button
                onClick={clearSearch}
                className="p-1.5 rounded-full hover:bg-[#C87941]/10 text-[#9C7B65] hover:text-[#C87941] transition-all mr-1"
              >
                <X size={16} />
              </button>
            )}

            <button className="bg-gradient-to-br from-[#C87941] to-[#A0622E] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-[0_2px_10px_rgba(200,121,65,0.30)] hover:scale-[1.02] hover:shadow-[0_4px_16px_rgba(200,121,65,0.40)] transition-all active:scale-95">
              Search
            </button>
          </div>

          <div className={`text-right mt-2 transition-opacity duration-300 ${isSearchFocused ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-[0.72rem] text-[#C4A882] italic font-medium">Press Enter to search</span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="w-full px-4 md:px-12 py-12 flex flex-col lg:flex-row gap-10">

        {/* Mobile Collection Pill Tabs */}
        {collections.length > 1 && (
          <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 -mb-4 scrollbar-hide">
            {collections.map(col => (
              <button
                key={col}
                onClick={() => setCollectionFilter(col)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  collectionFilter === col
                    ? 'bg-[#C87941] text-white border-[#C87941] shadow-sm'
                    : 'bg-white text-[#7A5542] border-[#DEC5A8] hover:border-[#C87941] hover:text-[#C87941]'
                }`}
              >
                {col}
              </button>
            ))}
          </div>
        )}

        {/* TASK 3 — LEFT SIDEBAR (Desktop) */}
        <aside className="hidden lg:block w-[220px] flex-shrink-0">
          <div className="sticky top-28 space-y-8">
            <section>
              <h3 className="text-[0.75rem] font-bold text-[#9C7B65] tracking-[0.08em] uppercase mb-4">Collection</h3>
              <div className="space-y-3">
                {collections.map(col => (
                  <label key={col} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="collection"
                        checked={collectionFilter === col}
                        onChange={() => setCollectionFilter(col)}
                        className="peer appearance-none w-4 h-4 rounded-full border-[1.5px] border-[#DEC5A8] checked:border-[#C87941] transition-all"
                      />
                      <div className="absolute w-2 h-2 rounded-full bg-[#C87941] opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className={`text-[0.875rem] transition-colors ${collectionFilter === col ? 'text-[#C87941] font-bold' : 'text-[#3D2B1A] group-hover:text-[#C87941]'}`}>
                      {col}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <div className="h-[1px] bg-[#EDD9C0]" />

            <section>
              <h3 className="text-[0.75rem] font-bold text-[#9C7B65] tracking-[0.08em] uppercase mb-4">Availability</h3>
              <div className="space-y-3">
                {['All Items', 'Available', 'Out of Stock'].map(status => (
                  <label key={status} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="availability"
                        checked={availabilityFilter === status}
                        onChange={() => setAvailabilityFilter(status)}
                        className="peer appearance-none w-4 h-4 rounded-full border-[1.5px] border-[#DEC5A8] checked:border-[#C87941] transition-all"
                      />
                      <div className="absolute w-2 h-2 rounded-full bg-[#C87941] opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className={`text-[0.875rem] transition-colors ${availabilityFilter === status ? 'text-[#C87941] font-bold' : 'text-[#3D2B1A] group-hover:text-[#C87941]'}`}>
                      {status}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <div className="h-[1px] bg-[#EDD9C0]" />

            <section>
              <h3 className="text-[0.75rem] font-bold text-[#9C7B65] tracking-[0.08em] uppercase mb-4">Price Range</h3>
              <div className="space-y-3">
                {['All Prices', 'Under ₹500', '₹500 - ₹1000', '₹1000 - ₹2000', 'Above ₹2000'].map(range => (
                  <label key={range} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="price"
                        checked={priceFilter === range}
                        onChange={() => setPriceFilter(range)}
                        className="peer appearance-none w-4 h-4 rounded-full border-[1.5px] border-[#DEC5A8] checked:border-[#C87941] transition-all"
                      />
                      <div className="absolute w-2 h-2 rounded-full bg-[#C87941] opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className={`text-[0.875rem] transition-colors ${priceFilter === range ? 'text-[#C87941] font-bold' : 'text-[#3D2B1A] group-hover:text-[#C87941]'}`}>
                      {range}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <div className="h-[1px] bg-[#EDD9C0]" />

            <section>
              <h3 className="text-[0.75rem] font-bold text-[#9C7B65] tracking-[0.08em] uppercase mb-4">Sort By</h3>
              <div className="space-y-3">
                {['Default', 'Price: Low to High', 'Price: High to Low', 'Name: A-Z'].map(option => (
                  <label key={option} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="sort"
                        checked={sortBy === option}
                        onChange={() => setSortBy(option)}
                        className="peer appearance-none w-4 h-4 rounded-full border-[1.5px] border-[#DEC5A8] checked:border-[#C87941] transition-all"
                      />
                      <div className="absolute w-2 h-2 rounded-full bg-[#C87941] opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className={`text-[0.875rem] transition-colors ${sortBy === option ? 'text-[#C87941] font-bold' : 'text-[#3D2B1A] group-hover:text-[#C87941]'}`}>
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <div className="h-[1px] bg-[#EDD9C0]" />

            <section className="space-y-4">
              <div className="bg-gradient-to-br from-[#FEF9F3] to-[#F5E6D3] border border-[#EDD9C0] rounded-xl p-4 text-center">
                <div className="font-serif text-2xl font-bold text-[#C87941] leading-none mb-1">{products.length}</div>
                <div className="text-[0.65rem] font-bold text-[#9C7B65] uppercase tracking-wider">Products</div>
              </div>
              <div className="bg-gradient-to-br from-[#FEF9F3] to-[#F5E6D3] border border-[#EDD9C0] rounded-xl p-4 text-center">
                <div className="font-serif text-2xl font-bold text-[#C87941] leading-none mb-1">100%</div>
                <div className="text-[0.65rem] font-bold text-[#9C7B65] uppercase tracking-wider">Handmade</div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#C87941] to-[#8B4513] rounded-xl p-5 text-white text-center shadow-lg">
              <MessageCircle size={32} className="mx-auto mb-3" />
              <h4 className="font-serif text-lg font-bold mb-1">Need Help?</h4>
              <p className="text-[0.78rem] opacity-90 mb-4 leading-relaxed">Contact us for custom resin orders and personalization.</p>
              <button className="w-full py-2 rounded-full bg-white/20 border border-white/40 text-xs font-bold hover:bg-white/30 transition-all">
                Contact Us
              </button>
            </section>
          </div>
        </aside>

        {/* Task 3 — MAIN GRID BLOCK */}
        <section className="flex-1 w-full">
          <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div id="collection-header">
              <h2 className="text-3xl font-sans font-extrabold text-[#2C1810]" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>Our Collection</h2>
              {search && (
                <p className="text-[0.82rem] text-[#7A5542] mt-1 animate-fade-in">
                  Showing {filteredProducts.length} results for <span className="font-bold text-[#C87941]">"{search}"</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <label className="text-xs font-bold text-[#9C7B65] mr-2">SORT BY:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border-[1.5px] border-[#DEC5A8] rounded-full px-4 py-2 text-sm font-medium text-[#5C3D2A] outline-none hover:border-[#C87941] shadow-sm"
                >
                  <option>Default</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Name: A-Z</option>
                </select>
              </div>
              <div className="hidden lg:flex items-center gap-2 bg-[#F5E6D3] p-1 rounded-lg">
                <button className="p-1.5 bg-white text-[#C87941] rounded shadow-sm"><LayoutGrid size={18} /></button>
                <span className="text-[0.7rem] font-bold px-2 text-[#9C7B65]">{filteredProducts.length} DESIGNS</span>
              </div>
            </div>
          </header>

          {/* Loading / Empty States */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 size={48} className="text-[#C87941] animate-spin" />
              <p className="text-[#C87941] text-sm font-bold uppercase tracking-[0.2em]">Crafting Magic...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-[#EDD9C0] animate-fade-slide-up">
              <div className="w-20 h-20 bg-[#FBF5EE] rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={40} className="text-[#DEC5A8]" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#5C3D2A] mb-2">No products found for "{search}"</h3>
              <p className="text-[#9C7B65] mb-8">Try adjusting your filters or search keywords.</p>
              <button
                onClick={() => { setSearch(''); setPriceFilter('All Prices'); setAvailabilityFilter('All Items'); setCollectionFilter('All'); }}
                className="px-8 py-3 rounded-full border-2 border-[#C87941] text-[#C87941] font-bold hover:bg-[#C87941] hover:text-white transition-all"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            /* DYNAMIC FLUID GRID */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-8 w-full animate-fade-in">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavourite={favouriteIds.has(product.id)}
                  onToggleFavourite={toggleFavourite}
                  onHover={handleProductHover}
                />
              ))}
            </div>
          )}
        </section>

        {/* TASK 3 — RIGHT SIDE PANEL (Wide Screens Only) */}
        <aside className="hidden xl:block w-[200px] flex-shrink-0">
          <div className="sticky top-28 space-y-10">
            <section>
              <h3 className="text-[0.75rem] font-bold text-[#9C7B65] tracking-[0.08em] uppercase mb-4">Recently Viewed</h3>
              <div className="space-y-4">
                {recentlyViewed.length > 0 ? (
                  recentlyViewed.map(p => (
                    <div key={p.id} className="group flex items-center gap-3 cursor-pointer animate-fade-in">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#EDD9C0] flex-shrink-0">
                        <img
                          src={p.image_url.startsWith('http') ? p.image_url : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${p.image_url}`}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[0.78rem] font-bold text-[#3D2B1A] truncate">{p.name}</div>
                        <div className="text-[0.78rem] font-bold text-[#C87941]">₹{p.price}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[0.78rem] text-[#B08060] italic text-center py-4 border border-dashed border-[#EDD9C0] rounded-xl bg-white/50">
                    Browse products to see them here
                  </p>
                )}
              </div>
            </section>

            <div className="h-[1px] bg-[#EDD9C0]" />

            <section className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-[#FDFAF6] border border-[#F0E0CF] rounded-xl shadow-sm">
                <div className="text-xl">🎨</div>
                <span className="text-[0.8rem] font-medium text-[#5C3D2A]">Unique Designs</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#FDFAF6] border border-[#F0E0CF] rounded-xl shadow-sm">
                <div className="text-xl">📦</div>
                <span className="text-[0.8rem] font-medium text-[#5C3D2A]">Safe Packaging</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#FDFAF6] border border-[#F0E0CF] rounded-xl shadow-sm">
                <div className="text-xl">💝</div>
                <span className="text-[0.8rem] font-medium text-[#5C3D2A]">Made with Love</span>
              </div>
            </section>
          </div>
        </aside>
      </main>

      {/* Luxury Footer */}
      <footer className="mt-20 py-20 px-6 bg-white border-t border-[#EDD9C0]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src="/images/icon.jpg?v=3" alt="Logo" className="w-10 h-10 rounded-full object-cover" />
              <h2 className="font-serif text-2xl font-bold text-[#2C1810]">RKL Trove</h2>
            </div>
            <p className="text-[#9C7B65] text-sm leading-relaxed max-w-sm">
              Artisan handcrafted resin creations delivered from our heart to your home. Every piece is unique, captured in time, and made with absolute passion.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-[#2C1810] mb-6 uppercase tracking-wider text-xs">Customer Space</h4>
            <ul className="space-y-4 text-sm text-[#7A5542]">
              <li><a href="#" className="hover:text-[#C87941] transition-colors">Shipping Information</a></li>
              <li><a href="#" className="hover:text-[#C87941] transition-colors">Product Care Guide</a></li>
              <li><a href="/profile" className="hover:text-[#C87941] transition-colors">My Profile</a></li>
              <li><a href="/cart" className="hover:text-[#C87941] transition-colors">Shopping Trove</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#2C1810] mb-6 uppercase tracking-wider text-xs">Stay Connected</h4>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 p-1.5 bg-[#FBF5EE] rounded-full border border-[#EDD9C0]">
                <input type="email" placeholder="Your email..." className="bg-transparent border-none outline-none px-4 text-xs flex-1" />
                <button className="bg-[#C87941] text-white p-2 rounded-full hover:scale-105 transition-all"><ArrowRight size={16} /></button>
              </div>
              <p className="text-[0.7rem] text-[#9C7B65] italic px-4">Join our community for exclusive shop drops</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-[#F5E6D3] text-center">
          <p className="text-[0.75rem] text-[#B08060] font-medium tracking-widest uppercase">
            © {new Date().getFullYear()} RKL Trove. Handcrafted Elegance. All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* Global CSS for Home-specific animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes searchReveal {
          from { opacity: 0; transform: translateY(16px) scaleX(0.95); }
          to   { opacity: 1; transform: translateY(0) scaleX(1); }
        }
        .animate-search-reveal {
          animation: searchReveal 500ms cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeSlideUpHome {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide-up {
          animation: fadeSlideUpHome 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}} />
    </div>
  )
}
