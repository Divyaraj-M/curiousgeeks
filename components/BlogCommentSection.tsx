'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { SessionPayload } from '@/lib/auth'

type BlogComment = {
  id: string
  post_slug: string
  author_name: string
  author_email: string
  body: string
  created_at: string
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const hue = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0"
      style={{ backgroundColor: `hsl(${hue}, 35%, 55%)` }}
    >
      {initials}
    </div>
  )
}

function CommentItem({ comment }: { comment: BlogComment }) {
  const formattedDate = new Date(comment.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
  return (
    <div className="flex gap-3 py-5 border-b border-[#E8E4DC] last:border-0">
      <Avatar name={comment.author_name} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-sm font-medium text-[#18181A]">{comment.author_name}</span>
          <time className="text-xs text-[#8A8A85]">{formattedDate}</time>
        </div>
        <p className="text-sm text-[#3A3A3C] leading-relaxed">{comment.body}</p>
      </div>
    </div>
  )
}

export default function BlogCommentSection({
  postSlug,
  initialComments,
  session,
}: {
  postSlug: string
  initialComments: BlogComment[]
  session: SessionPayload | null
}) {
  const [comments, setComments] = useState<BlogComment[]>(initialComments)
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/blog-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postSlug, body }),
      })
      const data = await res.json()
      if (data.comment) {
        setComments(prev => [...prev, data.comment as BlogComment])
        setBody('')
      } else {
        setError(data.error ?? 'Something went wrong')
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="discussion" className="mt-16 pt-12 border-t border-[#E8E4DC] scroll-mt-24">
      <h2 className="font-serif text-2xl text-[#18181A] tracking-tight mb-8">
        Discussion
        {comments.length > 0 && (
          <span className="ml-2 text-base font-normal text-[#8A8A85] font-sans">
            ({comments.length})
          </span>
        )}
      </h2>

      {/* Comment form */}
      {session ? (
        <form id="write-comment" onSubmit={handleSubmit} className="mb-8">
          <div className="rounded-[1.25rem] border border-[#E8E4DC] bg-white overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-[#E8E4DC]">
              <Avatar name={session.name} />
              <span className="text-sm font-medium text-[#18181A]">{session.name}</span>
            </div>
            <textarea
              rows={3}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="What are your thoughts?"
              className="w-full px-5 py-4 text-sm text-[#18181A] placeholder:text-[#C0BDB5] bg-transparent resize-none focus:outline-none"
            />
            <div className="flex items-center justify-between px-5 py-3 border-t border-[#E8E4DC]">
              {error ? <p className="text-xs text-red-500">{error}</p> : <span />}
              <button
                type="submit"
                disabled={loading || !body.trim()}
                className="flex items-center gap-1.5 text-sm font-medium bg-[#18181A] text-[#FAFAF6] rounded-full px-4 py-2 hover:bg-[#2A2A2C] active:scale-[0.97] disabled:opacity-40 transition-all duration-200"
              >
                {loading ? 'Posting…' : 'Post comment'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded-[1.25rem] border border-[#E8E4DC] bg-[#F5F1E8] px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-[#3A3A3C]">Community members can join the discussion.</p>
          <div className="flex items-center gap-3">
            <Link href={`/signin?from=/blog/${postSlug}`} className="text-sm font-medium text-[#8A8A85] hover:text-[#18181A] transition-colors">
              Sign in
            </Link>
            <Link href="/join" className="flex items-center gap-1.5 text-sm font-medium bg-[#18181A] text-[#FAFAF6] rounded-full px-4 py-2 hover:bg-[#2A2A2C] active:scale-[0.97] transition-all duration-200">
              Join free
            </Link>
          </div>
        </div>
      )}

      {/* Comments list */}
      <div className="rounded-[1.25rem] bg-white border border-[#E8E4DC] overflow-hidden">
        {comments.length === 0 ? (
          <div className="py-12 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-[#F5F1E8] flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2C5.582 2 2 5.134 2 9c0 1.89.832 3.604 2.18 4.86L3 17l4.27-1.27A8.54 8.54 0 0010 16c4.418 0 8-3.134 8-7s-3.582-7-8-7z" stroke="#F26B3A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-[#18181A] mb-1">No comments yet</p>
            <p className="text-xs text-[#8A8A85]">Start the discussion.</p>
          </div>
        ) : (
          <div className="px-5">
            {comments.map(c => <CommentItem key={c.id} comment={c} />)}
          </div>
        )}
      </div>
    </section>
  )
}
