import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Heart, Loader2, Gem, Sparkles, ArrowLeft, ShoppingBag } from 'lucide-react'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import { useAuth } from '../context/AuthContext'
import { getFavourites, removeFavourite } from '../services/api'

export default function Favourites() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [favourites, setFavourites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true })
      return
    }

    const fetchFavs = async () => {
      try {
        const res = await getFavourites()
        setFavourites(res.data.data || [])
      } catch (err) {
        toast.error('Failed to load your vault')
      } finally {
        setLoading(false)
      }
    }

    fetchFavs()
  }, [user, navigate])

  const toggleFavourite = async (productId) => {
    // Optimistic UI update
    setFavourites(prev => prev.filter(p => p.id !== productId))
    try {
      await removeFavourite(productId)
      toast.success('Removed from your vault', {
        style: { background: '#FBF5EE', color: '#2C1810', border: '1px solid #C87941' }
      })
    } catch (err) {
      toast.error('Failed to update vault')
      // Refresh if failed
      const res = await getFavourites()
      setFavourites(res.data.data || [])
    }
  }

  return (
    <div className="min-h-screen bg-[#FBF5EE] text-[#2C1810] font-sans selection:bg-[#C87941]/20">
      {/* Background Dot Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.12]" 
           style={{ backgroundImage: 'radial-gradient(#C87941 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      
      <Navbar favouriteCount={favourites.length} />

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-6 text-center">
        <div className="max-w-4xl mx-auto animate-fade-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5E6D3] text-[#C87941] text-xs font-bold tracking-widest uppercase mb-6 shadow-sm border border-[#EDD9C0]/50">
            <Heart size={12} className="fill-current" /> Curated Treasures
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#2C1810] leading-tight mb-4 text-center">
            The Personal <span className="text-[#C87941] italic text-center">Vault</span>
          </h1>
          <p className="text-lg text-[#7A5542] max-w-md mx-auto font-light leading-relaxed mb-10 text-center">
            A sanctuary for the resin masterpieces that captured your heart.
          </p>
        </div>
      </section>

      <main className="max-w-[1440px] mx-auto px-4 md:px-12 py-12 relative z-10">
        <div className="flex items-center justify-between mb-10 border-b border-[#EDD9C0] pb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-serif font-bold text-[#2C1810]">Your Selection</h2>
            <span className="px-3 py-1 bg-[#F5E6D3] text-[#C87941] text-[10px] font-bold rounded-full uppercase tracking-wider">
              {favourites.length} Items
            </span>
          </div>
          <Link to="/" className="text-sm text-[#C87941] hover:text-[#8B4513] transition-colors flex items-center gap-2 font-bold uppercase tracking-widest">
            <ArrowLeft size={16} /> Continue Exploring
          </Link>
        </div>

        {/* States Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 size={48} className="text-[#C87941] animate-spin" />
            <p className="text-[#C87941] text-sm font-bold uppercase tracking-[0.2em]">Opening the Vault...</p>
          </div>
        ) : favourites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[40px] border-2 border-dashed border-[#EDD9C0] animate-fade-slide-up shadow-[0_10px_40px_rgba(44,26,14,0.04)]">
            <div className="w-24 h-24 bg-[#FBF5EE] rounded-full flex items-center justify-center mb-8 border border-[#EDD9C0]">
              <Heart size={40} className="text-[#C4A882]" />
            </div>
            <h3 className="font-serif text-3xl font-bold text-[#2C1810] mb-4">Your Vault is Empty</h3>
            <p className="text-[#9C7B65] max-w-sm mb-12 leading-relaxed italic">Begin your journey through our collections and discover pieces that speak to your soul.</p>
            <Link
              to="/"
              className="bg-gradient-to-br from-[#C87941] to-[#A0622E] text-white px-12 py-4 rounded-full text-sm font-bold shadow-[0_10px_20px_rgba(200,121,65,0.25)] hover:scale-[1.02] hover:shadow-[0_12px_32px_rgba(200,121,65,0.35)] transition-all flex items-center gap-3"
            >
              <Gem size={18} /> Browse Our Creations
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 animate-fade-in pb-20">
            {favourites.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavourite={true}
                onToggleFavourite={toggleFavourite}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="py-20 px-6 bg-white border-t border-[#EDD9C0]">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            <div className="flex items-center gap-3 mb-6">
              <img src="/images/icon.jpg?v=3" alt="Logo" className="w-10 h-10 rounded-full object-cover" />
              <h2 className="font-serif text-2xl font-bold text-[#2C1810]">RKL Trove</h2>
            </div>
            <p className="text-[#9C7B65] text-xs tracking-[0.3em] uppercase max-w-sm border-t border-[#F5E6D3] pt-8">
              © {new Date().getFullYear()} Artistry Handcrafted for Eternity
            </p>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
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
