'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowUpRight } from '@phosphor-icons/react'

const CATEGORIES = ['Tool', 'App', 'Resource', 'Library', 'Other']
const STAGES = ['Idea', 'In Progress', 'Launched']

type State = 'idle' | 'loading' | 'error'

export default function SubmitProductPage() {
  const router = useRouter()
  const [state, setState] = useState<State>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const [form, setForm] = useState({
    name: '',
    url: '',
    tagline: '',
    description: '',
    category: '',
    tags: '',
    stage: '',
  })

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/products/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (res.status === 401) {
        router.push('/signin?from=/products/submit')
        return
      }
      if (data.ok && data.slug) {
        router.push(`/products/${data.slug}`)
      } else {
        setState('error')
        setErrorMsg(data.error ?? 'Something went wrong')
      }
    } catch {
      setState('error')
      setErrorMsg('Network error — please try again')
    }
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
      <div className="max-w-[720px] mx-auto">

        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm text-[#8A8A85] hover:text-[#18181A] transition-colors duration-200 mb-12"
        >
          <ArrowLeft size={14} weight="bold" />
          All products
        </Link>

        <div className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl text-[#18181A] tracking-tight leading-tight mb-4">
            Submit a product
          </h1>
          <p className="text-base text-[#8A8A85] leading-relaxed">
            Share something you've made with the Curious Geeks community. Your product goes live immediately.
          </p>
        </div>

        <div className="p-[6px] rounded-[1.75rem] bg-[#F5F1E8] border border-[#E8E4DC]">
          <div className="bg-white rounded-[calc(1.75rem_-_6px)] px-6 md:px-8 py-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Name */}
              <div>
                <label className={labelClass}>Product name <span className="text-[#F26B3A]">*</span></label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={form.name}
                  onChange={set('name')}
                  placeholder="My awesome tool"
                  className={inputClass}
                />
              </div>

              {/* URL */}
              <div>
                <label className={labelClass}>Product URL <span className="text-[#F26B3A]">*</span></label>
                <input
                  type="url"
                  required
                  value={form.url}
                  onChange={set('url')}
                  placeholder="https://myproduct.com"
                  className={inputClass}
                />
              </div>

              {/* Tagline */}
              <div>
                <label className={labelClass}>Tagline <span className="text-[#F26B3A]">*</span></label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={form.tagline}
                  onChange={set('tagline')}
                  placeholder="One sentence that captures what it does"
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Tell the community more about what you built, why you built it, and who it's for…"
                  className={inputClass + ' resize-none'}
                />
              </div>

              {/* Category + Stage side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    value={form.category}
                    onChange={set('category')}
                    className={inputClass}
                  >
                    <option value="">Select…</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Stage</label>
                  <select
                    value={form.stage}
                    onChange={set('stage')}
                    className={inputClass}
                  >
                    <option value="">Select…</option>
                    {STAGES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className={labelClass}>Tags</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={set('tags')}
                  placeholder="ai, productivity, open-source (comma-separated)"
                  className={inputClass}
                />
              </div>

              {errorMsg && (
                <p className="text-sm text-red-500">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={state === 'loading'}
                className="
                  w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
                  bg-[#18181A] text-[#FAFAF6] text-sm font-medium
                  hover:bg-[#2A2A2C] active:scale-[0.98] disabled:opacity-50
                  transition-all duration-200
                "
              >
                {state === 'loading' ? 'Submitting…' : 'Submit product'}
                {state !== 'loading' && <ArrowUpRight size={14} weight="bold" />}
              </button>

            </form>
          </div>
        </div>

        <p className="text-xs text-[#8A8A85] text-center mt-6">
          You must be a community member to submit.{' '}
          <Link href="/join" className="text-[#F26B3A] hover:underline">
            Join first →
          </Link>
        </p>

      </div>
    </div>
  )
}
