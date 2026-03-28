import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Cart() {
  const { items, removeItem, updateQty, clearCart, totalPrice } = useCart()
  const { user, token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [ordered, setOrdered] = useState(false)

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const handleConfirmOrder = async () => {
    if (items.length === 0) return toast.error('Your cart is empty!')
    setLoading(true)
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/order`,
        {
          customerName: user.name,
          customerEmail: user.email,
          items: items.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
          totalAmount: totalPrice,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setOrdered(true)
      clearCart()
      toast.success('Order placed! A confirmation has been sent to the admin.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Success screen
  if (ordered) {
    return (
      <div className="min-h-screen bg-cream-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-24 text-center animate-slide-up">
          <CheckCircle size={64} className="mx-auto text-rose-400 mb-5" />
          <h2 className="font-serif text-4xl text-stone-800 mb-3">Order Placed!</h2>
          <p className="text-stone-500 mb-8">
            Thank you, <strong>{user.name}</strong>! Your order has been received and the admin has been notified.
            We'll reach out to you at <strong>{user.email}</strong> with further details.
          </p>
          <Link to="/" className="btn-primary">
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="btn-ghost">
            <ArrowLeft size={16} /> Back to Shop
          </Link>
        </div>
        <h1 className="font-serif text-4xl text-stone-800 mb-8">Your Cart</h1>

        {items.length === 0 ? (
          /* Empty */
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <ShoppingBag size={56} className="text-stone-200 mb-5" />
            <h2 className="text-xl font-medium text-stone-500 mb-2">Your cart is empty</h2>
            <p className="text-stone-400 text-sm mb-6">Browse our collection and add your favourite pieces.</p>
            <Link to="/" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Items list */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.id} className="bg-white rounded-2xl shadow-soft p-4 flex gap-4 items-center">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl flex-shrink-0 bg-cream-100"
                    onError={e => { e.target.style.display = 'none' }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-base text-stone-800 leading-snug mb-1 line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-rose-500 font-semibold text-sm">{fmt(item.price)}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {/* Qty controls */}
                    <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-full px-1 py-0.5">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        id={`qty-minus-${item.id}`}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-stone-200 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        id={`qty-plus-${item.id}`}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-stone-200 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    {/* Subtotal */}
                    <span className="text-xs text-stone-500">{fmt(item.price * item.quantity)}</span>
                    {/* Remove */}
                    <button
                      onClick={() => { removeItem(item.id); toast.success('Item removed.') }}
                      id={`remove-${item.id}`}
                      className="text-stone-300 hover:text-red-400 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-soft p-6 sticky top-24">
                <h2 className="font-serif text-xl text-stone-800 mb-5">Order Summary</h2>

                <div className="space-y-2 text-sm mb-5">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-stone-600">
                      <span className="line-clamp-1 max-w-[160px]">{item.name} × {item.quantity}</span>
                      <span>{fmt(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-100 pt-4 mb-6">
                  <div className="flex justify-between font-semibold text-stone-800">
                    <span>Total</span>
                    <span className="text-rose-600 text-lg">{fmt(totalPrice)}</span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">Inclusive of all taxes</p>
                </div>

                <button
                  onClick={handleConfirmOrder}
                  id="confirm-order-btn"
                  disabled={loading}
                  className="btn-primary w-full py-3 rounded-xl text-base"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                  {loading ? 'Placing Order…' : 'Confirm Order'}
                </button>

                <p className="text-center text-xs text-stone-400 mt-3">
                  We will contact you to confirm delivery details.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
