import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, RotateCcw, RefreshCw, Download, Maximize, Send,
  X, Check, ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { submitCustomOrder } from '../services/api'

// ── Constants ──────────────────────────────────────────────────────────────────

const PRODUCT_TYPES = [
  { id: 'coaster', label: 'Coaster', emoji: '🫙', price: 499 },
  { id: 'keychain', label: 'Keychain', emoji: '🔑', price: 199 },
  { id: 'tray', label: 'Tray', emoji: '🪞', price: 899 },
  { id: 'frame', label: 'Photo Frame', emoji: '🖼', price: 649 },
  { id: 'clock', label: 'Clock', emoji: '⏰', price: 1299 },
  { id: 'earrings', label: 'Earrings', emoji: '💎', price: 349 },
]

const COLORS = [
  { name: 'Clear', hex: 'transparent', pattern: true },
  { name: 'Pearl White', hex: '#F5F0EB' },
  { name: 'Blush Pink', hex: '#F4C2CB' },
  { name: 'Rose Gold', hex: '#E8A598' },
  { name: 'Coral', hex: '#FF7F6E' },
  { name: 'Terracotta', hex: '#C1694F' },
  { name: 'Amber', hex: '#C87941' },
  { name: 'Mustard', hex: '#D4A017' },
  { name: 'Sage Green', hex: '#8FAF8C' },
  { name: 'Forest Green', hex: '#3A7D44' },
  { name: 'Ocean Blue', hex: '#4A90D9' },
  { name: 'Navy', hex: '#2C3E7A' },
  { name: 'Lavender', hex: '#B39DDB' },
  { name: 'Purple', hex: '#7B5EA7' },
  { name: 'Midnight Black', hex: '#1A1A2E' },
  { name: 'Charcoal', hex: '#36454F' },
]

const INCLUSIONS = [
  { id: 'flowers', label: 'Dried Flowers', emoji: '🌸', premium: false },
  { id: 'leaves', label: 'Leaves & Botanicals', emoji: '🍃', premium: false },
  { id: 'goldfoil', label: 'Gold Foil Flakes', emoji: '✨', premium: true },
  { id: 'silver', label: 'Silver Glitter', emoji: '💫', premium: true },
  { id: 'holographic', label: 'Holographic Glitter', emoji: '🌈', premium: false },
  { id: 'butterfly', label: 'Butterfly Wings', emoji: '🦋', premium: false },
  { id: 'shells', label: 'Seashells', emoji: '🐚', premium: false },
  { id: 'stars', label: 'Star Confetti', emoji: '⭐', premium: false },
  { id: 'gems', label: 'Gemstones', emoji: '💜', premium: true },
  { id: 'crystals', label: 'Crystal Chips', emoji: '🔮', premium: true },
  { id: 'moon', label: 'Moon & Star Charms', emoji: '🌙', premium: false },
  { id: 'hearts', label: 'Heart Charms', emoji: '❤️', premium: false },
]

const FONTS = [
  { id: 'Serif', label: 'Serif', family: "var(--font-heading)" },
  { id: 'Sans', label: 'Sans', family: "var(--font-body)" },
  { id: 'Script', label: 'Script', family: "'Dancing Script', cursive" },
  { id: 'Bold', label: 'Bold', family: "var(--font-heading)", weight: 800 },
]

const TEXT_COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#1A1A1A' },
  { name: 'Gold', hex: '#FFD700' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Amber', hex: '#C87941' },
  { name: 'Rose Gold', hex: '#E8A598' },
  { name: 'Navy', hex: '#2C3E7A' },
  { name: 'Red', hex: '#C0392B' },
]

