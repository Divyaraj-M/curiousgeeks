import Link from 'next/link'
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr'
import { sql } from '@/lib/db'
import type { Product } from '@/lib/types'
import { getAllPosts } from '@/lib/posts'
import ProductCard from '@/components/ProductCard'
import BlogCard from '@/components/BlogCard'

export const revalidate = 60

async function getRecentProducts(): Promise<Product[]> {
  const rows = await sql`
    select * from products
    where approved = true
    order by created_at desc
    limit 6
  `
  return rows as Product[]
}

async function getMemberCount(): Promise<number> {
  const rows = await sql`select count(*) as count from members`
  return Number(rows[0].count)
}

export default async function HomePage() {
  const [products, allPosts, memberCount] = await Promise.all([
    getRecentProducts(),
    getAllPosts(),
    getMemberCount(),
  ])
  const recentPosts = allPosts.slice(0, 3)

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[100dvh] flex flex-col justify-center px-6 pt-28 pb-16">
        {/* Background orbs — atmospheric warm decoration */}
        <div className="orb-1 absolute -top-32 -left-32 w-[560px] h-[560px] rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle at center, oklch(0.74 0.160 42 / 0.18) 0%, transparent 70%)' }} />
        <div className="orb-2 absolute -bottom-24 right-[-80px] w-[480px] h-[480px] rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle at center, oklch(0.80 0.130 55 / 0.14) 0%, transparent 70%)' }} />
        <div className="orb-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle at center, oklch(0.93 0.045 55 / 0.10) 0%, transparent 60%)' }} />

        <div className="relative z-10 max-w-[1200px] mx-auto w-full grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 md:gap-16 items-center">
          {/* Left: copy */}
          <div className="stagger-children">
            <h1 className="font-serif text-5xl md:text-7xl text-[#18181A] tracking-tight leading-[1.05] mb-6 max-w-[14ch]">
              A community of people who{' '}
              <em className="not-italic text-[#F26B3A]">notice things.</em>
            </h1>

            <p className="text-lg text-[#8A8A85] leading-relaxed max-w-[46ch] mb-10">
              Products, writing, and ideas from builders who pay attention. Share what you've made. Discover what others are building.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Primary */}
              <Link
                href="/join"
                className="
                  inline-flex items-center gap-2.5 font-medium text-sm
                  bg-[#18181A] text-[#FAFAF6] rounded-full px-6 py-3
                  hover:bg-[#2A2A2C] active:scale-[0.97]
                  transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                  group
                "
              >
                Join the community
                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                  <ArrowUpRight size={11} weight="bold" />
                </span>
              </Link>

              {/* Secondary */}
              <Link
                href="/products"
                className="
                  inline-flex items-center gap-1.5 font-medium text-sm
                  text-[#8A8A85] hover:text-[#18181A]
                  transition-colors duration-200 px-2 py-3
                "
              >
                See all products
                <ArrowUpRight size={13} weight="bold" />
              </Link>
            </div>
          </div>

          {/* Right: floating stat cards */}
          <div className="hidden md:flex flex-col gap-3 items-end">
            {/* Stat card 1 — Geeks */}
            <div className="p-[5px] rounded-[1.25rem] bg-[#F26B3A]/10 border border-[#F26B3A]/20">
              <div className="bg-white rounded-[calc(1.25rem_-_5px)] px-5 py-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] min-w-[160px]">
                <p className="text-3xl font-serif text-[#F26B3A] tracking-tight">{memberCount}</p>
                <p className="text-xs text-[#8A8A85] mt-0.5 uppercase tracking-[0.12em] font-medium">Geeks so far</p>
              </div>
            </div>
            {/* Stat card 2 — Products */}
            <div className="p-[5px] rounded-[1.25rem] bg-[#F5F1E8] border border-[#E8E4DC]">
              <div className="bg-white rounded-[calc(1.25rem_-_5px)] px-5 py-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] min-w-[160px]">
                <p className="text-3xl font-serif text-[#18181A] tracking-tight">{products.length}+</p>
                <p className="text-xs text-[#8A8A85] mt-0.5 uppercase tracking-[0.12em] font-medium">Products shared</p>
              </div>
            </div>
            {/* Stat card 3 — Blog posts */}
            <div className="p-[5px] rounded-[1.25rem] bg-[#F5F1E8] border border-[#E8E4DC]">
              <div className="bg-white rounded-[calc(1.25rem_-_5px)] px-5 py-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] min-w-[160px]">
                <p className="text-3xl font-serif text-[#18181A] tracking-tight">{allPosts.length}</p>
                <p className="text-xs text-[#8A8A85] mt-0.5 uppercase tracking-[0.12em] font-medium">Blog posts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── RECENT PRODUCTS ──────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-[1200px] mx-auto">
          {/* Section header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-serif text-3xl text-[#18181A] tracking-tight">Products</h2>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1.5 text-sm text-[#8A8A85] hover:text-[#18181A] transition-colors duration-200"
            >
              See all <ArrowUpRight size={13} weight="bold" />
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="p-[6px] rounded-[1.75rem] bg-[#F5F1E8] border border-[#E8E4DC]">
              <div className="bg-white rounded-[calc(1.75rem_-_6px)] px-8 py-14 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
                <p className="text-sm text-[#8A8A85] mb-4">No products yet. Be the first to share something.</p>
                <Link
                  href="/products/submit"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#F26B3A] hover:underline"
                >
                  Submit a product <ArrowUpRight size={13} weight="bold" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  size={i === 0 ? 'featured' : 'default'}
                />
              ))}
            </div>
          )}

          {/* Submit CTA */}
          <div className="mt-6 text-center">
            <Link
              href="/products/submit"
              className="inline-flex items-center gap-1.5 text-sm text-[#8A8A85] hover:text-[#F26B3A] transition-colors duration-200"
            >
              Have something to share? Submit your product
              <ArrowUpRight size={13} weight="bold" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── DIVIDER ──────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="border-t border-[#E8E4DC]" />
      </div>

      {/* ─── RECENT POSTS ─────────────────────────────────────────── */}
      {recentPosts.length > 0 && (
        <section className="px-6 py-20">
          <div className="max-w-[1200px] mx-auto">
            {/* Section header */}
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-serif text-3xl text-[#18181A] tracking-tight">Writing</h2>
              </div>
              <Link
                href="/blog"
                className="flex items-center gap-1.5 text-sm text-[#8A8A85] hover:text-[#18181A] transition-colors duration-200"
              >
                See all <ArrowUpRight size={13} weight="bold" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentPosts.map((post, i) => (
                <BlogCard
                  key={post.slug}
                  post={post}
                  size={i === 0 ? 'featured' : 'default'}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── COMMUNITY CTA ────────────────────────────────────────── */}
      <section className="px-6 pb-24">
        <div className="max-w-[1200px] mx-auto">
          <div className="p-[6px] rounded-[2rem] bg-[#F5F1E8] border border-[#E8E4DC]">
            <div className="
              bg-[#18181A] rounded-[calc(2rem_-_6px)]
              px-10 py-14 md:py-20
              shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]
              text-center
            ">
              <h2 className="font-serif text-4xl md:text-5xl text-white tracking-tight leading-tight mb-5 max-w-[18ch] mx-auto">
                Share what you notice with people who get it.
              </h2>
              <p className="text-[#8A8A85] text-base max-w-[44ch] mx-auto mb-10 leading-relaxed">
                Join a small community of builders, makers, and observers. Free forever. No noise, no algorithms.
              </p>
              <Link
                href="/join"
                className="
                  inline-flex items-center gap-2.5 font-medium text-sm
                  bg-[#FAFAF6] text-[#18181A] rounded-full px-6 py-3.5
                  hover:bg-white active:scale-[0.97]
                  transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                  group
                "
              >
                Join Curious Geeks
                <span className="w-6 h-6 rounded-full bg-[#18181A]/8 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                  <ArrowUpRight size={11} weight="bold" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
