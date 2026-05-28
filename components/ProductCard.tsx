import Link from 'next/link'
import { ArrowUpRight, Heart, Star } from '@phosphor-icons/react/dist/ssr'
import type { ProductWithStats } from '@/lib/types'

export default function ProductCard({ product, size = 'default' }: {
  product: ProductWithStats
  size?: 'default' | 'featured'
}) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      {/* Double-bezel outer shell */}
      <div className="
        p-[6px] rounded-[1.75rem]
        bg-[#F5F1E8] border border-[#E8E4DC]
        transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        group-hover:border-[#F26B3A]/30 group-hover:shadow-[0_12px_40px_-8px_rgba(242,107,58,0.12)]
      ">
        {/* Inner core */}
        <div className="
          bg-white rounded-[calc(1.75rem_-_6px)] p-6
          shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]
          h-full flex flex-col justify-between
          min-h-[180px]
        ">
          {/* Header */}
          <div>
            {product.category && (
              <span className="inline-block text-[10px] uppercase tracking-[0.15em] font-medium text-[#8A8A85] bg-[#F5F1E8] px-2.5 py-1 rounded-full mb-3">
                {product.category}
              </span>
            )}
            <h3 className={`font-serif text-[#18181A] tracking-tight mb-2 ${size === 'featured' ? 'text-2xl' : 'text-xl'}`}>
              {product.name}
            </h3>
            <p className="text-sm text-[#8A8A85] leading-relaxed line-clamp-2">
              {product.tagline}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#8A8A85]">
                by {product.maker_name}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-[#8A8A85]">
                <Heart
                  size={12}
                  weight={product.like_count > 0 ? 'fill' : 'regular'}
                  style={{ color: product.like_count > 0 ? '#F26B3A' : '#C0BDB5' }}
                />
                {product.like_count}
              </span>
              {product.avg_rating != null && (
                <span className="inline-flex items-center gap-1 text-xs text-[#8A8A85]">
                  <Star size={12} weight="fill" style={{ color: '#F26B3A' }} />
                  {Number(product.avg_rating).toFixed(1)}
                </span>
              )}
            </div>
            <span className="
              w-8 h-8 rounded-full bg-[#F5F1E8] flex items-center justify-center
              group-hover:bg-[#18181A] group-hover:text-white
              transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
              group-hover:translate-x-0.5 group-hover:-translate-y-0.5
            ">
              <ArrowUpRight size={14} weight="bold" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
