import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Loader2, Mail, Sparkles, ArrowLeft, Key } from 'lucide-react'
import { forgotPassword } from '../services/api'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return toast.error('Please enter your email address.')
    setLoading(true)
    try {
      await forgotPassword(email.trim())
      toast.success('Recovery key dispatched!', {
        icon: '📨',
        style: { background: '#FBF5EE', color: '#2C1810', border: '1px solid #C87941' }
      })
      navigate('/verify-otp', { state: { email: email.trim() } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch recovery key.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FBF5EE] relative overflow-hidden flex items-center justify-center px-4 font-sans">
      {/* Background Dot Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.12]" 
           style={{ backgroundImage: 'radial-gradient(#C87941 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      
      <div className="w-full max-w-md relative z-10 animate-fade-slide-up">
        <div className="text-center mb-10">
          <div className="inline-block relative group">
             <div className="w-16 h-16 rounded-full border border-[#EDD9C0] bg-white flex items-center justify-center shadow-md transition-transform duration-500 group-hover:scale-110">
                <Key className="text-[#C87941]" size={24} />
             </div>
             <div className="absolute -inset-4 bg-[#C87941]/5 rounded-full blur-xl" />
          </div>
          <h1 className="mt-8 text-4xl font-serif font-bold text-[#2C1810]">Recover Access</h1>
          <p className="text-[#9C7B65] mt-2 font-light italic">Summon your entry to the Trove</p>
        </div>

        <div className="bg-white rounded-[32px] p-8 sm:p-12 border border-[#EDD9C0] shadow-[0_12px_40px_rgba(44,26,14,0.06)]">
          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            <div className="space-y-2">
              <label htmlFor="fp-email" className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C87941] ml-4">CURATED EMAIL</label>
              <div className={`
                relative flex items-center bg-[#FBF5EE] border-[1.5px] rounded-full h-14 transition-all duration-300
                ${isFocused ? 'border-[#C87941] ring-4 ring-[#C87941]/5 bg-white' : 'border-[#DEC5A8]'}
              `}>
                <Mail className={`absolute left-4 transition-colors ${isFocused ? 'text-[#C87941]' : 'text-[#B08060]'}`} size={18} />
                <input
                  id="fp-email"
                  type="email"
                  required
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-full h-full bg-transparent border-none outline-none pl-12 pr-4 text-[#2C1810] placeholder:text-[#C4A882]/70 placeholder:italic text-sm"
                  placeholder="name@exclusive.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-full bg-gradient-to-br from-[#C87941] to-[#A0622E] text-white flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(200,121,65,0.25)] hover:shadow-[0_12px_32px_rgba(200,121,65,0.35)] transition-all hover:scale-[1.02] active:scale-95"
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <Mail size={18} />
                  <span className="uppercase tracking-widest text-sm font-bold">Request Access</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-[#C87941] hover:text-[#8B4513] font-bold text-sm transition-all group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Entry
            </Link>
          </p>
        </div>

        <div className="mt-12 text-center">
           <div className="inline-flex items-center gap-2 text-[10px] text-[#B08060] uppercase tracking-[0.3em] font-bold">
              <Sparkles size={10} className="text-[#C87941]" /> Ensuring Eternal Integrity
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
