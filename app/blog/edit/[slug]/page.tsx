'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from '@phosphor-icons/react'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

export default function EditPostPage() {
  const router = useRouter()
  const { slug } = useParams<{ slug: string }>()
  const [id, setId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.post) {
          setId(data.post.id)
          setTitle(data.post.title)
          setDescription(data.post.description ?? '')
          setTags((data.post.tags ?? []).join(', '))
          setContent(data.post.content)
          setPublished(data.post.published)
        }
      })
      .finally(() => setFetching(false))
  }, [slug])

  async function submit(publish: boolean) {
    setError('')
    if (!title.trim()) { setError('Title is required'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/blog', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title, description, content, tags, publish }),
      })
      const data = await res.json()
      if (data.ok) {
        router.push(`/blog/${data.slug}`)
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

  if (fetching) return (
    <div className="min-h-[100dvh] flex items-center justify-center">
      <p className="text-sm text-[#8A8A85]">Loading…</p>
    </div>
  )

  return (
    <div className="min-h-[100dvh] px-6 pt-28 pb-24">
      <div className="max-w-[1100px] mx-auto">

        <Link href={`/blog/${slug}`} className="inline-flex items-center gap-1.5 text-sm text-[#8A8A85] hover:text-[#18181A] transition-colors duration-200 mb-10">
          <ArrowLeft size={14} weight="bold" /> Back to post
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-4xl text-[#18181A] tracking-tight leading-tight">Edit post</h1>
          {published && <span className="text-xs font-medium text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded-full">Published</span>}
          {!published && <span className="text-xs font-medium text-[#8A8A85] bg-[#F5F1E8] border border-[#E8E4DC] px-3 py-1 rounded-full">Draft</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-[#8A8A85] uppercase tracking-[0.1em] mb-2">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8A8A85] uppercase tracking-[0.1em] mb-2">Tags (comma separated)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="product-thinking, career" className={inputClass} />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-[#8A8A85] uppercase tracking-[0.1em] mb-2">Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)} className={inputClass} />
        </div>

        <div className="mb-6">
          <label className="block text-xs font-medium text-[#8A8A85] uppercase tracking-[0.1em] mb-2">Content</label>
          <div data-color-mode="light" className="rounded-xl overflow-hidden border border-[#E8E4DC]">
            <MDEditor value={content} onChange={v => setContent(v ?? '')} height={520} preview="live" />
          </div>
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <div className="flex items-center gap-3">
          <button onClick={() => submit(true)} disabled={loading}
            className="px-6 py-3 rounded-xl bg-[#F26B3A] text-white text-sm font-medium hover:bg-[#e05a2a] active:scale-[0.98] disabled:opacity-50 transition-all duration-200">
            {loading ? 'Saving…' : published ? 'Save changes' : 'Publish'}
          </button>
          {published && (
            <button onClick={() => submit(false)} disabled={loading}
              className="px-6 py-3 rounded-xl bg-[#18181A] text-[#FAFAF6] text-sm font-medium hover:bg-[#2A2A2C] active:scale-[0.98] disabled:opacity-50 transition-all duration-200">
              Unpublish
            </button>
          )}
          <Link href={`/blog/${slug}`} className="text-sm text-[#8A8A85] hover:text-[#18181A] transition-colors px-4 py-3">
            Cancel
          </Link>
        </div>

      </div>
    </div>
  )
}
