import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import { Gem, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getFavourites, addFavourite, removeFavourite } from '../services/api'

export default function Home() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [favouriteIds, setFavouriteIds] = useState(new Set())

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`
        )
        setProducts(res.data)
      } catch {
        setError('Failed to load products. Is the backend running?')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Fetch favourites if logged in
  useEffect(() => {
    if (!user) return
    const fetchFavs = async () => {
      try {
        const res = await getFavourites()
        const ids = new Set((res.data.data || []).map((p) => p.id))
        setFavouriteIds(ids)
      } catch {
        // silently fail — favourites are optional
      }
    }
    fetchFavs()
  }, [user])

  const toggleFavourite = useCallback(async (productId) => {
    const isFav = favouriteIds.has(productId)
    // Optimistic update
    setFavouriteIds((prev) => {
      const next = new Set(prev)
      isFav ? next.delete(productId) : next.add(productId)
      return next
    })
    try {
      if (isFav) {
        await removeFavourite(productId)
      } else {
        await addFavourite(productId)
      }
    } catch {
      // Rollback on failure
      setFavouriteIds((prev) => {
        const next = new Set(prev)
        isFav ? next.add(productId) : next.delete(productId)
        return next
      })
    }
  }, [favouriteIds])

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar favouriteCount={favouriteIds.size} />

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-cream-100 to-cream-200 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 tracking-wider uppercase">
            <Gem size={13} />
            Handcrafted with Love
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl font-semibold text-stone-800 leading-tight mb-4">
            RKL Trove
          </h1>
          <p className="text-stone-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Discover our curated collection of premium resin art — from shimmering coasters to
            celestial wall art, each piece is a one-of-a-kind treasure.
          </p>
        </div>
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-rose-200 opacity-20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-cream-400 opacity-20 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Search */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h2 className="font-serif text-3xl text-stone-800">Our Collection</h2>
          <input
            id="product-search"
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field max-w-xs"
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={36} className="text-rose-400 animate-spin" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-xl">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-24 text-stone-400">
            <Gem size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg">No products found.</p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavourite={favouriteIds.has(product.id)}
                onToggleFavourite={toggleFavourite}
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-16 border-t border-stone-100 bg-white py-8 text-center text-sm text-stone-400">
        <p>© {new Date().getFullYear()} RKL Trove. All rights reserved. Crafted with ♥</p>
      </footer>
    </div>
  )
}
