'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from '@phosphor-icons/react'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('## Start writing...\n\n')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleTitleChange(v: string) {
    setTitle(v)
    if (!slug) {
      setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
    }
  }

  async function submit(publish: boolean) {
    setError('')
    if (!title.trim()) { setError('Title is required'); return }
    if (!content.trim() || content === '## Start writing...\n\n') { setError('Content is required'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, description, content, tags, publish }),
      })
      const data = await res.json()
      if (data.ok) {
        router.push(publish ? `/blog/${data.slug}` : '/blog')
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

  const inputClass = "w-full px-4 py-3 rounded-xl border border-[#E8E4DC] bg-[#FAFAF6] text-sm text-[#18181A] placeholder:text-[#C0BDB5] focus:outline-none focus:border-[#F26B3A] focus:ring-2 focus:ring-[#F26B3A]/20 transition-all duration-200"

  return (
    <div className="min-h-[100dvh] px-6 pt-28 pb-24">
      <div className="max-w-[1100px] mx-auto">

        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-[#8A8A85] hover:text-[#18181A] transition-colors duration-200 mb-10">
          <ArrowLeft size={14} weight="bold" /> Back to blog
        </Link>

        <div className="mb-8">
          <h1 className="font-serif text-4xl text-[#18181A] tracking-tight leading-tight">New post</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-[#8A8A85] uppercase tracking-[0.1em] mb-2">Title *</label>
            <input value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="Post title" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8A8A85] uppercase tracking-[0.1em] mb-2">Slug (URL)</label>
            <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="auto-generated-from-title" className={inputClass} />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-[#8A8A85] uppercase tracking-[0.1em] mb-2">Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="One sentence that makes people click" className={inputClass} />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-[#8A8A85] uppercase tracking-[0.1em] mb-2">Tags (comma separated)</label>
          <input value={tags} onChange={e => setTags(e.target.value)} placeholder="product-thinking, career, hot-take" className={inputClass} />
        </div>

        <div className="mb-6">
          <label className="block text-xs font-medium text-[#8A8A85] uppercase tracking-[0.1em] mb-2">Content *</label>
          <div data-color-mode="light" className="rounded-xl overflow-hidden border border-[#E8E4DC]">
            <MDEditor
              value={content}
              onChange={v => setContent(v ?? '')}
              height={520}
              preview="live"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            onClick={() => submit(true)}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-[#F26B3A] text-white text-sm font-medium hover:bg-[#e05a2a] active:scale-[0.98] disabled:opacity-50 transition-all duration-200"
          >
            {loading ? 'Publishing…' : 'Publish'}
          </button>
          <button
            onClick={() => submit(false)}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-[#18181A] text-[#FAFAF6] text-sm font-medium hover:bg-[#2A2A2C] active:scale-[0.98] disabled:opacity-50 transition-all duration-200"
          >
            {loading ? 'Saving…' : 'Save draft'}
          </button>
          <Link href="/blog" className="text-sm text-[#8A8A85] hover:text-[#18181A] transition-colors px-4 py-3">
            Cancel
          </Link>
        </div>

      </div>
    </div>
  )
}
