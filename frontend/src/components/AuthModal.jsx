import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  Lock, X, Mail, User, Eye, EyeOff,
  ShoppingBag, AlertCircle
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Sync guest favourites to server after login/signup
const syncGuestFavourites = async (token) => {
  const guestFavs = JSON.parse(localStorage.getItem('rkltrove_guest_favourites') || '[]')
  if (guestFavs.length === 0) return
  for (const productId of guestFavs) {
    try {
      await axios.post(
        `${API_URL}/api/favourites`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
    } catch (e) {
      // ignore duplicate errors silently
    }
  }
  localStorage.removeItem('rkltrove_guest_favourites')
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

export default function AuthModal({ isOpen, onClose, onAuthSuccess, cartItemCount = 0, cartTotal = 0 }) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('signin')

  // Sign In form state
  const [signInForm, setSignInForm] = useState({ email: '', password: '' })
  const [showSignInPass, setShowSignInPass] = useState(false)
  const [signInLoading, setSignInLoading] = useState(false)
  const [signInError, setSignInError] = useState('')

  // Sign Up form state
  const [signUpForm, setSignUpForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showSignUpPass, setShowSignUpPass] = useState(false)
  const [showSignUpConfirm, setShowSignUpConfirm] = useState(false)
  const [signUpLoading, setSignUpLoading] = useState(false)
  const [signUpError, setSignUpError] = useState('')

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const strength = getPasswordStrength(signUpForm.password)
  const isMatch = signUpForm.confirmPassword && signUpForm.password === signUpForm.confirmPassword

  const isSubmitting = signInLoading || signUpLoading

  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) onClose()
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    if (!signInForm.email || !signInForm.password) {
      setSignInError('Please fill in all fields.')
      return
    }
    setSignInError('')
    setSignInLoading(true)
    try {
      const res = await axios.post(`${API_URL}/api/login`, signInForm)
      const { user: userData, token } = res.data
      login(userData, token)
      await syncGuestFavourites(token)
      window.dispatchEvent(new Event('authChange'))
      toast.success('Welcome back! Placing your order...', {
        icon: '✨',
        style: { background: '#FBF5EE', color: '#2C1810', border: '1px solid #C87941' }
      })
      onClose()
      onAuthSuccess()
    } catch (err) {
      setSignInError(err.response?.data?.message || 'Sign in failed. Please try again.')
    } finally {
      setSignInLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    if (!signUpForm.name || !signUpForm.email || !signUpForm.password) {
      setSignUpError('Please fill in all fields.')
      return
    }
    if (signUpForm.password !== signUpForm.confirmPassword) {
      setSignUpError('Passwords do not match.')
      return
    }
    if (signUpForm.password.length < 6) {
      setSignUpError('Password must be at least 6 characters.')
      return
    }
    setSignUpError('')
    setSignUpLoading(true)
    try {
      const res = await axios.post(`${API_URL}/api/signup`, {
        name: signUpForm.name,
        email: signUpForm.email,
        password: signUpForm.password
      })
      const { user: userData, token } = res.data
      login(userData, token)
      await syncGuestFavourites(token)
      window.dispatchEvent(new Event('authChange'))
      toast.success('Account created! Placing your order...', {
        icon: '✨',
        style: { background: '#FBF5EE', color: '#2C1810', border: '1px solid #C87941' }
      })
      onClose()
      onAuthSuccess()
    } catch (err) {
      setSignUpError(err.response?.data?.message || 'Sign up failed. Please try again.')
    } finally {
      setSignUpLoading(false)
    }
  }

  const inputBox = (focused) => ({
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FDFAF6',
    border: `1.5px solid ${focused ? '#C87941' : '#DEC5A8'}`,
    borderRadius: '12px',
    padding: '0 14px',
    height: '48px',
    gap: '10px',
    transition: 'border-color 0.2s ease',
    boxShadow: focused ? '0 0 0 3px rgba(200,121,65,0.08)' : 'none'
  })

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(44,26,14,0.60)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'authModalFadeIn 250ms ease forwards'
      }}
    >
      <style>{`
        @keyframes authModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes authModalSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Modal Card */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 24px 80px rgba(44,26,14,0.20), 0 0 0 1px rgba(222,197,168,0.30)',
          animation: 'authModalSlideUp 350ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '14px', right: '14px',
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.6)', border: 'none',
            cursor: 'pointer', color: '#7A5542', zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; e.currentTarget.style.color = '#2C1810' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.6)'; e.currentTarget.style.color = '#7A5542' }}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #F5E6D3, #EDD0A8)',
          borderRadius: '24px 24px 0 0',
          padding: '28px 32px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.55)', border: '2px solid rgba(200,121,65,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px'
          }}>
            <Lock size={24} color="#C87941" />
          </div>
          <h2 style={{
            fontFamily: "var(--font-heading)",
            fontSize: '1.4rem', fontWeight: 800, color: '#2C1810', margin: 0,
            letterSpacing: '-0.02em'
          }}>
            Almost there!
          </h2>
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: '0.875rem', fontStyle: 'italic', color: '#7A5542',
            marginTop: '6px', lineHeight: 1.5
          }}>
            Sign in or create an account to complete your order
          </p>

          {/* Order summary strip */}
          <div style={{
            background: 'rgba(255,255,255,0.55)',
            border: '1px solid rgba(200,121,65,0.20)',
            borderRadius: '12px',
            padding: '10px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: '16px'
          }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: '0.82rem', color: '#5C3D2A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShoppingBag size={14} color="#C87941" />
              {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} in your cart
            </span>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: '0.875rem', fontWeight: 800, color: '#C87941' }}>
              Total: {fmt(cartTotal)}
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ padding: '0 32px' }}>
          <div style={{
            display: 'flex', background: '#FBF5EE', borderRadius: '12px',
            padding: '4px', marginTop: '24px', gap: '4px'
          }}>
            {[{ id: 'signin', label: 'Sign In' }, { id: 'signup', label: 'Create Account' }].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSignInError(''); setSignUpError('') }}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                  cursor: 'pointer', fontFamily: "var(--font-body)",
                  fontSize: '0.875rem', fontWeight: 600,
                  transition: 'all 0.2s ease',
                  background: activeTab === tab.id ? '#FFFFFF' : 'transparent',
                  color: activeTab === tab.id ? '#2C1810' : '#9C7B65',
                  boxShadow: activeTab === tab.id ? '0 2px 8px rgba(44,26,14,0.10)' : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Forms */}
        <div style={{ padding: '20px 32px 8px' }}>

          {/* ─── SIGN IN FORM ─── */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Email */}
              <InputField
                icon={<Mail size={16} color="#B08060" />}
                type="email"
                placeholder="Your email address"
                value={signInForm.email}
                onChange={(v) => setSignInForm(p => ({ ...p, email: v }))}
              />

              {/* Password */}
              <div style={{ position: 'relative' }}>
                <InputField
                  icon={<Lock size={16} color="#B08060" />}
                  type={showSignInPass ? 'text' : 'password'}
                  placeholder="Your password"
                  value={signInForm.password}
                  onChange={(v) => setSignInForm(p => ({ ...p, password: v }))}
                  rightEl={
                    <button type="button" onClick={() => setShowSignInPass(p => !p)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B08060', display: 'flex', padding: 0 }}>
                      {showSignInPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
              </div>

              {/* Forgot password */}
              <div style={{ textAlign: 'right', marginTop: '-4px' }}>
                <button
                  type="button"
                  onClick={() => { onClose(); navigate('/forgot-password') }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "var(--font-body)", fontSize: '0.8rem', color: '#9C7B65' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#C87941'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9C7B65'}
                >
                  Forgot password?
                </button>
              </div>

              {/* Error */}
              {signInError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#C0392B', fontFamily: "var(--font-body)", fontSize: '0.82rem' }}>
                  <AlertCircle size={14} />
                  {signInError}
                </div>
              )}

              {/* Submit */}
              <AuthButton loading={signInLoading} disabled={signInLoading}>
                <ShoppingBag size={16} />
                {signInLoading ? 'Signing in...' : 'Sign In & Place Order'}
              </AuthButton>
            </form>
          )}

          {/* ─── SIGN UP FORM ─── */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Name */}
              <InputField
                icon={<User size={16} color="#B08060" />}
                type="text"
                placeholder="Your full name"
                value={signUpForm.name}
                onChange={(v) => setSignUpForm(p => ({ ...p, name: v }))}
              />

              {/* Email */}
              <InputField
                icon={<Mail size={16} color="#B08060" />}
                type="email"
                placeholder="Your email address"
                value={signUpForm.email}
                onChange={(v) => setSignUpForm(p => ({ ...p, email: v }))}
              />

              {/* Password */}
              <div>
                <InputField
                  icon={<Lock size={16} color="#B08060" />}
                  type={showSignUpPass ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={signUpForm.password}
                  onChange={(v) => setSignUpForm(p => ({ ...p, password: v }))}
                  rightEl={
                    <button type="button" onClick={() => setShowSignUpPass(p => !p)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B08060', display: 'flex', padding: 0 }}>
                      {showSignUpPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
                {signUpForm.password && (
                  <div style={{ marginTop: '6px' }}>
                    <div style={{ width: '100%', height: '3px', backgroundColor: '#EDD9C0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: strength.width, height: '100%', backgroundColor: strength.color, transition: 'all 0.4s ease' }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: strength.color, display: 'block', textAlign: 'right', marginTop: '2px' }}>{strength.label}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <InputField
                icon={<Lock size={16} color="#B08060" />}
                type={showSignUpConfirm ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={signUpForm.confirmPassword}
                onChange={(v) => setSignUpForm(p => ({ ...p, confirmPassword: v }))}
                borderColor={signUpForm.confirmPassword ? (isMatch ? '#27AE60' : '#E74C3C') : undefined}
                rightEl={
                  <button type="button" onClick={() => setShowSignUpConfirm(p => !p)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B08060', display: 'flex', padding: 0 }}>
                    {showSignUpConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              {/* Error */}
              {signUpError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#C0392B', fontFamily: "var(--font-body)", fontSize: '0.82rem' }}>
                  <AlertCircle size={14} />
                  {signUpError}
                </div>
              )}

              {/* Submit */}
              <AuthButton loading={signUpLoading} disabled={signUpLoading}>
                <ShoppingBag size={16} />
                {signUpLoading ? 'Creating account...' : 'Create Account & Place Order'}
              </AuthButton>
            </form>
          )}
        </div>

        {/* Privacy note */}
        <div style={{
          padding: '16px 32px 24px',
          textAlign: 'center',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
        }}>
          <Lock size={11} color="#B08060" />
          <span style={{ fontFamily: "var(--font-body)", fontSize: '0.72rem', fontStyle: 'italic', color: '#B08060' }}>
            Your information is secure and encrypted
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────
function InputField({ icon, type, placeholder, value, onChange, rightEl, borderColor }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      backgroundColor: '#FDFAF6',
      border: `1.5px solid ${borderColor || (focused ? '#C87941' : '#DEC5A8')}`,
      borderRadius: '12px',
      padding: '0 14px', height: '48px', gap: '10px',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      boxShadow: focused ? '0 0 0 3px rgba(200,121,65,0.08)' : 'none'
    }}>
      <span style={{ color: focused ? '#C87941' : '#B08060', display: 'flex', flexShrink: 0, transition: 'color 0.2s' }}>{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          fontFamily: "var(--font-body)", fontSize: '0.875rem', color: '#2C1810'
        }}
      />
      {rightEl}
    </div>
  )
}

function AuthButton({ children, loading, disabled }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      style={{
        width: '100%', height: '48px', borderRadius: '12px', border: 'none',
        background: disabled
          ? '#E5D5C5'
          : 'linear-gradient(135deg, #C87941, #A0622E)',
        color: 'white', cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: "var(--font-body)", fontSize: '0.9rem', fontWeight: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        boxShadow: disabled ? 'none' : '0 4px 16px rgba(200,121,65,0.30)',
        transition: 'all 0.2s ease',
        marginTop: '4px'
      }}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.boxShadow = '0 6px 20px rgba(200,121,65,0.40)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = disabled ? 'none' : '0 4px 16px rgba(200,121,65,0.30)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {children}
    </button>
  )
}
