import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr'
import { sql } from '@/lib/db'
import type { Product } from '@/lib/types'
import ProductCard from '@/components/ProductCard'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Products',
  description: 'Products built and shared by the Curious Geeks community.',
}

const CATEGORIES = ['All', 'Tool', 'App', 'Resource', 'Library', 'Other']

async function getProducts(category?: string): Promise<Product[]> {
  const rows =
    category && category !== 'All'
      ? await sql`
          select * from products
          where approved = true and category = ${category}
          order by created_at desc
        `
      : await sql`
          select * from products
          where approved = true
          order by created_at desc
        `
  return rows as Product[]
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const products = await getProducts(category)

  return (
    <div className="min-h-[100dvh] px-6 pt-28 pb-24">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 stagger-children">
          <div>
            <h1 className="font-serif text-5xl md:text-6xl text-[#18181A] tracking-tight leading-tight">
              Products
            </h1>
          </div>

          {/* Submit CTA */}
          <Link
            href="/products/submit"
            className="
              self-start md:self-auto
              inline-flex items-center gap-2.5 font-medium text-sm
              bg-[#18181A] text-[#FAFAF6] rounded-full px-5 py-2.5
              hover:bg-[#2A2A2C] active:scale-[0.97]
              transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
              group
            "
          >
            Submit a product
            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
              <ArrowUpRight size={10} weight="bold" />
            </span>
          </Link>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map(cat => {
            const isActive = (!category && cat === 'All') || category === cat
            return (
              <Link
                key={cat}
                href={cat === 'All' ? '/products' : `/products?category=${cat}`}
                className={`
                  text-xs font-medium rounded-full px-3.5 py-1.5
                  transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${isActive
                    ? 'bg-[#18181A] text-white'
                    : 'bg-[#F5F1E8] text-[#8A8A85] hover:text-[#18181A] border border-[#E8E4DC]'
                  }
                `}
              >
                {cat}
              </Link>
            )
          })}
        </div>

        {/* Grid */}
        {products.length === 0 ? (
          <div className="p-[6px] rounded-[1.75rem] bg-[#F5F1E8] border border-[#E8E4DC]">
            <div className="bg-white rounded-[calc(1.75rem_-_6px)] px-8 py-24 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
              <p className="text-sm text-[#8A8A85] mb-4">
                {category && category !== 'All'
                  ? `No products in the "${category}" category yet.`
                  : 'No products yet. Be the first to share something.'}
              </p>
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
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
