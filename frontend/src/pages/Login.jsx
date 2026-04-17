import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import '../styles/Auth.css'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const buttonRef = useRef(null)
  
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleRipple = (e) => {
    if (!buttonRef.current) return
    const button = buttonRef.current
    const circle = document.createElement("span")
    const diameter = Math.max(button.clientWidth, button.clientHeight)
    const radius = diameter / 2

    circle.style.width = circle.style.height = `${diameter}px`
    circle.style.left = `${e.clientX - (button.offsetLeft + radius)}px`
    circle.style.top = `${e.clientY - (button.offsetTop + radius)}px`
    circle.classList.add("ripple")

    const existingRipple = button.getElementsByClassName("ripple")[0]
    if (existingRipple) existingRipple.remove()

    button.appendChild(circle)
    setTimeout(() => circle.remove(), 600)
  }

  const syncGuestFavourites = async (token) => {
    const guestFavs = JSON.parse(localStorage.getItem('rkltrove_guest_favourites') || '[]');
    if (guestFavs.length === 0) return;
    for (const productId of guestFavs) {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/favourites`,
          { productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (e) {
        // ignore duplicate errors silently
      }
    }
    localStorage.removeItem('rkltrove_guest_favourites');
  };

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please complete your credentials')
    
    handleRipple(e)
    setLoading(true)
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/login`
      const res = await axios.post(apiUrl, form)
      
      setSuccess(true)
      await syncGuestFavourites(res.data.token)
      window.dispatchEvent(new Event('authChange'))
      setTimeout(() => {
        login(res.data.user, res.data.token)
        toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`, {
          icon: '✨',
          style: { background: '#FBF5EE', color: '#2C1810', border: '1px solid #C87941' }
        })
        if (location.state?.from === 'cart') {
          navigate('/cart')
        } else {
          navigate('/home')
        }
      }, 1500)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed')
      setLoading(false)
    }
  }

  const styles = {
    container: {
      backgroundColor: '#FBF5EE',
      fontFamily: "'DM Sans', sans-serif",
      color: '#2C1810',
    },
    leftPanel: {
      background: 'linear-gradient(160deg, #F5E6D3 0%, #EDD0A8 50%, #E8C49A 100%)',
      padding: '40px',
      position: 'relative',
      overflow: 'hidden',
      zIndex: 1
    },
    rightPanel: {
      backgroundColor: '#FBF5EE',
      backgroundImage: 'radial-gradient(circle, rgba(222, 197, 168, 0.25) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
      padding: '24px',
      position: 'relative'
    },
    logoFrame: {
      width: '160px',
      height: '160px',
      borderRadius: '50%',
      background: 'transparent',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      /* backdropFilter: 'blur(8px)', */
      position: 'relative',
      zIndex: 2,
      opacity: 1,
      /* animation: mounted ? 'scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none', */
      /* animationDelay: '150ms' */
    },
    dashedRing: {
      position: 'absolute',
      width: '200px',
      height: '200px',
      borderRadius: '50%',
      border: '1px dashed rgba(200,121,65,0.25)',
      top: '-22px',
      left: '-22px',
      zIndex: 1
    },
    brandName: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '3rem',
      fontWeight: 800,
      background: 'linear-gradient(135deg, #8B4513 0%, #C87941 50%, #D4956A 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      textShadow: '0 2px 20px rgba(200,121,65,0.15)',
      letterSpacing: '0.04em',
      marginTop: '24px',
      textAlign: 'center',
      opacity: 1,
      /* animation: mounted ? 'fadeSlideUp 0.5s ease-out forwards' : 'none', */
      /* animationDelay: '400ms' */
    },
    decorativeLine: {
      width: '60px',
      height: '2px',
      background: 'linear-gradient(90deg, transparent, #C87941, transparent)',
      margin: '10px auto 0 auto',
      borderRadius: '2px',
      opacity: 1,
      /* animation: 'fadeIn 0.4s ease-out forwards', */
      /* animationDelay: '550ms' */
    },
    taglineWrapper: {
      position: 'relative',
      marginTop: '16px',
      marginBottom: '40px',
      opacity: 1,
      /* animation: 'fadeSlideUp 0.5s ease-out forwards', */
      /* animationDelay: '600ms' */
    },
    tagline: {
      fontSize: '1.1rem',
      fontStyle: 'italic',
      color: '#6B4226',
      letterSpacing: '0.06em',
      padding: '0 20px'
    },
    quotePrefix: {
      content: '""',
      fontSize: '1.8rem',
      color: 'rgba(200,121,65,0.35)',
      fontFamily: "'Playfair Display', serif",
      position: 'absolute',
      left: '-5px',
      top: '-10px'
    },
    quoteSuffix: {
      fontSize: '1.8rem',
      color: 'rgba(200,121,65,0.35)',
      fontFamily: "'Playfair Display', serif",
      position: 'absolute',
      right: '-5px',
      bottom: '-15px'
    },
    badge: (delay) => ({
      background: 'rgba(255,255,255,0.55)',
      border: '1px solid rgba(200,121,65,0.30)',
      borderRadius: '24px',
      padding: '10px 20px',
      fontSize: '0.82rem',
      fontWeight: 600,
      color: '#5C3018',
      letterSpacing: '0.04em',
      backdropFilter: 'blur(6px)',
      boxShadow: '0 2px 8px rgba(200,121,65,0.12)',
      display: 'flex',
      alignItems: 'center',
      opacity: mounted ? 1 : 0,
      animation: 'fadeSlideRight 0.4s ease-out forwards',
      animationDelay: delay
    }),
    badgeDot: {
      width: '7px',
      height: '7px',
      borderRadius: '50%',
      background: '#C87941',
      boxShadow: '0 0 6px rgba(200,121,65,0.6)',
      marginRight: '8px'
    },
    diamond: (top, left, opacity, duration, delay) => ({
      position: 'absolute',
      width: '8px',
      height: '8px',
      background: `rgba(200,121,65, ${opacity})`,
      top,
      left,
      zIndex: 0,
      animation: `diamondFloat ${duration}s ease-in-out infinite`,
      animationDelay: delay
    })
  }

  return (
    <div style={styles.container} className="auth-page-container">
      {/* LEFT PANEL — Brand Story */}
      <div className="left-panel" style={styles.leftPanel}>
        {/* Decorative Elements */}
        <div className="left-panel-decorative-orb" style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,121,65,0.18) 0%, transparent 70%)', zIndex: 0 }} />
        <div className="left-panel-decorative-orb" style={{ position: 'absolute', bottom: -40, left: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,169,110,0.20) 0%, transparent 70%)', zIndex: 0, animationDelay: '2s' }} />
        <div className="left-panel-decorative-orb" style={{ position: 'absolute', top: '55%', left: '10%', width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,121,65,0.12) 0%, transparent 70%)', zIndex: 0 }} />
        
        {/* Corner Brackets */}
        <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 0 }}>
          <div className="corner-bracket-h" style={{ height: 1.5, background: 'rgba(200,121,65,0.40)', position: 'absolute', left: 0 }} />
          <div className="corner-bracket-v" style={{ width: 1.5, background: 'rgba(200,121,65,0.40)', position: 'absolute', top: 0 }} />
        </div>
        <div style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 0, transform: 'rotate(180deg)' }}>
          <div className="corner-bracket-h" style={{ height: 1.5, background: 'rgba(200,121,65,0.40)', position: 'absolute', left: 0 }} />
          <div className="corner-bracket-v" style={{ width: 1.5, background: 'rgba(200,121,65,0.40)', position: 'absolute', top: 0 }} />
        </div>

        {/* Diamond Shapes */}
        <div className="diamond-shape" style={styles.diamond('20%', '15%', 0.25, 4.0, '0s')} />
        <div className="diamond-shape" style={styles.diamond('70%', '80%', 0.18, 5.5, '1s')} />
        <div className="diamond-shape" style={styles.diamond('40%', '85%', 0.20, 3.8, '0.5s')} />
        <div className="diamond-shape" style={styles.diamond('80%', '20%', 0.15, 6.2, '1.5s')} />
        
        <div style={{ position: 'relative', marginBottom: '32px' }}>
           <img src="/images/icon.jpg?v=3" alt="RKL Trove Logo" style={{ height: '160px', width: '160px', objectFit: 'cover', borderRadius: '50%', boxShadow: '0 8px 32px rgba(44,26,14,0.15)' }} />
        </div>

        <div>
          <h1 style={styles.brandName}>RKL Trove</h1>
          <div style={styles.decorativeLine} />
        </div>

        <div style={styles.taglineWrapper}>
          <span style={styles.quotePrefix}>"</span>
          <p style={styles.tagline}>Handcrafted with love, crafted for you</p>
          <span style={styles.quoteSuffix}>"</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <div className="badge-item" style={styles.badge('750ms')}>
            <div className="badge-dot" /> 100% Handmade
          </div>
          <div className="badge-item" style={styles.badge('850ms')}>
            <div className="badge-dot" /> Premium Resin
          </div>
          <div className="badge-item" style={styles.badge('950ms')}>
            <div className="badge-dot" /> Unique Designs
          </div>
        </div>

        <p style={{ position: 'absolute', bottom: 20, fontSize: '0.72rem', fontStyle: 'italic', color: 'rgba(92,56,24,0.55)', letterSpacing: '0.08em', opacity: mounted ? 1 : 0, animation: 'fadeIn 0.6s ease-out forwards', animationDelay: '1100ms' }}>
          ✦ Crafted with passion in India ✦
        </p>
      </div>

      {/* RIGHT PANEL — Form Side */}
      <div className="right-panel" style={styles.rightPanel}>
        <div className="card" style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '40px 44px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 2px 8px rgba(44, 26, 14, 0.06), 0 8px 32px rgba(44, 26, 14, 0.08), 0 0 0 1px rgba(222, 197, 168, 0.4)',
          opacity: mounted ? 1 : 0,
          animation: mounted ? 'fadeSlideLeft 0.5s ease-out forwards' : 'none',
          animationDelay: '150ms'
        }}>
          <div className="mobile-brand">
            <img src="/images/icon.jpg?v=3" alt="RKL Logo" style={{ height: '64px', width: '64px', objectFit: 'cover', borderRadius: '50%', marginBottom: '12px' }} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #8B4513 0%, #C87941 50%, #D4956A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '0.05em' }}>RKL Trove</h2>
            <div style={{ width: '40px', height: '2px', background: '#C87941', marginTop: '4px' }} />
          </div>

          <div style={{ width: '36px', height: '3px', background: 'linear-gradient(90deg, #C87941, #E8A96E)', borderRadius: '2px', marginBottom: '12px', opacity: mounted ? 1 : 0, animation: 'fadeIn 0.4s ease-out forwards', animationDelay: '350ms' }} />
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#2C1810', lineHeight: 1.2, opacity: mounted ? 1 : 0, animation: 'fadeSlideUp 0.45s ease-out forwards', animationDelay: '400ms' }}>Welcome Back</h2>
          <p style={{ fontSize: '0.9rem', color: '#9C7B65', marginTop: '6px', marginBottom: '32px', opacity: mounted ? 1 : 0, animation: 'fadeSlideUp 0.4s ease-out forwards', animationDelay: '480ms' }}>Sign in to explore our collection</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="input-field-animate" style={{ opacity: mounted ? 1 : 0, animation: 'fadeSlideUp 0.38s ease-out forwards', animationDelay: '560ms' }}>
              <label className={`input-label ${focusedField === 'email' || form.email ? 'active' : ''}`} style={{ fontSize: '0.8rem', fontWeight: 600, color: focusedField === 'email' ? '#C87941' : '#5C3D2A', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Email Address</label>
              <div className={`input-box-wrapper ${focusedField === 'email' ? 'focused' : ''}`} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FDFAF6', border: `1.5px solid ${focusedField === 'email' ? '#C87941' : '#DEC5A8'}`, borderRadius: '12px', padding: '0 16px', height: '52px' }}>
                <Mail className="input-icon" size={18} style={{ color: focusedField === 'email' ? '#C87941' : '#B08060', marginRight: '10px' }} />
                <input
                  type="email"
                  name="email"
                  placeholder="name@exclusive.com"
                  style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', height: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem' }}
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>

            <div className="input-field-animate" style={{ opacity: mounted ? 1 : 0, animation: 'fadeSlideUp 0.38s ease-out forwards', animationDelay: '620ms' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className={`input-label ${focusedField === 'password' || form.password ? 'active' : ''}`} style={{ fontSize: '0.8rem', fontWeight: 600, color: focusedField === 'password' ? '#C87941' : '#5C3D2A', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Security Key</label>
                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#9C7B65', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#C87941'} onMouseLeave={(e) => e.target.style.color = '#9C7B65'}>Lost Key?</Link>
              </div>
              <div className={`input-box-wrapper ${focusedField === 'password' ? 'focused' : ''}`} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FDFAF6', border: `1.5px solid ${focusedField === 'password' ? '#C87941' : '#DEC5A8'}`, borderRadius: '12px', padding: '0 16px', height: '52px' }}>
                <Lock className="input-icon" size={18} style={{ color: focusedField === 'password' ? '#C87941' : '#B08060', marginRight: '10px' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', height: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem' }}
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <div onClick={() => setShowPass(!showPass)} style={{ cursor: 'pointer', color: '#B08060', marginLeft: '6px' }} onMouseEnter={(e) => e.target.style.color = '#C87941'} onMouseLeave={(e) => e.target.style.color = '#B08060'}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            <button
              ref={buttonRef}
              type="submit"
              disabled={loading}
              className="submit-btn-ripple"
              style={{
                width: '100%',
                height: '52px',
                borderRadius: '12px',
                background: success ? 'linear-gradient(135deg, #27AE60, #1E8449)' : 'linear-gradient(135deg, #C87941 0%, #A0622E 100%)',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 600,
                letterSpacing: '0.03em',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '8px',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transform: success ? 'scale(1.02)' : 'scale(1)',
                opacity: mounted ? 1 : 0,
                animation: mounted ? 'fadeSlideUp 0.4s ease-out forwards' : 'none',
                animationDelay: '800ms'
              }}
            >
              {success ? (
                <>
                  <CheckCircle size={20} />
                  <span style={{ textTransform: 'uppercase', tracking: '0.2em' }}>✓ Success!</span>
                </>
              ) : loading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spinLoader 0.7s linear infinite' }} />
                  <span style={{ textTransform: 'uppercase', tracking: '0.2em' }}>Validating...</span>
                </>
              ) : (
                <>
                  <span style={{ textTransform: 'uppercase', tracking: '0.2em' }}>Seal & Enter</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0', color: '#9C7B65', fontSize: '0.8rem', opacity: mounted ? 1 : 0, animation: 'fadeIn 0.4s ease-out forwards', animationDelay: '900ms' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#EDD9C0' }} />
            <span>or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#EDD9C0' }} />
          </div>

          <div style={{ textAlign: 'center', opacity: mounted ? 1 : 0, animation: 'fadeIn 0.4s ease-out forwards', animationDelay: '900ms' }}>
            <p style={{ fontSize: '0.875rem', color: '#7A5542' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: '#C87941', fontWeight: 600, textDecoration: 'none', borderBottom: '1px dashed #C87941' }}>Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
