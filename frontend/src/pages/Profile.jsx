import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Mail, Phone, MapPin, Hash, Save, CheckCircle, Loader2,
  Lock, ShoppingBag, Heart, ShoppingCart, Settings, ChevronRight,
  Camera, Calendar, Trash2, AlertTriangle, Building2, Home, ArrowLeft,
  RotateCcw
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getProfile, updateProfile, deleteAccount } from '../services/api'
import Navbar from '../components/Navbar'
import '../styles/Auth.css'

export default function Profile() {
  const navigate = useNavigate()
  const { user, login, logout } = useAuth()
  const token = localStorage.getItem('rkl_token')

  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', city: '', pincode: '' })
  const [originalData, setOriginalData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [success, setSuccess] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [progressWidth, setProgressWidth] = useState(0)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    const fetch = async () => {
      try {
        const res = await getProfile()
        const d = res.data.data || res.data
        setProfile(d)
        const fd = { name: d.name || '', phone: d.phone || '', address: d.address || '', city: d.city || '', pincode: d.pincode || '' }
        setFormData(fd)
        setOriginalData(fd)
      } catch {
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [user, navigate])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (profile) {
      setTimeout(() => setProgressWidth(calculateCompleteness()), 300)
    }
  }, [profile])

  const calculateCompleteness = () => {
    if (!profile) return 0
    let score = 40
    if (profile.phone) score += 20
    if (profile.address) score += 25
    if (profile.pincode) score += 15
    return score
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const next = { ...prev, [name]: value }
      if (originalData) {
        const changed = Object.keys(next).some(k => next[k] !== (originalData[k] || ''))
        setHasChanges(changed)
      }
      return next
    })
  }

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData)
      setHasChanges(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!hasChanges) return
    setUpdating(true)
    try {
      const res = await updateProfile(formData)
      const updated = res.data.data || res.data
      setProfile(updated)
      const newFd = { name: updated.name || '', phone: updated.phone || '', address: updated.address || '', city: updated.city || '', pincode: updated.pincode || '' }
      setOriginalData(newFd)
      setHasChanges(false)
      setSuccess(true)
      login({ ...user, name: updated.name }, token)
      toast.success('Profile updated successfully ✨', {
        style: { background: '#FBF5EE', color: '#2C1810', border: '1px solid #C87941' }
      })
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      await deleteAccount()
      logout()
      toast.success('Account deleted.', { style: { background: '#FBF5EE', color: '#2C1810' } })
      navigate('/login')
    } catch {
      toast.error('Failed to delete account.')
      setDeleting(false)
    }
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'

  const inputBox = (focused) => ({
    display: 'flex', alignItems: 'center',
    backgroundColor: focused ? '#FFFFFF' : '#FDFAF6',
    border: `1.5px solid ${focused ? '#C87941' : '#DEC5A8'}`,
    borderRadius: '12px', padding: '0 16px', height: '52px',
    transition: 'all 0.22s ease',
    transform: focused ? 'translateY(-1px)' : 'translateY(0)'
  })

  const label = (focused) => ({
    fontSize: '0.75rem', fontWeight: 700,
    color: focused ? '#C87941' : '#5C3D2A',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    display: 'block', marginBottom: '8px'
  })

  const completeness = calculateCompleteness()

  const completionTags = [
    { key: 'name', label: 'Name', done: !!profile?.name },
    { key: 'email', label: 'Email', done: true },
    { key: 'phone', label: 'Phone', done: !!profile?.phone },
    { key: 'address', label: 'Address', done: !!profile?.address },
    { key: 'pincode', label: 'Pincode', done: !!profile?.pincode },
  ]

  const quickActions = [
    { icon: ShoppingBag, label: 'My Orders', onClick: () => toast('Coming soon! 🛍️', { icon: '⏳' }) },
    { icon: Heart, label: 'My Favourites', onClick: () => navigate('/favourites') },
    { icon: ShoppingCart, label: 'My Cart', onClick: () => navigate('/cart') },
    { icon: Settings, label: 'Account Settings', onClick: () => toast('Coming soon! ⚙️', { icon: '⏳' }) },
  ]

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FBF5EE' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <Loader2 style={{ animation: 'spinLoader 0.7s linear infinite', color: '#C87941' }} size={48} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FBF5EE', fontFamily: "'DM Sans', sans-serif", color: '#2C1810' }}>
      <Navbar />

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #F5E6D3 0%, #EDD0A8 60%, #E8C49A 100%)',
        height: isMobile ? '160px' : '200px',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,121,65,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,169,110,0.18) 0%, transparent 70%)', filter: 'blur(30px)' }} />

        {/* Breadcrumb */}
        <div style={{ position: 'absolute', top: 20, left: isMobile ? 16 : 48, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'rgba(92,56,24,0.65)' }}>
          <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => navigate('/')}>
            <Home size={13} /> Home
          </span>
          <span>›</span>
          <span style={{ fontWeight: 600, color: 'rgba(92,56,24,0.90)' }}>My Profile</span>
        </div>

        {/* Mobile back button */}
        {isMobile && (
          <button
            onClick={() => navigate(-1)}
            style={{ position: 'absolute', top: 44, left: 16, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: '#5C3018', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}

        {/* Avatar (overlapping) */}
        <div style={{
          position: 'absolute',
          bottom: '-55px',
          left: isMobile ? '50%' : '48px',
          transform: isMobile ? 'translateX(-50%)' : 'none',
          zIndex: 10
        }}>
          <div style={{ position: 'relative', width: '110px', height: '110px' }}>
            {/* Rotating dashed ring */}
            <div className="logo-ring-dashed" style={{ position: 'absolute', width: '130px', height: '130px', borderRadius: '50%', border: '1.5px dashed rgba(200,121,65,0.35)', top: '-10px', left: '-10px' }} />
            {/* Avatar circle */}
            <div style={{
              width: '110px', height: '110px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #C87941, #8B4513)',
              border: '4px solid #FFFFFF',
              boxShadow: '0 8px 32px rgba(200,121,65,0.30)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Playfair Display', serif", fontSize: '2.8rem', fontWeight: 700, color: 'white',
              cursor: 'pointer', position: 'relative', overflow: 'hidden'
            }}
              className="group"
              onClick={() => toast('Profile photo upload coming soon! 📸', { icon: '🎨' })}
            >
              {profile?.name?.charAt(0).toUpperCase() || 'U'}
              {/* Hover overlay */}
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(44,26,14,0.45)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%', opacity: 0, transition: 'opacity 0.2s'
              }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
              >
                <Camera size={20} color="white" />
                <span style={{ fontSize: '0.7rem', color: 'white', marginTop: '4px', fontFamily: "'DM Sans', sans-serif" }}>Edit</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '80px 16px 40px' : '72px 48px 60px' }}>
        <div style={{
          display: 'flex', gap: '28px',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'flex-start'
        }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ width: isMobile ? '100%' : '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Identity Card */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '32px 28px', border: '1px solid #F0E0CF', boxShadow: '0 4px 20px rgba(44,26,14,0.06)', textAlign: 'center' }}>
              {/* Name */}
              <h2 style={{
                fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700,
                background: 'linear-gradient(135deg, #2C1810, #8B4513)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}>
                {profile?.name || 'Your Name'}
              </h2>

              {/* Email */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#7A5542', fontSize: '0.85rem', marginTop: '8px' }}>
                <Mail size={13} /> {profile?.email}
              </div>

              {/* Phone */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: profile?.phone ? '#7A5542' : '#B08060', fontSize: '0.85rem', marginTop: '6px', fontStyle: profile?.phone ? 'normal' : 'italic' }}>
                <Phone size={13} />
                {profile?.phone || 'Add phone number'}
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: '#EDD9C0', margin: '18px 0' }} />

              {/* Member since */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#9C7B65', fontSize: '0.78rem', fontStyle: 'italic' }}>
                <Calendar size={13} /> Member since {formatDate(profile?.created_at)}
              </div>

              {/* Completeness */}
              <div style={{ marginTop: '20px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#7A5542' }}>Profile Completeness</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#C87941' }}>{completeness}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#EDD9C0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #C87941, #E8A96E)',
                    borderRadius: '4px',
                    width: `${progressWidth}%`,
                    transition: 'width 1s cubic-bezier(0.4,0,0.2,1)'
                  }} />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                  {completionTags.map(t => (
                    <span key={t.key} style={{
                      fontSize: '0.72rem', padding: '5px 12px', borderRadius: '20px',
                      background: t.done ? '#C87941' : 'transparent',
                      color: t.done ? 'white' : '#9C7B65',
                      border: t.done ? '1px solid #C87941' : '1px solid #C4A882',
                      fontWeight: t.done ? 600 : 400
                    }}>
                      {t.done ? `✓ ${t.label}` : `+ ${t.label}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '20px 24px', border: '1px solid #F0E0CF', boxShadow: '0 4px 20px rgba(44,26,14,0.06)' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: '#9C7B65', textTransform: 'uppercase', marginBottom: '4px' }}>Quick Links</p>
              <div>
                {quickActions.map((action, i) => (
                  <div
                    key={i}
                    onClick={action.onClick}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 0',
                      borderBottom: i < quickActions.length - 1 ? '1px solid #F5EDE3' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      borderRadius: '8px',
                      paddingLeft: '4px'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(200,121,65,0.04)'; e.currentTarget.style.paddingLeft = '8px' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.paddingLeft = '4px' }}
                  >
                    <action.icon size={18} style={{ color: '#C87941', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.875rem', color: '#3D2B1A', flex: 1 }}>{action.label}</span>
                    <ChevronRight size={16} style={{ color: '#B08060' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Edit Form Card */}
            <div style={{ background: 'white', borderRadius: '20px', padding: isMobile ? '24px 20px' : '36px 40px', border: '1px solid #F0E0CF', boxShadow: '0 4px 20px rgba(44,26,14,0.06)' }}>
              <div style={{ width: '36px', height: '3px', background: 'linear-gradient(90deg, #C87941, #E8A96E)', borderRadius: '2px', marginBottom: '14px' }} />
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: '#2C1810' }}>Edit Profile</h2>
              <p style={{ fontSize: '0.875rem', color: '#9C7B65', marginTop: '4px', marginBottom: '28px' }}>Keep your details up to date</p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Row 1: Name + Phone */}
                <div style={{ display: 'flex', gap: '16px', flexDirection: isMobile ? 'column' : 'row' }}>
                  <div style={{ flex: 1 }}>
                    <label style={label(focusedField === 'name')}>Full Name <span style={{ color: '#C87941' }}>*</span></label>
                    <div style={inputBox(focusedField === 'name')}>
                      <User size={17} style={{ color: focusedField === 'name' ? '#C87941' : '#B08060', marginRight: '10px', flexShrink: 0 }} />
                      <input
                        type="text" name="name" value={formData.name} onChange={handleChange} required
                        onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                        placeholder="Your full name"
                        style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif" }}
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={label(focusedField === 'phone')}>Phone Number</label>
                      <span style={{ fontSize: '0.68rem', background: '#F5EDE3', color: '#9C7B65', padding: '2px 8px', borderRadius: '8px', fontWeight: 600 }}>Optional</span>
                    </div>
                    <div style={inputBox(focusedField === 'phone')}>
                      <Phone size={17} style={{ color: focusedField === 'phone' ? '#C87941' : '#B08060', marginRight: '10px', flexShrink: 0 }} />
                      <input
                        type="tel" name="phone" value={formData.phone} onChange={handleChange} maxLength={10}
                        onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)}
                        placeholder="10-digit mobile number"
                        style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Email (read-only) */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ ...label(false), color: '#9C7B65' }}>Email Address</label>
                    <div style={{ fontSize: '0.65rem', background: '#F5EDE3', color: '#9C7B65', padding: '3px 10px', borderRadius: '20px', fontWeight: 700 }}>VERIFIED</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F5EDE3', border: '1.5px solid #E5D5C5', borderRadius: '12px', padding: '0 16px', height: '52px', opacity: 0.8, cursor: 'not-allowed' }}>
                    <Mail size={17} style={{ color: '#B08060', marginRight: '10px', flexShrink: 0 }} />
                    <input type="email" value={profile?.email || ''} readOnly style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem', cursor: 'not-allowed', color: '#7A5542', fontFamily: "'DM Sans', sans-serif" }} />
                    <Lock size={15} style={{ color: '#B08060' }} />
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#B08060', fontStyle: 'italic', marginTop: '5px' }}>✦ Email address cannot be changed</p>
                </div>

                {/* Delivery Address */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={label(focusedField === 'address')}>Delivery Address</label>
                    <span style={{ fontSize: '0.68rem', background: '#F5EDE3', color: '#9C7B65', padding: '2px 8px', borderRadius: '8px', fontWeight: 600 }}>Optional</span>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'flex-start',
                    backgroundColor: focusedField === 'address' ? '#FFFFFF' : '#FDFAF6',
                    border: `1.5px solid ${focusedField === 'address' ? '#C87941' : '#DEC5A8'}`,
                    borderRadius: '12px', padding: '14px 16px', minHeight: '100px',
                    transition: 'all 0.22s ease'
                  }}>
                    <MapPin size={17} style={{ color: focusedField === 'address' ? '#C87941' : '#B08060', marginRight: '10px', marginTop: '2px', flexShrink: 0 }} />
                    <textarea
                      name="address" value={formData.address} onChange={handleChange} maxLength={300}
                      onFocus={() => setFocusedField('address')} onBlur={() => setFocusedField(null)}
                      placeholder="Your full delivery address"
                      style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem', resize: 'none', minHeight: '80px', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}
                    />
                  </div>
                  <div style={{ textAlign: 'right', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: formData.address.length >= 290 ? '#E74C3C' : formData.address.length >= 240 ? '#C87941' : '#B08060', fontWeight: 600 }}>
                      {formData.address.length} / 300
                    </span>
                  </div>
                </div>

                {/* Row 2: City + Pincode */}
                <div style={{ display: 'flex', gap: '16px', flexDirection: isMobile ? 'column' : 'row' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={label(focusedField === 'city')}>City</label>
                      <span style={{ fontSize: '0.68rem', background: '#F5EDE3', color: '#9C7B65', padding: '2px 8px', borderRadius: '8px', fontWeight: 600 }}>Optional</span>
                    </div>
                    <div style={inputBox(focusedField === 'city')}>
                      <Building2 size={17} style={{ color: focusedField === 'city' ? '#C87941' : '#B08060', marginRight: '10px', flexShrink: 0 }} />
                      <input
                        type="text" name="city" value={formData.city} onChange={handleChange}
                        onFocus={() => setFocusedField('city')} onBlur={() => setFocusedField(null)}
                        placeholder="Your city"
                        style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif" }}
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={label(focusedField === 'pincode')}>Pincode</label>
                      <span style={{ fontSize: '0.68rem', background: '#F5EDE3', color: '#9C7B65', padding: '2px 8px', borderRadius: '8px', fontWeight: 600 }}>Optional</span>
                    </div>
                    <div style={inputBox(focusedField === 'pincode')}>
                      <Hash size={17} style={{ color: focusedField === 'pincode' ? '#C87941' : '#B08060', marginRight: '10px', flexShrink: 0 }} />
                      <input
                        type="tel" name="pincode" value={formData.pincode} onChange={handleChange} maxLength={6}
                        onFocus={() => setFocusedField('pincode')} onBlur={() => setFocusedField(null)}
                        placeholder="6-digit pincode"
                        style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Form Action Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  {hasChanges ? (
                    <button type="button" onClick={handleReset} style={{ background: 'none', border: 'none', fontSize: '0.875rem', color: '#9C7B65', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'DM Sans', sans-serif", transition: 'color 0.2s' }}
                      onMouseEnter={(e) => e.target.style.color = '#C87941'}
                      onMouseLeave={(e) => e.target.style.color = '#9C7B65'}
                    >
                      <RotateCcw size={14} /> Reset Changes
                    </button>
                  ) : <div />}

                  <button
                    type="submit" disabled={!hasChanges || updating}
                    className="submit-btn-ripple"
                    style={{
                      width: '180px', height: '48px', borderRadius: '12px',
                      background: success ? 'linear-gradient(135deg, #27AE60, #1E8449)' :
                        (!hasChanges ? '#E5D5C5' : 'linear-gradient(135deg, #C87941 0%, #A0622E 100%)'),
                      color: 'white', fontSize: '0.95rem', fontWeight: 600,
                      border: 'none', cursor: !hasChanges || updating ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      transition: 'all 0.3s ease', opacity: !hasChanges ? 0.6 : 1,
                      fontFamily: "'DM Sans', sans-serif",
                      boxShadow: hasChanges && !updating ? '0 6px 20px rgba(200,121,65,0.30)' : 'none'
                    }}
                  >
                    {success ? (
                      <><CheckCircle size={18} /><span>Saved!</span></>
                    ) : updating ? (
                      <><Loader2 size={18} style={{ animation: 'spinLoader 0.7s linear infinite' }} /><span>Saving...</span></>
                    ) : (
                      <><Save size={18} /><span>Save Changes</span></>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Danger Zone */}
            <div style={{ background: '#FFF5F5', border: '1px solid rgba(192,57,43,0.15)', borderRadius: '12px', padding: '20px 24px' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: '#C0392B', textTransform: 'uppercase', marginBottom: '16px' }}>Account</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <Trash2 size={18} style={{ color: '#C0392B', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#5C3D2A', fontWeight: 600 }}>Delete Account</p>
                    <p style={{ fontSize: '0.78rem', color: '#9C7B65', marginTop: '2px' }}>This action cannot be undone</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  style={{
                    border: '1.5px solid #C0392B', color: '#C0392B', borderRadius: '8px',
                    padding: '8px 16px', fontSize: '0.875rem', fontWeight: 600, background: 'transparent',
                    cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#C0392B'; e.currentTarget.style.color = 'white' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#C0392B' }}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DELETE MODAL ── */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(44,26,14,0.50)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '36px 32px',
            maxWidth: '400px', width: '100%', textAlign: 'center',
            animation: 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards',
            boxShadow: '0 24px 64px rgba(44,26,14,0.25)'
          }}>
            <AlertTriangle size={40} style={{ color: '#C0392B', margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: '#2C1810', marginBottom: '12px' }}>Delete Account?</h3>
            <p style={{ fontSize: '0.875rem', color: '#5C3D2A', lineHeight: 1.6, marginBottom: '28px' }}>
              Are you sure you want to delete your account? All your data including favourites and orders will be lost permanently.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{ flex: 1, height: '44px', border: '2px solid #C87941', color: '#C87941', background: 'transparent', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount} disabled={deleting}
                style={{ flex: 1, height: '44px', background: 'linear-gradient(135deg, #C0392B, #922B21)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: "'DM Sans', sans-serif" }}
              >
                {deleting ? <Loader2 size={16} style={{ animation: 'spinLoader 0.7s linear infinite' }} /> : null}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
