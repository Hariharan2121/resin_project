import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Mail, Phone, MapPin, Hash, Save, CheckCircle, Loader2,
  Lock, ShoppingBag, Heart, ShoppingCart, Settings, ChevronRight,
  Camera, Calendar, Trash2, AlertTriangle, Building2, Home, ArrowLeft,
  RotateCcw, Palette, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getProfile, updateProfile, deleteAccount, getMyOrders } from '../services/api'
import Navbar from '../components/Navbar'
import '../styles/Auth.css'

export default function Profile() {
  const navigate = useNavigate()
  const { user, login, logout } = useAuth()
  const token = localStorage.getItem('rkl_token')

  const [profile, setProfile] = useState(null)
  
  // Controlled fields
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [pincode, setPincode] = useState('')
  
  // Error states
  const [nameError, setNameError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [pincodeError, setPincodeError] = useState('')
  
  const [originalData, setOriginalData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  const [focusedField, setFocusedField] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)
  
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [progressWidth, setProgressWidth] = useState(0)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  // Order History State
  const [myOrders, setMyOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  
  // Refs for scrolling
  const nameRef = useRef(null)
  const phoneRef = useRef(null)
  const pincodeRef = useRef(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    const fetchProfile = async () => {
      try {
        const data = await getProfile()
        setProfile(data)
        setName(data.name || '')
        setPhone(data.phone || '')
        setAddress(data.address || '')
        setPincode(data.pincode || '')
        setOriginalData({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || '',
          pincode: data.pincode || ''
        })

        // Fetch Orders
        try {
          const ordRes = await getMyOrders();
          setMyOrders(ordRes.data.data);
        } catch(e) { console.error('Orders fetch failed', e) }

      } catch (err) {
        console.error('Profile fetch failed:', err);
      } finally {
        setLoading(false)
        setLoadingOrders(false)
      }
    }
    fetchProfile()
  }, [user, navigate])

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':   return 'text-[#C87941] bg-[#FEF0E3]';
      case 'confirmed': return 'text-[#2E7D32] bg-[#E8F5E9]';
      case 'completed': return 'text-[#1976D2] bg-[#E3F2FD]';
      case 'cancelled': return 'text-[#C62828] bg-[#FFEBEE]';
      default:          return 'text-gray-600 bg-gray-100';
    }
  }

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleCompleteness = () => {
      let pct = 40; // name + email always filled
      if (phone && phone.trim()) pct += 20;
      if (address && address.trim()) pct += 25;
      if (pincode && pincode.trim()) pct += 15;
      return pct;
    };
    setTimeout(() => setProgressWidth(handleCompleteness()), 300)
  }, [name, phone, address, pincode])

  useEffect(() => {
    if (!originalData) return;
    const changed =
      name    !== originalData.name    ||
      phone   !== originalData.phone   ||
      address !== originalData.address ||
      pincode !== originalData.pincode;
    setHasChanges(changed);
  }, [name, phone, address, pincode, originalData]);

  const calculateCompleteness = () => {
    let pct = 40; // name + email always filled
    if (phone && phone.trim()) pct += 20;
    if (address && address.trim()) pct += 25;
    if (pincode && pincode.trim()) pct += 15;
    return pct;
  };

  const handleReset = () => {
    if (originalData) {
      setName(originalData.name)
      setPhone(originalData.phone)
      setAddress(originalData.address)
      setPincode(originalData.pincode)
      setNameError('')
      setPhoneError('')
      setPincodeError('')
      setHasChanges(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    // STEP 1 - Reset all errors
    setNameError('')
    setPhoneError('')
    setPincodeError('')

    // STEP 2 - Validate all fields
    let isValid = true;

    if (!name.trim()) {
      setNameError('Full name is required');
      isValid = false;
      if (!isValid) nameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      isValid = false;
      if (!isValid) nameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (!phone.trim()) {
      setPhoneError('Phone number is required');
      isValid = false;
      if (!isValid && name.trim().length >= 2) phoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (!/^[0-9]{10}$/.test(phone.trim())) {
      setPhoneError('Enter a valid 10-digit phone number');
      isValid = false;
      if (!isValid && name.trim().length >= 2) phoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (pincode && !/^[0-9]{6}$/.test(pincode.trim())) {
      setPincodeError('Enter a valid 6-digit pincode');
      isValid = false;
      if (!isValid && name.trim().length >= 2 && phone.trim().length === 10) pincodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (!isValid) {
      toast.error('Please check the form for errors', {
        style: { background: '#FFF4F4', color: '#C0392B', border: '1px solid #C0392B' }
      });
      return;
    }

    // STEP 3 - Call API
    setIsSaving(true)
    try {
      const updatedData = await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        pincode: pincode.trim()
      });

      // STEP 4 - Return fresh data logic via API (already unrolled in try block or just re-fetch)
      const freshProfile = await getProfile();

      // STEP 5 - Update all state
      setProfile(freshProfile);
      setName(freshProfile.name || '');
      setPhone(freshProfile.phone || '');
      setAddress(freshProfile.address || '');
      setPincode(freshProfile.pincode || '');
      setOriginalData({
        name: freshProfile.name || '',
        phone: freshProfile.phone || '',
        address: freshProfile.address || '',
        pincode: freshProfile.pincode || ''
      });
      setHasChanges(false);

      // STEP 6 - Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...storedUser,
        name: freshProfile.name
      }));
      login({ ...user, name: freshProfile.name }, token); // update context

      // STEP 7 - Success feedback
      toast.success('Profile updated successfully ✓', {
        style: { background: '#FBF5EE', color: '#2C1810', border: '1px solid #C87941' }
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1500);

    } catch (err) {
      const msg = err.message || 'Failed to update profile'
      toast.error(msg)
      if (msg.toLowerCase().includes('phone')) setPhoneError(msg)
      if (msg.toLowerCase().includes('name')) setNameError(msg)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      await deleteAccount()
      logout()
      toast.success('Account deleted.', { style: { background: '#FBF5EE', color: '#2C1810' } })
      navigate('/login')
    } catch (err) {
      toast.error('Failed to delete account.')
      setDeleting(false)
    }
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'

  // Input styles function
  const inputBox = (focused, error) => ({
    display: 'flex', alignItems: 'center',
    backgroundColor: focused ? '#FFFFFF' : '#FDFAF6',
    border: `1.5px solid ${error ? '#C0392B' : (focused ? '#C87941' : '#DEC5A8')}`,
    boxShadow: error ? '0 0 0 4px rgba(192,57,43,0.08)' : 'none',
    borderRadius: '12px', padding: '0 16px', height: '52px',
    transition: 'all 0.22s ease',
    transform: focused ? 'translateY(-1px)' : 'translateY(0)'
  })

  const label = () => ({
    fontSize: '0.78rem', fontWeight: 700,
    color: '#3D2B1A',
    letterSpacing: '0.07em', opacity: 1,
    display: 'block', marginBottom: '8px'
  })

  // Ensure these placeholder styles get applied across text inputs
  const inputStyle = { 
    background: 'transparent', border: 'none', outline: 'none', 
    width: '100%', 
    fontSize: '0.95rem', 
    fontWeight: 500,
    color: '#1A0F00',
    fontFamily: "'DM Sans', sans-serif" 
  }

  const completeness = calculateCompleteness()

  const completionTags = [
    { key: 'name', label: 'Name', done: !!name },
    { key: 'email', label: 'Email', done: true },
    { key: 'phone', label: 'Phone', done: !!phone },
    { key: 'address', label: 'Address', done: !!address },
    { key: 'pincode', label: 'Pincode', done: !!pincode },
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
    <div className="profile-page-container" style={{ minHeight: '100vh', backgroundColor: '#FBF5EE', fontFamily: "'DM Sans', sans-serif", paddingTop: '72px' }}>
      {/* ADDING CSS OVERRIDES FOR PLACEHOLDERS IN HEAD */}
      <style dangerouslySetInnerHTML={{__html:`
        .profile-page-container input::placeholder,
        .profile-page-container textarea::placeholder {
          color: #A07850 !important;
          font-style: italic !important;
        }
      `}} />

      <Navbar />

      {/* ── HEADER SECTION ─────────────────────────────────────────── */}
      <div style={{
        height: isMobile ? '160px' : '200px',
        position: 'relative',
        zIndex: 20
      }}>
        {/* Background Layer with Overflow Hidden for Orbs */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #F5E6D3 0%, #EDD0A8 60%, #E8C49A 100%)',
          overflow: 'hidden',
          zIndex: 1
        }}>
          {/* Animated Orbs */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,121,65,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: -50, left: '10%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)', filter: 'blur(30px)' }} />
          
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#C87941 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        </div>

        {/* Content Container (Breadcrumbs) */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto', padding: isMobile ? '24px 16px' : '32px 48px', height: '100%' }}>
          {isMobile ? (
            <button
              onClick={() => navigate(-1)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: '#5C3018', background: 'none', border: 'none', cursor: 'pointer', marginTop: '12px' }}
            >
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7A5542', fontSize: '0.85rem', fontWeight: 500 }}>
              <span style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => navigate('/')}>Home</span>
              <span style={{ opacity: 0.4 }}>/</span>
              <span style={{ color: '#2C1810' }}>Profile</span>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div style={{
          position: 'absolute',
          bottom: '-55px',
          left: isMobile ? '50%' : '48px',
          transform: isMobile ? 'translateX(-50%)' : 'none',
          zIndex: 30
        }}>
          <div style={{ position: 'relative', width: '110px', height: '110px' }}>
            <div className="logo-ring-dashed" style={{ position: 'absolute', width: '130px', height: '130px', borderRadius: '50%', border: '1.5px dashed rgba(200,121,65,0.35)', top: '-10px', left: '-10px' }} />
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
              {name.charAt(0).toUpperCase() || 'U'}
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
            <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '32px 28px', border: '1px solid #F0E0CF', boxShadow: '0 4px 20px rgba(44,26,14,0.06)', textAlign: 'center' }}>
              {/* Name */}
              <h2 style={{
                fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700,
                background: 'linear-gradient(135deg, #8B4513, #C87941, #D4956A)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}>
                {name || 'Your Name'}
              </h2>

              {/* Email */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#3D2B1A', fontSize: '0.85rem', marginTop: '8px' }}>
                <Mail size={13} /> {profile?.email}
              </div>

              {/* Phone */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#3D2B1A', fontSize: '0.85rem', marginTop: '6px', fontStyle: phone ? 'normal' : 'italic' }}>
                <Phone size={13} />
                {phone || 'Add phone number'}
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: '#EDD9C0', margin: '18px 0' }} />

              {/* Member since */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#6B4226', fontSize: '0.78rem', fontStyle: 'italic' }}>
                <Calendar size={13} /> Member since {formatDate(profile?.createdAt)}
              </div>

              {/* Completeness */}
              <div style={{ marginTop: '20px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#3D2B1A' }}>Profile Completeness</span>
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
                      color: t.done ? '#FFFFFF' : '#C87941',
                      border: t.done ? '1.5px solid #C87941' : '1.5px solid #C87941',
                      fontWeight: t.done ? 600 : 600
                    }}>
                      {t.done ? `✓ ${t.label}` : `+ ${t.label}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '20px 24px', border: '1px solid #F0E0CF', boxShadow: '0 4px 20px rgba(44,26,14,0.06)' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: '#7A5542', textTransform: 'uppercase', marginBottom: '4px' }}>QUICK LINKS</p>
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
                    <span style={{ fontSize: '0.875rem', color: '#2C1810', flex: 1 }}>{action.label}</span>
                    <ChevronRight size={16} style={{ color: '#B08060' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Edit Form Card */}
            <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: isMobile ? '24px 20px' : '36px 40px', border: '1px solid #F0E0CF', boxShadow: '0 4px 20px rgba(44,26,14,0.06)' }}>
              <div style={{ width: '36px', height: '3px', background: 'linear-gradient(90deg, #C87941, #E8A96E)', borderRadius: '2px', marginBottom: '14px' }} />
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: '#1A0F00' }}>My Profile</h2>
              <p style={{ fontSize: '0.875rem', color: '#5C3D2A', marginTop: '4px', marginBottom: '28px' }}>Manage your personal information</p>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Row 1: Name + Phone */}
                <div style={{ display: 'flex', gap: '16px', flexDirection: isMobile ? 'column' : 'row' }}>
                  {/* Name field */}
                  <div style={{ flex: 1 }} ref={nameRef}>
                    <label style={label()}>FULL NAME <span style={{ color: '#C0392B', fontWeight: 700 }}>*</span></label>
                    <div style={inputBox(focusedField === 'name', nameError)}>
                      <User size={17} style={{ color: focusedField === 'name' ? '#C87941' : '#B08060', marginRight: '10px', flexShrink: 0 }} />
                      <input
                        type="text" value={name} 
                        onChange={(e) => { 
                          setName(e.target.value); 
                          if (nameError) setNameError(''); 
                        }}
                        onFocus={() => setFocusedField('name')} 
                        onBlur={() => {
                          setFocusedField(null)
                          if (!name.trim()) setNameError('Full name is required')
                          else if (name.trim().length < 2) setNameError('Name must be at least 2 characters')
                          else setNameError('')
                        }}
                        placeholder="Your full name"
                        maxLength={100}
                        style={inputStyle}
                      />
                    </div>
                    {nameError && (
                      <div style={{ color: '#C0392B', fontSize: '0.775rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                        <AlertCircle size={13} /> {nameError}
                      </div>
                    )}
                  </div>
                  
                  {/* Phone field */}
                  <div style={{ flex: 1 }} ref={phoneRef}>
                    <label style={label()}>PHONE NUMBER <span style={{ color: '#C0392B', fontWeight: 700 }}>*</span></label>
                    <div style={inputBox(focusedField === 'phone', phoneError)}>
                      <Phone size={17} style={{ color: focusedField === 'phone' ? '#C87941' : '#B08060', marginRight: '10px', flexShrink: 0 }} />
                      <input
                        type="tel" value={phone} 
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setPhone(val);
                          if (phoneError) setPhoneError('');
                        }}
                        onFocus={() => setFocusedField('phone')} 
                        onBlur={() => {
                          setFocusedField(null)
                          if (!phone.trim()) setPhoneError('Phone number is required')
                          else if (!/^[0-9]{10}$/.test(phone.trim())) setPhoneError('Enter a valid 10-digit phone number')
                          else setPhoneError('')
                        }}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        style={inputStyle}
                      />
                    </div>
                    {phoneError && (
                      <div style={{ color: '#C0392B', fontSize: '0.775rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                        <AlertCircle size={13} /> {phoneError}
                      </div>
                    )}
                  </div>
                </div>

                {/* Email (read-only) */}
                <div>
                  <label style={label()}>EMAIL ADDRESS</label>
                  <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F5EDE3', border: '1.5px solid #E5D5C5', borderRadius: '12px', padding: '0 16px', height: '52px', cursor: 'not-allowed' }}>
                    <Mail size={17} style={{ color: '#B08060', marginRight: '10px', flexShrink: 0 }} />
                    <input type="email" value={profile?.email || ''} readOnly disabled style={{ ...inputStyle, cursor: 'not-allowed', color: '#5C3D2A', opacity: 1 }} />
                    <Lock size={15} style={{ color: '#B08060' }} />
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#8B6347', fontStyle: 'italic', marginTop: '5px', opacity: 1 }}>✦ Email cannot be changed</p>
                </div>

                {/* Delivery Address */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{...label(), marginBottom: 0}}>DELIVERY ADDRESS</label>
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
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)} 
                      maxLength={300}
                      rows={3}
                      onFocus={() => setFocusedField('address')} 
                      onBlur={() => setFocusedField(null)}
                      placeholder="Your full delivery address"
                      style={{ ...inputStyle, resize: 'none', minHeight: '80px', lineHeight: 1.6 }}
                    />
                  </div>
                  <div style={{ textAlign: 'right', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: address.length >= 290 ? '#E74C3C' : address.length >= 240 ? '#C87941' : '#B08060', fontWeight: 600 }}>
                      {address.length} / 300
                    </span>
                  </div>
                </div>

                {/* Row 2: Pincode */}
                <div style={{ display: 'flex', gap: '16px', flexDirection: isMobile ? 'column' : 'row' }}>
                  <div style={{ width: isMobile ? '100%' : '50%' }} ref={pincodeRef}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={{...label(), marginBottom: 0}}>PINCODE</label>
                      <span style={{ fontSize: '0.68rem', background: '#F5EDE3', color: '#9C7B65', padding: '2px 8px', borderRadius: '8px', fontWeight: 600 }}>Optional</span>
                    </div>
                    <div style={inputBox(focusedField === 'pincode', pincodeError)}>
                      <Hash size={17} style={{ color: focusedField === 'pincode' ? '#C87941' : '#B08060', marginRight: '10px', flexShrink: 0 }} />
                      <input
                        type="tel" value={pincode} 
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setPincode(val);
                          if (pincodeError) setPincodeError('');
                        }}
                        maxLength={6}
                        onFocus={() => setFocusedField('pincode')} 
                        onBlur={() => {
                          setFocusedField(null)
                          if (pincode && !/^[0-9]{6}$/.test(pincode.trim())) setPincodeError('Enter a valid 6-digit pincode')
                          else setPincodeError('')
                        }}
                        placeholder="6-digit pincode"
                        style={inputStyle}
                      />
                    </div>
                    {pincodeError && (
                      <div style={{ color: '#C0392B', fontSize: '0.775rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                        <AlertCircle size={13} /> {pincodeError}
                      </div>
                    )}
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
                    type="submit" disabled={isSaving}
                    style={{
                      width: '180px', height: '48px', borderRadius: '12px',
                      background: saveSuccess ? 'linear-gradient(135deg, #27AE60, #1E8449)' : 'linear-gradient(135deg, #C87941, #A0622E)',
                      color: 'white', fontSize: '0.95rem', fontWeight: 600,
                      border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      transition: 'all 0.3s ease', 
                      opacity: isSaving ? 0.85 : 1,
                      transform: saveSuccess ? 'scale(1.02)' : 'none',
                      fontFamily: "'DM Sans', sans-serif",
                      boxShadow: !isSaving ? '0 4px 20px rgba(200,121,65,0.35)' : 'none'
                    }}
                  >
                    {saveSuccess ? (
                      <><CheckCircle size={18} /><span>✓ Saved!</span></>
                    ) : isSaving ? (
                      <><Loader2 size={18} style={{ animation: 'spinLoader 0.7s linear infinite' }} /><span>Saving...</span></>
                    ) : (
                      <><Save size={18} /><span>Save Changes</span></>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* ── ORDER HISTORY ── */}
            <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: isMobile ? '24px 20px' : '36px 40px', border: '1px solid #F0E0CF', boxShadow: '0 4px 20px rgba(44,26,14,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, color: '#1A0F00' }}>Order History</h3>
                  <p style={{ fontSize: '0.85rem', color: '#5C3D2A', marginTop: '2px' }}>Track your resin art acquisitions</p>
                </div>
                <div style={{ background: '#FEF0E3', padding: '8px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag size={18} style={{ color: '#C87941' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#A0622E' }}>{myOrders.length}</span>
                </div>
              </div>

              {loadingOrders ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Loader2 style={{ animation: 'spinLoader 0.7s linear infinite', color: '#DEC5A8', margin: '0 auto' }} size={32} />
                </div>
              ) : myOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', backgroundColor: '#FBF5EE', borderRadius: '16px', border: '1px dashed #DEC5A8' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏺</div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#5C3D2A' }}>No orders yet</h4>
                  <p style={{ fontSize: '0.82rem', color: '#8B6347', maxWidth: '240px', margin: '8px auto 20px' }}>Your acquired treasures will appear here after your first purchase.</p>
                  <button onClick={() => navigate('/')} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #C87941, #8B4513)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(200,121,65,0.2)' }}>Shop Collection</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {myOrders.map(order => (
                    <div key={order.id} style={{ border: '1px solid #EDD9C0', borderRadius: '16px', overflow: 'hidden', backgroundColor: 'white' }}>
                      <div style={{ padding: '16px 20px', borderBottom: '1px solid #F5EDE3', background: '#FBF5EE/40', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#9C7B65', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Order #{order.id.slice(-6).toUpperCase()}
                          </p>
                          <p style={{ fontSize: '0.78rem', color: '#5C3D2A', fontWeight: 500 }}>
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                           <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase', ...getStatusColor(order.status) === 'text-[#C87941] bg-[#FEF0E3]' ? { color: '#C87941', background: '#FEF0E3' } : getStatusColor(order.status) === 'text-[#2E7D32] bg-[#E8F5E9]' ? { color: '#2E7D32', background: '#E8F5E9' } : getStatusColor(order.status).includes('1976D2') ? { color: '#1976D2', background: '#E3F2FD' } : { color: '#C62828', background: '#FFEBEE' } }}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ padding: '16px 20px' }}>
                        {order.orderType === 'standard' ? (
                          <div style={{ fontSize: '0.85rem', color: '#3D2B1A' }}>
                            {order.items.slice(0, 2).map((item, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span>{item.name} <span style={{ color: '#9C7B65' }}>x{item.quantity}</span></span>
                                <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                            {order.items.length > 2 && <p style={{ fontSize: '0.78rem', color: '#C87941', marginTop: '4px' }}>+ {order.items.length - 2} more items</p>}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C87941', fontWeight: 700 }}>
                              <Palette size={14} /> Custom {order.customDetails.productType}
                            </div>
                            <p style={{ fontSize: '0.78rem', color: '#5C3D2A', marginTop: '4px', opacity: 0.8 }}>Design Studio Selection</p>
                          </div>
                        )}
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #EDD9C0' }}>
                          <span style={{ fontSize: '0.78rem', color: '#9C7B65' }}>Total Amount</span>
                          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#C87941' }}>₹{order.totalPrice.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div style={{ background: '#FFF5F5', border: '1px solid rgba(192,57,43,0.15)', borderRadius: '12px', padding: '20px 24px' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: '#C0392B', textTransform: 'uppercase', marginBottom: '16px' }}>Account</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <Trash2 size={18} style={{ color: '#C0392B', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#3D2B1A', fontWeight: 600 }}>Delete Account</p>
                    <p style={{ fontSize: '0.78rem', color: '#7A5542', marginTop: '2px' }}>This action cannot be undone</p>
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
