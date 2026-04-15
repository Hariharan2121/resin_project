import React, { useState } from 'react'
import { ShoppingCart, Heart, Sparkles, Check, Eye } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function ProductCard({ product, isFavourite = false, onToggleFavourite, onHover }) {
  const { addItem, items } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)
  const [added, setAdded] = useState(false)
  const [imgHovered, setImgHovered] = useState(false)

  const inCart = items.find((i) => i.id === product.id)
  const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

  const getFullImageUrl = () => {
    const path = product.image_url || product.imageUrl;
    // VERY IMPORTANT: Return null if no path to prevent requesting base URL
    if (!path || path === '' || path === '/') return null;
    
    if (path.startsWith('http')) return path;
    
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_URL}${cleanPath}`;
  };

  const handleAddToCart = (e) => {
    e.stopPropagation()
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
      toast.error('Please login to save favourites.')
      navigate('/login')
      return
    }
    if (onToggleFavourite) onToggleFavourite(product.id)
  }

  const handleNavigateToDetail = () => {
    navigate(`/product/${product.id}`)
  }

  return (
    <article
      className="group bg-white rounded-[20px] overflow-hidden border border-[#F0E0CF] shadow-[0_2px_12px_rgba(44,26,14,0.06)] transition-all duration-300 hover:-translate-y-[6px] hover:shadow-[0_12px_36px_rgba(200,121,65,0.16)] hover:border-[#DEC5A8] flex flex-col h-full"
      onMouseEnter={() => onHover && onHover(product)}
    >
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
            onError={() => {
              console.error(`❌ Image failed to load: ${getFullImageUrl()}`);
              setImgError(true);
            }}
            className="w-full h-full object-cover transition-all duration-500"
            style={{
              transform: imgHovered ? 'scale(1.06) brightness(1.08)' : 'scale(1)',
              filter: imgHovered ? 'brightness(1.06)' : 'brightness(1)'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#F5E6D3]">
            <Sparkles className="text-[#CBA27F]" size={40} />
          </div>
        )}

        {/* "View Details" overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'rgba(44,26,14,0.75)',
          color: 'white',
          fontSize: '0.8rem',
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          padding: '10px',
          textAlign: 'center',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          transform: imgHovered ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease',
          letterSpacing: '0.04em'
        }}>
          <Eye size={14} /> View Details
        </div>

        {/* Floating Badge */}
        <div className="absolute top-3 left-3">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-[#C87941] uppercase tracking-wider flex items-center gap-1 shadow-sm border border-[#F0E0CF]">
            <Sparkles size={10} /> Handmade
          </div>
        </div>

        {/* Favourites Button */}
        <button
          onClick={handleFavouriteClick}
          className={`absolute top-3 right-3 w-10 h-10 rounded-[10px] border-[1.5px] flex items-center justify-center transition-all duration-300 shadow-sm ${
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
            className={`flex-1 ml-4 h-11 rounded-[10px] flex items-center justify-center gap-2 font-bold text-sm tracking-wide transition-all duration-300 shadow-md transform ${
              added
                ? 'bg-[#27AE60] text-white'
                : 'bg-gradient-to-br from-[#C87941] to-[#A0622E] text-white hover:shadow-[0_4px_16px_rgba(200,121,65,0.4)] active:scale-95'
            }`}
          >
            {added ? (
              <><Check size={16} /><span>✓ Added</span></>
            ) : (
              <><ShoppingCart size={16} /><span>Add to Cart</span></>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
