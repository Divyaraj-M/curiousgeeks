'use client'
import { useState } from 'react'
import { Heart } from '@phosphor-icons/react'
import type { SessionPayload } from '@/lib/auth'

export default function LikeButton({
  productSlug,
  initialCount,
  initialLiked,
  session,
}: {
  productSlug: string
  initialCount: number
  initialLiked: boolean
  session: SessionPayload | null
}) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  async function handleLike() {
    if (!session || loading) return
    const prevLiked = liked
    const prevCount = count
    setLiked(!liked)
    setCount(c => c + (liked ? -1 : 1))
    setLoading(true)
    try {
      const res = await fetch(`/api/products/${productSlug}/like`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setLiked(data.liked)
        setCount(data.count)
      } else {
        setLiked(prevLiked)
        setCount(prevCount)
      }
    } catch {
      setLiked(prevLiked)
      setCount(prevCount)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <span
        title="Sign in to like this product"
        className="inline-flex items-center gap-1.5 text-[#8A8A85] cursor-default select-none"
      >
        <Heart size={18} weight="regular" />
        <span className="text-sm">{count}</span>
      </span>
    )
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-sm transition-all duration-200 active:scale-[0.97] disabled:opacity-50 group"
      aria-label={liked ? 'Unlike this product' : 'Like this product'}
    >
      <Heart
        size={18}
        weight={liked ? 'fill' : 'regular'}
        style={{ color: liked ? '#F26B3A' : '#8A8A85' }}
        className="transition-transform duration-150 group-hover:scale-110"
      />
      <span style={{ color: liked ? '#F26B3A' : '#8A8A85' }}>{count}</span>
    </button>
  )
}
