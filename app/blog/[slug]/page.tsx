import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'
import { getAllPosts, getPostBySlug } from '@/lib/posts'

export const revalidate = 3600

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.meta.title,
    description: post.meta.description,
    openGraph: {
      title: post.meta.title,
      description: post.meta.description,
      type: 'article',
      publishedTime: post.meta.date,
      tags: post.meta.tags,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const formattedDate = new Date(post.meta.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="min-h-[100dvh] px-6 pt-28 pb-32">
      <div className="max-w-[1200px] mx-auto">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-[#8A8A85] hover:text-[#18181A] transition-colors duration-200 mb-12"
        >
          <ArrowLeft size={14} weight="bold" />
          All posts
        </Link>

        {/* Post header */}
        <div className="mb-12 stagger-children">
          {/* Tags */}
          {post.meta.tags && post.meta.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.meta.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-block text-[10px] uppercase tracking-[0.15em] font-medium text-[#F26B3A] bg-[#F26B3A]/12 px-2.5 py-1 rounded-full"
                >
                  {tag.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          )}

          <h1 className="font-serif text-4xl md:text-5xl text-[#18181A] tracking-tight leading-tight mb-6 max-w-[24ch]">
            {post.meta.title}
          </h1>

          {post.meta.description && (
            <p className="text-xl text-[#8A8A85] leading-relaxed max-w-[52ch] mb-6">
              {post.meta.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 text-sm text-[#8A8A85]">
            <span>By Divyaraj Murugan</span>
            <span className="text-[#E8E4DC]">·</span>
            <time dateTime={post.meta.date}>{formattedDate}</time>
            {post.meta.readingTime && (
              <>
                <span className="text-[#E8E4DC]">·</span>
                <span>{post.meta.readingTime}</span>
              </>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E8E4DC] mb-12" />

        {/* Article body */}
        <article className="prose">
          <MDXRemote source={post.content} />
        </article>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-[#E8E4DC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-[#18181A] mb-0.5">Written by Divyaraj Murugan</p>
            <p className="text-xs text-[#8A8A85]">Product thinker. Curious Geeks founder.</p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-[#8A8A85] hover:text-[#18181A] transition-colors duration-200"
          >
            <ArrowLeft size={14} weight="bold" />
            Back to all posts
          </Link>
        </div>
      </div>
    </div>
  )
}
