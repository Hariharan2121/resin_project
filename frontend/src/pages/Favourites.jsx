import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Heart, Loader2, ShoppingCart, Gem } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { getFavourites, removeFavourite } from '../services/api'

export default function Favourites() {
  const { user } = useAuth()
  const { addItem, items } = useCart()
  const navigate = useNavigate()

  const [favourites, setFavourites] = useState([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState(null)

  useEffect(() => {
    if (!user) { navigate('/login', { replace: true }); return }
    const fetchFavs = async () => {
      try {
        const res = await getFavourites()
        setFavourites(res.data.data || [])
      } catch {
        toast.error('Failed to load favourites.')
      } finally {
        setLoading(false)
      }
    }
    fetchFavs()
  }, [user, navigate])

  const handleRemove = async (productId) => {
    setRemovingId(productId)
    // Optimistic UI
    setFavourites((prev) => prev.filter((p) => p.id !== productId))
    try {
      await removeFavourite(productId)
      toast.success('Removed from favourites.')
    } catch {
      toast.error('Failed to remove. Please try again.')
      // Re-fetch on failure
      const res = await getFavourites()
      setFavourites(res.data.data || [])
    } finally {
      setRemovingId(null)
    }
  }

  const handleAddToCart = (product) => {
    addItem(product)
    toast.success(`"${product.name}" added to cart!`)
  }

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />

      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-cream-100 to-cream-200 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 tracking-wider uppercase">
            <Heart size={13} className="fill-rose-500" />
            My Favourites
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-stone-800 mb-2">
            Saved with Love
          </h1>
          <p className="text-stone-500 text-base">Products you've loved ♥</p>
        </div>
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-rose-200 opacity-20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-cream-400 opacity-20 rounded-full blur-3xl pointer-events-none" />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={36} className="text-rose-400 animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && favourites.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mb-5">
              <Heart size={36} className="text-rose-300" />
            </div>
            <h2 className="font-serif text-2xl text-stone-700 mb-1">No favourites yet</h2>
            <p className="text-stone-400 text-sm mb-6">Start exploring and heart the products you love!</p>
            <Link
              to="/"
              className="btn-primary px-8 py-3 rounded-xl"
            >
              <Gem size={16} />
              Browse Products
            </Link>
          </div>
        )}

        {/* Grid */}
        {!loading && favourites.length > 0 && (
          <>
            <p className="text-stone-400 text-sm mb-6">
              {favourites.length} saved {favourites.length === 1 ? 'product' : 'products'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
              {favourites.map((product) => {
                const inCart = items.find((i) => i.id === product.id)
                return (
                  <article
                    key={product.id}
                    id={`fav-card-${product.id}`}
                    className="card group flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden bg-cream-100 aspect-square">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                      {/* Remove heart button */}
                      <button
                        id={`fav-remove-${product.id}`}
                        onClick={() => handleRemove(product.id)}
                        disabled={removingId === product.id}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md transition-transform duration-150 hover:scale-110 active:scale-95"
                        aria-label="Remove from favourites"
                      >
                        <Heart size={16} className="fill-rose-500 text-rose-500" />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col flex-1 p-4">
                      <h3 className="font-serif text-lg text-stone-800 leading-snug mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-xs text-stone-500 mb-3 line-clamp-2 flex-1">{product.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-stone-100">
                        <span className="text-lg font-semibold text-rose-600">{formatPrice(product.price)}</span>
                        <button
                          onClick={() => handleAddToCart(product)}
                          id={`fav-cart-${product.id}`}
                          className="btn-primary text-xs px-4 py-2"
                        >
                          <ShoppingCart size={14} />
                          {inCart ? 'Add More' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </section>

      <footer className="mt-16 border-t border-stone-100 bg-white py-8 text-center text-sm text-stone-400">
        <p>© {new Date().getFullYear()} RKL Trove. All rights reserved. Crafted with ♥</p>
      </footer>
    </div>
  )
}
