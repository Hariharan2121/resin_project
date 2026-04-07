import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  User, Mail, Phone, MapPin, Hash, Save, 
  CheckCircle, Loader2, Lock, ShoppingBag 
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getProfile, updateProfile } from '../services/api'
import '../styles/Auth.css'

export default function Profile() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const buttonRef = useRef(null)
  
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    pincode: ''
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [success, setSuccess] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    const fetchProfile = async () => {
      try {
        const res = await getProfile()
        const profileData = res.data.data || res.data // Handle both raw and {data: {}} formats
        setProfile(profileData)
        setFormData({
          name: profileData.name || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          pincode: profileData.pincode || ''
        })
      } catch (err) {
        console.error('Profile fetch error:', err)
        toast.error('Failed to load profile details')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, navigate])

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const next = { ...prev, [name]: value }
      
      // Safety check: if profile hasn't loaded yet, don't try to compare
      if (!profile) return next

      // Check for changes against original profile
      const changed = 
        next.name !== (profile.name || '') ||
        next.phone !== (profile.phone || '') ||
        next.address !== (profile.address || '') ||
        next.pincode !== (profile.pincode || '')
      setHasChanges(changed)
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!hasChanges) return
    
    setUpdating(true)
    try {
      const res = await updateProfile(formData)
      const updatedData = res.data.data || res.data
      setProfile(updatedData)
      setHasChanges(false)
      setSuccess(true)
      
      // Update local storage user if name changed
      const updatedUser = { ...user, name: updatedData.name }
      localStorage.setItem('rkl_user', JSON.stringify(updatedUser))
      setUser(updatedUser)

      toast.success('Profile updated successfully', {
        icon: '✨',
        style: { background: '#FBF5EE', color: '#2C1810', border: '1px solid #C87941' }
      })

      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF5EE]">
        <Loader2 className="animate-spin text-[#C87941]" size={48} />
      </div>
    )
  }

  // Calculate completeness
  const calculateCompleteness = () => {
    let score = 40 // Name + Email
    if (profile?.phone) score += 20
    if (profile?.address) score += 25
    if (profile?.pincode) score += 15
    return score
  }
  const completeness = calculateCompleteness()

  const formatMemberDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const styles = {
    page: {
      backgroundColor: '#FBF5EE',
      backgroundImage: 'radial-gradient(circle, rgba(222, 197, 168, 0.15) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
    },
    wrapper: {
      maxWidth: '1100px',
      width: '100%',
    },
    leftCard: {
      background: 'linear-gradient(160deg, #F5E6D3 0%, #EDD0A8 100%)',
      borderRadius: '24px',
      padding: '48px 32px',
      textAlign: 'center',
      boxShadow: '0 10px 30px rgba(200,121,65,0.12)',
      height: 'fit-content',
      position: 'relative',
      overflow: 'hidden'
    },
    avatar: {
      width: '120px',
      height: '120px',
      margin: '0 auto',
      background: 'linear-gradient(135deg, #C87941, #8B4513)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3rem',
      fontWeight: 700,
      color: 'white',
      fontFamily: "'Playfair Display', serif",
      boxShadow: '0 0 0 8px rgba(200,121,65,0.1), 0 0 0 16px rgba(200,121,65,0.05), 0 12px 32px rgba(200,121,65,0.25)',
      animation: 'pulseGlow 3s infinite',
      zIndex: 2,
      position: 'relative'
    },
    userName: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '2rem',
      fontWeight: 800,
      background: 'linear-gradient(135deg, #2C1810 0%, #8B4513 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginTop: '32px'
    },
    rightCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '24px',
      padding: '48px',
      boxShadow: '0 10px 40px rgba(44,26,14,0.08)',
      position: 'relative'
    },
    progressTrack: {
      width: '100%',
      height: '8px',
      backgroundColor: '#EDD9C0',
      borderRadius: '4px',
      margin: '8px 0 20px 0',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #C87941, #E8A96E)',
      borderRadius: '4px',
      transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
      width: `${completeness}%`
    }
  }

  return (
    <div style={styles.page} className="profile-page-container">
      <div style={styles.wrapper} className="profile-wrapper">
        
        {/* LEFT CARD — Identity */}
        <div style={styles.leftCard} className="profile-left-card animate-fade-in">
          {/* Decorative Orbs */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)', borderRadius: '50%' }} />
          
          <div style={styles.avatar}>
            {profile?.name?.charAt(0).toUpperCase()}
          </div>

          <h2 style={styles.userName}>{profile?.name}</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#7A5542', fontSize: '0.9rem', marginTop: '8px' }}>
            <Mail size={14} /> {profile?.email}
          </div>

          <p style={{ marginTop: '12px', fontSize: '0.8rem', fontStyle: 'italic', color: '#9C7B65' }}>
            Member since {formatMemberDate(profile?.created_at)}
          </p>

          <div style={{ marginTop: '32px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#5C3018', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Profile Completeness</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#C87941' }}>{completeness}%</span>
            </div>
            <div style={styles.progressTrack}>
              <div style={styles.progressFill} />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              <div className="tag" style={{ fontSize: '0.7rem', padding: '5px 12px', borderRadius: '20px', background: '#C87941', color: 'white', fontWeight: 600 }}>✓ Name</div>
              <div className="tag" style={{ fontSize: '0.7rem', padding: '5px 12px', borderRadius: '20px', background: '#C87941', color: 'white', fontWeight: 600 }}>✓ Email</div>
              {profile?.phone ? (
                <div className="tag" style={{ fontSize: '0.7rem', padding: '5px 12px', borderRadius: '20px', background: '#C87941', color: 'white', fontWeight: 600 }}>✓ Phone</div>
              ) : (
                <div className="tag" style={{ fontSize: '0.7rem', padding: '5px 12px', borderRadius: '20px', border: '1px solid #C4A882', color: '#9C7B65' }}>+ Phone</div>
              )}
              {profile?.address ? (
                <div className="tag" style={{ fontSize: '0.7rem', padding: '5px 12px', borderRadius: '20px', background: '#C87941', color: 'white', fontWeight: 600 }}>✓ Address</div>
              ) : (
                <div className="tag" style={{ fontSize: '0.7rem', padding: '5px 12px', borderRadius: '20px', border: '1px solid #C4A882', color: '#9C7B65' }}>+ Address</div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT CARD — Edit Form */}
        <div style={styles.rightCard} className="profile-right-card">
          <div style={{ width: '40px', height: '3px', background: 'linear-gradient(90deg, #C87941, #EEC39A)', borderRadius: '2px', marginBottom: '16px' }} />
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: '#2C1810', marginBottom: '8px' }}>My Profile</h2>
          <p style={{ color: '#9C7B65', fontSize: '0.95rem', marginBottom: '40px' }}>Manage your personal and delivery information</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Name */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#5C3D2A', letterSpacing: '0.08em', marginBottom: '10px', display: 'block' }}>
                FULL NAME <span style={{ color: '#C87941' }}>*</span>
              </label>
              <div className={`input-box-wrapper ${focusedField === 'name' ? 'focused' : ''}`} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FDFAF6', border: '1.5px solid #DEC5A8', borderRadius: '14px', padding: '0 18px', height: '56px' }}>
                <User className="input-icon" size={20} style={{ color: focusedField === 'name' ? '#C87941' : '#B08060', marginRight: '12px' }} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Your full name"
                  required
                  style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '1rem' }}
                />
              </div>
            </div>

            {/* Email - Read Only */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9C7B65', letterSpacing: '0.08em' }}>EMAIL ADDRESS</label>
                <div style={{ fontSize: '0.65rem', background: '#F5EDE3', color: '#9C7B65', padding: '3px 10px', borderRadius: '20px', fontWeight: 700 }}>VERIFIED</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F2ECE4', border: '1.5px solid #E5D5C5', borderRadius: '14px', padding: '0 18px', height: '56px', opacity: 0.8, cursor: 'not-allowed' }}>
                <Mail size={20} style={{ color: '#B08060', marginRight: '12px' }} />
                <input
                  type="email"
                  value={profile?.email}
                  readOnly
                  style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '1rem', cursor: 'not-allowed', color: '#7A5542' }}
                />
                <Lock size={16} style={{ color: '#B08060' }} />
              </div>
              <p style={{ fontSize: '0.72rem', color: '#B08060', fontStyle: 'italic', marginTop: '6px' }}>Email address cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#5C3D2A', letterSpacing: '0.08em' }}>PHONE NUMBER</label>
                <div style={{ fontSize: '0.68rem', background: '#F5EDE3', color: '#9C7B65', padding: '2px 8px', borderRadius: '8px' }}>Optional</div>
              </div>
              <div className={`input-box-wrapper ${focusedField === 'phone' ? 'focused' : ''}`} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FDFAF6', border: '1.5px solid #DEC5A8', borderRadius: '14px', padding: '0 18px', height: '56px' }}>
                <Phone className="input-icon" size={20} style={{ color: focusedField === 'phone' ? '#C87941' : '#B08060', marginRight: '12px' }} />
                <input
                  type="tel"
                  name="phone"
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="10-digit mobile number"
                  style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '1rem' }}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#5C3D2A', letterSpacing: '0.08em' }}>DELIVERY ADDRESS</label>
                <div style={{ fontSize: '0.68rem', background: '#F5EDE3', color: '#9C7B65', padding: '2px 8px', borderRadius: '8px' }}>Optional</div>
              </div>
              <div className={`input-box-wrapper ${focusedField === 'address' ? 'focused' : ''}`} style={{ display: 'flex', alignItems: 'flex-start', backgroundColor: '#FDFAF6', border: '1.5px solid #DEC5A8', borderRadius: '14px', padding: '14px 18px', minHeight: '100px' }}>
                <MapPin className="input-icon" size={20} style={{ color: focusedField === 'address' ? '#C87941' : '#B08060', marginRight: '12px', marginTop: '2px' }} />
                <textarea
                  name="address"
                  maxLength={300}
                  value={formData.address}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('address')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Your full delivery address"
                  style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '1rem', resize: 'none', minHeight: '80px' }}
                />
              </div>
              <div style={{ textAlign: 'right', marginTop: '6px' }}>
                <span style={{ 
                  fontSize: '0.72rem', 
                  color: formData.address.length >= 290 ? '#E74C3C' : (formData.address.length >= 240 ? '#C87941' : '#B08060'),
                  fontWeight: 600
                }}>
                  {formData.address.length} / 300
                </span>
              </div>
            </div>

            {/* Pincode */}
            <div style={{ width: '200px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#5C3D2A', letterSpacing: '0.08em' }}>PINCODE</label>
                <div style={{ fontSize: '0.68rem', background: '#F5EDE3', color: '#9C7B65', padding: '2px 8px', borderRadius: '8px' }}>Optional</div>
              </div>
              <div className={`input-box-wrapper ${focusedField === 'pincode' ? 'focused' : ''}`} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FDFAF6', border: '1.5px solid #DEC5A8', borderRadius: '14px', padding: '0 18px', height: '56px' }}>
                <Hash className="input-icon" size={20} style={{ color: focusedField === 'pincode' ? '#C87941' : '#B08060', marginRight: '12px' }} />
                <input
                  type="tel"
                  name="pincode"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('pincode')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="6 digits"
                  style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '1rem' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <button
                ref={buttonRef}
                type="submit"
                disabled={!hasChanges || updating}
                className="submit-btn-ripple"
                style={{
                  width: '100%',
                  height: '56px',
                  borderRadius: '14px',
                  background: success ? 'linear-gradient(135deg, #27AE60, #1E8449)' : 
                              (!hasChanges ? '#E5D5C5' : 'linear-gradient(135deg, #C87941 0%, #A0622E 100%)'),
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  border: 'none',
                  cursor: (!hasChanges || updating) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: hasChanges && !updating ? '0 10px 20px rgba(200,121,65,0.25)' : 'none'
                }}
              >
                {success ? (
                  <>
                    <CheckCircle size={22} />
                    <span style={{ textTransform: 'uppercase' }}>✓ Saved!</span>
                  </>
                ) : updating ? (
                  <>
                    <Loader2 size={22} className="animate-spin" />
                    <span style={{ textTransform: 'uppercase' }}>Persisting...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span style={{ textTransform: 'uppercase' }}>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
