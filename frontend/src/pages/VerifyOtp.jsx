import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Loader2, ShieldCheck, Sparkles, ArrowLeft, Timer, RefreshCw } from 'lucide-react'
import { verifyOtp, forgotPassword } from '../services/api'

const OTP_SECONDS = 600 // 10 minutes

export default function VerifyOtp() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''

  const [digits, setDigits] = useState(Array(6).fill(''))
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(OTP_SECONDS)
  const inputRefs = useRef([])

  useEffect(() => {
    if (!email) navigate('/forgot-password', { replace: true })
  }, [email, navigate])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(id)
  }, [secondsLeft])

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const handleDigitChange = (idx, value) => {
    if (!/^\d*$/.test(value)) return
    const updated = [...digits]
    updated[idx] = value.slice(-1) 
    setDigits(updated)
    if (value && idx < 5) inputRefs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const updated = Array(6).fill('')
    for (let i = 0; i < pasted.length; i++) updated[i] = pasted[i]
    setDigits(updated)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otp = digits.join('')
    if (otp.length < 6) return toast.error('Sequence is incomplete.')
    setLoading(true)
    try {
      await verifyOtp(email, otp)
      toast.success('Identity Authenticated!', {
        icon: '🛡️',
        style: { background: '#FBF5EE', color: '#2C1810', border: '1px solid #C87941' }
      })
      navigate('/reset-password', { state: { email, otp } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sequence rejected.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await forgotPassword(email)
      toast.success('New sequence dispatched.', {
        style: { background: '#FBF5EE', color: '#2C1810', border: '1px solid #C87941' }
      })
      setDigits(Array(6).fill(''))
      setSecondsLeft(OTP_SECONDS)
      inputRefs.current[0]?.focus()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch sequence.')
    } finally {
      setResending(false)
    }
  }

  const expired = secondsLeft <= 0

  return (
    <div className="min-h-screen bg-[#FBF5EE] text-[#2C1810] font-sans relative overflow-hidden flex items-center justify-center px-4">
      {/* Background Dot Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.12]" 
           style={{ backgroundImage: 'radial-gradient(#C87941 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      
      <div className="w-full max-w-md relative z-10 animate-fade-slide-up py-10">
        <div className="text-center mb-10">
          <div className="inline-block relative group mb-6">
             <div className="w-16 h-16 rounded-full border border-[#EDD9C0] bg-white flex items-center justify-center shadow-md transition-transform duration-500 group-hover:rotate-[360deg]">
                <ShieldCheck className="text-[#C87941]" size={24} />
             </div>
             <div className="absolute -inset-4 bg-[#C87941]/5 rounded-full blur-xl" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-[#2C1810]">Verify Identity</h1>
          <p className="text-[#9C7B65] mt-2 font-light italic">Enter the unique 6-digit sequence sent to</p>
          <p className="text-[#C87941] font-bold mt-1 text-sm tracking-wide">{email}</p>
        </div>

        <div className="bg-white rounded-[32px] p-8 sm:p-12 border border-[#EDD9C0] shadow-[0_12px_40px_rgba(44,26,14,0.06)]">
          <form onSubmit={handleSubmit} className="space-y-10" noValidate>
            
            <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  id={`otp-digit-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl font-bold rounded-[14px] border-2 bg-[#FBF5EE] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#C87941]/5 focus:bg-white ${d ? 'border-[#C87941] text-[#C87941] shadow-[0_4px_12px_rgba(200,121,65,0.1)]' : 'border-[#DEC5A8] text-[#2C1810]'}`}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <div className="text-center space-y-4">
              {!expired ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5EDE3] border border-[#EDD9C0]/30 text-xs font-bold uppercase tracking-widest text-[#9C7B65] shadow-sm">
                  <Timer size={14} className={secondsLeft < 60 ? 'text-red-500 animate-pulse' : 'text-[#C87941]'} />
                  Sequence expires in <span className="text-[#C87941] ml-1">{formatTime(secondsLeft)}</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-widest font-black text-red-500">The sequence has dissolved</p>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#C87941] text-[#C87941] text-xs font-bold uppercase tracking-widest hover:bg-[#C87941] hover:text-white transition-all shadow-sm active:scale-95"
                  >
                    {resending ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                    {resending ? 'Summoning...' : 'Summon New Sequence'}
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || expired}
              className="w-full h-14 rounded-full bg-gradient-to-br from-[#C87941] to-[#A0622E] text-white flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(200,121,65,0.25)] hover:shadow-[0_12px_32px_rgba(200,121,65,0.35)] transition-all hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span className="uppercase tracking-[0.2em] text-sm font-bold">Authorize Access</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center">
            <Link to="/forgot-password" title="Use Different Email" className="inline-flex items-center gap-2 text-[#C87941] hover:text-[#8B4513] font-bold text-sm transition-all group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Use Different Email
            </Link>
          </p>
        </div>

        <div className="mt-12 text-center">
           <div className="inline-flex items-center gap-2 text-[10px] text-[#B08060] uppercase tracking-[0.3em] font-bold">
              <Sparkles size={10} className="text-[#C87941]" /> Ensuring Eternal Protocol
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide-up {
          animation: fadeSlideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}} />
    </div>
  )
}
