import Link from 'next/link'
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr'
import type { PostMeta } from '@/lib/types'

export default function BlogCard({ post, size = 'default' }: {
  post: PostMeta
  size?: 'default' | 'featured'
}) {
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
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
          min-h-[160px]
        ">
          {/* Header */}
          <div>
            {/* Tags row */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {post.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="inline-block text-[10px] uppercase tracking-[0.15em] font-medium text-[#F26B3A] bg-[#F26B3A]/12 px-2.5 py-1 rounded-full">
                    {tag.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            )}

            <h3 className={`font-serif text-[#18181A] tracking-tight mb-2 leading-tight ${size === 'featured' ? 'text-2xl' : 'text-xl'}`}>
              {post.title}
            </h3>

            {post.description && (
              <p className="text-sm text-[#8A8A85] leading-relaxed line-clamp-2">
                {post.description}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-5">
            <div className="flex items-center gap-2">
              <time className="text-xs text-[#8A8A85]">{formattedDate}</time>
              {post.readingTime && (
                <>
                  <span className="text-[#E8E4DC]">·</span>
                  <span className="text-xs text-[#8A8A85]">{post.readingTime}</span>
                </>
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
