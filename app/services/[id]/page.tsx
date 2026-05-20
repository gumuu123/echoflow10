'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Star, MapPin, Calendar, Clock, Shield, Check, MessageSquare, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ServiceDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchService()
  }, [id])

  const [activeImage, setActiveImage] = useState(0)

  const fetchService = async () => {
    const { data } = await supabase
      .from('services')
      .select(`
        *,
        category:categories(name),
        provider:profiles!services_provider_id_fkey(*)
      `)
      .eq('id', id)
      .single()
    
    setService(data)
    setLoading(false)
  }

  const handleBooking = async () => {
    setBookingLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login?next=/services/' + id)
      return
    }

    const { error } = await supabase.from('bookings').insert({
      service_id: id,
      provider_id: service.provider_id,
      client_id: user.id,
      status: 'pending',
      total_price: service.price,
      booking_date: new Date().toISOString().split('T')[0],
      start_time: '10:00 AM'
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Booking request sent!')
      router.push('/dashboard')
    }
    setBookingLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">Service not found</h2>
          <Link href="/search" className="text-blue-600">Back to search</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/search" className="flex items-center text-gray-500 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Portfolio */}
        {service.images && service.images.length > 0 && (
          <div className="mb-12 space-y-4">
             <div className="aspect-video w-full rounded-[40px] overflow-hidden bg-gray-200 border border-gray-100 shadow-xl relative group">
                <img src={service.images[activeImage]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                {service.is_boosted && (
                  <div className="absolute top-8 left-8 bg-yellow-400 text-yellow-900 border border-yellow-500 px-4 py-2 rounded-2xl flex items-center shadow-2xl text-xs font-black uppercase tracking-widest animate-pulse">
                    Featured Expert
                  </div>
                )}
             </div>
             <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {service.images.map((img: string, i: number) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-32 h-20 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-blue-600 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
             </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                {service.category?.name || 'Service'}
              </span>
              <h1 className="text-4xl font-extrabold text-gray-900 mt-4 mb-6">{service.title}</h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">{service.description}</p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center text-gray-700 bg-gray-50 px-4 py-2 rounded-xl">
                  <Star className="w-5 h-5 text-yellow-500 mr-2 fill-yellow-500" />
                  <span className="font-bold">{service.provider?.rating?.toFixed(1) || 'NEW'} Rating</span>
                </div>
                <div className="flex items-center text-gray-700 bg-gray-50 px-4 py-2 rounded-xl">
                  <MapPin className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="font-bold">{[service.provider?.barangay, service.provider?.city].filter(Boolean).join(', ') || 'Local Area'}</span>
                </div>
              </div>
            </div>

            {/* Provider Info */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About the Provider</h2>
              <div className="flex items-center space-x-6 mb-6">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-3xl font-bold text-gray-500">
                  {service.provider?.avatar_url ? (
                    <img src={service.provider.avatar_url} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    service.provider?.full_name?.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{service.provider?.full_name}</h3>
                  <div className="flex items-center text-gray-500 mt-1">
                    <Check className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm">Verified Professional</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-6">{service.provider?.bio || service.provider?.description || 'No bio provided.'}</p>
              <button 
                onClick={handleBooking}
                disabled={bookingLoading}
                className="flex items-center text-blue-600 font-bold hover:underline disabled:opacity-50"
              >
                {bookingLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <MessageSquare className="w-5 h-5 mr-2" />}
                Contact {service.provider?.full_name?.split(' ')[0] || 'Provider'}
              </button>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <div className="mb-8">
                <p className="text-gray-500 font-medium">Starting from</p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-5xl font-black text-gray-900">${service.price}</span>
                  <span className="text-gray-500 font-bold">/ task</span>
                </div>
              </div>

              <div className="space-y-4 mb-8 text-sm font-medium text-gray-600">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-gray-400 mr-3" />
                  Community-Verified Professionals
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-3" />
                  Direct Peer-to-Peer Communication
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={bookingLoading}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 active:transform active:scale-95 flex items-center justify-center disabled:opacity-50"
              >
                {bookingLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Contact & Book'}
              </button>

              <p className="mt-4 text-center text-xs text-gray-400">
                Discuss payment methods (Cash, GCash, etc.) directly with the pro.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
