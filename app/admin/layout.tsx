'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  LayoutDashboard, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login?next=/admin')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    setIsAdmin(true)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const navItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Provider Requests', href: '/admin/providers', icon: CheckCircle2 },
    { name: 'Disputes', href: '/admin/disputes', icon: ShieldAlert },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-gray-100"
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-72 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col p-8">
          <div className="mb-12">
            <h1 className="text-2xl font-black italic tracking-tighter">EchoFlow <span className="text-blue-500 block text-xs not-italic tracking-widest uppercase">Admin Panel</span></h1>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-bold transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <button 
            onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
            className="flex items-center space-x-3 px-6 py-4 rounded-2xl font-bold text-red-400 hover:bg-red-400/10 transition-all mt-auto"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-4 lg:p-12 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
