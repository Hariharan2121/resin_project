import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import '../styles/Auth.css'

export default function Signup() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const buttonRef = useRef(null)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
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

  const getPasswordStrength = (pass) => {
    if (!pass) return { width: '0%', color: '#EDD9C0', label: '' }
    if (pass.length < 6) return { width: '33%', color: '#E74C3C', label: 'Weak' }
    const hasNumber = /\d/.test(pass)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass)
    if (pass.length >= 8 && hasNumber && hasSpecial) return { width: '100%', color: '#27AE60', label: 'Strong' }
    if (pass.length >= 6 && (hasNumber || hasSpecial)) return { width: '66%', color: '#E67E22', label: 'Medium' }
    return { width: '33%', color: '#E74C3C', label: 'Weak' }
  }

  const strength = getPasswordStrength(form.password)
  const isMatch = form.confirmPassword && form.password === form.confirmPassword

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all artistic details')
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')

    handleRipple(e)
    setLoading(true)
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/signup`
      const res = await axios.post(apiUrl, {
        name: form.name,
        email: form.email,
        password: form.password
      })
      
      setSuccess(true)
      setTimeout(() => {
        login(res.data.user, res.data.token)
        toast.success(`Welcome to the collection, ${form.name.split(' ')[0]}!`, {
          icon: '✨',
          style: { background: '#FBF5EE', color: '#2C1810', border: '1px solid #C87941' }
        })
        navigate('/')
      }, 1500)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
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
      position: 'relative',
      overflowY: 'auto'
    },
    logoFrame: {
      width: '160px',
      height: '160px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.35)',
      border: '2px solid rgba(200,121,65,0.30)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(8px)',
      position: 'relative',
      zIndex: 2,
      opacity: mounted ? 1 : 0,
      animation: mounted ? 'scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none',
      animationDelay: '150ms'
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
      opacity: mounted ? 1 : 0,
      animation: mounted ? 'fadeSlideUp 0.5s ease-out forwards' : 'none',
      animationDelay: '400ms'
    },
    tagline: {
      fontSize: '1.1rem',
      fontStyle: 'italic',
      color: '#6B4226',
      letterSpacing: '0.06em',
      padding: '0 20px'
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
    })
  }

  return (
    <div style={styles.container} className="auth-page-container">
      {/* LEFT PANEL — Brand Story */}
      <div className="left-panel" style={styles.leftPanel}>
        <div className="left-panel-decorative-orb" style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,121,65,0.18) 0%, transparent 70%)', zIndex: 0 }} />
        <div className="left-panel-decorative-orb" style={{ position: 'absolute', bottom: -40, left: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,169,110,0.20) 0%, transparent 70%)', zIndex: 0, animationDelay: '2s' }} />
        
        <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 0 }}>
          <div className="corner-bracket-h" style={{ height: 1.5, background: 'rgba(200,121,65,0.40)', position: 'absolute', left: 0 }} />
          <div className="corner-bracket-v" style={{ width: 1.5, background: 'rgba(200,121,65,0.40)', position: 'absolute', top: 0 }} />
        </div>
        <div style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 0, transform: 'rotate(180deg)' }}>
          <div className="corner-bracket-h" style={{ height: 1.5, background: 'rgba(200,121,65,0.40)', position: 'absolute', left: 0 }} />
          <div className="corner-bracket-v" style={{ width: 1.5, background: 'rgba(200,121,65,0.40)', position: 'absolute', top: 0 }} />
        </div>

        <div className="logo-frame-outer" style={styles.logoFrame}>
           <div className="logo-ring-dashed" style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', border: '1px dashed rgba(200,121,65,0.25)', zIndex: 1 }} />
           <img src="/images/icon.png" alt="RKL Trove Logo" className="logo-img-floating" style={{ height: '120px', width: '120px', objectFit: 'contain' }} />
        </div>

        <div>
          <h1 style={styles.brandName}>RKL Trove</h1>
          <div style={{ width: '60px', height: '2px', background: 'linear-gradient(90deg, transparent, #C87941, transparent)', margin: '10px auto 0 auto', borderRadius: '2px', opacity: mounted ? 1 : 0, animation: 'fadeIn 0.4s ease-out forwards', animationDelay: '550ms' }} />
        </div>

        <div style={{ position: 'relative', marginTop: '16px', marginBottom: '40px', opacity: mounted ? 1 : 0, animation: 'fadeSlideUp 0.5s ease-out forwards', animationDelay: '600ms' }}>
          <span style={{ position: 'absolute', left: '-5px', top: '-10px', fontSize: '1.8rem', color: 'rgba(200,121,65,0.35)', fontFamily: "'Playfair Display', serif" }}>"</span>
          <p style={styles.tagline}>Handcrafted with love, crafted for you</p>
          <span style={{ position: 'absolute', right: '-5px', bottom: '-15px', fontSize: '1.8rem', color: 'rgba(200,121,65,0.35)', fontFamily: "'Playfair Display', serif" }}>"</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <div className="badge-item" style={styles.badge('750ms')}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#C87941', boxShadow: '0 0 6px rgba(200,121,65,0.6)', marginRight: '8px' }} /> 100% Handmade
          </div>
          <div className="badge-item" style={styles.badge('850ms')}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#C87941', boxShadow: '0 0 6px rgba(200,121,65,0.6)', marginRight: '8px' }} /> Premium Resin
          </div>
          <div className="badge-item" style={styles.badge('950ms')}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#C87941', boxShadow: '0 0 6px rgba(200,121,65,0.6)', marginRight: '8px' }} /> Unique Designs
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
           maxWidth: '430px',
           boxShadow: '0 2px 8px rgba(44, 26, 14, 0.06), 0 8px 32px rgba(44, 26, 14, 0.08), 0 0 0 1px rgba(222, 197, 168, 0.4)',
           opacity: mounted ? 1 : 0,
           animation: mounted ? 'fadeSlideLeft 0.5s ease-out forwards' : 'none',
           animationDelay: '150ms'
        }}>
          <div className="mobile-brand">
            <img src="/images/icon.png" alt="RKL Logo" style={{ height: '64px', marginBottom: '12px' }} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #8B4513 0%, #C87941 50%, #D4956A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '0.05em' }}>RKL Trove</h2>
            <div style={{ width: '40px', height: '2px', background: '#C87941', marginTop: '4px' }} />
          </div>
          <div style={{ width: '36px', height: '3px', background: 'linear-gradient(90deg, #C87941, #E8A96E)', borderRadius: '2px', marginBottom: '12px', opacity: mounted ? 1 : 0, animation: 'fadeIn 0.4s ease-out forwards', animationDelay: '350ms' }} />
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#2C1810', lineHeight: 1.2, opacity: mounted ? 1 : 0, animation: 'fadeSlideUp 0.45s ease-out forwards', animationDelay: '400ms' }}>Create Account</h2>
          <p style={{ fontSize: '0.9rem', color: '#9C7B65', marginTop: '6px', marginBottom: '32px', opacity: mounted ? 1 : 0, animation: 'fadeSlideUp 0.4s ease-out forwards', animationDelay: '480ms' }}>Join us and discover handcrafted resin art</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ opacity: mounted ? 1 : 0, animation: 'fadeSlideUp 0.38s ease-out forwards', animationDelay: '560ms' }}>
              <label className={`input-label ${focusedField === 'name' || form.name ? 'active' : ''}`} style={{ fontSize: '0.8rem', fontWeight: 600, color: focusedField === 'name' ? '#C87941' : '#5C3D2A', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Artist Name</label>
              <div className={`input-box-wrapper ${focusedField === 'name' ? 'focused' : ''}`} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FDFAF6', border: `1.5px solid ${focusedField === 'name' ? '#C87941' : '#DEC5A8'}`, borderRadius: '12px', padding: '0 16px', height: '52px' }}>
                <User className="input-icon" size={18} style={{ color: focusedField === 'name' ? '#C87941' : '#B08060', marginRight: '10px' }} />
                <input
                  type="text"
                  name="name"
                  placeholder="Theodore Trove"
                  style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', height: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem' }}
                  value={form.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>

            <div style={{ opacity: mounted ? 1 : 0, animation: 'fadeSlideUp 0.38s ease-out forwards', animationDelay: '620ms' }}>
              <label className={`input-label ${focusedField === 'email' || form.email ? 'active' : ''}`} style={{ fontSize: '0.8rem', fontWeight: 600, color: focusedField === 'email' ? '#C87941' : '#5C3D2A', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Email Curation</label>
              <div className={`input-box-wrapper ${focusedField === 'email' ? 'focused' : ''}`} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FDFAF6', border: `1.5px solid ${focusedField === 'email' ? '#C87941' : '#DEC5A8'}`, borderRadius: '12px', padding: '0 16px', height: '52px' }}>
                <Mail className="input-icon" size={18} style={{ color: focusedField === 'email' ? '#C87941' : '#B08060', marginRight: '10px' }} />
                <input
                  type="email"
                  name="email"
                  placeholder="exclusive@rkl.com"
                  style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', height: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem' }}
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>

            <div style={{ opacity: mounted ? 1 : 0, animation: 'fadeSlideUp 0.38s ease-out forwards', animationDelay: '680ms' }}>
              <label className={`input-label ${focusedField === 'password' || form.password ? 'active' : ''}`} style={{ fontSize: '0.8rem', fontWeight: 600, color: focusedField === 'password' ? '#C87941' : '#5C3D2A', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Security Key</label>
              <div className={`input-box-wrapper ${focusedField === 'password' ? 'focused' : ''}`} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FDFAF6', border: `1.5px solid ${focusedField === 'password' ? '#C87941' : '#DEC5A8'}`, borderRadius: '12px', padding: '0 16px', height: '52px' }}>
                <Lock className="input-icon" size={18} style={{ color: focusedField === 'password' ? '#C87941' : '#B08060', marginRight: '10px' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="Min. 6 characters"
                  style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', height: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem' }}
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <div onClick={() => setShowPass(!showPass)} style={{ cursor: 'pointer', color: '#B08060', marginLeft: '6px' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            {form.password && (
              <div style={{ marginTop: '-12px', display: 'flex', flexDirection: 'column', gap: '6px', opacity: mounted ? 1 : 0, animation: 'fadeIn 0.3s forwards', animationDelay: '680ms' }}>
                <div style={{ width: '100%', height: '4px', backgroundColor: '#EDD9C0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: strength.width, height: '100%', backgroundColor: strength.color, transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: strength.color, textAlign: 'right' }}>{strength.label}</span>
              </div>
            )}

            <div style={{ opacity: mounted ? 1 : 0, animation: 'fadeSlideUp 0.38s ease-out forwards', animationDelay: '740ms' }}>
              <label className={`input-label ${focusedField === 'confirmPassword' || form.confirmPassword ? 'active' : ''}`} style={{ fontSize: '0.8rem', fontWeight: 600, color: focusedField === 'confirmPassword' ? '#C87941' : '#5C3D2A', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Trust the Key</label>
              <div className={`input-box-wrapper ${focusedField === 'confirmPassword' ? 'focused' : ''}`} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FDFAF6', border: `1.5px solid ${form.confirmPassword && !isMatch ? '#C0392B' : (form.confirmPassword && isMatch ? '#2E7D32' : (focusedField === 'confirmPassword' ? '#C87941' : '#DEC5A8'))}`, borderRadius: '12px', padding: '0 16px', height: '52px' }}>
                <Lock className="input-icon" size={18} style={{ color: focusedField === 'confirmPassword' ? '#C87941' : '#B08060', marginRight: '10px' }} />
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Repeat keys"
                  style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', height: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem' }}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                />
                {isMatch && <CheckCircle size={18} style={{ color: '#2E7D32', marginLeft: '6px' }} />}
                <div onClick={() => setShowConfirmPass(!showConfirmPass)} style={{ cursor: 'pointer', color: '#B08060', marginLeft: '8px' }}>
                  {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
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
                marginTop: '12px',
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
                  <span style={{ textTransform: 'uppercase', tracking: '0.2em' }}>Forging...</span>
                </>
              ) : (
                <>
                  <span style={{ textTransform: 'uppercase', tracking: '0.2em' }}>Join the Trove</span>
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
              Already an artist in our collection?{' '}
              <Link to="/login" style={{ color: '#C87941', fontWeight: 600, textDecoration: 'none', borderBottom: '1px dashed #C87941' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
