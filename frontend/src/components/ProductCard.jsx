import React, { useState } from 'react'
import { ShoppingCart, Heart, Sparkles, Check, Eye, XCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { addFavourite, removeFavourite } from '../services/api'

export default function ProductCard({ product, isFavourite = false, onToggleFavourite, onHover, showAvailability = false }) {
  const { addItem, items } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)
  const [added, setAdded] = useState(false)
  const [imgHovered, setImgHovered] = useState(false)

  const inCart = items.find((i) => i.id === product.id)
  const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')
  
  // Handle availability
  const isAvailable = product.is_available !== false // Default true

  const getFullImageUrl = () => {
    const path = product.image_url || product.imageUrl
    if (!path || path === '' || path === '/') return null
    if (path.startsWith('http')) return path
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${API_URL}${cleanPath}`
  }

  const handleAddToCart = (e) => {
    e.stopPropagation()
    if (!isAvailable) {
      // Out of stock — toggle guest/server favourites
      if (!user) {
        // Guest: store in localStorage
        const guestFavs = JSON.parse(localStorage.getItem('rkltrove_guest_favourites') || '[]')
        if (guestFavs.includes(String(product.id))) {
          toast.error('This product is out of stock and already in your wishlist.', {
            style: { background: '#FDF0EF', color: '#C0392B', border: '1px solid #E74C3C' }
          })
          return
        }
        guestFavs.push(String(product.id))
        localStorage.setItem('rkltrove_guest_favourites', JSON.stringify(guestFavs))
        if (onToggleFavourite) onToggleFavourite(product.id)
        toast.success(`"${product.name}" moved to your wishlist!`, {
          icon: '💖',
          style: { background: '#FEF9F3', color: '#2C1810', border: '1px solid #C87941' }
        })
        return
      }

      // Logged in: check existing
      if (isFavourite) {
        toast.error('This product is out of stock and already in your wishlist.', {
          style: { background: '#FDF0EF', color: '#C0392B', border: '1px solid #E74C3C' }
        })
        return
      }

      // Add to wishlist if not already there
      if (onToggleFavourite) {
        onToggleFavourite(product.id)
        toast.success(`"${product.name}" moved to your wishlist!`, {
          icon: '💖',
          style: { background: '#FEF9F3', color: '#2C1810', border: '1px solid #C87941' }
        })
      }
      return
    }
    addItem(product)
    setAdded(true)
    toast.success(`"${product.name}" added to cart!`, {
      icon: '✨',
      style: { background: '#FBF5EE', color: '#2C1810', border: '1px solid #C87941' }
    })
    setTimeout(() => setAdded(false), 2000)
  }

  const handleFavouriteClick = (e) => {
    e.stopPropagation()

    if (!user) {
      // Guest: toggle in localStorage
      const guestFavs = JSON.parse(localStorage.getItem('rkltrove_guest_favourites') || '[]')
      if (guestFavs.includes(String(product.id))) {
        const updated = guestFavs.filter(id => id !== String(product.id))
        localStorage.setItem('rkltrove_guest_favourites', JSON.stringify(updated))
        toast('Removed from favourites', { icon: '💔' })
      } else {
        guestFavs.push(String(product.id))
        localStorage.setItem('rkltrove_guest_favourites', JSON.stringify(guestFavs))
        toast.success('Added to favourites ♥', {
          style: { background: '#FBF5EE', color: '#2C1810', border: '1px solid #C87941' }
        })
      }
      if (onToggleFavourite) onToggleFavourite(product.id)
      return
    }

    // Logged in — use server API
    if (onToggleFavourite) onToggleFavourite(product.id)
  }

  const handleNavigateToDetail = () => {
    navigate(`/product/${product.id}`)
  }

  return (
    <article
      className={`group bg-white rounded-[20px] overflow-hidden border border-[#F0E0CF] shadow-[0_2px_12px_rgba(44,26,14,0.06)] transition-all duration-300 flex flex-col h-full ${
        isAvailable 
          ? 'hover:-translate-y-[6px] hover:shadow-[0_12px_36px_rgba(200,121,65,0.16)] hover:border-[#DEC5A8]' 
          : 'opacity-95 hover:-translate-y-[3px] hover:shadow-[0_4px_12px_rgba(44,26,14,0.1)] hover:border-[#EDD9C0]'
      }`}
      onMouseEnter={() => onHover && onHover(product)}
    >
      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.75); }
        }
        @keyframes badgeFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Image Container */}
      <div
        className="relative aspect-square overflow-hidden bg-[#FBF5EE] flex-shrink-0 cursor-pointer"
        onClick={handleNavigateToDetail}
        onMouseEnter={() => setImgHovered(true)}
        onMouseLeave={() => setImgHovered(false)}
      >
        {getFullImageUrl() && !imgError ? (
          <img
            src={getFullImageUrl()}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-all duration-500"
            style={{
              transform: imgHovered ? 'scale(1.06) brightness(1.08)' : 'scale(1)',
              filter: imgHovered ? 'brightness(1.06)' : 'brightness(1)',
              opacity: isAvailable ? 1 : 0.8
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#F5E6D3]">
            <Sparkles className="text-[#CBA27F]" size={40} />
          </div>
        )}

        {/* Status Badge */}
        {(showAvailability || !isAvailable) && (
          <div 
            className="absolute top-3 left-3 z-[2]"
            style={{ animation: 'badgeFadeIn 300ms ease-out forwards' }}
          >
            {isAvailable ? (
              <div className="bg-gradient-to-br from-[#27AE60] to-[#1E8449] text-white text-[0.72rem] font-[700] tracking-wider py-1.5 px-3 rounded-full flex items-center gap-1.5 shadow-[0_2px_8px_rgba(39,174,96,0.35)]">
                <div 
                  className="w-1.5 h-1.5 bg-white rounded-full" 
                  style={{ animation: 'pulseDot 2s ease-in-out infinite' }}
                />
                Available
              </div>
            ) : (
              <div className="bg-gradient-to-br from-[#E74C3C] to-[#C0392B] text-white text-[0.72rem] font-[700] tracking-wider py-1.5 px-3 rounded-full flex items-center gap-1.5 shadow-[0_2px_8px_rgba(231,76,60,0.35)]">
                <XCircle size={12} />
                Out of Stock
              </div>
            )}
          </div>
        )}

        {/* Favourites Button */}
        <button
          onClick={handleFavouriteClick}
          className={`absolute top-3 right-3 w-10 h-10 rounded-[10px] border-[1.5px] z-[2] flex items-center justify-center transition-all duration-300 shadow-sm ${
            isFavourite
              ? 'bg-[#FBF5EE] border-[#C87941] text-[#E74C3C]'
              : 'bg-white border-[#DEC5A8] text-[#B08060] hover:border-[#C87941] hover:bg-[#FEF9F3]'
          }`}
        >
          <Heart size={18} className={isFavourite ? 'fill-current' : ''} />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4 md:p-5 flex flex-col flex-grow">
        <h3
          className="font-serif text-[1.1rem] font-semibold text-[#2C1810] mb-2 line-clamp-2 leading-snug min-h-[2.8rem] cursor-pointer hover:text-[#C87941] transition-colors duration-200"
          onClick={handleNavigateToDetail}
        >
          {product.name}
        </h3>

        {(product.description || '').trim() && (
          <p className="text-[0.82rem] text-[#7A5542] mb-4 line-clamp-2 leading-relaxed italic">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-4">
          <div className="flex flex-col">
            <span className="text-[1.2rem] font-bold text-[#C87941]">
              ₹{product.price ? Number(product.price).toFixed(2) : '0.00'}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={added}
            className={`flex-1 ml-3 h-11 rounded-[12px] flex items-center justify-center gap-2 font-bold text-[0.82rem] tracking-wide transition-all duration-300 shadow-sm px-3 ${
              !isAvailable 
                ? 'bg-[#FEF0E3] text-[#C87941] border border-[#C87941] hover:bg-[#FEEBC8] active:scale-95'
                : added
                  ? 'bg-[#27AE60] text-white active:scale-95'
                  : 'bg-gradient-to-br from-[#C87941] to-[#A0622E] text-white hover:shadow-[0_4px_16px_rgba(200,121,65,0.4)] hover:scale-[1.02] active:scale-95'
            }`}
          >
            {added ? (
              <><Check size={16} /><span>Added</span></>
            ) : !isAvailable ? (
              <><Heart size={14} className="fill-current" /><span>Wishlist</span></>
            ) : (
              <><ShoppingCart size={16} /><span>Add to Cart</span></>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
