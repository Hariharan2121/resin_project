import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Gem, Loader2, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill all fields.')
    
    const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/login`;
    console.log('Attempting login to:', apiUrl);
    // toast.loading(`Connecting to: ${apiUrl}`); // Temporary debug
    
    setLoading(true)
    try {
      const res = await axios.post(apiUrl, form)
      login(res.data.user, res.data.token)
      toast.success(`Welcome back, ${res.data.user.name}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-cream-100 to-cream-200 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-card p-8 sm:p-10 animate-slide-up">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-50 mb-4">
              <Gem size={28} className="text-rose-500" />
            </div>
            <h1 className="font-serif text-3xl font-semibold text-stone-800">Welcome back</h1>
            <p className="text-sm text-stone-500 mt-1">Sign in to your RKL Trove account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="form-label mb-0">Password</label>
                <Link
                  to="/forgot-password"
                  id="forgot-password-link"
                  className="text-xs font-medium hover:underline"
                  style={{ color: '#C87941' }}
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="input-field pr-11"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-rose-600 hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
