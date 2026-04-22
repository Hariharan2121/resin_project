import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ShoppingCart, Heart, Palette, Truck, Package, RefreshCw,
  Copy, Home, ChevronRight, Plus, Minus, Share2, Star, XCircle, Info
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { getProductById, getProducts, getFavourites, addFavourite, removeFavourite } from '../services/api'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import AuthModal from '../components/AuthModal'

// ── Skeleton component ────────────────────────────────────────────────────────
function Skeleton({ width = '100%', height = '20px', borderRadius = '8px', style = {} }) {
  return (
    <div style={{
      width, height, borderRadius, flexShrink: 0,
      animation: 'skeletonPulse 1.5s ease-in-out infinite',
      ...style
    }} />
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem, items, updateQty } = useCart()
  const { user } = useAuth()

  const [product, setProduct] = useState(null)
  const [allProducts, setAllProducts] = useState([])
  const [favouriteIds, setFavouriteIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isFavourite, setIsFavourite] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [activeThumb, setActiveThumb] = useState(0)
  const [imgError, setImgError] = useState(false)
  const [imgHovered, setImgHovered] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [showCustomizeAuth, setShowCustomizeAuth] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    setProduct(null)
    setQuantity(1)
    setActiveThumb(0)
    setImgError(false)
    setMounted(false)

    Promise.all([
      getProductById(id),
      getProducts(),
      user ? getFavourites().catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } })
    ]).then(([prod, prods, favRes]) => {
      if (!prod) { setNotFound(true); setLoading(false); return }
      setProduct(prod)
      setAllProducts(prods || [])
      const favData = favRes?.data?.data || favRes?.data || []
      const ids = new Set(favData.map(f => f.id))
      setFavouriteIds(ids)
      setIsFavourite(ids.has(product?.id || id))
      setLoading(false)
      setTimeout(() => setMounted(true), 50)
    }).catch(err => {
      console.error('Fetch detail error:', err)
      setLoading(false)
    })
  }, [id, user])

  const toggleFavourite = async (prodId) => {
    const productId = prodId
    const wasFav = favouriteIds.has(productId)
    
    // Optimistic UI update
    setFavouriteIds(prev => {
      const next = new Set(prev)
      wasFav ? next.delete(productId) : next.add(productId)
      return next
    })
    if (productId === (product?.id || id)) setIsFavourite(!wasFav)

    if (!user) {
      // Guest: sync to localStorage
      const guestFavs = JSON.parse(localStorage.getItem('rkltrove_guest_favourites') || '[]')
      if (wasFav) {
        const updated = guestFavs.filter(id => id !== String(productId))
        localStorage.setItem('rkltrove_guest_favourites', JSON.stringify(updated))
      } else {
        guestFavs.push(String(productId))
        localStorage.setItem('rkltrove_guest_favourites', JSON.stringify(guestFavs))
      }
      return
    }

    try {
      if (wasFav) {
        await removeFavourite(productId)
      } else {
        await addFavourite(productId)
      }
    } catch (err) {
      // Rollback
      setFavouriteIds(prev => {
        const next = new Set(prev)
        wasFav ? next.add(productId) : next.delete(productId)
        return next
      })
      if (productId === Number(product?.id)) setIsFavourite(wasFav)
      toast.error('Failed to update favourites.')
    }
  }

  const imgSrc = product
    ? (product.image_url?.startsWith('http') ? product.image_url : `${API_URL}${product.image_url}`)
    : ''

  const isAvailable = product?.is_available !== false;

  const handleAddToCart = async () => {
    if (!product) return
    if (!isAvailable) {
      // Out of stock — add to favourites (guest or logged-in)
      if (!user) {
        const guestFavs = JSON.parse(localStorage.getItem('rkltrove_guest_favourites') || '[]')
        if (guestFavs.includes(String(product.id))) {
          toast.error('This product is out of stock and already in your wishlist.', {
            style: { background: '#FEF9F3', color: '#2C1810', border: '1px solid #C87941' }
          })
          return
        }
        guestFavs.push(String(product.id))
        localStorage.setItem('rkltrove_guest_favourites', JSON.stringify(guestFavs))
        setIsFavourite(true)
        toast.success(`"${product.name}" added to your wishlist!`, {
          icon: '💖',
          style: { background: '#FBF5EE', color: '#2C1810', border: '1px solid #C87941' }
        })
        return
      }

      if (isFavourite) {
        toast.error('This product is out of stock and already in your wishlist.', {
          style: { background: '#FEF9F3', color: '#2C1810', border: '1px solid #C87941' }
        })
        return
      }

      setFavLoading(true)
      try {
        await addFavourite(product.id)
        setIsFavourite(true)
        toast.success(`"${product.name}" added to your wishlist!`, {
          icon: '💖',
          style: { background: '#FBF5EE', color: '#2C1810', border: '1px solid #C87941' }
        })
      } catch (err) {
        toast.error('Failed to update wishlist.')
      } finally {
        setFavLoading(false)
      }
      return
    }
    const existing = items.find(i => i.id === product.id)
    if (existing) {
      updateQty(product.id, existing.quantity + quantity)
    } else {
      for (let i = 0; i < quantity; i++) addItem(product)
    }
    toast.success(`${quantity > 1 ? quantity + '× ' : ''}"${product.name}" added to cart!`, {
      icon: '🛒',
      style: { background: '#FBF5EE', color: '#2C1810', border: '1px solid #C87941' }
    })
  }

  const handleFavourite = async () => {
    setFavLoading(true)
    try {
      if (!user) {
        // Guest: toggle in localStorage
        const guestFavs = JSON.parse(localStorage.getItem('rkltrove_guest_favourites') || '[]')
        if (guestFavs.includes(String(product.id))) {
          const updated = guestFavs.filter(id => id !== String(product.id))
          localStorage.setItem('rkltrove_guest_favourites', JSON.stringify(updated))
          setIsFavourite(false)
          toast('Removed from favourites', { icon: '💔' })
        } else {
          guestFavs.push(String(product.id))
          localStorage.setItem('rkltrove_guest_favourites', JSON.stringify(guestFavs))
          setIsFavourite(true)
          toast.success('Added to favourites! ♥', {
            style: { background: '#FBF5EE', color: '#2C1810', border: '1px solid #C87941' }
          })
        }
        setFavLoading(false)
        return
      }
      if (isFavourite) {
        await removeFavourite(product.id)
        setIsFavourite(false)
        toast('Removed from favourites', { icon: '💔' })
      } else {
        await addFavourite(product.id)
        setIsFavourite(true)
        toast.success('Added to favourites! ♥', {
          style: { background: '#FBF5EE', color: '#2C1810', border: '1px solid #C87941' }
        })
      }
    } catch {
      toast.error('Failed to update favourites.')
    } finally {
      setFavLoading(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied!', { icon: '🔗' })
  }

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Check out this product from RKL Trove: ${product?.name} — ${window.location.href}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const related = allProducts.filter(p => String(p.id) !== String(id)).slice(0, 4)

  const fadeIn = (delay = 0) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`
  })

  // ── Loading Skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FBF5EE', fontFamily: "var(--font-body)" }}>
        <style>{`
          @keyframes skeletonPulse {
            0%, 100% { background-color: #F0E0CF; }
            50% { background-color: #E8D0B8; }
          }
        `}</style>
        <Navbar />
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 48px' }}>
          <Skeleton height="16px" width="220px" style={{ marginBottom: '32px' }} />
          <div style={{ display: 'flex', gap: '48px', flexDirection: isMobile ? 'column' : 'row' }}>
            <div style={{ flex: 1 }}>
              <Skeleton height={isMobile ? '280px' : '440px'} borderRadius="20px" style={{ marginBottom: '12px' }} />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-start">
                {[1,2,3].map(i => <Skeleton key={i} width="70px" height="70px" borderRadius="10px" />)}
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Skeleton height="14px" width="100px" />
              <Skeleton height="40px" width="85%" />
              <Skeleton height="16px" width="160px" />
              <Skeleton height="50px" width="50%" />
              <Skeleton height="1px" />
              <Skeleton height="80px" />
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <Skeleton height="52px" style={{ flex: 1 }} borderRadius="14px" />
                <Skeleton height="52px" style={{ flex: 1 }} borderRadius="14px" />
                <Skeleton width="52px" height="52px" borderRadius="14px" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Not Found ──────────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FBF5EE', fontFamily: "var(--font-body)" }}>
        <Navbar />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔍</div>
          <h1 className="text-3xl md:text-6xl font-sans font-extrabold text-[#2C1810] mb-4 leading-[1.1] tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Product Not Found</h1>
          <p style={{ color: '#9C7B65', marginBottom: '24px' }}>This product may have been removed or doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'linear-gradient(135deg, #C87941, #A0622E)', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 28px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', fontFamily: "var(--font-body)" }}
          >
            Back to Store
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FBF5EE', fontFamily: "var(--font-body)", color: '#2C1810' }}>
      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { background-color: #F0E0CF; }
          50% { background-color: #E8D0B8; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.75); }
        }
      `}</style>
      <Navbar />

      {/* Breadcrumb */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '16px 16px 0' : '24px 48px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#9C7B65', flexWrap: 'wrap' }}>
          <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'color 0.2s' }}
            onClick={() => navigate('/')}
            onMouseEnter={(e) => e.currentTarget.style.color = '#C87941'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#9C7B65'}
          >
            <Home size={13} /> Home
          </span>
          <span style={{ color: '#C4A882' }}>›</span>
          <span style={{ color: '#9C7B65' }}>
            {product.collection || 'Products'}
          </span>
          <span style={{ color: '#C4A882' }}>›</span>
          <span style={{ color: '#2C1810', fontWeight: 500 }}>{product.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '20px 16px 40px' : '32px 48px 60px' }}>
        <div style={{
          display: 'flex', gap: isMobile ? '24px' : '48px',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'flex-start'
        }}>

          {/* ── LEFT — Image ── */}
          <div style={{
            flex: '0 0 auto', width: isMobile ? '100%' : '48%',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateX(0)' : 'translateX(-30px)',
            transition: 'opacity 0.5s ease 0ms, transform 0.5s ease 0ms'
          }}>
            {/* Main Image */}
            <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(200,121,65,0.15)', border: '1px solid #EDD9C0', aspectRatio: '1/1', cursor: 'zoom-in' }}
              onMouseEnter={() => setImgHovered(true)}
              onMouseLeave={() => setImgHovered(false)}
            >
              {!imgError ? (
                <img
                  src={imgSrc}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#FBF5EE', transform: imgHovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.4s ease', display: 'block' }}
                  onError={() => setImgError(true)}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#F5E6D3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>
                  🎨
                </div>
              )}
              {/* Handcrafted badge */}
              <div style={{
                position: 'absolute', top: '16px', left: '16px',
                background: 'rgba(200,121,65,0.90)', color: 'white',
                fontSize: '0.72rem', fontWeight: 600, padding: '6px 14px',
                borderRadius: '20px', backdropFilter: 'blur(4px)',
                letterSpacing: '0.04em'
              }}>
                ✦ Handcrafted
              </div>
            </div>

            {/* Thumbnails */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  onClick={() => setActiveThumb(i)}
                  style={{
                    width: '70px', height: '70px', borderRadius: '10px', overflow: 'hidden',
                    border: activeThumb === i ? '2px solid #C87941' : '2px solid transparent',
                    cursor: 'pointer',
                    boxShadow: activeThumb === i ? '0 0 0 3px rgba(200,121,65,0.20)' : 'none',
                    transition: 'all 0.2s', flexShrink: 0
                  }}
                >
                  {!imgError ? (
                    <img src={imgSrc} alt={`thumb ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgError(true)} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#F5E6D3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🎨</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT — Info ── */}
          <div style={{
            flex: 1, minWidth: 0,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateX(0)' : 'translateX(30px)',
            transition: 'opacity 0.5s ease 150ms, transform 0.5s ease 150ms'
          }}>
            {/* Category tag & Availability */}
            <div style={{ ...fadeIn(200), display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: '#FEF0E3', color: '#C87941', border: '1px solid rgba(200,121,65,0.25)', fontSize: '0.75rem', fontWeight: 600, padding: '5px 14px', borderRadius: '20px' }}>
                Resin Art
              </span>
              
              {isAvailable ? (
                <div style={{ background: '#E8F8F0', border: '1.5px solid #27AE60', color: '#1E8449', borderRadius: '20px', padding: '5px 14px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', background: '#27AE60', borderRadius: '50%', animation: 'pulseDot 2s ease-in-out infinite' }} />
                  In Stock & Available
                </div>
              ) : (
                <div style={{ background: '#FDF0EF', border: '1.5px solid #E74C3C', color: '#C0392B', borderRadius: '20px', padding: '5px 14px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <XCircle size={12} />
                  Currently Out of Stock
                </div>
              )}
            </div>

            {/* Collection tag — shown only if set */}
            {product.collection && (
              <div style={{ ...fadeIn(200), marginBottom: '6px', marginTop: '4px' }}>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#C87941',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}>
                  {product.collection}
                </span>
              </div>
            )}

            {/* Product name */}
            <h1 style={{ ...fadeIn(280), fontFamily: "var(--font-heading)", fontSize: isMobile ? '1.8rem' : '3rem', fontWeight: 900, color: '#1A0F00', lineHeight: 1.05, marginBottom: '12px', letterSpacing: '-0.04em' }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div style={{ ...fadeIn(360), display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="#C87941" color="#C87941" />)}
              </div>
              <span style={{ fontWeight: 700, color: '#C87941', fontSize: '0.9rem' }}>4.9</span>
              <span style={{ color: '#9C7B65', fontSize: '0.82rem' }}>(24 reviews)</span>
            </div>

            {/* Price */}
            <div style={{ ...fadeIn(440), marginTop: '22px' }}>
              <div style={{
                fontFamily: "var(--font-heading)", fontSize: '2.5rem', fontWeight: 800,
                background: 'linear-gradient(135deg, #C87941, #8B4513)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                display: 'inline-block', letterSpacing: '-0.02em'
              }}>
                ₹{Number(product.price).toFixed(2)}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#9C7B65', fontStyle: 'italic', marginTop: '4px' }}>Inclusive of all taxes</p>
            </div>

            <div style={{ ...fadeIn(480), height: '1px', background: '#EDD9C0', margin: '20px 0' }} />

            {/* Description */}
            <div style={fadeIn(520)}>
              <p style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', color: '#9C7B65', textTransform: 'uppercase', marginBottom: '10px' }}>The Story</p>
              <p style={{ fontSize: '0.9rem', color: '#3D2B1A', lineHeight: 1.8, opacity: 0.9 }}>
                {product.description || 'A beautifully handcrafted resin piece, made with premium materials and love. Each item is unique and one-of-a-kind.'}
              </p>
            </div>

            {/* Highlights */}
            <div style={{ ...fadeIn(580), display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '18px' }}>
              {['✦ 100% Handmade', '✦ Premium Resin', '✦ Ships in 5-7 days'].map(h => (
                <span key={h} style={{ background: '#FEF9F3', border: '1px solid #EDD9C0', borderRadius: '20px', padding: '8px 16px', fontSize: '0.82rem', color: '#5C3D2A' }}>
                  {h}
                </span>
              ))}
            </div>

            <div style={{ ...fadeIn(620), height: '1px', background: '#EDD9C0', margin: '20px 0' }} />

            {/* Quantity */}
            <div style={fadeIn(660)}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', color: '#9C7B65', textTransform: 'uppercase', marginBottom: '12px' }}>Quantity</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0', opacity: isAvailable ? 1 : 0.5, pointerEvents: isAvailable ? 'auto' : 'none' }}>
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid #DEC5A8', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', color: '#7A5542' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF0E3'; e.currentTarget.style.borderColor = '#C87941' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#DEC5A8' }}
                >
                  <Minus size={14} />
                </button>
                <span style={{ minWidth: '48px', textAlign: 'center', fontSize: '1rem', fontWeight: 600, color: '#2C1810' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(10, q + 1))}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid #DEC5A8', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', color: '#7A5542' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF0E3'; e.currentTarget.style.borderColor = '#C87941' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#DEC5A8' }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ ...fadeIn(720), display: 'flex', gap: '12px', marginTop: '24px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                style={{
                  flex: 1, minWidth: isMobile ? '100%' : 'auto', height: '52px', borderRadius: '14px',
                  background: isAvailable 
                    ? 'linear-gradient(135deg, #C87941, #A0622E)' 
                    : '#FEF0E3',
                  color: isAvailable ? 'white' : '#C87941', 
                  border: isAvailable ? 'none' : '2.5px solid #C87941', 
                  fontSize: '1rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  cursor: 'pointer', fontFamily: "var(--font-body)",
                  boxShadow: isAvailable ? '0 4px 20px rgba(200,121,65,0.35)' : 'none',
                  transition: 'all 0.25s ease',
                  opacity: 1
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  if (isAvailable) {
                    e.currentTarget.style.boxShadow = '0 8px 28px rgba(200,121,65,0.45)';
                  } else {
                    e.currentTarget.style.background = '#FEEBC8';
                  }
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.transform = 'translateY(0)';
                  if (isAvailable) {
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(200,121,65,0.35)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #C87941, #A0622E)';
                  } else {
                    e.currentTarget.style.background = '#FEF0E3';
                  }
                }}
              >
                {isAvailable ? <><ShoppingCart size={18} /> Add to Cart</> : <><Heart size={18} /> Add to Wishlist</>}
              </button>

              {/* Customize */}
              <div style={{ flex: 1, position: 'relative' }} title={!isAvailable ? "Request a custom version" : ""}>
                <button
                  onClick={() => {
                    if (!user) {
                      setShowCustomizeAuth(true)
                    } else {
                      navigate(`/customize?product=${product.id}&name=${encodeURIComponent(product.name)}`)
                    }
                  }}
                  style={{
                    width: '100%', height: '52px', borderRadius: '14px',
                    background: 'white', border: '2px solid #C87941', color: '#C87941',
                    fontSize: '1rem', fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    cursor: 'pointer', fontFamily: "var(--font-body)",
                    transition: 'all 0.25s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF0E3'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <Palette size={18} /> Customize This
                </button>
              </div>

              {/* Heart */}
              <button
                onClick={handleFavourite}
                disabled={favLoading}
                style={{
                  width: '52px', height: '52px', flexShrink: 0, borderRadius: '14px',
                  border: `1.5px solid ${isFavourite ? '#C87941' : '#DEC5A8'}`,
                  background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s',
                  color: isFavourite ? '#E74C3C' : '#B08060'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#C87941'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = isFavourite ? '#C87941' : '#DEC5A8'}
              >
                <Heart size={20} fill={isFavourite ? '#E74C3C' : 'none'} />
              </button>
            </div>

            {/* Unavailable Info Box */}
            {!isAvailable && (
              <div style={{ ...fadeIn(750), background: '#FEF9F3', border: '1px solid #EDD9C0', borderLeft: '4px solid #E67E22', borderRadius: '10px', padding: '14px 18px', display: 'flex', gap: '12px', marginTop: '20px' }}>
                <Info size={20} style={{ color: '#E67E22', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#5C3D2A', marginBottom: '4px' }}>Currently Unavailable</p>
                  <p style={{ fontSize: '0.82rem', color: '#7A5542', lineHeight: 1.5 }}>
                    This product is out of stock right now. You can still request a custom version or add it to your favourites to know when it's back.
                  </p>
                </div>
              </div>
            )}

            {/* Share */}
            <div style={{ ...fadeIn(780), display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
              <span style={{ fontSize: '0.8rem', color: '#9C7B65' }}>Share:</span>
              <button onClick={handleCopyLink} style={{ background: 'white', border: '1px solid #DEC5A8', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', color: '#7A5542', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C87941'; e.currentTarget.style.color = '#C87941' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#DEC5A8'; e.currentTarget.style.color = '#7A5542' }}>
                <Copy size={13} /> Copy Link
              </button>
              <button onClick={handleWhatsApp} style={{ background: '#25D366', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', color: 'white', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Share2 size={13} /> WhatsApp
              </button>
            </div>

            {/* Delivery Info */}
            <div style={{ ...fadeIn(840), background: '#FEF9F3', border: '1px solid #EDD9C0', borderRadius: '14px', padding: '16px 20px', marginTop: '20px' }}>
              {[
                { icon: Truck, text: 'Free shipping on orders above ₹999' },
                { icon: Package, text: 'Ships within 3-5 business days' },
                { icon: RefreshCw, text: 'Easy 7-day returns' }
              ].map((item, i, arr) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid #F0E0CF' : 'none' }}>
                  <item.icon size={16} style={{ color: '#C87941', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem', color: '#5C3D2A' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div style={{ marginTop: '64px', opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease 400ms' }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: '1.5rem', fontWeight: 700, color: '#2C1810', marginBottom: '24px' }}>
              You May Also Like
            </h2>
            <div style={{
              display: isMobile ? 'flex' : 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
              overflowX: isMobile ? 'auto' : 'visible',
              flexDirection: isMobile ? 'row' : undefined,
              paddingBottom: isMobile ? '12px' : 0
            }}>
              {related.map(p => (
                <div key={p.id} style={{ minWidth: isMobile ? '240px' : undefined }}>
                  <ProductCard 
                    product={p} 
                    isFavourite={favouriteIds.has(p.id)}
                    onToggleFavourite={toggleFavourite}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Auth modal for Customize button (guests) */}
      <AuthModal
        isOpen={showCustomizeAuth}
        onClose={() => setShowCustomizeAuth(false)}
        onAuthSuccess={() => {
          setShowCustomizeAuth(false)
          navigate(`/customize?product=${product?.id}&name=${encodeURIComponent(product?.name || '')}`)
        }}
        cartItemCount={0}
        cartTotal={0}
      />
    </div>
  )
}
