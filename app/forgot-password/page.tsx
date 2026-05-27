'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check } from '@phosphor-icons/react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center px-6 pt-28 pb-24">
      <div className="max-w-[440px] mx-auto w-full">

        <Link
          href="/signin"
          className="inline-flex items-center gap-1.5 text-sm text-[#8A8A85] hover:text-[#18181A] transition-colors duration-200 mb-12"
        >
          <ArrowLeft size={14} weight="bold" />
          Back to sign in
        </Link>

        <div className="mb-8">
          <h1 className="font-serif text-4xl text-[#18181A] tracking-tight leading-tight mb-2">
            Forgot password
          </h1>
          <p className="text-sm text-[#8A8A85]">
            Enter your email and we'll send a reset link.
          </p>
        </div>

        <div className="p-[6px] rounded-[1.75rem] bg-[#F5F1E8] border border-[#E8E4DC]">
          <div className="bg-white rounded-[calc(1.75rem_-_6px)] px-6 py-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">

            {sent ? (
              <div className="flex flex-col items-center text-center gap-4 py-4">
                <div className="w-12 h-12 rounded-full bg-[#F26B3A]/10 flex items-center justify-center">
                  <Check size={20} weight="bold" className="text-[#F26B3A]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#18181A] mb-1">Check your email</p>
                  <p className="text-xs text-[#8A8A85]">
                    If an account exists for <strong>{email}</strong>, a reset link has been sent. Check your spam folder too.
                  </p>
                </div>
                <Link href="/signin" className="text-sm text-[#F26B3A] hover:underline">
                  Back to sign in →
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#8A8A85] uppercase tracking-[0.1em] mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="
                      w-full px-4 py-3 rounded-xl border border-[#E8E4DC] bg-[#FAFAF6]
                      text-sm text-[#18181A] placeholder:text-[#C0BDB5]
                      focus:outline-none focus:border-[#F26B3A] focus:ring-2 focus:ring-[#F26B3A]/20
                      transition-all duration-200
                    "
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full py-3 rounded-xl bg-[#18181A] text-[#FAFAF6] text-sm font-medium
                    hover:bg-[#2A2A2C] active:scale-[0.98] disabled:opacity-50
                    transition-all duration-200
                  "
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}