const SHAPES = [
  { id: 'Square', label: 'Square', css: { borderRadius: '16px' } },
  { id: 'Round', label: 'Round', css: { borderRadius: '50%' } },
  { id: 'Hexagon', label: 'Hexagon', css: { borderRadius: '0', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' } },
  { id: 'Oval', label: 'Oval', css: { borderRadius: '50% / 35%' } },
]

const FINISHES = ['Glossy', 'Matte', 'Satin']

const defaultState = {
  selectedProduct: null,
  selectedColor: COLORS[1],
  selectedInclusions: [],
  customText: '',
  selectedFont: FONTS[0],
  selectedTextColor: TEXT_COLORS[0],
  textSize: 24,
  selectedShape: SHAPES[0],
  selectedSize: 'M',
  selectedFinish: FINISHES[0],
  specialInstructions: '',
  textPosition: { x: 50, y: 50 },
}

// ── Price Calculator ───────────────────────────────────────────────────────────
function calcPrice(state) {
  if (!state.selectedProduct) return 0
  let p = state.selectedProduct.price
  state.selectedInclusions.forEach(inc => {
    p += inc.premium ? 150 : 50
  })
  if (state.customText) p += 99
  if (state.selectedSize === 'L') p += 200
  if (state.selectedSize === 'S') p -= 100
  if (state.selectedFinish === 'Satin') p += 75
  if (state.selectedFinish === 'Matte') p += 50
  return Math.max(p, 0)
}

// ── Inclusion Canvas Decoration ───────────────────────────────────────────────
const INCLUSION_PARTICLES = {
  goldfoil: [
    { left: '20%', top: '15%', content: '✦', color: '#FFD700', size: '1.2rem', rotate: 15 },
    { left: '75%', top: '30%', content: '✦', color: '#FFC107', size: '0.9rem', rotate: -20 },
    { left: '50%', top: '60%', content: '✦', color: '#FFD700', size: '1rem', rotate: 45 },
    { left: '30%', top: '75%', content: '✦', color: '#FFC107', size: '0.7rem', rotate: -10 },
    { left: '80%', top: '70%', content: '✦', color: '#FFD700', size: '1.1rem', rotate: 30 },
  ],
  silver: [
    { left: '15%', top: '40%', content: '·', color: '#C0C0C0', size: '2rem', rotate: 0 },
    { left: '65%', top: '20%', content: '·', color: '#E0E0E0', size: '1.5rem', rotate: 0 },
    { left: '40%', top: '80%', content: '·', color: '#C0C0C0', size: '2rem', rotate: 0 },
    { left: '85%', top: '55%', content: '·', color: '#D0D0D0', size: '1.8rem', rotate: 0 },
  ],
  flowers: [
    { left: '25%', top: '20%', content: '🌸', size: '1.5rem' },
    { left: '70%', top: '45%', content: '🌷', size: '1.2rem' },
    { left: '40%', top: '70%', content: '🌸', size: '1rem' },
    { left: '10%', top: '65%', content: '🌺', size: '1.3rem' },
  ],
  leaves: [
    { left: '20%', top: '25%', content: '🍃', size: '1.4rem' },
    { left: '72%', top: '55%', content: '🌿', size: '1.2rem' },
    { left: '45%', top: '75%', content: '🍃', size: '1rem' },
  ],
  holographic: [
    { left: '30%', top: '30%', content: '✦', color: '#E040FB', size: '1rem', rotate: 20 },
    { left: '60%', top: '20%', content: '✦', color: '#00BCD4', size: '0.8rem', rotate: -35 },
    { left: '50%', top: '65%', content: '✦', color: '#76FF03', size: '1.1rem', rotate: 55 },
    { left: '15%', top: '55%', content: '✦', color: '#FF4081', size: '0.9rem', rotate: -15 },
    { left: '80%', top: '40%', content: '✦', color: '#FFEA00', size: '1rem', rotate: 30 },
  ],
  butterfly: [
    { left: '30%', top: '25%', content: '🦋', size: '1.4rem' },
    { left: '65%', top: '60%', content: '🦋', size: '1.1rem' },
  ],
  shells: [
    { left: '25%', top: '40%', content: '🐚', size: '1.3rem' },
    { left: '70%', top: '35%', content: '🐚', size: '1rem' },
    { left: '45%', top: '72%', content: '🐚', size: '1.2rem' },
  ],
  stars: [
    { left: '20%', top: '20%', content: '⭐', size: '1rem' },
    { left: '70%', top: '30%', content: '⭐', size: '0.8rem' },
    { left: '45%', top: '60%', content: '⭐', size: '1.1rem' },
    { left: '15%', top: '72%', content: '⭐', size: '0.9rem' },
    { left: '80%', top: '65%', content: '⭐', size: '1rem' },
  ],
  gems: [
    { left: '30%', top: '30%', content: '💎', size: '1.2rem' },
    { left: '65%', top: '55%', content: '💜', size: '1rem' },
  ],
  crystals: [
    { left: '25%', top: '35%', content: '🔮', size: '1.3rem' },
    { left: '70%', top: '60%', content: '🔮', size: '1rem' },
  ],
  moon: [
    { left: '20%', top: '20%', content: '🌙', size: '1.3rem' },
    { left: '65%', top: '35%', content: '⭐', size: '1rem' },
    { left: '40%', top: '70%', content: '✨', size: '1.1rem', color: '#FFD700' },
  ],
  hearts: [
    { left: '20%', top: '25%', content: '❤️', size: '1.2rem' },
    { left: '70%', top: '45%', content: '🩷', size: '1rem' },
    { left: '45%', top: '70%', content: '❤️', size: '1.1rem' },
  ],
}

// ── Section Header ─────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.10em', color: '#C87941', textTransform: 'uppercase' }}>{title}</p>
      {subtitle && <p style={{ fontSize: '0.78rem', color: '#9C7B65', marginTop: '3px', fontStyle: 'italic' }}>{subtitle}</p>}
    </div>
  )
}

