import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Loader2, KeyRound, Eye, EyeOff, Sparkles, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { resetPassword } from '../services/api'

function getStrength(password) {
  let score = 0
  if (password.length >= 8) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  return score 
}

const strengthConfig = {
  0: { label: 'Fragile', color: '#666' },
  1: { label: 'Soft', color: '#E74C3C' },
  2: { label: 'Solid', color: '#F39C12' },
  3: { label: 'Crystaline', color: '#C87941' },
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
  const [focusedField, setFocusedField] = useState(null)

  useEffect(() => {
    if (!email || !otp) navigate('/forgot-password', { replace: true })
  }, [email, otp, navigate])

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const strength = getStrength(form.newPassword)
  const sc = strengthConfig[strength]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword.length < 6) return toast.error('Key must be at least 6 characters.')
    if (form.newPassword !== form.confirm) return toast.error('Keys do not match.')
    setLoading(true)
    try {
      await resetPassword(email, otp, form.newPassword)
      toast.success('Your new key has been forged!', {
        icon: '💎',
        style: { background: '#FBF5EE', color: '#2C1810', border: '1px solid #C87941' }
      })
      setTimeout(() => navigate('/login', { replace: true }), 2000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to forge key.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FBF5EE] text-[#2C1810] font-sans relative overflow-hidden flex items-center justify-center px-4">
      {/* Background Dot Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.12]" 
           style={{ backgroundImage: 'radial-gradient(#C87941 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      
      <div className="w-full max-w-md relative z-10 animate-fade-slide-up py-10">
        <div className="text-center mb-10">
          <div className="inline-block relative group mb-6">
             <div className="w-16 h-16 rounded-full border border-[#EDD9C0] bg-white flex items-center justify-center shadow-md transition-transform duration-500 group-hover:scale-110">
                <KeyRound className="text-[#C87941]" size={24} />
             </div>
             <div className="absolute -inset-4 bg-[#C87941]/5 rounded-full blur-xl" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-[#2C1810]">Forge New Key</h1>
          <p className="text-[#9C7B65] mt-2 font-light italic">Secure your presence in the Trove</p>
        </div>

        <div className="bg-white rounded-[32px] p-8 sm:p-12 border border-[#EDD9C0] shadow-[0_12px_40px_rgba(44,26,14,0.06)]">
          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            
            {/* New Password */}
            <div className="space-y-2">
              <label htmlFor="rp-new" className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C87941] ml-4">NEW ACCESS KEY</label>
              <div className={`relative flex items-center bg-[#FBF5EE] border-[1.5px] rounded-full h-14 transition-all duration-300 ${focusedField === 'newPassword' ? 'border-[#C87941] ring-4 ring-[#C87941]/5 bg-white' : 'border-[#DEC5A8]'}`}>
                <input
                  id="rp-new"
                  name="newPassword"
                  type={showNew ? 'text' : 'password'}
                  required
                  onFocus={() => setFocusedField('newPassword')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full h-full bg-transparent border-none outline-none pl-6 pr-12 text-[#2C1810] placeholder:text-[#C4A882]/70 placeholder:italic text-sm"
                  placeholder="Minimum 6 characters"
                  value={form.newPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-4 text-[#C4A882] hover:text-[#C87941] transition-colors"
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Strength Indicators */}
              {form.newPassword.length > 0 && (
                <div className="px-4 space-y-2 animate-fade-in mt-3">
                  <div className="flex gap-2">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-1 flex-1 rounded-full overflow-hidden bg-[#EDD9C0]">
                        <div 
                           className="h-full transition-all duration-700 ease-out"
                           style={{ 
                             width: n <= strength ? '100%' : '0%',
                             backgroundColor: sc.color,
                             boxShadow: n <= strength ? `0 0 12px ${sc.color}44` : 'none'
                           }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] uppercase tracking-widest font-black" style={{ color: sc.color }}>{sc.label}</span>
                     {strength < 3 && <span className="text-[9px] text-[#9C7B65] italic tracking-wide"> — add complexity</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="rp-confirm" className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C87941] ml-4">CONFIRM KEY</label>
              <div className={`relative flex items-center bg-[#FBF5EE] border-[1.5px] rounded-full h-14 transition-all duration-300 ${focusedField === 'confirm' ? 'border-[#C87941] ring-4 ring-[#C87941]/5 bg-white' : 'border-[#DEC5A8]'}`}>
                <input
                  id="rp-confirm"
                  name="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  onFocus={() => setFocusedField('confirm')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full h-full bg-transparent border-none outline-none pl-6 pr-12 text-[#2C1810] placeholder:text-[#C4A882]/70 placeholder:italic text-sm"
                  placeholder="Repeat your new key"
                  value={form.confirm}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-4 text-[#C4A882] hover:text-[#C87941] transition-colors"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {form.confirm && (
                 <div className="px-4 animate-fade-in mt-2">
                   {form.newPassword === form.confirm ? (
                     <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded inline-flex">
                       <CheckCircle2 size={12} /> Alignment Perfect
                     </div>
                   ) : (
                     <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-bold uppercase tracking-widest bg-red-50 px-2 py-1 rounded inline-flex">
                       <ShieldAlert size={12} /> Keys Divergent
                     </div>
                   )}
                 </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-full bg-gradient-to-br from-[#C87941] to-[#A0622E] text-white flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(200,121,65,0.25)] hover:shadow-[0_12px_32px_rgba(200,121,65,0.35)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <KeyRound size={18} />
                  <span className="uppercase tracking-[0.15em] text-sm font-bold">Forge New Access</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center">
           <div className="inline-flex items-center gap-2 text-[10px] text-[#B08060] uppercase tracking-[0.3em] font-bold">
              <Sparkles size={10} className="text-[#C87941]" /> Protecting Your Gems with Care
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
