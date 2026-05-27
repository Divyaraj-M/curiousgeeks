'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Eye, EyeSlash } from '@phosphor-icons/react'

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (data.ok) {
        router.push(from)
        router.refresh()
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

        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#8A8A85] hover:text-[#18181A] transition-colors duration-200 mb-12">
          <ArrowLeft size={14} weight="bold" />
          Back home
        </Link>

        <div className="mb-8">
          <h1 className="font-serif text-4xl text-[#18181A] tracking-tight leading-tight mb-2">Sign in</h1>
          <p className="text-sm text-[#8A8A85]">Welcome back to Curious Geeks.</p>
        </div>

        <div className="p-[6px] rounded-[1.75rem] bg-[#F5F1E8] border border-[#E8E4DC]">
          <div className="bg-white rounded-[calc(1.75rem_-_6px)] px-6 py-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-xs font-medium text-[#8A8A85] uppercase tracking-[0.1em] mb-2">Email</label>
                <input
                  type="email" required autoFocus
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" className={inputClass}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-[#8A8A85] uppercase tracking-[0.1em]">Password</label>
                  <Link href="/forgot-password" className="text-xs text-[#F26B3A] hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} required
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Your password" className={inputClass + ' pr-11'}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A85] hover:text-[#18181A] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#18181A] text-[#FAFAF6] text-sm font-medium hover:bg-[#2A2A2C] active:scale-[0.98] disabled:opacity-50 transition-all duration-200">
                {loading ? 'Signing in…' : 'Sign in'}
              </button>

            </form>
          </div>
        </div>

        <p className="text-xs text-[#8A8A85] text-center mt-6">
          Don't have an account?{' '}
          <Link href="/join" className="text-[#F26B3A] hover:underline">Join Curious Geeks →</Link>
        </p>

      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  )
}
