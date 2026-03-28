import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Gem, Loader2, ShieldCheck } from 'lucide-react'
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

  // Redirect if no email was passed
  useEffect(() => {
    if (!email) navigate('/forgot-password', { replace: true })
  }, [email, navigate])

  // Countdown timer
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
    updated[idx] = value.slice(-1) // only last char
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
    if (otp.length < 6) return toast.error('Please enter all 6 digits.')
    setLoading(true)
    try {
      await verifyOtp(email, otp)
      toast.success('OTP verified!')
      navigate('/reset-password', { state: { email, otp } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await forgotPassword(email)
      toast.success('New OTP sent to your email!')
      setDigits(Array(6).fill(''))
      setSecondsLeft(OTP_SECONDS)
      inputRefs.current[0]?.focus()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP.')
    } finally {
      setResending(false)
    }
  }

  const expired = secondsLeft <= 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-cream-100 to-cream-200 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-card p-8 sm:p-10 animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 mb-4">
              <ShieldCheck size={28} className="text-amber-600" />
            </div>
            <h1 className="font-serif text-3xl font-semibold text-stone-800">Verify OTP</h1>
            <p className="text-sm text-stone-500 mt-1">
              Enter the 6-digit OTP sent to
            </p>
            <p className="text-sm font-semibold text-stone-700 mt-0.5">{email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* OTP digit inputs */}
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
                  className="w-11 h-14 sm:w-12 sm:h-16 text-center text-xl font-bold rounded-xl border-2 text-stone-800 bg-cream-50 focus:outline-none transition-all duration-150"
                  style={{
                    borderColor: d ? '#C87941' : '#e7d9c8',
                    boxShadow: d ? '0 0 0 3px rgba(200,121,65,0.12)' : 'none',
                  }}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {/* Timer / Resend */}
            <div className="text-center">
              {!expired ? (
                <p className="text-sm text-stone-500">
                  OTP expires in{' '}
                  <span className="font-semibold" style={{ color: secondsLeft < 60 ? '#dc2626' : '#C87941' }}>
                    {formatTime(secondsLeft)}
                  </span>
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-500">OTP expired</p>
                  <button
                    type="button"
                    id="resend-otp-btn"
                    onClick={handleResend}
                    disabled={resending}
                    className="text-sm font-semibold hover:underline flex items-center gap-1 mx-auto"
                    style={{ color: '#C87941' }}
                  >
                    {resending && <Loader2 size={13} className="animate-spin" />}
                    {resending ? 'Resending…' : 'Resend OTP'}
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              id="verify-otp-btn"
              disabled={loading || expired}
              className="btn-primary w-full py-3 rounded-xl"
              style={{ background: '#C87941' }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={16} />}
              {loading ? 'Verifying…' : 'Verify OTP'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500">
            <Link to="/forgot-password" className="font-medium hover:underline" style={{ color: '#C87941' }}>
              ← Try a different email
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          <Gem size={16} className="text-rose-400" />
          <span className="font-serif text-sm text-stone-400">RKL Trove</span>
        </div>
      </div>
    </div>
  )
}
