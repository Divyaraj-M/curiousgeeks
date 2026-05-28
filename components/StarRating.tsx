'use client'
import { useState } from 'react'
import { Star } from '@phosphor-icons/react'

type StarRatingProps =
  | { mode: 'display'; value: number | null; size?: 'sm' | 'md' }
  | { mode: 'input'; value: number; onChange: (v: number) => void }

export default function StarRating(props: StarRatingProps) {
  const [hovered, setHovered] = useState(0)

  if (props.mode === 'display') {
    const { value, size = 'md' } = props
    const px = size === 'sm' ? 12 : 16
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            size={px}
            weight={value != null && i <= value ? 'fill' : 'regular'}
            style={{ color: value != null && i <= value ? '#F26B3A' : '#E8E4DC' }}
          />
        ))}
      </div>
    )
  }

  const { value, onChange } = props
  const active = hovered || value
  return (
    <div
      className="flex items-center gap-0.5"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHovered(i)}
          onClick={() => onChange(i)}
          className="focus:outline-none transition-transform duration-100 hover:scale-110"
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
        >
          <Star
            size={20}
            weight={i <= active ? 'fill' : 'regular'}
            style={{ color: i <= active ? '#F26B3A' : '#C0BDB5' }}
          />
        </button>
      ))}
    </div>
  )
}
