import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingBag, LogOut, Gem, Heart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar({ favouriteCount = 0 }) {
  const { user, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isCartPage = location.pathname === '/cart'
  const isFavPage = location.pathname === '/favourites'

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-100 shadow-soft">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <Gem
            size={22}
            className="text-rose-500 transition-transform duration-300 group-hover:rotate-12"
          />
          <span className="font-serif text-2xl font-semibold text-stone-800 tracking-wide">
            RKL Trove
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {/* Welcome text */}
          {user && (
            <span className="hidden sm:block text-sm text-stone-500">
              Hi, <span className="font-medium text-stone-700">{user.name}</span>
            </span>
          )}

          {/* Favourites button — only when logged in */}
          {user && (
            <Link
              to="/favourites"
              id="nav-favourites-btn"
              className={`relative p-2 rounded-full transition-colors ${
                isFavPage
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-stone-600 hover:text-rose-600 hover:bg-rose-50'
              }`}
              aria-label="Go to favourites"
            >
              <Heart size={20} className={isFavPage ? 'fill-rose-500 text-rose-500' : ''} />
              {favouriteCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none px-1 animate-fade-in">
                  {favouriteCount > 99 ? '99+' : favouriteCount}
                </span>
              )}
            </Link>
          )}

          {/* Cart button */}
          <Link
            to="/cart"
            id="nav-cart-btn"
            className={`relative p-2 rounded-full transition-colors ${
              isCartPage
                ? 'bg-rose-50 text-rose-600'
                : 'text-stone-600 hover:text-rose-600 hover:bg-rose-50'
            }`}
            aria-label="Go to cart"
          >
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none px-1 animate-fade-in">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            id="nav-logout-btn"
            className="btn-ghost"
            aria-label="Logout"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>
    </header>
  )
}
