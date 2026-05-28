import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { ArrowLeft, PencilSimple } from '@phosphor-icons/react/dist/ssr'
import { getAllPosts, getPostBySlug, ADMIN_EMAIL } from '@/lib/posts'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import type { PostMeta } from '@/lib/types'
import TableOfContents, { type Heading } from '@/components/TableOfContents'
import BlogCard from '@/components/BlogCard'
import BlogCommentSection from '@/components/BlogCommentSection'

export const revalidate = 60

export async function generateStaticParams() {
  const { readdirSync, existsSync } = await import('fs')
  const { join } = await import('path')
  const dir = join(process.cwd(), 'content/blog')
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => ({ slug: f.replace(/\.md$/, '') }))
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
      description: post.meta.description ?? undefined,
      type: 'article',
      publishedTime: post.meta.date,
      tags: post.meta.tags,
    },
  }
}

function headingId(children: React.ReactNode): string {
  const text = Array.isArray(children)
    ? children.map(c => (typeof c === 'string' ? c : '')).join('')
    : typeof children === 'string' ? children : ''
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const mdxComponents = {
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 id={headingId(children)} className="scroll-mt-24" {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 id={headingId(children)} className="scroll-mt-24" {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 id={headingId(children)} className="scroll-mt-24" {...props}>{children}</h3>
  ),
}

function extractHeadings(content: string): Heading[] {
  return content
    .split('\n')
    .filter(line => /^#{1,3} /.test(line))
    .map(line => {
      const match = line.match(/^(#{1,3}) (.+)/)
      if (!match) return null
      const level = match[1].length
      const text = match[2].replace(/[`*_[\]()#]/g, '').trim()
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      return { level, text, id }
    })
    .filter((h): h is Heading => h !== null)
}

function getRelatedPosts(allPosts: PostMeta[], current: PostMeta): PostMeta[] {
  const currentTags = new Set(current.tags)
  if (!currentTags.size) return []
  return allPosts
    .filter(p => p.slug !== current.slug)
    .map(p => ({ p, score: p.tags.filter(t => currentTags.has(t)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ p }) => p)
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [post, allPosts, session] = await Promise.all([
    getPostBySlug(slug),
    getAllPosts(),
    getSession(),
  ])
  if (!post) notFound()

  const blogCommentsRows = await sql`
    select * from blog_comments where post_slug = ${slug} order by created_at asc
  `
  const initialComments = blogCommentsRows as {
    id: string; post_slug: string; author_name: string;
    author_email: string; body: string; created_at: string
  }[]

  const isAdmin = session?.email === ADMIN_EMAIL
  const headings = extractHeadings(post.content)
  const relatedPosts = getRelatedPosts(allPosts, post.meta)
  const tags = post.meta.tags ?? []

  const [y, m, d] = (post.meta.date || '').split('-').map(Number)
  const formattedDate = y
    ? new Date(y, m - 1, d).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      })
    : ''

  return (
    <div className="min-h-[100dvh] px-6 pt-28 pb-32">
      <div className="max-w-[1200px] mx-auto">

        {/* Top nav row */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-[#8A8A85] hover:text-[#18181A] transition-colors duration-200">
            <ArrowLeft size={14} weight="bold" />
            All posts
          </Link>
          {isAdmin && (
            <Link
              href={`/blog/edit/${slug}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F26B3A]/10 text-[#F26B3A] text-xs font-medium hover:bg-[#F26B3A]/20 transition-colors duration-200"
            >
              <PencilSimple size={13} weight="bold" />
              Edit post
            </Link>
          )}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_240px] gap-16">

          {/* Left — article */}
          <div>
            {/* Post header */}
            <div className="mb-12 stagger-children">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {tags.map(tag => (
                    <span key={tag} className="inline-block text-[10px] uppercase tracking-[0.15em] font-medium text-[#F26B3A] bg-[#F26B3A]/12 px-2.5 py-1 rounded-full">
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

            <div className="border-t border-[#E8E4DC] mb-12" />

            <article className="prose">
              <MDXRemote source={post.content} components={mdxComponents} />
            </article>

            {/* Author footer */}
            <div className="mt-16 pt-8 border-t border-[#E8E4DC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <p className="text-sm font-medium text-[#18181A] mb-0.5">Written by Divyaraj Murugan</p>
                <p className="text-xs text-[#8A8A85]">Product thinker. Curious Geeks founder.</p>
              </div>
              <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-[#8A8A85] hover:text-[#18181A] transition-colors duration-200">
                <ArrowLeft size={14} weight="bold" />
                Back to all posts
              </Link>
            </div>

            {/* Discussion / comments */}
            <BlogCommentSection
              postSlug={slug}
              initialComments={initialComments}
              session={session}
            />

            {/* Related articles */}
            {relatedPosts.length > 0 && (
              <section className="mt-16 pt-12 border-t border-[#E8E4DC]">
                <h2 className="font-serif text-2xl text-[#18181A] tracking-tight mb-8">
                  Related reads
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedPosts.map(p => (
                    <BlogCard key={p.slug} post={p} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right — sticky sidebar */}
          <aside className="hidden xl:block">
            <div className="sticky top-28 space-y-8">

              {/* Table of contents */}
              <TableOfContents headings={headings} />

              {/* Tags */}
              {tags.length > 0 && (
                <div className={headings.length > 0 ? 'pt-8 border-t border-[#E8E4DC]' : ''}>
                  <p className="text-[10px] uppercase tracking-[0.15em] font-medium text-[#8A8A85] mb-3">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-block text-[10px] uppercase tracking-[0.12em] font-medium text-[#F26B3A] bg-[#F26B3A]/10 px-2.5 py-1 rounded-full"
                      >
                        {tag.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Discussion widget */}
              <div className="pt-8 border-t border-[#E8E4DC]">
                <p className="text-[10px] uppercase tracking-[0.15em] font-medium text-[#8A8A85] mb-4">
                  Discussion
                </p>
                <a
                  href="#discussion"
                  className="flex items-center gap-2.5 text-sm text-[#3A3A3C] hover:text-[#F26B3A] transition-colors duration-200 mb-3 group"
                >
                  <span className="w-7 h-7 rounded-full bg-[#F26B3A]/10 text-[#F26B3A] text-xs flex items-center justify-center font-semibold group-hover:bg-[#F26B3A] group-hover:text-white transition-colors duration-200">
                    {initialComments.length}
                  </span>
                  {initialComments.length === 1 ? '1 comment' : `${initialComments.length} comments`}
                </a>
                <a
                  href="#write-comment"
                  className="text-xs font-medium text-[#F26B3A] hover:underline"
                >
                  Write a comment →
                </a>
              </div>

            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}
