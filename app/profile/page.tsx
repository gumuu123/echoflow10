'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { uploadFiles } from '@/lib/storage'
import { User, Phone, MapPin, Camera, Save, Loader2, TrendingUp, X, History } from 'lucide-react'
import { format } from 'date-fns'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clientBookings, setClientBookings] = useState<any[]>([])
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    city: 'Lapu-Lapu City',
    barangay: '',
    street: '',
    facebook_url: '',
    mode_of_payment: '',
    payment_terms: [] as string[],
    offered_services: [] as string[],
    avatar_url: '',
    cover_photo_url: '',
    email: '',
  })
  const [newService, setNewService] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) {
        console.error("Error retrieving profile from database:", error.message)
      }

      if (data) {
        setProfile(data)
        setFormData({
          full_name: data.full_name || '',
          phone_number: data.phone_number || '',
          city: data.city || 'Lapu-Lapu City',
          barangay: data.barangay || '',
          street: data.street || '',
          facebook_url: data.facebook_url || '',
          mode_of_payment: data.mode_of_payment || '',
          payment_terms: Array.isArray(data.payment_terms) ? data.payment_terms : [],
          offered_services: Array.isArray(data.offered_services) ? data.offered_services : [],
          avatar_url: data.avatar_url || '',
          cover_photo_url: data.cover_photo_url || '',
          email: user.email || data.email || '', // Fallback safely to auth email metadata
        })

        // If client, fetch their transactional journey
        if (data.role === 'client') {
          const { data: bookingsData } = await supabase
            .from('bookings')
            .select(`
              *,
              provider:profiles!provider_id(*)
            `)
            .eq('client_id', user.id)
            .order('booked_at', { ascending: false })
          setClientBookings(bookingsData || [])
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile info:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0]
    if (!file || !profile?.id) return
    
    try {
      setSaving(true)
      const bucket = type === 'avatar' ? 'avatars' : 'covers'
      const urls = await uploadFiles([file], bucket)
      const url = urls[0]

      if (type === 'avatar') {
        setFormData(prev => ({ ...prev, avatar_url: url }))
      } else {
        setFormData(prev => ({ ...prev, cover_photo_url: url }))
      }
      
      const field = type === 'avatar' ? 'avatar_url' : 'cover_photo_url'
      await supabase.from('profiles').update({ [field]: url }).eq('id', profile.id)
    } catch (err: any) {
      alert(`Upload error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile?.id) return
    setSaving(true)
    
    // Deconstruct fields cleanly to avoid updating non-existent columns (like email)
    const { email, ...updatableFields } = formData

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updatableFields,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    if (error) {
      alert(`Update failed: ${error.message}`)
    } else {
      alert('Success! Your neighborhood profile has been updated.')
      fetchProfile()
    }
    
    setSaving(false)
  }

  const toggleTerm = (term: string) => {
    const current = formData.payment_terms
    if (current.includes(term)) {
      setFormData({ ...formData, payment_terms: current.filter(t => t !== term) })
    } else {
      setFormData({ ...formData, payment_terms: [...current, term] })
    }
  }

  const addService = () => {
    if (!newService.trim()) return
    setFormData({ ...formData, offered_services: [...formData.offered_services, newService.trim()] })
    setNewService('')
  }

  const removeService = (idx: number) => {
    setFormData({ ...formData, offered_services: formData.offered_services.filter((_, i) => i !== idx) })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Gathering community profile details...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-12 bg-white rounded-[3rem] shadow-2xl border border-slate-100 max-w-md mx-auto">
          <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <User className="w-12 h-12 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-display font-black text-slate-900 italic uppercase tracking-tighter">Connection Offline</h2>
          <p className="text-slate-400 font-bold mt-4 text-sm leading-relaxed">It seems we couldn't authenticate you. Please sign back in to access your profile safely.</p>
          <Link href="/login" className="mt-10 inline-block w-full grad-primary text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100/50 hover:-translate-y-1 transition-all">
            Sign In Again
          </Link>
        </div>
      </div>
    )
  }

  const isProvider = profile?.role === 'provider'

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 lg:py-24 pb-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-12">
            <div>
               <h1 className="text-4xl font-display font-black text-slate-900 italic uppercase tracking-tighter">Profile Settings</h1>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Personalize how you connect with neighbors</p>
            </div>
            <Link href={`/profile/${profile?.id}`} className="px-6 py-3 bg-white border border-slate-100 rounded-2xl text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
               View Public Profile
            </Link>
        </div>

        <form onSubmit={handleUpdate} className="space-y-10">
          
          {/* Cover & Avatar Module */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">
            <div className="h-64 relative group">
               {formData.cover_photo_url ? (
                 <img src={formData.cover_photo_url} className="w-full h-full object-cover" alt="Cover" />
               ) : (
                 <div className="w-full h-full grad-primary opacity-10" />
               )}
               <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                  <div className="text-center">
                     <Camera className="w-8 h-8 mx-auto mb-2" />
                     <p className="font-black text-[10px] uppercase tracking-widest">Update Cover Photo</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} />
               </label>
            </div>
            
            <div className="px-10 pb-10">
              <div className="relative flex justify-between items-end -mt-16 mb-10">
                <div className="relative group">
                   <div className="w-32 h-32 bg-white rounded-[2rem] p-1 shadow-2xl border border-slate-100 overflow-hidden">
                      {formData.avatar_url ? (
                        <img src={formData.avatar_url} className="w-full h-full object-cover rounded-[1.8rem]" alt="Avatar" />
                      ) : (
                        <div className="w-full h-full bg-slate-50 rounded-[1.8rem] flex items-center justify-center text-4xl font-black text-slate-300 uppercase italic">
                           {profile?.full_name?.charAt(0)}
                        </div>
                      )}
                   </div>
                   <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera size={24} />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
                   </label>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Save All Changes
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Your Full Name</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-sans"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-6 py-4 bg-slate-100 border border-slate-100 rounded-2xl text-slate-400 font-bold outline-none cursor-not-allowed font-sans"
                    />
                 </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left/Middle Column */}
            <div className="lg:col-span-2 space-y-10">
               {/* Location / neighborhood detail */}
               <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <MapPin size={20} />
                     </div>
                     <h3 className="text-xl font-display font-black text-slate-900 italic">Your Local Area</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                     <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Street Address / House info</label>
                        <input
                          type="text"
                          placeholder="e.g. 123 Friendly Lane"
                          value={formData.street}
                          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold font-sans"
                        />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Barangay Sector</label>
                        <input
                          type="text"
                          placeholder="e.g. Basak"
                          value={formData.barangay}
                          onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold font-sans"
                        />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">City / Town</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold font-sans"
                        />
                     </div>
                  </div>
               </section>

               {/* Role-Specific Panel */}
               {isProvider ? (
                 <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 animate-in slide-in-from-bottom duration-550">
                    <div className="flex items-center gap-4 mb-8">
                       <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
                          <TrendingUp size={20} />
                       </div>
                       <h3 className="text-xl font-display font-black text-slate-900 italic">Service Management Panel</h3>
                    </div>
                    
                    <div className="mb-8">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Offered Services Tag Module</label>
                       <div className="flex gap-4">
                          <input
                            type="text"
                            placeholder="e.g. Plumbing repairs, Garden care, Home massage"
                            value={newService}
                            onChange={(e) => setNewService(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                            className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-semibold outline-none focus:ring-4 focus:ring-indigo-50 font-sans"
                          />
                          <button
                            type="button"
                            onClick={addService}
                            className="bg-indigo-600 text-white px-8 rounded-2xl font-black text-xs uppercase tracking-widest"
                          >
                             Add Tag
                          </button>
                       </div>
                       <div className="flex flex-wrap gap-2 mt-4">
                          {formData.offered_services.map((tag, i) => (
                             <div key={i} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl flex items-center gap-2 font-bold text-xs font-sans">
                                <span>{tag}</span>
                                <button type="button" onClick={() => removeService(i)} className="hover:text-red-500">
                                   <X size={14} />
                                </button>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Mode of Payment</label>
                          <input
                            type="text"
                            placeholder="e.g. Cash, GCash 0917..."
                            value={formData.mode_of_payment}
                            onChange={(e) => setFormData({ ...formData, mode_of_payment: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold font-sans"
                          />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Payment Terms Arrangement</label>
                          <div className="grid grid-cols-2 gap-2">
                             {['Per Hour', 'Per Day', 'Per Session', 'Per Project'].map(term => (
                               <button
                                 key={term}
                                 type="button"
                                 onClick={() => toggleTerm(term)}
                                 className={cn(
                                   "px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-tighter border transition-all font-sans",
                                   formData.payment_terms.includes(term)
                                     ? "bg-slate-900 text-white border-slate-900"
                                     : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                                 )}
                               >
                                 {term}
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>
                 </section>
               ) : (
                 /* Client Transactional Interaction History Panel */
                 <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 animate-in slide-in-from-bottom duration-550">
                    <div className="flex items-center gap-4 mb-8">
                       <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                          <History size={20} />
                       </div>
                       <h3 className="text-xl font-display font-black text-slate-900 italic">Transactional Interaction History</h3>
                    </div>
                    
                    <div className="divide-y divide-slate-50">
                       {clientBookings.length > 0 ? (
                         clientBookings.map((b) => (
                           <div key={b.id} className="py-6 flex items-center justify-between group">
                              <div>
                                 <h4 className="font-extrabold text-slate-900 italic text-base">Booking for {b.service_category || 'Local Service'}</h4>
                                 <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                                   With {b.provider?.full_name} • {b.booked_at ? format(new Date(b.booked_at), 'MMM dd, yyyy') : 'No Date'}
                                 </p>
                              </div>
                              <span className={cn(
                                "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                                b.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                b.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                b.status === 'accepted' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                "bg-red-50 text-red-650 border-red-100"
                              )}>
                                 {b.status}
                              </span>
                           </div>
                         ))
                       ) : (
                         <div className="text-center py-12">
                            <p className="text-slate-400 font-bold italic text-sm">No transaction interactions logged yet.</p>
                            <Link href="/search" className="text-indigo-600 font-extrabold text-xs uppercase hover:underline mt-2 inline-block">Explore Local Pro Listings</Link>
                         </div>
                       )}
                    </div>
                 </section>
               )}
            </div>

            {/* Sidebar Communication coordinates */}
            <div className="space-y-10">
               <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                        <Phone size={20} />
                     </div>
                     <h3 className="text-xl font-display font-black text-slate-900 italic">Communications</h3>
                  </div>
                  <div className="space-y-6">
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Primary Phone Number</label>
                        <input
                          type="tel"
                          value={formData.phone_number}
                          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold font-sans"
                        />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Facebook Profile Link</label>
                        <input
                          type="text"
                          placeholder="https://facebook.com/your-username"
                          value={formData.facebook_url}
                          onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold font-sans"
                        />
                     </div>
                  </div>
               </section>
               
               <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white">
                  <div className="flex items-center gap-4 mb-6">
                     <div className="p-3 bg-white/10 rounded-2xl">
                        <User size={20} />
                     </div>
                     <h3 className="text-xl font-display font-black italic text-white">Cozy Neighborhood Circle</h3>
                  </div>
                  <p className="text-white/60 font-medium text-xs leading-relaxed">
                    EchoFlow values genuine neighborly interactions. Your communication links are only shared to ensure smooth, friendly contact after an appointment is accepted.
                  </p>
               </section>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}