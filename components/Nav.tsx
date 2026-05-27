'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { List, X, ArrowUpRight, SignOut } from '@phosphor-icons/react'
import type { SessionPayload } from '@/lib/auth'

function UserAvatar({ session }: { session: SessionPayload }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const initials = session.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function signOut() {
    await fetch('/api/auth/signout', { method: 'POST' })
    router.refresh()
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="
          w-8 h-8 rounded-full bg-[#F26B3A] text-white text-xs font-semibold
          flex items-center justify-center
          hover:ring-2 hover:ring-[#F26B3A]/30
          transition-all duration-200
        "
        aria-label="Account menu"
      >
        {initials}
      </button>

      {open && (
        <div className="
          absolute right-0 top-full mt-2 w-52 rounded-2xl
          bg-white border border-[#E8E4DC] shadow-[0_8px_32px_-4px_rgba(0,0,0,0.1)]
          overflow-hidden z-50
        ">
          <div className="px-4 py-3 border-b border-[#E8E4DC]">
            <p className="text-xs font-medium text-[#18181A] truncate">{session.name}</p>
            <p className="text-[11px] text-[#8A8A85] truncate">{session.email}</p>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#8A8A85] hover:text-[#18181A] hover:bg-[#F5F1E8] transition-colors"
          >
            <SignOut size={14} />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export default function Nav({ session }: { session: SessionPayload | null }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  const links = [
    { href: '/blog', label: 'Blog' },
    { href: '/products', label: 'Products' },
  ]

  async function mobileSignOut() {
    await fetch('/api/auth/signout', { method: 'POST' })
    router.refresh()
    setOpen(false)
  }

  return (
    <>
      {/* Floating pill nav */}
      <header className="fixed top-5 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
        <nav
          className={`
            pointer-events-auto flex items-center gap-6 px-5 py-3 rounded-full
            transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${scrolled
              ? 'bg-[#FAFAF6]/90 backdrop-blur-xl border border-[#E8E4DC] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)]'
              : 'bg-[#FAFAF6]/70 backdrop-blur-md border border-[#E8E4DC]/60'}
          `}
        >
          {/* Logo — CG mascot wordmark */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex items-center">
              {/* C creature — persimmon badge */}
              <svg viewBox="-10 -10 120 120" className="badge-c w-7 h-7 transition-transform duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.12]" aria-hidden="true">
                <circle cx="50" cy="50" r="56" fill="#F26B3A" stroke="#171210" strokeWidth="5.5"/>
                <path d="M 82.77 27.06 A 40 40 0 1 0 82.77 72.94 L 69.66 63.77 A 24 24 0 1 1 69.66 36.23 Z"
                      fill="white" stroke="#171210" strokeWidth="5.5" strokeLinejoin="round"/>
                <circle className="cg-eye" cx="46" cy="44" r="4" fill="#171210"/>
                <circle className="cg-eye cg-eye-b" cx="58" cy="44" r="4" fill="#171210"/>
              </svg>
              {/* G creature — cream badge */}
              <svg viewBox="-10 -10 120 120" className="badge-g w-7 h-7 -ml-1.5 transition-transform duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] group-hover:-translate-y-0.5" aria-hidden="true">
                <circle cx="50" cy="50" r="56" fill="oklch(0.95 0.06 80)" stroke="#171210" strokeWidth="5.5"/>
                <path d="M 82.77 27.06 A 40 40 0 1 0 82.77 72.94 L 69.66 63.77 A 24 24 0 1 1 69.66 36.23 Z"
                      fill="white" stroke="#171210" strokeWidth="5.5" strokeLinejoin="round"/>
                <path d="M 62 50 L 80 50 L 80 68 L 70 68 L 70 60 L 62 60 Z"
                      fill="white" stroke="#171210" strokeWidth="5.5" strokeLinejoin="round" strokeLinecap="round"/>
                <circle className="cg-eye" cx="46" cy="40" r="4" fill="#171210"/>
                <circle className="cg-eye cg-eye-b" cx="58" cy="40" r="4" fill="#171210"/>
              </svg>
            </span>
            <span className="font-sans font-semibold text-sm tracking-tight text-[#18181A] group-hover:text-[#F26B3A] transition-colors duration-300">
              Curious Geeks
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-5">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm transition-colors duration-200 ${
                  pathname.startsWith(l.href)
                    ? 'text-[#18181A] font-medium'
                    : 'text-[#8A8A85] hover:text-[#18181A]'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <UserAvatar session={session} />
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-sm text-[#8A8A85] hover:text-[#18181A] transition-colors duration-200"
                >
                  Already a member?
                </Link>
                <Link
                  href="/join"
                  className="
                    flex items-center gap-2 text-sm font-medium
                    bg-[#18181A] text-[#FAFAF6] rounded-full px-4 py-2
                    hover:bg-[#2A2A2C] active:scale-[0.97]
                    transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                    group
                  "
                >
                  Join
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                    <ArrowUpRight size={10} weight="bold" />
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden relative w-8 h-8 flex items-center justify-center"
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span className={`absolute transition-all duration-300 ${open ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}>
              <X size={18} weight="light" />
            </span>
            <span className={`absolute transition-all duration-300 ${open ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`}>
              <List size={18} weight="light" />
            </span>
          </button>
        </nav>
      </header>

      {/* Mobile overlay */}
      <div
        className={`
          fixed inset-0 z-30 md:hidden bg-[#FAFAF6]/95 backdrop-blur-2xl
          flex flex-col items-center justify-center gap-8
          transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      >
        <div className="flex flex-col items-center gap-6 stagger-children">
          {/* Mascot in mobile menu */}
          <span className="flex items-center mb-2">
            <svg viewBox="-10 -10 120 120" className="badge-c w-12 h-12" aria-hidden="true">
              <circle cx="50" cy="50" r="56" fill="#F26B3A" stroke="#171210" strokeWidth="5.5"/>
              <path d="M 82.77 27.06 A 40 40 0 1 0 82.77 72.94 L 69.66 63.77 A 24 24 0 1 1 69.66 36.23 Z"
                    fill="white" stroke="#171210" strokeWidth="5.5" strokeLinejoin="round"/>
              <circle className="cg-eye" cx="46" cy="44" r="4" fill="#171210"/>
              <circle className="cg-eye cg-eye-b" cx="58" cy="44" r="4" fill="#171210"/>
            </svg>
            <svg viewBox="-10 -10 120 120" className="badge-g w-12 h-12 -ml-2.5" aria-hidden="true">
              <circle cx="50" cy="50" r="56" fill="oklch(0.95 0.06 80)" stroke="#171210" strokeWidth="5.5"/>
              <path d="M 82.77 27.06 A 40 40 0 1 0 82.77 72.94 L 69.66 63.77 A 24 24 0 1 1 69.66 36.23 Z"
                    fill="white" stroke="#171210" strokeWidth="5.5" strokeLinejoin="round"/>
              <path d="M 62 50 L 80 50 L 80 68 L 70 68 L 70 60 L 62 60 Z"
                    fill="white" stroke="#171210" strokeWidth="5.5" strokeLinejoin="round" strokeLinecap="round"/>
              <circle className="cg-eye" cx="46" cy="40" r="4" fill="#171210"/>
              <circle className="cg-eye cg-eye-b" cx="58" cy="40" r="4" fill="#171210"/>
            </svg>
          </span>

          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="font-sans font-semibold text-4xl text-[#18181A] hover:text-[#F26B3A] transition-colors"
            >
              {l.label}
            </Link>
          ))}

          {session ? (
            <>
              <p className="text-sm text-[#8A8A85]">Signed in as <span className="text-[#18181A] font-medium">{session.name}</span></p>
              <button
                onClick={mobileSignOut}
                className="flex items-center gap-2 text-sm text-[#8A8A85] hover:text-[#18181A] transition-colors"
              >
                <SignOut size={14} />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="text-sm text-[#8A8A85] hover:text-[#18181A] transition-colors"
              >
                Already a member?
              </Link>
              <Link
                href="/join"
                className="mt-2 flex items-center gap-2 bg-[#18181A] text-[#FAFAF6] rounded-full px-6 py-3 font-medium text-base"
              >
                Join the community
                <ArrowUpRight size={14} weight="bold" />
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}
