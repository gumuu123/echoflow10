'use client'

import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FooterModals from '@/components/FooterModals'
import { motion, AnimatePresence } from 'motion/react'
import { usePathname } from 'next/navigation'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
        <Navbar />
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.main>
        </AnimatePresence>
        <Footer />
        <FooterModals />
      </body>
    </html>
  )
}
