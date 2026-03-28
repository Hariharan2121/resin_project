import { useState } from 'react'
import { ShoppingCart, Eye, Heart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function ProductCard({ product, isFavourite = false, onToggleFavourite }) {
  const { addItem, items } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [heartAnimating, setHeartAnimating] = useState(false)

  const inCart = items.find((i) => i.id === product.id)

  const handleAddToCart = () => {
    setIsAdding(true)
    addItem(product)
    toast.success(`"${product.name}" added to cart!`)
    setTimeout(() => setIsAdding(false), 600)
  }

  const handleFavouriteClick = () => {
    if (!user) {
      toast.error('Please login to save favourites.')
      navigate('/login')
      return
    }
    setHeartAnimating(true)
    setTimeout(() => setHeartAnimating(false), 400)
    if (onToggleFavourite) onToggleFavourite(product.id)
    toast.success(isFavourite ? 'Removed from favourites.' : '♥ Added to favourites!')
  }

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price)

  return (
    <article className="card group flex flex-col" id={`product-card-${product.id}`}>
      {/* Image */}
      <div className="relative overflow-hidden bg-cream-100 aspect-square">
        {!imgError ? (
          <img
            src={`http://localhost:5000${product.image_url}`}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-50 to-cream-200">
            <Eye size={36} className="text-rose-300" />
          </div>
        )}

        {/* Heart / Favourite button */}
        <button
          id={`fav-btn-${product.id}`}
          onClick={handleFavouriteClick}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md transition-all duration-150 hover:scale-110 active:scale-95 ${heartAnimating ? 'heart-pulse' : ''}`}
          aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
        >
          <Heart
            size={16}
            className={`transition-all duration-200 ${isFavourite ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`}
          />
        </button>

        {/* In-cart badge */}
        {inCart && (
          <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
            In Cart ({inCart.quantity})
          </div>
        )}
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
          <span className="text-lg font-semibold text-rose-600">{formattedPrice}</span>
          <button
            onClick={handleAddToCart}
            id={`add-to-cart-${product.id}`}
            disabled={isAdding}
            className={`btn-primary text-xs px-4 py-2 ${isAdding ? 'scale-95' : ''}`}
          >
            <ShoppingCart size={14} />
            {inCart ? 'Add More' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  )
}
