'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  Star, 
  TrendingUp, 
  Users,
  Settings,
  User as UserIcon,
  CreditCard,
  Plus,
  MapPin,
  Search,
  ArrowUpRight,
  X,
  Check,
  Pause,
  Trash2,
  Archive,
  Heart,
  ExternalLink,
  Loader2,
  ThumbsUp
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

// Helper Stat Card component
function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
      <div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <h3 className="text-3xl font-display font-black text-slate-900 mt-2 italic">{value}</h3>
      </div>
      <div className={cn("p-4 rounded-2xl text-white shadow-lg", color)}>
        <Icon size={22} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<any[]>([])
  const [activeServices, setActiveServices] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [sukiNetwork, setSukiNetwork] = useState<any[]>([])
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false)
  const [evalBooking, setEvalBooking] = useState<any>(null)
  const [evalRating, setEvalRating] = useState(0)
  const [archivedBookingIds, setArchivedBookingIds] = useState<string[]>([])
  
  const supabase = createClient()

  useEffect(() => {
    const savedArchive = localStorage.getItem('echo_archived_bookings')
    if (savedArchive) {
      try {
        setArchivedBookingIds(JSON.parse(savedArchive))
      } catch (e) {
        console.error("Failed to parse archived bookings:", e)
      }
    }
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: profileData, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      
      if (pError) throw pError;
      setProfile(profileData)

      if (profileData) {
        if (profileData.role === 'provider') {
          const { data: bookingsData, error: bError } = await supabase
            .from('bookings')
            .select(`
              *,
              client:profiles!bookings_client_id_fkey(id, full_name, avatar_url, city)
            `)
            .eq('provider_id', user.id)
            .order('created_at', { ascending: false })
          
          if (bError) {
            console.error("❌ Provider bookings fetch error details:", bError.message, bError.details, bError.hint)
          }
          
          const verifiedBookings = bookingsData || []
          setBookings(verifiedBookings)
          setActiveServices(verifiedBookings.filter(b => b.status === 'pending' || b.status === 'accepted' || b.status === 'on_hold'))

          const { data: regularClients, error: sukiError } = await supabase
            .from('regular_clients')
            .select(`
              id,
              provider_id,
              client_id,
              client:profiles!client_id(id, full_name, avatar_url, city)
            `)
            .eq('provider_id', user.id)

          if (sukiError) {
            console.error("❌ Suki Network Fetch Error:", sukiError.message)
          }
          
          setSukiNetwork(regularClients || [])
        } else {
          const { data: bookingsData, error: cError } = await supabase
            .from('bookings')
            .select(`
              *,
              provider:profiles!bookings_provider_id_fkey(id, full_name, avatar_url, city)
            `)
            .eq('client_id', user.id)
            .order('created_at', { ascending: false })
          
          if (cError) {
            console.error("❌ Client bookings fetch error details:", cError.message, cError.details, cError.hint)
          }
          
          const verifiedBookings = bookingsData || []
          setBookings(verifiedBookings)
          setActiveServices(verifiedBookings.filter(b => b.status === 'pending' || b.status === 'accepted' || b.status === 'on_hold'))

          const { data: favoritesData } = await supabase
            .from('favorites')
            .select(`
              *,
              provider:profiles(id, full_name, avatar_url, city)
            `)
            .eq('client_id', user.id)
          
          setFavorites(favoritesData || [])
        }
      }
    } catch (e: any) {
      console.error("❌ Dashboard initialize error:", e.message || e)
    } finally {
      setLoading(false)
    }
  }

  const handleBookingAction = async (bookingId: string, status: string) => {
    try {
      const now = new Date().toISOString()
      const updateData: any = { status, updated_at: now }
      
      if (status === 'accepted') updateData.accepted_at = now
      if (status === 'on_hold') updateData.on_hold_at = now
      if (status === 'cancelled') updateData.cancelled_at = now
      if (status === 'completed') updateData.completed_at = now
      
      const current = bookings.find(b => b.id === bookingId)
      if (status === 'accepted' && current?.status === 'on_hold') {
        updateData.continued_at = now
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId)

      if (error) {
        alert(error.message)
      } else {
        const audioEnabled = localStorage.getItem('echo_audio_enabled') !== 'false'
        if (audioEnabled) {
          const audio = new Audio('/sounds/notification.mp3')
          audio.play().catch(e => console.warn("Audio chime block:", e))
        }
        fetchDashboardData()
      }
    } catch (err: any) {
      console.error("❌ Booking update action error:", err.message || err)
    }
  }

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to remove this record from your history?')) return
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId)

    if (error) {
      alert(error.message)
    } else {
      // Instantly optimize UI state update locally before refetching
      setBookings(prev => prev.filter(b => b.id !== bookingId))
      setActiveServices(prev => prev.filter(b => b.id !== bookingId))
      fetchDashboardData()
    }
  }

  const archiveLocalBooking = (id: string) => {
    const nextArr = [...archivedBookingIds, id]
    setArchivedBookingIds(nextArr)
    localStorage.setItem('echo_archived_bookings', JSON.stringify(nextArr))
  }

  const handleMarkAsSuki = async (clientId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert("Session expired. Please log back in.")
      return
    }

    const { error } = await supabase
      .from('regular_clients')
      .upsert(
        { provider_id: user.id, client_id: clientId }, 
        { onConflict: 'provider_id,client_id' }
      )

    if (error) {
      console.error("❌ DB Insert Failed:", error.message, error.details)
      alert(`Failed to add client: ${error.message}`)
    } else {
      alert('Client successfully added to your cozy Suki Network!')
      fetchDashboardData() 
    }
  }

  const handleEvaluate = async () => {
    if (!evalBooking || evalRating === 0) return
    
    const { error: revError } = await supabase
      .from('reviews')
      .insert({
        booking_id: evalBooking.id,
        provider_id: evalBooking.provider_id,
        stars: evalRating
      })

    if (revError) {
      alert(revError.message)
    } else {
      setIsEvaluationOpen(false)
      setEvalBooking(null)
      setEvalRating(0)
      alert('Thank you for sharing your friendly experience with our community!')
    }
  }

  const toggleFavorite = async (providerId: string) => {
    const isFav = favorites.some(f => f.provider_id === providerId)
    if (isFav) {
      await supabase.from('favorites').delete().eq('client_id', profile.id).eq('provider_id', providerId)
    } else {
      await supabase.from('favorites').insert({ client_id: profile.id, provider_id: providerId })
    }
    fetchDashboardData()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 max-w-md mx-auto">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserIcon className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-display font-bold text-slate-900">Let's Get You Signed In</h2>
          <p className="text-slate-500 font-medium mt-2">We couldn't load your profile. Please sign in or register to connect with your cozy local community.</p>
          <Link href="/login" className="mt-8 inline-block grad-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 p-3">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  const isProvider = profile?.role === 'provider'
  const visibleBookings = bookings.filter(b => !archivedBookingIds.includes(b.id))

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
          <div>
            <h1 className="text-5xl font-display font-black text-slate-900 tracking-tight italic">
              Hello, {profile.full_name?.split(' ')[0]}!
            </h1>
            <div className="text-slate-500 font-bold mt-2 flex items-center uppercase tracking-widest text-xs">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
              {isProvider ? 'Service Provider' : 'Client'} Hub • Welcoming Local Community
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isProvider ? (
              <Link href="/services/new" className="grad-primary text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:-translate-y-1 transition-all flex items-center">
                <Plus className="mr-2" size={18} /> Offer a New Service
              </Link>
            ) : (
              <Link href="/search" className="grad-primary text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:-translate-y-1 transition-all flex items-center">
                <Search className="mr-2" size={18} /> Find Local Services
              </Link>
            )}
          </div>
        </div>

        {/* Dashboard Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {isProvider ? (
            <>
              <StatCard label="Total Requests" value={bookings.length} icon={Calendar} color="bg-indigo-600" />
              <StatCard label="Finished Services" value={bookings.filter(b => b.status === 'completed').length} icon={Check} color="bg-emerald-600" />
              <StatCard label="Suki Network Size" value={sukiNetwork.length} icon={Users} color="bg-amber-600" />
              <StatCard label="Active ongoing jobs" value={activeServices.length} icon={TrendingUp} color="bg-violet-600" />
            </>
          ) : (
            <>
              <StatCard label="Total Bookings" value={bookings.length} icon={Calendar} color="bg-indigo-600" />
              <StatCard label="Services Competed" value={bookings.filter(b => b.status === 'completed').length} icon={Archive} color="bg-amber-600" />
              <StatCard label="Active Services" value={activeServices.length} icon={TrendingUp} color="bg-emerald-600" />
              <StatCard label="Saved Favorites" value={favorites.length} icon={Heart} color="bg-pink-600" />
            </>
          )} 
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Transaction Area */}
          <div className="lg:col-span-2 space-y-10">
            {/* History Matrix */}
            <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h2 className="text-2xl font-display font-black text-slate-900 italic">
                  {isProvider ? 'Incoming Service Requests' : 'Your Friendly History'}
                </h2>
                <div className="flex gap-2">
                  <span className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Real-time updates
                  </span>
                </div>
              </div>
              
              <div className="divide-y divide-slate-50">
                {visibleBookings.length > 0 ? (
                  visibleBookings.map((booking) => {
                    const targetProfile = isProvider ? booking.client : booking.provider
                    return (
                      <div key={booking.id} className="p-8 hover:bg-slate-50/50 transition-all group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[1.5rem] grad-primary flex items-center justify-center text-white text-xl font-display font-black shadow-lg shadow-indigo-100 group-hover:rotate-3 transition-transform">
                              {targetProfile?.full_name?.charAt(0) || 'E'}
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900 text-lg uppercase italic leading-none">
                                {targetProfile?.full_name || 'Neighbor'}
                              </h4>
                              <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-tighter">
                                {booking.created_at ? format(new Date(booking.created_at), 'MMMM dd, yyyy • h:mm a') : 'Direct booking'}
                              </p>
                              
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase">
                                  {booking.service_category || 'Service'}
                                </span>
                                <span className={cn(
                                  "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                  booking.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                  booking.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                  booking.status === 'accepted' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                  booking.status === 'on_hold' ? "bg-slate-900 text-white border-slate-900" :
                                  "bg-red-50 text-red-600 border-red-100"
                                )}>
                                  {booking.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3">
                            {isProvider ? (
                              <>
                                {booking.status === 'pending' && (
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => handleBookingAction(booking.id, 'accepted')}
                                      className="px-4 py-2 grad-primary text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 hover:opacity-90"
                                    >
                                      Accept
                                    </button>
                                    <button 
                                      onClick={() => handleBookingAction(booking.id, 'cancelled')}
                                      className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                                    >
                                      Cancel
                                    </button>
                                    <button 
                                      onClick={() => handleBookingAction(booking.id, 'on_hold')}
                                      className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                                    >
                                      Hold
                                    </button>
                                  </div>
                                )}
                                {booking.status === 'on_hold' && (
                                  <button onClick={() => handleBookingAction(booking.id, 'accepted')} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs">
                                    Resume Job
                                  </button>
                                )}
                                {booking.status === 'completed' && (
                                  <button onClick={() => handleMarkAsSuki(booking.client_id)} className="px-4 py-2 bg-amber-50 text-amber-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all shadow-sm flex items-center gap-1">
                                    <ThumbsUp size={12} /> Add to Suki
                                  </button>
                                )}
                                {/* FIXED: Explicitly display trash deletion options for non-active states */}
                                {(booking.status === 'completed' || booking.status === 'cancelled') && (
                                  <button onClick={() => handleDeleteBooking(booking.id)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all">
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </>
                            ) : (
                              <>
                                {booking.status === 'pending' && (
                                  <button onClick={() => handleBookingAction(booking.id, 'cancelled')} className="px-5 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                    Cancel Request
                                  </button>
                                )}
                                {booking.status === 'completed' && (
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => {
                                        setEvalBooking(booking)
                                        setIsEvaluationOpen(true)
                                      }}
                                      className="px-5 py-3 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
                                    >
                                      Unbox Feedback
                                    </button>
                                    <button 
                                      onClick={() => archiveLocalBooking(booking.id)}
                                      className="px-4 py-3 bg-slate-50 text-slate-400 hover:bg-slate-200 rounded-2xl text-[10px] font-black uppercase"
                                      title="Hide / Archive"
                                    >
                                      Archive
                                    </button>
                                    <button onClick={() => handleDeleteBooking(booking.id)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all">
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                )}
                                {booking.status === 'cancelled' && (
                                  <div className="flex gap-2">
                                    <button onClick={() => archiveLocalBooking(booking.id)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all">
                                      <Archive size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteBooking(booking.id)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all">
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="p-20 text-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                       <Calendar className="w-12 h-12 text-slate-200" />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-xl">No Bookings Yet</h3>
                    <p className="text-slate-400 font-bold mt-2">Connecting with neighbours and booking list will populate this matrix.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Finished Services Ledger for Providers */}
            {isProvider && (
              <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
                <h2 className="text-2xl font-display font-black text-slate-900 italic mb-6">Completed Services Ledger</h2>
                <div className="divide-y divide-slate-50">
                  {bookings.filter(b => b.status === 'completed').length > 0 ? (
                    bookings.filter(b => b.status === 'completed').map((b) => (
                      <div key={b.id} className="py-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900">{b.client?.full_name || 'Local Resident'}</h4>
                          <p className="text-xs text-slate-500">{b.service_category || 'Service'} • {b.created_at ? format(new Date(b.created_at), 'MMM d, yyyy') : 'No Date'}</p>
                        </div>
                        {/* FIXED: Directly hooks up your text button element to the deletion handler */}
                        <button 
                          onClick={() => handleDeleteBooking(b.id)}
                          className="text-red-500 hover:text-red-700 font-bold text-xs uppercase"
                        >
                          Delete Entry
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 font-bold text-sm italic py-4">No completed tasks on record yet.</p>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Side Panels */}
          <div className="space-y-10">
            {/* Active Services Replacement Workspace */}
            <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
              <h3 className="text-xl font-display font-black text-slate-900 italic mb-8">Active Service Stream</h3>
              <div className="space-y-4">
                {activeServices.length > 0 ? (
                  activeServices.map(service => {
                    const activeTarget = isProvider ? service.client : service.provider
                    return (
                      <div key={service.id} className="p-5 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-100 animate-in slide-in-from-right duration-500">
                        <div className="flex justify-between items-start mb-4">
                          <div className="bg-white/20 p-2 rounded-xl">
                            <TrendingUp size={18} />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status: {service.status}</span>
                        </div>
                        <h4 className="font-black italic text-lg leading-tight truncate">
                          {activeTarget?.full_name || 'Neighbor'}
                        </h4>
                        <p className="text-xs font-semibold opacity-80 mt-1 truncate">
                          {service.service_category || 'Service Tag'}
                        </p>
                        
                        <div className="mt-6 flex gap-2">
                          <button 
                            onClick={() => handleBookingAction(service.id, 'completed')}
                            className="flex-1 bg-white text-indigo-600 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                          >
                            Mark as Completed
                          </button>
                          <button 
                            onClick={() => handleBookingAction(service.id, 'cancelled')}
                            className="p-3 bg-white/10 text-white rounded-2xl hover:bg-red-500 transition-all border border-transparent"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No active services in progress</p>
                  </div>
                )}
              </div>
            </section>

            {/* Loyalty / Favorites & Suki Network Workspace */}
            <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
              <h3 className="text-xl font-display font-black text-slate-900 italic mb-8">
                {isProvider ? 'Frequent Clients / Suki Network' : 'Favorite Providers'}
              </h3>
              <div className="space-y-4">
                {(isProvider ? sukiNetwork : favorites).length > 0 ? (
                  (isProvider ? sukiNetwork : favorites).map(item => {
                    const target = isProvider ? item.client : item.provider
                    
                    if (!target) {
                      return (
                        <div key={item.id} className="p-4 bg-slate-50 rounded-[1.5rem] flex justify-between items-center border border-dashed border-slate-200">
                          <div>
                            <p className="text-xs font-black text-slate-700 italic">Suki Connection</p>
                            <p className="text-[10px] font-mono text-slate-400 mt-1 truncate max-w-[140px]">{item.client_id}</p>
                          </div>
                          <span className="text-[9px] bg-amber-50 text-amber-600 px-2.5 py-1 rounded-md font-black uppercase tracking-widest">Linked</span>
                        </div>
                      )
                    }

                    return (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-[1.5rem] group hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center font-black text-indigo-600 text-sm shadow-sm group-hover:scale-110 transition-transform">
                            {target?.full_name?.charAt(0) || 'E'}
                          </div>
                          <div>
                            <h5 className="font-black text-slate-900 text-sm italic truncate max-w-[120px]">
                              {target?.full_name || 'Neighbor'}
                            </h5>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                              {target?.city || 'Local Sector'}
                            </p>
                          </div>
                        </div>
                        <Link href={`/profile/${target?.id}`} className="p-2 text-slate-300 hover:text-indigo-600">
                          <ExternalLink size={16} />
                        </Link>
                      </div>
                    )
                  })
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {isProvider ? 'Begin adding suki clients!' : 'Explore our maps and save your favorite pros!'}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Post-Service Evaluation Popup for Clients */}
      {isEvaluationOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-300">
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-8">
                <Star size={48} className="fill-indigo-600/10" />
              </div>
              <h2 className="text-3xl font-display font-black text-slate-900 italic mb-4 uppercase tracking-tighter">Service Complete!</h2>
              <p className="text-slate-500 font-semibold leading-relaxed mb-10">
                How was your experience with <span className="text-indigo-600 font-extrabold">{evalBooking?.provider?.full_name || 'your provider'}</span>? 
                Help the EchoFlow circle grow stronger by echoing your feedback anonymously.
              </p>
              
              <div className="flex justify-center gap-4 mb-10">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEvalRating(star)}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      star <= evalRating ? "text-amber-500 scale-110" : "text-slate-200 hover:text-amber-300"
                    )}
                  >
                    <Star size={32} className={cn(star <= evalRating && "fill-amber-500")} />
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleEvaluate}
                  disabled={evalRating === 0}
                  className="flex-1 grad-primary text-white py-4 rounded-2xl font-black text-sm shadow-xl disabled:opacity-50 transition-all"
                >
                  Submit Echo
                </button>
                <button
                  onClick={() => {
                    setIsEvaluationOpen(false)
                    setEvalBooking(null)
                    setEvalRating(0)
                  }}
                  className="px-6 bg-slate-100 text-slate-500 font-bold text-sm rounded-2xl hover:bg-slate-200"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}