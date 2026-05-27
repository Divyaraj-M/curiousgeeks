import Link from 'next/link'
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr'

export default function Footer() {
  return (
    <footer className="border-t border-[#E8E4DC] mt-32 py-16 px-6">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <p className="font-serif text-xl text-[#18181A] mb-1">Curious Geeks</p>
          <p className="text-sm text-[#8A8A85]">A community of people who notice things.</p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-[#8A8A85]">
          <Link href="/blog" className="hover:text-[#18181A] transition-colors">Blog</Link>
          <Link href="/products" className="hover:text-[#18181A] transition-colors">Products</Link>
          <Link href="/join" className="hover:text-[#18181A] transition-colors">Join</Link>
          <a href="https://linkedin.com/in/divyaraj-murugan" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-[#18181A] transition-colors">
            LinkedIn <ArrowUpRight size={12} />
          </a>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto mt-10 pt-6 border-t border-[#E8E4DC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-xs text-[#8A8A85]">© {new Date().getFullYear()} Divyaraj Murugan · Curious Geeks</p>
        <Link href="/privacy" className="text-xs text-[#8A8A85] hover:text-[#18181A] transition-colors">
          Privacy Policy
        </Link>
      </div>
    </footer>
  )
}
