import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Gem, Loader2, Mail } from 'lucide-react'
import { forgotPassword } from '../services/api'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return toast.error('Please enter your email address.')
    setLoading(true)
    try {
      await forgotPassword(email.trim())
      toast.success('OTP sent! Check your inbox.')
      navigate('/verify-otp', { state: { email: email.trim() } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-cream-100 to-cream-200 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-card p-8 sm:p-10 animate-slide-up">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 mb-4">
              <Mail size={28} className="text-amber-600" />
            </div>
            <h1 className="font-serif text-3xl font-semibold text-stone-800">Forgot Password</h1>
            <p className="text-sm text-stone-500 mt-1">
              Enter your registered email to receive an OTP
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="fp-email" className="form-label">Email address</label>
              <input
                id="fp-email"
                type="email"
                autoComplete="email"
                required
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              id="send-otp-btn"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl"
              style={{ background: loading ? '#d97706' : '#C87941' }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Mail size={16} />}
              {loading ? 'Sending OTP…' : 'Send OTP'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500">
            Remember your password?{' '}
            <Link to="/login" className="font-medium hover:underline" style={{ color: '#C87941' }}>
              Back to Login
            </Link>
          </p>
        </div>

        {/* Branding */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <Gem size={16} className="text-rose-400" />
          <span className="font-serif text-sm text-stone-400">RKL Trove</span>
        </div>
      </div>
    </div>
  )
}
