import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, Globe } from '@phosphor-icons/react/dist/ssr'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import type { Product, Comment } from '@/lib/types'
import CommentSection from '@/components/CommentSection'

export const revalidate = 60

async function getProduct(slug: string): Promise<Product | null> {
  const rows = await sql`
    select * from products
    where slug = ${slug} and approved = true
    limit 1
  `
  return (rows[0] as Product) ?? null
}

async function getComments(slug: string): Promise<Comment[]> {
  const rows = await sql`
    select * from comments
    where product_slug = ${slug}
    order by created_at asc
  `
  return rows as Comment[]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return {}
  return {
    title: product.name,
    description: product.tagline ?? undefined,
    openGraph: {
      title: product.name,
      description: product.tagline ?? undefined,
      type: 'website',
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()
  const [initialComments, session] = await Promise.all([
    getComments(slug),
    getSession(),
  ])

  const formattedDate = new Date(product.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="min-h-[100dvh] px-6 pt-28 pb-32">
      <div className="max-w-[800px] mx-auto">
        {/* Back */}
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm text-[#8A8A85] hover:text-[#18181A] transition-colors duration-200 mb-12"
        >
          <ArrowLeft size={14} weight="bold" />
          All products
        </Link>

        {/* Product header card */}
        <div className="p-[6px] rounded-[2rem] bg-[#F5F1E8] border border-[#E8E4DC] mb-10">
          <div className="bg-white rounded-[calc(2rem_-_6px)] p-8 md:p-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
            {/* Category badge + date */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              {product.category && (
                <span className="inline-block text-[10px] uppercase tracking-[0.15em] font-medium text-[#8A8A85] bg-[#F5F1E8] px-2.5 py-1 rounded-full">
                  {product.category}
                </span>
              )}
              <time className="text-xs text-[#8A8A85]">{formattedDate}</time>
            </div>

            {/* Name */}
            <h1 className="font-serif text-4xl md:text-5xl text-[#18181A] tracking-tight leading-tight mb-4">
              {product.name}
            </h1>

            {/* Tagline */}
            <p className="text-xl text-[#8A8A85] leading-relaxed mb-8">
              {product.tagline}
            </p>

            {/* Description */}
            {product.description && (
              <p className="text-base text-[#3A3A3C] leading-relaxed mb-8">
                {product.description}
              </p>
            )}

            {/* Footer row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-[#E8E4DC]">
              <div className="text-sm text-[#8A8A85]">
                Made by <span className="text-[#18181A] font-medium">{product.maker_name}</span>
              </div>

              {product.url && (
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex items-center gap-2 text-sm font-medium
                    bg-[#18181A] text-[#FAFAF6] rounded-full px-5 py-2.5
                    hover:bg-[#2A2A2C] active:scale-[0.97]
                    transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                    group
                  "
                >
                  <Globe size={14} />
                  Visit product
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                    <ArrowUpRight size={10} weight="bold" />
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {product.tags.map((tag: string) => (
              <span
                key={tag}
                className="inline-block text-xs font-medium text-[#8A8A85] bg-[#F5F1E8] border border-[#E8E4DC] px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Comment section */}
        <CommentSection
          productSlug={slug}
          initialComments={initialComments}
          session={session}
        />
      </div>
    </div>
  )
}
