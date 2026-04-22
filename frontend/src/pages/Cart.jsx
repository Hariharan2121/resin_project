import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { 
  Minus, Plus, Trash2, ShoppingBag, ArrowLeft, 
  Loader2, CheckCircle, Sparkles, CreditCard,
  ShieldCheck, Truck, Package, Info
} from 'lucide-react'
import Navbar from '../components/Navbar'
import AuthModal from '../components/AuthModal'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Cart() {
  const { items, removeItem, updateQty, clearCart, totalPrice } = useCart()
  const { user, token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [ordered, setOrdered] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  // ─── Place order (always called after confirming auth) ───────────────────
  const placeOrder = async () => {
    setLoading(true)
    try {
      const currentUser = user || JSON.parse(localStorage.getItem('rkl_user') || '{}')
      const currentToken = token || localStorage.getItem('rkl_token')

      await axios.post(
        `${API_URL}/api/order`,
        {
          userDetails: {
            name: currentUser.name,
            email: currentUser.email
          },
          cart: items.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
          total: totalPrice,
        },
        { headers: { Authorization: `Bearer ${currentToken}` } }
      )
      setOrdered(true)
      clearCart()
      toast.success('Your treasures are secured!', {
        icon: '✨',
        style: { background: '#FBF5EE', color: '#2C1810', border: '1px solid #C87941' }
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to secure treasures. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Called after AuthModal completes login/signup ───────────────────────
  const handleAuthSuccessAndOrder = async () => {
    // Short tick so AuthContext state has settled from login() call
    await placeOrder()
  }

  // ─── Confirm Order button handler ────────────────────────────────────────
  const handleConfirmOrder = async () => {
    if (items.length === 0) return toast.error('Your cart is empty!')

    // Check for out-of-stock items
    const outOfStockItems = items.filter(i => i.is_available === false)
    if (outOfStockItems.length > 0) {
      return toast.error(
        `Please remove out-of-stock items (${outOfStockItems.map(i => i.name).join(', ')}) before checkout.`,
        { style: { background: '#FDF0EF', color: '#C0392B', border: '1px solid #E74C3C' } }
      )
    }

    // Check auth
    const currentToken = token || localStorage.getItem('rkl_token')
    if (!currentToken) {
      // Not logged in — open auth modal instead of redirecting
      setShowAuthModal(true)
      return
    }

    // Logged in — place order directly
    await placeOrder()
  }

  // ─── Success screen ───────────────────────────────────────────────────────
  const displayUser = user || JSON.parse(localStorage.getItem('rkl_user') || '{}')

  if (ordered) {
    return (
      <div className="min-h-screen bg-[#FBF5EE] text-[#2C1810] font-sans overflow-hidden" style={{ fontFamily: 'var(--font-body)' }}>
        <div className="fixed inset-0 pointer-events-none opacity-[0.12]" 
             style={{ backgroundImage: 'radial-gradient(#C87941 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <Navbar />
        <div className="max-w-xl mx-auto px-6 py-12 md:py-32 text-center animate-fade-slide-up relative z-10">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 border border-[#C87941]/30 shadow-[0_12px_40px_rgba(200,121,65,0.15)] relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-[#C87941]/20 to-transparent" />
             <CheckCircle size={48} className="text-[#C87941] relative z-10" />
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2C1810] mb-6">Treasures Secured</h2>
          <p className="text-[#7A5542] text-lg leading-relaxed mb-10 italic max-w-sm mx-auto">
            Thank you, <span className="text-[#C87941] font-bold">{displayUser.name}</span>. Your unique curation is now part of the RKL Trove. We will contact <span className="text-[#2C1810] font-bold">{displayUser.email}</span> shortly.
          </p>
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center justify-center gap-3 bg-gradient-to-br from-[#C87941] to-[#A0622E] text-white px-12 py-4 rounded-full text-sm font-bold shadow-[0_10px_20px_rgba(200,121,65,0.25)] hover:scale-[1.02] transition-all">
              <ArrowLeft size={18} /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FBF5EE] text-[#2C1810] font-sans selection:bg-[#C87941]/20">
      <div className="fixed inset-0 pointer-events-none opacity-[0.12]" 
           style={{ backgroundImage: 'radial-gradient(#C87941 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <Navbar />

      <main className="max-w-[1440px] mx-auto px-4 md:px-12 py-8 md:py-16 relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 md:mb-12 animate-fade-in">
          <Link to="/" className="group inline-flex items-center gap-2 text-[#9C7B65] hover:text-[#C87941] transition-all font-bold text-xs uppercase tracking-widest">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[#EDD9C0] group-hover:-translate-x-1 transition-transform shadow-sm">
               <ArrowLeft size={14} />
            </div>
            Back to Collection
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-8 md:mb-12 border-b border-[#EDD9C0] pb-8 animate-fade-slide-up">
           <div>
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5E6D3] text-[#C87941] text-[10px] font-bold rounded-full uppercase mb-4 tracking-widest shadow-sm">
               <Sparkles size={10} /> Your Selection
             </div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-sans font-extrabold text-[#2C1810]" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em' }}>The <span className="italic text-[#C87941]">Curation</span></h1>
           </div>
           {items.length > 0 && (
             <div className="text-right">
               <span className="text-[#9C7B65] font-medium leading-relaxed italic">{items.length} unique masterpieces selected</span>
             </div>
           )}
        </div>

        {/* Main Content Grid */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[40px] border-2 border-dashed border-[#EDD9C0] animate-fade-slide-up shadow-sm">
            <div className="w-24 h-24 bg-[#FBF5EE] rounded-full flex items-center justify-center mb-8 border border-[#EDD9C0]">
               <ShoppingBag size={40} className="text-[#C4A882]" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-[#2C1810] mb-4">Your Curation is Empty</h2>
            <p className="text-[#9C7B65] max-w-sm mb-12 leading-relaxed italic">Begin your journey through our collections and discover pieces that speak to your soul.</p>
            <Link to="/" className="bg-[#C87941] text-white px-12 py-4 rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-all">Explore Creations</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* PRODUCT LIST PANEL */}
            <div className="lg:col-span-8 space-y-6 animate-fade-in [animation-delay:200ms]">
              {items.map(item => (
                <article key={item.id} className="relative group bg-white rounded-[24px] p-5 md:p-6 flex flex-col sm:flex-row gap-6 items-center shadow-[0_4px_24px_rgba(44,26,14,0.04)] border border-[#F0E0CF] transition-all duration-500 hover:shadow-[0_12px_40px_rgba(200,121,65,0.12)] hover:border-[#DEC5A8]">
                  {/* Item Image */}
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 flex-shrink-0">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-[18px] bg-[#FBF5EE] transition-transform duration-700 group-hover:scale-[1.04]"
                      onError={e => { e.target.style.display = 'none' }}
                    />
                    <div className="absolute inset-0 pointer-events-none rounded-[18px] ring-1 ring-inset ring-[#C87941]/10" />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <h3 className="text-lg md:text-2xl font-sans font-extrabold text-[#2C1810] mb-2 leading-tight group-hover:text-[#C87941] transition-colors" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                      {item.name}
                    </h3>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                      <span className="text-[#C87941] font-extrabold text-xl" style={{ fontFamily: 'var(--font-heading)' }}>{fmt(item.price)}</span>
                      <div className="hidden sm:block h-4 w-[1px] bg-[#EDD9C0]" />
                      {item.is_available === false ? (
                        <span className="text-[10px] text-white uppercase tracking-widest font-bold bg-[#E74C3C] px-3 py-1 rounded-full shadow-sm animate-pulse">Out of Stock</span>
                      ) : (
                        <span className="text-[10px] text-[#9C7B65] uppercase tracking-widest font-bold bg-[#FBF5EE] px-2 py-1 rounded">Original Art</span>
                      )}
                    </div>
                  </div>

                  {/* Controls Area */}
                  <div className="flex flex-col items-center sm:items-end gap-6 flex-shrink-0">
                    <div className="flex items-center gap-3 bg-[#FBF5EE] border border-[#EDD9C0] rounded-2xl p-1 shadow-inner">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white hover:text-[#C87941] text-[#9C7B65] transition-all shadow-sm active:scale-90"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center text-lg font-bold text-[#2C1810] font-serif">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white hover:text-[#C87941] text-[#9C7B65] transition-all shadow-sm active:scale-90"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <button
                      onClick={() => { removeItem(item.id); toast.success('Treasure released from selection.') }}
                      className="inline-flex items-center gap-2 text-[#B08060] hover:text-[#E74C3C] text-[10px] font-bold uppercase tracking-widest transition-colors px-2 py-1"
                    >
                      <Trash2 size={14} /> Release Treasure
                    </button>
                  </div>
                </article>
              ))}

              {/* Security Badge */}
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 py-6 opacity-60">
                 <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#7A5542]">
                    <ShieldCheck size={16} className="text-[#C87941]" /> Secured Checkout
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#7A5542]">
                    <Truck size={16} className="text-[#C87941]" /> Safe Packaging
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#7A5542]">
                    <Package size={16} className="text-[#C87941]" /> Curated Tracking
                 </div>
              </div>
            </div>

            {/* ORDER SUMMARY PANEL */}
            <div className="lg:col-span-4 lg:sticky lg:top-32 animate-fade-in [animation-delay:400ms]">
              <div className="bg-white rounded-[32px] p-6 md:p-10 border border-[#EDD9C0] shadow-[0_12px_40px_rgba(44,26,14,0.06)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-[#C87941]/5 pointer-events-none">
                   <Sparkles size={80} />
                </div>
                
                <h2 className="text-2xl font-serif font-bold text-[#2C1810] mb-8 border-b border-[#FBF5EE] pb-6 flex items-center gap-3">
                  Curation Summary
                </h2>

                <div className="space-y-5 mb-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between items-start text-sm group">
                      <div className="flex flex-col pr-4">
                        <span className="text-[#5C3D2A] font-medium leading-snug">{item.name}</span>
                        <span className="text-[10px] text-[#A0622E] font-bold uppercase tracking-tighter mt-1">Acquiring: {item.quantity}</span>
                      </div>
                      <span className="text-[#2C1810] font-bold whitespace-nowrap" style={{ fontFamily: 'var(--font-heading)' }}>{fmt(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-8 border-t border-[#FBF5EE]">
                  <div className="flex justify-between text-[#9C7B65] text-sm">
                    <span className="font-medium">Acquisition Subtotal</span>
                    <span className="font-serif">{fmt(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-[#9C7B65] text-sm">
                    <span className="font-medium">Artisanal Shipping</span>
                    <span className="text-[#C87941] uppercase text-[10px] font-black tracking-widest bg-[#F5EDE3] px-2 py-0.5 rounded-full">Complimentary</span>
                  </div>
                  
                  <div className="flex justify-between items-end pt-8 bg-gradient-to-t from-[#FBF5EE]/50 to-transparent p-4 -mx-4 rounded-b-2xl">
                    <span className="text-[#2C1810] font-bold text-lg uppercase tracking-wider">Total Investment</span>
                    <div className="text-right">
                       <span className="text-3xl md:text-4xl font-extrabold text-[#C87941]" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>{fmt(totalPrice)}</span>
                       <p className="text-[9px] text-[#9C7B65] uppercase tracking-widest font-black mt-1">Luxe Inclusive</p>
                    </div>
                  </div>
                </div>

                {/* Guest info banner — shown only when not logged in */}
                {!user && (
                  <div style={{
                    background: '#FEF9F3',
                    border: '1px solid #EDD9C0',
                    borderLeft: '3px solid #C87941',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                    marginTop: '20px'
                  }}>
                    <Info size={18} style={{ color: '#C87941', flexShrink: 0, marginTop: '1px' }} />
                    <div>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: '0.82rem', color: '#7A5542', lineHeight: 1.5 }}>
                        You'll be asked to sign in when you confirm. It's quick and free!
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleConfirmOrder}
                  disabled={loading || items.some(i => i.is_available === false)}
                  className={`
                    w-full mt-6 p-5 rounded-[18px] text-lg font-bold shadow-lg transition-all flex items-center justify-center gap-3
                    ${loading || items.some(i => i.is_available === false)
                      ? 'bg-[#E5D5C5] text-white cursor-not-allowed opacity-80' 
                      : 'bg-gradient-to-br from-[#C87941] to-[#A0622E] text-white hover:shadow-[0_12px_24px_rgba(200,121,65,0.3)] hover:-translate-y-0.5 active:translate-y-0'}
                  `}
                >
                  {loading ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      <span>Securing Treasures...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      <span>Confirm Curation</span>
                    </>
                  )}
                </button>

                <p className="text-center text-[10px] text-[#B08060] mt-8 leading-relaxed max-w-[200px] mx-auto uppercase tracking-widest font-bold">
                  {user ? 'Collector identity confirmed.' : 'Sign in required at checkout.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Auth Modal — shown when guest clicks Confirm Order */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccessAndOrder}
        cartItemCount={items.length}
        cartTotal={totalPrice}
      />

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
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #EDD9C0; border-radius: 10px; }
      `}} />
    </div>
  )
}
