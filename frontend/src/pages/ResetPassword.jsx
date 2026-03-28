import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Gem, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react'
import { resetPassword } from '../services/api'

function getStrength(password) {
  let score = 0
  if (password.length >= 8) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  if (score === 0 && password.length > 0) score = 0
  return score // 0: none, 1: weak, 2: medium, 3: strong
}

const strengthConfig = {
  0: { label: '', color: '#e5e7eb', bars: 0 },
  1: { label: 'Weak', color: '#ef4444', bars: 1 },
  2: { label: 'Medium', color: '#f97316', bars: 2 },
  3: { label: 'Strong', color: '#22c55e', bars: 3 },
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const otp = location.state?.otp || ''

  const [form, setForm] = useState({ newPassword: '', confirm: '' })
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!email || !otp) navigate('/forgot-password', { replace: true })
  }, [email, otp, navigate])

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const strength = getStrength(form.newPassword)
  const sc = strengthConfig[strength]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword.length < 6) return toast.error('Password must be at least 6 characters.')
    if (form.newPassword !== form.confirm) return toast.error('Passwords do not match.')
    setLoading(true)
    try {
      await resetPassword(email, otp, form.newPassword)
      toast.success('Password reset successfully! Please login.')
      setTimeout(() => navigate('/login', { replace: true }), 2000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-cream-100 to-cream-200 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-card p-8 sm:p-10 animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 mb-4">
              <KeyRound size={28} className="text-amber-600" />
            </div>
            <h1 className="font-serif text-3xl font-semibold text-stone-800">Reset Password</h1>
            <p className="text-sm text-stone-500 mt-1">Choose a strong new password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* New Password */}
            <div>
              <label htmlFor="rp-new" className="form-label">New Password</label>
              <div className="relative">
                <input
                  id="rp-new"
                  name="newPassword"
                  type={showNew ? 'text' : 'password'}
                  required
                  className="input-field pr-11"
                  placeholder="Min. 6 characters"
                  value={form.newPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  tabIndex={-1}
                  aria-label="Toggle new password visibility"
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Strength bar */}
              {form.newPassword.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className="h-1.5 flex-1 rounded-full transition-all duration-300"
                        style={{ background: n <= strength ? sc.color : '#e5e7eb' }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium" style={{ color: sc.color }}>
                    {sc.label}
                    {strength < 3 && (
                      <span className="text-stone-400 font-normal ml-1">
                        — add {strength < 1 ? 'letters, numbers & symbols' : strength < 2 ? 'numbers & symbols' : 'a symbol'}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="rp-confirm" className="form-label">Confirm New Password</label>
              <div className="relative">
                <input
                  id="rp-confirm"
                  name="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  className="input-field pr-11"
                  placeholder="Re-enter your new password"
                  value={form.confirm}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  tabIndex={-1}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.confirm && form.newPassword !== form.confirm && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
              )}
              {form.confirm && form.newPassword === form.confirm && (
                <p className="text-xs text-green-500 mt-1">✓ Passwords match</p>
              )}
            </div>

            <button
              type="submit"
              id="reset-password-btn"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl"
              style={{ background: '#C87941' }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={16} />}
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          <Gem size={16} className="text-rose-400" />
          <span className="font-serif text-sm text-stone-400">RKL Trove</span>
        </div>
      </div>
    </div>
  )
}
