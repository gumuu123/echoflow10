'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#0b1120] pt-20 pb-10 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Column 1 */}
          <div className="lg:pr-8">
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">ECHOFLOW</h2>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
              Home improvement and local services, made easy and transparent for everyone.
            </p>
            <button className="bg-white text-gray-900 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
              Download App
            </button>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm">DISCOVER</h3>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-sm hover:text-white transition-colors">How to Use</Link></li>
              <li><Link href="/about" className="text-sm hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/search" className="text-sm hover:text-white transition-colors">Provider Directory</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm">SUPPORT</h3>
            <ul className="space-y-4">
              <li><button onClick={() => window.dispatchEvent(new CustomEvent('open-support-modal'))} className="text-sm hover:text-white transition-colors text-left w-full">Issues & Support</button></li>
              <li><button onClick={() => window.dispatchEvent(new CustomEvent('open-dispute-modal'))} className="text-sm hover:text-white transition-colors text-left w-full">Report an Issue</button></li>
              <li><button onClick={() => window.dispatchEvent(new CustomEvent('open-feature-modal'))} className="text-sm hover:text-white transition-colors text-left w-full">Request a Feature</button></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm">CONNECT</h3>
            <div className="flex gap-4 mb-6">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-indigo-600 transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-indigo-600 transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-indigo-600 transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Stay updated with our latest features and service provider spotlights.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} EchoFlow, Inc.
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-sm text-gray-500 hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-white transition-colors">Privacy</Link>
            <Link href="/sitemap" className="text-sm text-gray-500 hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
