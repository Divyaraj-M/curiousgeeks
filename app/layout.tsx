import type { Metadata } from 'next'
import './globals.css'
import NavWrapper from '@/components/NavWrapper'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: {
    default: 'Curious Geeks',
    template: '%s · Curious Geeks',
  },
  description: 'A community of people who notice things. Products, writing, and ideas from builders who pay attention.',
  openGraph: {
    title: 'Curious Geeks',
    description: 'A community of people who notice things.',
    siteName: 'Curious Geeks',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NavWrapper />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
