'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, ArrowUpRight, Eye, EyeSlash } from '@phosphor-icons/react'

const perks = [
  "Share products you've built with real people",
  'Leave comments on community products',
  'Be part of a community that notices things',
  'No newsletters. No spam. Ever.',
]

type Step = 'form' | 'otp' | 'done'


export default function JoinPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('form')
  const [pendingEmail, setPendingEmail] = useState('')
  const [code, setCode] = useState('')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const codeRef = useRef<HTMLInputElement>(null)

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')
    if (form.password !== form.confirm) { setErrorMsg('Passwords do not match'); return }
    if (form.password.length < 8) { setErrorMsg('Password must be at least 8 characters'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/members/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (data.ok) {
        setPendingEmail(data.pendingEmail)
        setStep('otp')
        setTimeout(() => codeRef.current?.focus(), 100)
      } else {
        setErrorMsg(data.error ?? 'Something went wrong')
      }
    } catch {
      setErrorMsg('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-signup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, code }),
      })
      const data = await res.json()
      if (data.ok) {
        setStep('done')
        setTimeout(() => { router.push('/'); router.refresh() }, 2000)
      } else {
        setErrorMsg(data.error ?? 'Something went wrong')
      }
    } catch {
      setErrorMsg('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  async function resendOtp() {
    setErrorMsg('')
    setCode('')
    await fetch('/api/members/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password }),
    })
  }

  const inputClass = `
    w-full px-4 py-3 rounded-xl border border-[#E8E4DC] bg-[#FAFAF6]
    text-sm text-[#18181A] placeholder:text-[#C0BDB5]
    focus:outline-none focus:border-[#F26B3A] focus:ring-2 focus:ring-[#F26B3A]/20
    transition-all duration-200
  `
  const labelClass = "block text-xs font-medium text-[#8A8A85] uppercase tracking-[0.1em] mb-2"

  return (
    <div className="min-h-[100dvh] px-6 pt-28 pb-24">
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">

        {/* Left: pitch */}
        <div className="stagger-children">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#8A8A85] hover:text-[#18181A] transition-colors duration-200 mb-12">
            <ArrowLeft size={14} weight="bold" />
            Back home
          </Link>
          <h1 className="font-serif text-4xl md:text-5xl text-[#18181A] tracking-tight leading-tight mb-6">Join Curious Geeks</h1>
          <p className="text-lg text-[#8A8A85] leading-relaxed mb-10">A small community for people who build things and pay attention.</p>
          <ul className="space-y-3">
            {perks.map(perk => (
              <li key={perk} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#F26B3A]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} weight="bold" className="text-[#F26B3A]" />
                </span>
                <span className="text-sm text-[#3A3A3C] leading-relaxed">{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: form card */}
        <div className="p-[6px] rounded-[1.75rem] bg-[#F5F1E8] border border-[#E8E4DC]">
          <div className="bg-white rounded-[calc(1.75rem_-_6px)] px-6 py-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">

            {/* Done */}
            {step === 'done' && (
              <div className="flex flex-col items-center text-center py-8 gap-4">
                <div className="w-14 h-14 rounded-full bg-[#F26B3A]/10 flex items-center justify-center">
                  <Check size={24} weight="bold" className="text-[#F26B3A]" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl text-[#18181A] tracking-tight mb-2">Welcome aboard!</h2>
                  <p className="text-sm text-[#8A8A85]">You're in. Redirecting you home…</p>
                </div>
              </div>
            )}

            {/* OTP step */}
            {step === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div className="text-center mb-2">
                  <p className="text-sm font-medium text-[#18181A] mb-1">Check your email</p>
                  <p className="text-xs text-[#8A8A85]">We sent a 6-digit code to <strong>{pendingEmail}</strong></p>
                </div>

                <div>
                  <label className={labelClass}>Confirmation code</label>
                  <input
                    ref={codeRef}
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    required
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className={inputClass + ' text-2xl tracking-[0.3em] text-center font-mono'}
                  />
                </div>

                {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#18181A] text-[#FAFAF6] text-sm font-medium hover:bg-[#2A2A2C] active:scale-[0.98] disabled:opacity-50 transition-all duration-200"
                >
                  {loading ? 'Verifying…' : 'Confirm email'}
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button type="button" onClick={() => { setStep('form'); setCode(''); setErrorMsg('') }}
                    className="text-xs text-[#8A8A85] hover:text-[#18181A] transition-colors">
                    ← Change details
                  </button>
                  <button type="button" onClick={resendOtp}
                    className="text-xs text-[#F26B3A] hover:underline transition-colors">
                    Resend code
                  </button>
                </div>
              </form>
            )}

            {/* Registration form */}
            {step === 'form' && (
              <form onSubmit={handleFormSubmit} className="space-y-4">

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>First name <span className="text-[#F26B3A]">*</span></label>
                    <input type="text" required autoFocus value={form.firstName} onChange={set('firstName')} placeholder="Alex" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Last name <span className="text-[#F26B3A]">*</span></label>
                    <input type="text" required value={form.lastName} onChange={set('lastName')} placeholder="Chen" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Email <span className="text-[#F26B3A]">*</span></label>
                  <input type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Password <span className="text-[#F26B3A]">*</span></label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} required minLength={8} value={form.password} onChange={set('password')} placeholder="At least 8 characters" className={inputClass + ' pr-11'} />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A85] hover:text-[#18181A] transition-colors">
                      {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Confirm password <span className="text-[#F26B3A]">*</span></label>
                  <input type={showPassword ? 'text' : 'password'} required value={form.confirm} onChange={set('confirm')} placeholder="Same password again" className={inputClass} />
                </div>

                {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#18181A] text-[#FAFAF6] text-sm font-medium hover:bg-[#2A2A2C] active:scale-[0.98] disabled:opacity-50 transition-all duration-200">
                  {loading ? 'Sending code…' : 'Create account'}
                  {!loading && <ArrowUpRight size={14} weight="bold" />}
                </button>

                <p className="text-xs text-[#8A8A85] text-center">
                  Already have an account?{' '}
                  <Link href="/signin" className="text-[#F26B3A] hover:underline">Sign in →</Link>
                </p>

              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}
