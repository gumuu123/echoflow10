'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  Star, 
  Facebook, 
  CreditCard, 
  CheckCircle2, 
  Loader2,
  TrendingUp,
  History,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [bookingHistory, setBookingHistory] = useState<any[]>([])
  const [reviewsStats, setReviewsStats] = useState({
    rating: 0,
    reviewCount: 0,
    starDistribution: [0, 0, 0, 0, 0] // 1, 2, 3, 4, 5 stars
  })
  
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      
      setProfile(profileData)

      if (profileData) {
        // Fetch real-time anonymized feedback aggregates straight from public.reviews
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*')
          .eq('provider_id', id)
        
        if (reviewsData && reviewsData.length > 0) {
          const total = reviewsData.length
          const sum = reviewsData.reduce((acc, r) => acc + (r.stars || 0), 0)
          const avg = parseFloat((sum / total).toFixed(1))
          
          const dist = [0, 0, 0, 0, 0]
          reviewsData.forEach(r => {
            if (r.stars >= 1 && r.stars <= 5) {
              dist[r.stars - 1]++
            }
          })
          
          setReviewsStats({
            rating: avg,
            reviewCount: total,
            starDistribution: dist
          })
        }

        // Fetch shared transaction history
        if (user) {
          const { data: bookings } = await supabase
            .from('bookings')
            .select('*')
            .or(`and(client_id.eq.${user.id},provider_id.eq.${id}),and(client_id.eq.${id},provider_id.eq.${user.id})`)
            .order('booked_at', { ascending: false })
          setBookingHistory(bookings || [])
        }
      }
    } catch (e) {
      console.error("Failed to load profile:", e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Profile not found
      </div>
    )
  }

  const isProvider = profile.role === 'provider'
  const displayRating = reviewsStats.reviewCount > 0 ? reviewsStats.rating : (profile.rating || 0)
  const displayCount = reviewsStats.reviewCount > 0 ? reviewsStats.reviewCount : (profile.review_count || 0)

  // Safety Arrays fallback arrays
  const safeOfferedServices = Array.isArray(profile.offered_services) ? profile.offered_services : []
  const safePaymentTerms = Array.isArray(profile.payment_terms) ? profile.payment_terms : []

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Cover Photo */}
      <div className="h-64 relative overflow-hidden group">
        {profile.cover_photo_url ? (
          <img src={profile.cover_photo_url} className="w-full h-full object-cover" alt="Cover" />
        ) : (
          <div className="w-full h-full grad-primary opacity-20" />
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Left Column: Essential Info */}
          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-indigo-100/50 p-8 border border-white">
              <div className="w-32 h-32 rounded-3xl bg-slate-100 overflow-hidden border-4 border-white shadow-lg mx-auto -mt-16 mb-6">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-slate-300 text-4xl uppercase">
                    {profile.full_name?.charAt(0)}
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <h1 className="text-2xl font-display font-black text-slate-900 italic uppercase tracking-tighter">
                  {profile.full_name}
                </h1>
                <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mt-2">
                  Friendly {profile.role}
                </p>
                
                {isProvider && (
                  <div className="mt-4 flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={16} 
                        className={cn(
                          "transition-colors",
                          star <= Math.round(displayRating) ? "fill-amber-400 text-amber-400" : "text-slate-200"
                        )} 
                        />
                    ))}
                    <span className="text-[10px] font-black text-slate-400 ml-2">({displayCount})</span>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
                <div className="flex items-center gap-4 text-slate-600 group">
                   <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <Mail size={18} />
                   </div>
                   <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                      <p className="text-xs font-bold truncate text-slate-800">{profile.email}</p>
                   </div>
                </div>
                {profile.phone_number && (
                  <div className="flex items-center gap-4 text-slate-600 group">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <Phone size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Phone</p>
                        <p className="text-xs font-bold text-slate-800">{profile.phone_number}</p>
                    </div>
                  </div>
                )}
                {profile.facebook_url && (
                  <a href={profile.facebook_url} target="_blank" className="flex items-center gap-4 text-slate-600 group hover:text-indigo-600">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                        <Facebook size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Social Connection</p>
                        <p className="text-xs font-bold text-slate-850">Facebook Profile</p>
                    </div>
                  </a>
                )}
                <div className="flex items-center gap-4 text-slate-600 group font-bold">
                   <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <MapPin size={18} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Local Neighborhood</p>
                      <p className="text-xs font-bold truncate text-slate-800">{profile.barangay}, {profile.city}</p>
                   </div>
                </div>
              </div>

              {currentUser && currentUser.id !== profile.id && (
                <Link 
                  href={`/messages?userId=${profile.id}`}
                  className="w-full mt-8 grad-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 hover:-translate-y-1 transition-all"
                >
                  <MessageSquare size={18} />
                  Say Hello / Message
                </Link>
              )}
            </div>
          </div>

          {/* Right Column: Dynamic Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {isProvider ? (
              <>
                <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                         <TrendingUp size={20} />
                      </div>
                      <h3 className="text-2xl font-display font-black text-slate-900 italic">Offered Services</h3>
                   </div>
                   
                   <div className="flex flex-wrap gap-3">
                      {safeOfferedServices.length > 0 ? (
                        safeOfferedServices.map((service: string, i: number) => (
                           <div key={i} className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-black text-xs uppercase tracking-widest">
                              {service}
                           </div>
                        ))
                      ) : (
                        <p className="text-slate-400 font-bold italic">No service tags listed yet.</p>
                      )}
                   </div>
                </section>

                <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                         <CreditCard size={20} />
                      </div>
                      <h3 className="text-2xl font-display font-black text-slate-900 italic">Payment Methods</h3>
                   </div>
                   
                   <div className="grid md:grid-cols-2 gap-8">
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Preferred Channels</p>
                         <p className="text-slate-900 font-bold text-lg">{profile.mode_of_payment || 'Direct cash or e-wallet'}</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Terms of service</p>
                         <div className="flex flex-wrap gap-2">
                            {safePaymentTerms.length > 0 ? (
                              safePaymentTerms.map((term: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs">
                                   <CheckCircle2 size={14} />
                                   {term}
                                </div>
                              ))
                            ) : (
                              <p className="text-slate-400 font-bold italic">Please ask provider directly.</p>
                            )}
                         </div>
                      </div>
                   </div>
                </section>
              </>
            ) : (
              <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                       <History size={20} />
                    </div>
                    <h3 className="text-2xl font-display font-black text-slate-900 italic">Shared Community Transactions</h3>
                 </div>
                 <div className="divide-y divide-slate-50">
                    {bookingHistory.length > 0 ? (
                      bookingHistory.map((booking, i) => (
                        <div key={i} className="py-6 flex items-center justify-between group">
                           <div>
                              <p className="text-sm font-black text-slate-900 italic uppercase">Appointment #{booking.id.slice(0, 8)}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                {new Date(booking.booked_at).toLocaleDateString()} • {booking.status}
                              </p>
                           </div>
                           <Link href="/dashboard" className="p-3 rounded-xl bg-slate-50 text-indigo-600 opacity-0 group-hover:opacity-100 transition-all">
                              <TrendingUp size={18} />
                           </Link>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 font-bold italic py-8">No shared bookings yet.</p>
                    )}
                 </div>
              </section>
            )}

            {/* Aggregate Reviews - Mandatory 100% Anonymous Rendering */}
            {isProvider && (
              <section className="bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 text-white">
                 <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-white/10 text-white rounded-2xl">
                          <Star size={20} />
                       </div>
                       <h3 className="text-2xl font-display font-black italic">Community Star Rating</h3>
                    </div>
                    <div className="text-right">
                       <p className="text-4xl font-display font-black text-amber-400 italic leading-none">{displayRating || '0.0'}</p>
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-2">{displayCount} feedbacks</p>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map((val) => {
                      const count = reviewsStats.starDistribution[val - 1]
                      return (
                        <div key={val} className="text-center">
                           <div className={cn(
                             "aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all relative",
                             Math.round(displayRating) >= val ? "bg-white/10 border-amber-400 text-amber-400 animate-pulse" : "bg-white/5 border-white/5 text-white/20"
                           )}>
                              <Star size={24} className={Math.round(displayRating) >= val ? "fill-amber-400" : ""} />
                              {count > 0 && (
                                <span className="absolute top-1 right-1.5 text-[8px] font-black text-white bg-indigo-600 rounded-full px-1.5 py-0.5">
                                  {count}
                                </span>
                              )}
                           </div>
                           <p className="text-[10px] font-black mt-3 opacity-40 uppercase">{val} Star</p>
                        </div>
                      )
                    })}
                 </div>
                 
                 <div className="mt-10 p-6 bg-white/5 rounded-2xl text-xs font-bold text-white/60 leading-relaxed italic border border-white/5 flex gap-3 items-start">
                   <Info size={16} className="shrink-0 mt-0.5 text-indigo-400" />
                   <p>
                     To preserve our peaceful neighborhood privacy standards, individual review comments and client identity cards remain 100% encrypted and anonymous.
                   </p>
                 </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}