// ── Divider ────────────────────────────────────────────────────────────────────
function Divider() {
  return <div style={{ height: '1px', background: '#EDD9C0', margin: '20px 0' }} />
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CustomizeStudio() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const canvasRef = useRef(null)

  const [state, setState] = useState(defaultState)
  const [history, setHistory] = useState([defaultState])
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [submitting, setSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Pre-select product from query param
  useEffect(() => {
    const productName = searchParams.get('name')
    if (productName) {
      const match = PRODUCT_TYPES.find(p => productName.toLowerCase().includes(p.id) || p.id.includes(productName.toLowerCase()))
      if (match) updateState({ selectedProduct: match })
    }
  }, [])

  const updateState = useCallback((patch) => {
    setState(prev => {
      const next = { ...prev, ...patch }
      setHistory(h => [...h.slice(-9), prev])
      return next
    })
  }, [])

  const handleUndo = () => {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setState(prev)
    setHistory(h => h.slice(0, -1))
  }

  const handleReset = () => {
    if (window.confirm('Reset all customizations?')) {
      setState(defaultState)
      setHistory([])
    }
  }

  const handleDownload = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(canvasRef.current, { backgroundColor: null, scale: 2 })
      const link = document.createElement('a')
      link.download = 'RKLTrove_Custom_Design.png'
      link.href = canvas.toDataURL()
      link.click()
      toast.success('Design downloaded!', { icon: '📥' })
    } catch {
      toast.error('Download failed. Try again.')
    }
  }

  const toggleInclusion = (inc) => {
    const current = state.selectedInclusions
    const exists = current.find(i => i.id === inc.id)
    updateState({
      selectedInclusions: exists ? current.filter(i => i.id !== inc.id) : [...current, inc]
    })
  }

  const estimatedPrice = calcPrice(state)

  const handleSubmitOrder = async () => {
    if (!state.selectedProduct) {
      toast.error('Please select a product type first.')
      return
    }
    if (!user) {
      toast.error('Please login to place a custom order.')
      navigate('/login')
      return
    }
    setSubmitting(true)
    try {
      const userData = JSON.parse(localStorage.getItem('rkl_user') || '{}')
      await submitCustomOrder({
        orderType: 'custom',
        productType: state.selectedProduct.label,
        baseColor: state.selectedColor.name,
        inclusions: state.selectedInclusions.map(i => i.label),
        customText: state.customText,
        textFont: state.selectedFont.id,
        textColor: state.selectedTextColor.name,
        shape: state.selectedShape.id,
        size: state.selectedSize,
        finish: state.selectedFinish,
        specialInstructions: state.specialInstructions,
        estimatedPrice,
        userName: userData.name || user?.name || '',
        userEmail: userData.email || user?.email || '',
      })
      setShowSuccessModal(true)
    } catch {
      toast.error('Failed to submit order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Text Drag ─────────────────────────────────────────────────────────────
  const handleTextMouseDown = (e) => {
    e.preventDefault()
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const curX = (state.textPosition.x / 100) * rect.width
    const curY = (state.textPosition.y / 100) * rect.height
    setDragOffset({ x: e.clientX - rect.left - curX, y: e.clientY - rect.top - curY })
    setIsDragging(true)
  }

  const handleCanvasMouseMove = useCallback((e) => {
    if (!isDragging || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100
    const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100
    setState(prev => ({ ...prev, textPosition: { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) } }))
  }, [isDragging, dragOffset])

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !canvasRef.current) return
    e.preventDefault()
    const touch = e.touches[0]
    const rect = canvasRef.current.getBoundingClientRect()
    const x = ((touch.clientX - rect.left - dragOffset.x) / rect.width) * 100
    const y = ((touch.clientY - rect.top - dragOffset.y) / rect.height) * 100
    setState(prev => ({ ...prev, textPosition: { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) } }))
  }, [isDragging, dragOffset])

  const handleTextTouchStart = (e) => {
    const touch = e.touches[0]
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const curX = (state.textPosition.x / 100) * rect.width
    const curY = (state.textPosition.y / 100) * rect.height
    setDragOffset({ x: touch.clientX - rect.left - curX, y: touch.clientY - rect.top - curY })
    setIsDragging(true)
  }

  // Canvas preview
  const canvasStyle = {
    ...(state.selectedShape.css || {}),
    backgroundColor: state.selectedColor.pattern ? 'white' : state.selectedColor.hex,
    position: 'relative', overflow: 'hidden',
    width: isMobile ? '280px' : '380px',
    height: isMobile ? '280px' : '380px',
    boxShadow: '0 20px 60px rgba(200,121,65,0.20), 0 4px 16px rgba(44,26,14,0.10)',
    transition: 'background-color 0.4s ease, border-radius 0.35s ease',
    flexShrink: 0,
    cursor: 'default',
  }

  const fontFamily = state.selectedFont.weight === 800 ? "var(--font-heading)" : state.selectedFont.family
  const fontWeight = state.selectedFont.weight || 600

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "var(--font-body)", backgroundColor: '#FBF5EE' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap');
        @keyframes floatAnim {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes sparkleAnim {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
        @keyframes checkDraw {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes circleGrow {
          from { stroke-dashoffset: 200; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        input[type="range"] {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: linear-gradient(to right, #C87941, #DEC5A8);
          outline: none;
          cursor: pointer;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #C87941;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(200,121,65,0.40);
          cursor: pointer;
        }
      `}</style>

      {/* ── LEFT PANEL — Tools ── */}
      <div style={{
        width: isMobile ? '100%' : '320px',
        flexShrink: 0,
        background: '#FFFFFF',
        borderRight: '1px solid #EDD9C0',
        height: isMobile ? 'auto' : '100vh',
        overflowY: 'auto',
        position: isMobile ? 'relative' : 'sticky',
        top: 0,
        padding: '20px 20px 80px',
      }}>
        {/* Panel Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #EDD9C0' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9C7B65', padding: '4px', display: 'flex' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: '1.1rem', background: 'linear-gradient(135deg, #C87941, #8B4513)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: 0 }}>
              Design Studio
            </h2>
            <p style={{ fontSize: '0.72rem', color: '#9C7B65', margin: 0 }}>Customize your resin product</p>
          </div>
        </div>

        {/* SECTION 1 — Product Type */}
        <SectionHeader title="Product Type" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          {PRODUCT_TYPES.map(pt => (
            <button
              key={pt.id}
              onClick={() => updateState({ selectedProduct: pt })}
              style={{
                padding: '14px 8px', borderRadius: '12px',
                border: `2px solid ${state.selectedProduct?.id === pt.id ? '#C87941' : '#EDD9C0'}`,
                background: state.selectedProduct?.id === pt.id ? '#FEF0E3' : '#FEF9F3',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                transition: 'all 0.2s', position: 'relative',
                boxShadow: state.selectedProduct?.id === pt.id ? '0 0 0 3px rgba(200,121,65,0.15)' : 'none'
              }}
            >
              {state.selectedProduct?.id === pt.id && (
                <div style={{ position: 'absolute', top: '6px', right: '6px', width: '18px', height: '18px', borderRadius: '50%', background: '#C87941', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={11} color="white" />
                </div>
              )}
              <span style={{ fontSize: '2rem' }}>{pt.emoji}</span>
              <span style={{ fontSize: '0.78rem', color: '#3D2B1A', fontWeight: 500 }}>{pt.label}</span>
              <span style={{ fontSize: '0.70rem', color: '#C87941', fontWeight: 700 }}>₹{pt.price}</span>
            </button>
          ))}
        </div>

        <Divider />

        {/* SECTION 2 — Base Color */}
        <SectionHeader title="Base Color" subtitle="Choose your resin base color" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
          {COLORS.map(c => (
            <button
              key={c.name}
              onClick={() => updateState({ selectedColor: c })}
              title={c.name}
              style={{
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                background: c.pattern
                  ? 'repeating-linear-gradient(45deg, #ddd 0px, #ddd 4px, white 4px, white 8px)'
                  : c.hex,
                border: `2px solid ${state.selectedColor.name === c.name ? '#2C1810' : 'transparent'}`,
                transform: state.selectedColor.name === c.name ? 'scale(1.15)' : 'scale(1)',
                cursor: 'pointer', transition: 'all 0.15s ease',
                boxShadow: state.selectedColor.name === c.name ? 'inset 0 0 0 2px white' : '0 1px 4px rgba(0,0,0,0.1)'
              }}
            />
          ))}
        </div>
        <p style={{ fontSize: '0.82rem', color: '#C87941', fontWeight: 600, marginBottom: '20px' }}>
          Selected: {state.selectedColor.name}
        </p>

        <Divider />

        {/* SECTION 3 — Inclusions */}
        <SectionHeader title="Inclusions" subtitle="Select elements to embed in your resin" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '20px' }}>
          {INCLUSIONS.map(inc => {
            const isSelected = state.selectedInclusions.some(i => i.id === inc.id)
            return (
              <div
                key={inc.id}
                onClick={() => toggleInclusion(inc)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 10px', borderRadius: '10px',
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: isSelected ? '#FEF0E3' : 'transparent',
                  borderLeft: isSelected ? '3px solid #C87941' : '3px solid transparent',
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#FEF9F3' }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
              >
                {/* Custom checkbox */}
                <div style={{
                  width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0,
                  border: `1.5px solid ${isSelected ? '#C87941' : '#DEC5A8'}`,
                  background: isSelected ? '#C87941' : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s'
                }}>
                  {isSelected && <Check size={12} color="white" />}
                </div>
                <span style={{ fontSize: '0.82rem' }}>{inc.emoji}</span>
                <span style={{ fontSize: '0.75rem', color: '#3D2B1A', lineHeight: 1.2 }}>{inc.label}</span>
                {inc.premium && <span style={{ fontSize: '0.60rem', background: '#FEF0E3', color: '#C87941', border: '1px solid #EDD9C0', borderRadius: '4px', padding: '1px 4px', marginLeft: 'auto', flexShrink: 0 }}>+₹150</span>}
              </div>
            )
          })}
        </div>

        <Divider />

        {/* SECTION 4 — Add Text */}
        <SectionHeader title="Personalise" subtitle="Add custom text to your product" />
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #DEC5A8', borderRadius: '10px', padding: '10px 14px', background: '#FDFAF6' }}>
            <input
              type="text"
              value={state.customText}
              onChange={e => updateState({ customText: e.target.value.slice(0, 50) })}
              placeholder="Your name, quote, or message..."
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '0.9rem', fontFamily: "var(--font-body)" }}
            />
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.72rem', color: state.customText.length >= 45 ? '#E74C3C' : '#B08060', marginTop: '4px' }}>
            {state.customText.length} / 50
          </div>
        </div>

        {/* Font selector */}
        <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5C3D2A', marginBottom: '8px' }}>Text Font</p>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
          {FONTS.map(f => (
            <button key={f.id} onClick={() => updateState({ selectedFont: f })}
              style={{
                padding: '6px 14px', borderRadius: '20px', border: `1.5px solid ${state.selectedFont.id === f.id ? '#C87941' : '#DEC5A8'}`,
                background: state.selectedFont.id === f.id ? '#C87941' : 'white',
                color: state.selectedFont.id === f.id ? 'white' : '#5C3D2A',
                fontSize: '0.82rem', fontFamily: f.family, fontWeight: f.weight || 400,
                cursor: 'pointer', transition: 'all 0.15s'
              }}
            >{f.label}</button>
          ))}
        </div>

        {/* Text color */}
        <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5C3D2A', marginBottom: '8px' }}>Text Color</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
          {TEXT_COLORS.map(tc => (
            <button key={tc.name} onClick={() => updateState({ selectedTextColor: tc })} title={tc.name}
              style={{
                width: '28px', height: '28px', borderRadius: '50%', background: tc.hex, flexShrink: 0,
                border: `2px solid ${state.selectedTextColor.name === tc.name ? '#C87941' : 'rgba(0,0,0,0.15)'}`,
                transform: state.selectedTextColor.name === tc.name ? 'scale(1.18)' : 'scale(1)',
                cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: tc.hex === '#FFFFFF' ? 'inset 0 0 0 1px #DDD' : 'none'
              }}
            />
          ))}
        </div>

        {/* Text size slider */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5C3D2A', margin: 0 }}>Text Size</p>
            <span style={{ fontSize: '0.78rem', color: '#C87941', fontWeight: 700 }}>{state.textSize}px</span>
          </div>
          <input type="range" min="12" max="72" step="2" value={state.textSize}
            onChange={e => updateState({ textSize: parseInt(e.target.value) })} />
        </div>

        <Divider />

        {/* SECTION 5 — Shape & Size */}
        <SectionHeader title="Shape & Size" />
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
          {SHAPES.map(sh => (
            <button key={sh.id} onClick={() => updateState({ selectedShape: sh })}
              style={{
                width: '70px', height: '70px', borderRadius: '12px', flexShrink: 0,
                border: `2px solid ${state.selectedShape.id === sh.id ? '#C87941' : '#EDD9C0'}`,
                background: state.selectedShape.id === sh.id ? '#FEF0E3' : '#FEF9F3',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                boxShadow: state.selectedShape.id === sh.id ? '0 0 0 3px rgba(200,121,65,0.15)' : 'none',
                transition: 'all 0.2s', position: 'relative'
              }}>
              {/* CSS shape indicator */}
              <div style={{
                width: '28px', height: '28px',
                background: state.selectedShape.id === sh.id ? '#C87941' : '#DEC5A8',
                ...(sh.css),
                flexShrink: 0,
                transition: 'all 0.2s'
              }} />
              <span style={{ fontSize: '0.68rem', color: '#3D2B1A', fontWeight: 500 }}>{sh.id}</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {['S', 'M', 'L'].map(s => (
            <button key={s} onClick={() => updateState({ selectedSize: s })}
              style={{
                flex: 1, padding: '8px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600,
                border: `1.5px solid ${state.selectedSize === s ? '#C87941' : '#DEC5A8'}`,
                background: state.selectedSize === s ? '#C87941' : 'white',
                color: state.selectedSize === s ? 'white' : '#5C3D2A',
                cursor: 'pointer', transition: 'all 0.15s'
              }}>
              {s === 'S' ? 'Small' : s === 'M' ? 'Medium' : 'Large'}
            </button>
          ))}
        </div>

        <Divider />

        {/* SECTION 6 — Finish */}
        <SectionHeader title="Finish" />
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {FINISHES.map(f => (
            <button key={f} onClick={() => updateState({ selectedFinish: f })}
              style={{
                flex: 1, padding: '10px 4px', borderRadius: '12px', cursor: 'pointer',
                border: `2px solid ${state.selectedFinish === f ? '#C87941' : '#EDD9C0'}`,
                background: state.selectedFinish === f ? '#FEF0E3' : '#FEF9F3',
                transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                boxShadow: state.selectedFinish === f ? '0 0 0 3px rgba(200,121,65,0.15)' : 'none'
              }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                background: f === 'Glossy'
                  ? 'radial-gradient(circle at 30% 30%, #FFFFFF, #DEC5A8, #B08060)'
                  : f === 'Matte' ? '#C4A882'
                  : 'linear-gradient(135deg, #E8D5C0 0%, #C4A882 50%, #E8D5C0 100%)'
              }} />
              <span style={{ fontSize: '0.75rem', color: '#3D2B1A', fontWeight: 500 }}>{f}</span>
            </button>
          ))}
        </div>

        <Divider />

        {/* Special Instructions */}
        <SectionHeader title="Special Instructions" />
        <textarea
          value={state.specialInstructions}
          onChange={e => updateState({ specialInstructions: e.target.value.slice(0, 300) })}
          placeholder="Any special requests, reference image URLs, or notes for our craftsmen..."
          maxLength={300}
          style={{
            width: '100%', minHeight: '80px', padding: '12px 14px',
            border: '1.5px solid #DEC5A8', borderRadius: '10px',
            background: '#FDFAF6', resize: 'none', outline: 'none',
            fontSize: '0.88rem', fontFamily: "var(--font-body)", lineHeight: 1.6,
            boxSizing: 'border-box', color: '#2C1810'
          }}
        />
        <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#B08060', marginTop: '4px' }}>
          {state.specialInstructions.length} / 300
        </div>
      </div>

      {/* ── RIGHT PANEL — Canvas ── */}
      <div style={{
        flex: 1, background: '#FBF5EE',
        backgroundImage: 'radial-gradient(circle, rgba(222, 197, 168, 0.2) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', position: 'relative', padding: '24px 16px 120px', gap: '20px'
      }}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
      >
        {/* Canvas Preview */}
        <div
          ref={canvasRef}
          style={canvasStyle}
        >
          {/* Clear pattern */}
          {state.selectedColor.pattern && (
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(200,200,200,0.15) 0px, rgba(200,200,200,0.15) 4px, transparent 4px, transparent 10px)', zIndex: 0 }} />
          )}

          {/* Glossy overlay */}
          {state.selectedFinish === 'Glossy' && (
            <div style={{ position: 'absolute', top: '10%', left: '8%', width: '35%', height: '18%', background: 'rgba(255,255,255,0.28)', borderRadius: '50%', filter: 'blur(10px)', pointerEvents: 'none', zIndex: 2 }} />
          )}

          {/* Satin effect */}
          {state.selectedFinish === 'Satin' && (
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(255,255,255,0.08) 100%)', pointerEvents: 'none', zIndex: 2 }} />
          )}

          {/* Inclusion particles */}
          {state.selectedInclusions.map(inc => {
            const particles = INCLUSION_PARTICLES[inc.id] || []
            return particles.map((p, i) => (
              <div key={`${inc.id}-${i}`} style={{
                position: 'absolute', left: p.left, top: p.top,
                fontSize: p.size, color: p.color,
                transform: `rotate(${p.rotate || 0}deg)`,
                pointerEvents: 'none', zIndex: 3,
                animation: 'floatAnim 3s ease-in-out infinite',
                animationDelay: `${i * 0.4}s`
              }}>
                {p.content}
              </div>
            ))
          })}

          {/* Custom text — draggable */}
          {state.customText && (
            <div
              onMouseDown={handleTextMouseDown}
              onTouchStart={handleTextTouchStart}
              style={{
                position: 'absolute',
                left: `${state.textPosition.x}%`,
                top: `${state.textPosition.y}%`,
                transform: 'translate(-50%, -50%)',
                fontSize: `${state.textSize}px`,
                color: state.selectedTextColor.hex,
                fontFamily: fontFamily,
                fontWeight: fontWeight,
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                textShadow: '0 1px 4px rgba(0,0,0,0.18)',
                whiteSpace: 'nowrap',
                zIndex: 10,
                maxWidth: '90%',
                textAlign: 'center',
              }}
            >
              {state.customText}
            </div>
          )}
        </div>

        {/* Drag hint */}
        {state.customText && (
          <p style={{ fontSize: '0.72rem', color: '#9C7B65', fontStyle: 'italic', margin: '-8px 0 0' }}>
            ↕ Drag the text to reposition
          </p>
        )}

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {[
            { icon: RotateCcw, label: 'Undo', action: handleUndo, title: 'Undo last change' },
            { icon: RefreshCw, label: 'Reset', action: handleReset, title: 'Reset all' },
            { icon: Download, label: 'Download', action: handleDownload, title: 'Download preview' },
            { icon: Maximize, label: 'Fullscreen', action: () => setShowFullscreen(true), title: 'Fullscreen preview' },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} title={btn.title}
              style={{
                width: '42px', height: '42px', borderRadius: '10px',
                border: '1.5px solid #DEC5A8', background: 'white',
                color: '#7A5542', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.18s', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C87941'; e.currentTarget.style.color = '#C87941' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#DEC5A8'; e.currentTarget.style.color = '#7A5542' }}
            >
              <btn.icon size={17} />
            </button>
          ))}
        </div>

        {/* Price Card */}
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #EDD9C0', padding: '14px 20px', minWidth: isMobile ? '280px' : '320px', boxShadow: '0 4px 16px rgba(200,121,65,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: '#7A5542' }}>Estimated Price:</span>
            <span style={{
              fontFamily: "var(--font-heading)", fontSize: '1.3rem',
              background: state.selectedProduct ? 'linear-gradient(135deg, #C87941, #8B4513)' : '#B08060',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              fontWeight: 700
            }}>
              {state.selectedProduct ? `₹${estimatedPrice}` : 'Select a product'}
            </span>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#B08060', fontStyle: 'italic', textAlign: 'center', marginTop: '6px', margin: '6px 0 0' }}>
            Price may vary based on complexity
          </p>
        </div>

        {/* Order Button (sticky bottom) */}
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 50 }}>
          <button
            onClick={handleSubmitOrder}
            disabled={submitting}
            style={{
              height: '52px', padding: '0 24px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #C87941, #8B4513)',
              color: 'white', border: 'none', fontSize: '0.95rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '10px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 8px 32px rgba(200,121,65,0.40)',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(200,121,65,0.50)' } }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(200,121,65,0.40)' }}
          >
            {submitting ? (
              <div style={{ width: '18px', height: '18px', border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spinLoader 0.7s linear infinite' }} />
            ) : <Send size={18} />}
            Request Custom Order {state.selectedProduct ? `— ₹${estimatedPrice}` : ''}
          </button>
        </div>
      </div>

      {/* ── Fullscreen Modal ── */}
      {showFullscreen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(44,26,14,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setShowFullscreen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C3D2A', zIndex: 201 }}>
            <X size={20} />
          </button>
          <div style={{ ...canvasStyle, width: '520px', height: '520px', boxShadow: '0 40px 80px rgba(200,121,65,0.30)' }}>
            {/* Same canvas content */}
            {state.selectedFinish === 'Glossy' && (
              <div style={{ position: 'absolute', top: '10%', left: '8%', width: '35%', height: '18%', background: 'rgba(255,255,255,0.28)', borderRadius: '50%', filter: 'blur(10px)', pointerEvents: 'none', zIndex: 2 }} />
            )}
            {state.selectedInclusions.map(inc => {
              const particles = INCLUSION_PARTICLES[inc.id] || []
              return particles.map((p, i) => (
                <div key={`fs-${inc.id}-${i}`} style={{ position: 'absolute', left: p.left, top: p.top, fontSize: `calc(${p.size} * 1.3)`, color: p.color, transform: `rotate(${p.rotate || 0}deg)`, pointerEvents: 'none', zIndex: 3 }}>
                  {p.content}
                </div>
              ))
            })}
            {state.customText && (
              <div style={{
                position: 'absolute', left: `${state.textPosition.x}%`, top: `${state.textPosition.y}%`,
                transform: 'translate(-50%, -50%)', fontSize: `${state.textSize * 1.38}px`,
                color: state.selectedTextColor.hex, fontFamily: fontFamily, fontWeight: fontWeight,
                textShadow: '0 1px 4px rgba(0,0,0,0.18)', whiteSpace: 'nowrap', zIndex: 10
              }}>
                {state.customText}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Success Modal ── */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(44,26,14,0.50)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '40px 36px', maxWidth: '420px', width: '100%', textAlign: 'center', animation: 'scaleIn 0.28s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: '0 24px 64px rgba(44,26,14,0.25)' }}>
            {/* Animated checkmark */}
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ margin: '0 auto 20px' }}>
              <circle cx="36" cy="36" r="32" stroke="#C87941" strokeWidth="3" fill="rgba(200,121,65,0.08)"
                strokeDasharray="201" strokeDashoffset="0"
                style={{ animation: 'circleGrow 0.5s ease forwards' }} />
              <path d="M22 36L32 46L50 28" stroke="#C87941" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="100" strokeDashoffset="0"
                style={{ animation: 'checkDraw 0.4s ease 0.4s both' }} />
            </svg>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: '#2C1810', marginBottom: '12px' }}>
              Custom Order Requested! 🎨
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#5C3D2A', lineHeight: 1.7, marginBottom: '12px' }}>
              Our craftsmen will review your design and contact you within 24 hours to confirm details.
            </p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#C87941', fontWeight: 700, marginBottom: '28px' }}>
              Estimated Price: ₹{estimatedPrice}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => navigate('/')}
                style={{ flex: 1, height: '44px', border: '2px solid #C87941', color: '#C87941', background: 'transparent', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
              >
                Back to Home
              </button>
              <button
                onClick={() => { setShowSuccessModal(false); setState(defaultState); setHistory([]) }}
                style={{ flex: 1, height: '44px', background: 'linear-gradient(135deg, #C87941, #A0622E)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
              >
                Design Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
