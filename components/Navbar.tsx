'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Menu, X, User as UserIcon, LogOut, Settings, MessageSquare, Search, MapPin } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    getUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
        getUnreadCount(session.user.id)
      } else {
        setProfile(null)
        setUnreadCount(0)
      }
      setLoading(false)
    })

    const playNotificationSound = () => {
      const enabled = localStorage.getItem('echo_audio_enabled') !== 'false'
      if (enabled) {
        const audio = new Audio('/sounds/notification.mp3')
        audio.play().catch(e => console.warn("Audio playback blocked by browser/gesture:", e))
      }
    }

    // Listen for real-time messages for current user
    const msgChannel = supabase
      .channel('navbar_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user && payload.new.receiver_id === user.id) {
              setUnreadCount(prev => prev + 1)
              playNotificationSound()
            }
          })
        }
      )
      .subscribe()

    // Listen for real-time bookings
    const bookingChannel = supabase
      .channel('navbar_bookings')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bookings' },
        (payload) => {
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user && (payload.new.client_id === user.id || payload.new.provider_id === user.id)) {
               playNotificationSound()
            }
          })
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
      supabase.removeChannel(msgChannel)
      supabase.removeChannel(bookingChannel)
    }
  }, [])

  const getUnreadCount = async (userId: string) => {
    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false)
    setUnreadCount(count || 0)
  }

  const getUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        fetchProfile(user.id)
        getUnreadCount(user.id)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      
      setProfile(data)
    } catch (e) {
      console.error("Navbar fetchProfile error:", e)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const navLinks = [
    { href: '/search', label: 'Find Services', icon: Search },
    { href: '/map', label: 'Map View', icon: MapPin },
    ...(user ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
  ]

  const authenticatedLinks = [
    ...(profile?.role === 'admin' ? [{ href: '/admin', label: 'Admin', icon: Settings }] : []),
    { href: '/messages', label: 'Messages', icon: MessageSquare, hasBadge: true },
    { href: '/profile', label: 'Profile', icon: UserIcon },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 w-full">
          {/* Logo */}
          <div className="flex flex-1 items-center justify-start">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 grad-primary rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:rotate-6 transition-transform">
                <span className="text-white font-display font-black text-xl italic">E</span>
              </div>
              <span className="text-2xl font-display font-bold tracking-tight">
                <span className="text-slate-900">Echo</span>
                <span className="text-indigo-600">Flow</span>
              </span>
            </Link>
          </div>

          {/* Desktop Center Navigation */}
          <div className="hidden md:flex items-center justify-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  pathname === link.href 
                    ? 'text-indigo-600 bg-indigo-50' 
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                {link.icon && <link.icon className={`w-4 h-4 ${pathname === link.href ? 'text-indigo-600' : 'text-slate-400'}`} />}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Desktop Right Navigation */}
          <div className="hidden md:flex flex-1 items-center justify-end space-x-4">
            {!loading && (
              <>
                {user ? (
                  <>
                    <div className="flex items-center space-x-1 mr-2">
                      {authenticatedLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`p-2.5 rounded-xl transition-all relative ${
                            pathname === link.href
                              ? 'bg-indigo-50 text-indigo-600'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                          }`}
                          title={link.label}
                        >
                          {link.icon ? <link.icon className="w-5 h-5" /> : <div className="text-xs font-bold px-1 uppercase">{link.label.charAt(0)}</div>}
                          {'hasBadge' in link && link.hasBadge && unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse shadow-sm shadow-red-200"></span>
                          )}
                        </Link>
                      ))}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-sm font-bold text-slate-700 hover:text-indigo-600 px-4 py-2"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/register"
                      className="grad-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:shadow-xl hover:shadow-indigo-100 transition-all transform hover:-translate-y-0.5"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 py-6 px-4 animate-in slide-in-from-top-4 duration-300">
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-4">Navigation</div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  pathname === link.href ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.icon && <link.icon className="w-5 h-5 opacity-70" />}
                <span>{link.label}</span>
              </Link>
            ))}

            <div className="h-px bg-slate-100 my-6"></div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-4">Account</div>
            
            {user ? (
              <>
                {authenticatedLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                        pathname === link.href ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {link.icon && <link.icon className="w-5 h-5 opacity-70" />}
                        <span>{link.label}</span>
                      </div>
                      {'hasBadge' in link && link.hasBadge && unreadCount > 0 && (
                        <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full shadow-sm">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                ))}
                <button
                  onClick={() => {
                    handleSignOut()
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-base font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-5 h-5 opacity-70" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-4 rounded-xl text-base font-bold text-slate-700 bg-slate-50 hover:bg-slate-100"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-4 rounded-xl text-base font-bold text-white grad-primary shadow-lg shadow-indigo-100"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
