import type { Metadata } from 'next'
import Link from 'next/link'
import { PencilSimple } from '@phosphor-icons/react/dist/ssr'
import { getAllPosts, ADMIN_EMAIL } from '@/lib/posts'
import { getSession } from '@/lib/auth'
import BlogCard from '@/components/BlogCard'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Writing from the Curious Geeks community. Hot takes, ideas, and observations from people who pay attention.',
}

export default async function BlogPage() {
  const [posts, session] = await Promise.all([getAllPosts(), getSession()])
  const isAdmin = session?.email === ADMIN_EMAIL

  return (
    <div className="min-h-[100dvh] px-6 pt-28 pb-24">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-14">
          <div className="stagger-children">
            <h1 className="font-serif text-5xl md:text-6xl text-[#18181A] tracking-tight leading-tight mb-4">
              The Blog
            </h1>
            <p className="text-lg text-[#8A8A85] max-w-[50ch] leading-relaxed">
              Hot takes, long thoughts, and quiet observations. Unfiltered.
            </p>
          </div>
          {isAdmin && (
            <Link
              href="/blog/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F26B3A] text-white text-sm font-medium hover:bg-[#e05a2a] active:scale-[0.98] transition-all duration-200 shrink-0"
            >
              <PencilSimple size={14} weight="bold" />
              Write post
            </Link>
          )}
        </div>

        {/* Posts grid */}
        {posts.length === 0 ? (
          <div className="p-[6px] rounded-[1.75rem] bg-[#F5F1E8] border border-[#E8E4DC]">
            <div className="bg-white rounded-[calc(1.75rem_-_6px)] px-8 py-20 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
              <p className="text-sm text-[#8A8A85]">No posts yet. Check back soon.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post, i) => (
              <BlogCard key={post.slug} post={post} size={i === 0 ? 'featured' : 'default'} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
