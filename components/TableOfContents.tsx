'use client'
import { useState, useEffect } from 'react'

export type Heading = { level: number; text: string; id: string }

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (!headings.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Track the topmost visible heading
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-72px 0% -60% 0%', threshold: 0 }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (!headings.length) return null

  return (
    <nav className="sticky top-28">
      <p className="text-[10px] uppercase tracking-[0.15em] font-medium text-[#8A8A85] mb-4">
        On this page
      </p>
      <ul className="space-y-2 border-l border-[#E8E4DC]">
        {headings.map(({ id, text, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={e => {
                e.preventDefault()
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                setActiveId(id)
              }}
              className={`
                block text-sm leading-snug py-0.5 border-l-2 transition-all duration-200
                ${level === 3 ? 'pl-5' : 'pl-3'}
                ${activeId === id
                  ? 'border-[#F26B3A] text-[#F26B3A] font-medium -ml-[2px]'
                  : 'border-transparent text-[#8A8A85] hover:text-[#18181A] hover:border-[#C0BDB5]'
                }
              `}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
