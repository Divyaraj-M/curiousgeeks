'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Eye, EyeSlash, Check } from '@phosphor-icons/react'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (data.ok) {
        setDone(true)
        setTimeout(() => router.push('/signin'), 2500)
      } else {
        setError(data.error ?? 'Something went wrong')
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = `
    w-full px-4 py-3 rounded-xl border border-[#E8E4DC] bg-[#FAFAF6]
    text-sm text-[#18181A] placeholder:text-[#C0BDB5]
    focus:outline-none focus:border-[#F26B3A] focus:ring-2 focus:ring-[#F26B3A]/20
    transition-all duration-200
  `

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center px-6 pt-28 pb-24">
      <div className="max-w-[440px] mx-auto w-full">

        <div className="mb-8">
          <h1 className="font-serif text-4xl text-[#18181A] tracking-tight leading-tight mb-2">Set new password</h1>
          <p className="text-sm text-[#8A8A85]">Choose a strong password for your account.</p>
        </div>

        <div className="p-[6px] rounded-[1.75rem] bg-[#F5F1E8] border border-[#E8E4DC]">
          <div className="bg-white rounded-[calc(1.75rem_-_6px)] px-6 py-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">

            {!token ? (
              <div className="text-center py-4">
                <p className="text-sm text-[#8A8A85] mb-3">Invalid or missing reset link.</p>
                <Link href="/forgot-password" className="text-sm text-[#F26B3A] hover:underline">
                  Request a new one →
                </Link>
              </div>
            ) : done ? (
              <div className="flex flex-col items-center text-center gap-4 py-4">
                <div className="w-12 h-12 rounded-full bg-[#F26B3A]/10 flex items-center justify-center">
                  <Check size={20} weight="bold" className="text-[#F26B3A]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#18181A] mb-1">Password updated</p>
                  <p className="text-xs text-[#8A8A85]">Redirecting you to sign in…</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#8A8A85] uppercase tracking-[0.1em] mb-2">New password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'} required autoFocus minLength={8}
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="At least 8 characters" className={inputClass + ' pr-11'}
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A85] hover:text-[#18181A] transition-colors">
                      {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8A8A85] uppercase tracking-[0.1em] mb-2">Confirm password</label>
                  <input
                    type={showPassword ? 'text' : 'password'} required
                    value={confirm} onChange={e => setConfirm(e.target.value)}
                    placeholder="Same password again" className={inputClass}
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#18181A] text-[#FAFAF6] text-sm font-medium hover:bg-[#2A2A2C] active:scale-[0.98] disabled:opacity-50 transition-all duration-200">
                  {loading ? 'Updating…' : 'Update password'}
                </button>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
