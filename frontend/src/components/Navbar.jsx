import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Heart, ShoppingBag, Menu, X, ChevronDown, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar({ favouriteCount = 0 }) {
  const { user, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const dropdownRef = useRef(null)

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
    setIsDropdownOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Favourites', path: '/favourites' },
    { name: 'Cart', path: '/cart' },
  ]

  const activeLinkStyle = "after:w-full after:left-0"
  const inactiveLinkStyle = "after:w-0 hover:after:w-full hover:after:left-0"

  const Badge = ({ count }) => {
    if (count <= 0) return null
    return (
      <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] bg-[#C87941] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white/20">
        {count >= 10 ? '9+' : count}
      </span>
    )
  }

  return (
    <header 
      className={`sticky top-0 z-50 w-full h-[60px] md:h-[68px] transition-all duration-300 flex items-center border-b ${
        isScrolled 
          ? 'bg-[#050810]/95 backdrop-blur-[20px] shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-[rgba(212,175,136,0.15)]' 
          : 'bg-[#050810]/70 backdrop-blur-[12px] shadow-[0_2px_20px_rgba(0,0,0,0.3)] border-[rgba(212,175,136,0.1)]'
      }`}
    >
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6 flex items-center justify-between relative">
        
        {/* LEFT — Brand Identity */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <img 
            src="/images/icon.png" 
            alt="RKL Trove Logo" 
            className="h-[44px] w-auto object-contain transition-all duration-300 group-hover:brightness-125" 
            style={{ filter: 'drop-shadow(0 0 8px rgba(212,175,136,0.2))' }}
          />
          <h1 className="font-bold text-[1.25rem] md:text-[1.5rem] tracking-[0.02em] font-serif leading-none pt-0.5"
              style={{
                background: 'linear-gradient(135deg, #F4D39B 0%, #D4AF88 50%, #AF8F6F 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
            RKL Trove
          </h1>
        </Link>

        {/* CENTER — Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative text-[0.95rem] font-medium transition-colors py-1 after:content-[''] after:absolute after:bottom-0 after:h-[2px] after:bg-[#D4AF88] after:transition-all after:duration-300 ${
                location.pathname === link.path ? 'text-white ' + activeLinkStyle : 'text-gray-400 hover:text-white ' + inactiveLinkStyle
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* RIGHT — Action Icons */}
        <div className="flex items-center gap-2 md:gap-5">
          {user ? (
            <>
              {/* Desktop Icons */}
              <div className="hidden md:flex items-center gap-4">
                <Link to="/favourites" className="relative p-2 text-gray-400 hover:text-[#D4AF88] transition-all">
                  <Heart size={22} className={location.pathname === '/favourites' ? 'fill-[#D4AF88] text-[#D4AF88]' : ''} />
                  <Badge count={favouriteCount} />
                </Link>
                <Link to="/cart" className="relative p-2 text-gray-400 hover:text-[#D4AF88] transition-all">
                  <ShoppingBag size={22} className={location.pathname === '/cart' ? 'fill-[#D4AF88]/10 text-[#D4AF88]' : ''} />
                  <Badge count={totalItems} />
                </Link>
              </div>

              {/* User Avatar Circle */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold uppercase transition-transform duration-300 hover:scale-105 shadow-md shrink-0"
                  style={{ background: 'linear-gradient(135deg, #C87941, #8B4513)' }}
                >
                  {user?.name?.charAt(0) || 'U'}
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-[calc(100%+12px)] right-0 w-[200px] bg-white rounded-xl shadow-[0_8px_32px_rgba(44,26,14,0.15)] border border-[rgba(200,121,65,0.15)] py-2 animate-slide-down origin-top-right z-[60]">
                    <div className="px-4 py-2 text-xs text-[#9C7B65] font-bold uppercase tracking-wider">
                      Hello, {user?.name?.split(' ')[0]}
                    </div>
                    <div className="h-[1px] bg-[rgba(200,121,65,0.1)] my-1" />
                    
                    <Link
                      to="/profile"
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#3D2B1A] hover:bg-[rgba(200,121,65,0.08)] hover:text-[#C87941] transition-all"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User size={15} /> My Profile
                    </Link>

                    <div className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-[#3D2B1A] opacity-50 cursor-default">
                      <div className="flex items-center gap-3">
                        <ShoppingBag size={15} /> My Orders
                      </div>
                      <span className="text-[10px] bg-[#F5E6D3] text-[#C87941] px-1.5 py-0.5 rounded-full font-bold">Soon</span>
                    </div>

                    <div className="h-[1px] bg-[rgba(200,121,65,0.1)] my-1" />
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#C0392B] hover:bg-[rgba(192,57,43,0.06)] transition-all text-left"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="px-5 py-2 text-sm font-bold text-[#C87941] border-2 border-[#C87941] rounded-xl hover:bg-orange-50 transition-all">
                Login
              </Link>
              <Link to="/signup" className="px-5 py-2 text-sm font-bold text-white bg-[#C87941] rounded-xl hover:bg-[#8B4513] transition-all shadow-sm">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Hamburguer */}
          <button 
            className="md:hidden p-2 text-[#7A5C44]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* MOBILE HAMBURGER MENU */}
      <div 
        className={`absolute top-[100%] left-0 w-full overflow-hidden transition-all duration-300 ease-in-out md:hidden z-40 border-t border-[rgba(212,175,136,0.1)] ${
          isMenuOpen ? 'max-h-[400px] opacity-100 shadow-[0_10px_40px_rgba(0,0,0,0.8)]' : 'max-h-0 opacity-0'
        }`}
        style={{ background: 'rgba(5, 8, 16, 0.98)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex flex-col py-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-6 py-4 text-[1rem] transition-colors border-b border-white/5 last:border-0 ${
                location.pathname === link.path ? 'text-[#D4AF88] font-bold bg-white/5' : 'text-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{link.name}</span>
                {link.name === 'Cart' && totalItems > 0 && (
                   <span className="bg-[#D4AF88] text-white text-[10px] h-5 w-5 rounded-full flex items-center justify-center font-bold">
                     {totalItems}
                   </span>
                )}
              </div>
            </Link>
          ))}
          
          <div className="p-6 pt-4 space-y-3">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="w-full flex items-center justify-center gap-2 px-4 py-4 text-[#D4AF88] bg-white/5 rounded-xl font-bold text-sm border border-white/10"
                >
                  <User size={18} /> My Profile
                </Link>
                <div className="w-full flex items-center justify-center gap-2 px-4 py-4 text-gray-500 bg-white/5 rounded-xl font-bold text-sm border border-white/5 opacity-60">
                   <ShoppingBag size={18} /> My Orders (Soon)
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-4 text-red-400 bg-red-400/10 rounded-xl font-bold text-sm border border-red-400/20"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-[#D4AF88] border-2 border-[#D4AF88] rounded-xl">
                  Login
                </Link>
                <Link to="/signup" className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-white bg-[#D4AF88] rounded-xl shadow-lg">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
