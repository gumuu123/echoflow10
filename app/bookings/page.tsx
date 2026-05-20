'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  MessageSquare,
  Star
} from 'lucide-react'
import Link from 'next/link'

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    setProfile(profileData)

    const isProvider = profileData?.role === 'provider'
    const query = supabase
      .from('bookings')
      .select(`
        *,
        service:services(title, category:categories(name)),
        client:profiles!bookings_client_id_fkey(full_name, avatar_url, phone, city),
        provider:profiles!bookings_provider_id_fkey(full_name, avatar_url, phone, city)
      `)
      .order('booking_date', { ascending: false })

    if (isProvider) {
      query.eq('provider_id', user.id)
    } else {
      query.eq('client_id', user.id)
    }

    const { data } = await query
    setBookings(data || [])
    setLoading(false)
  }

  const updateStatus = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId)

    if (error) {
      alert(error.message)
    } else {
      fetchBookings()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'completed': return 'text-blue-600 bg-blue-50'
      case 'cancelled': return 'text-red-600 bg-red-50'
      case 'in_progress': return 'text-purple-600 bg-purple-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle2 className="w-4 h-4 mr-1" />
      case 'pending': return <AlertCircle className="w-4 h-4 mr-1" />
      case 'completed': return <CheckCircle2 className="w-4 h-4 mr-1" />
      case 'cancelled': return <XCircle className="w-4 h-4 mr-1" />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const isProvider = profile?.role === 'provider'

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900">Your Bookings</h1>
            <p className="text-gray-500 mt-2">Manage your appointments and service history.</p>
          </div>
          <Link 
            href={isProvider ? "/dashboard" : "/search"}
            className="inline-flex items-center text-blue-600 font-bold hover:underline"
          >
            {isProvider ? "Back to Dashboard" : "Find more services"}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    {/* Left: Info */}
                    <div className="flex items-start space-x-6">
                      <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-2xl text-gray-400 shrink-0">
                        {isProvider ? (
                          booking.client?.avatar_url ? <img src={booking.client.avatar_url} className="w-full h-full rounded-2xl object-cover" /> : booking.client?.full_name?.charAt(0)
                        ) : (
                          booking.provider?.avatar_url ? <img src={booking.provider.avatar_url} className="w-full h-full rounded-2xl object-cover" /> : booking.provider?.full_name?.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">
                            {(Array.isArray(booking.service) ? booking.service[0]?.category?.name : booking.service?.category?.name) || 'Service'}
                          </span>
                          <div className={`flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            {booking.status.replace('_', ' ')}
                          </div>
                        </div>
                        <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
                          {(Array.isArray(booking.service) ? booking.service[0]?.title : booking.service?.title) || 'Custom Service'}
                        </h3>
                        <p className="text-gray-500 font-medium mb-4 flex items-center">
                          With {isProvider ? booking.client?.full_name : booking.provider?.full_name}
                        </p>
                        
                        <div className="flex flex-wrap gap-6 text-sm font-bold text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {booking.booking_date}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                            {booking.start_time}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            {isProvider ? (booking.client?.city || 'On-site') : (booking.provider?.city || 'Local')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Price & Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 lg:text-right">
                      <div>
                        <p className="text-gray-500 text-sm font-medium">Total Price</p>
                        <p className="text-3xl font-black text-gray-900">${booking.total_price}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {isProvider && booking.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => updateStatus(booking.id, 'confirmed')}
                              className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 transition"
                            >
                              Confirm
                            </button>
                            <button 
                              onClick={() => updateStatus(booking.id, 'cancelled')}
                              className="bg-red-50 text-red-600 px-6 py-2 rounded-xl font-bold hover:bg-red-100 transition"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        
                        {isProvider && booking.status === 'confirmed' && (
                          <button 
                            onClick={() => updateStatus(booking.id, 'completed')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition"
                          >
                            Mark Completed
                          </button>
                        )}

                        {!isProvider && booking.status === 'pending' && (
                          <button 
                            onClick={() => updateStatus(booking.id, 'cancelled')}
                            className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl font-bold hover:bg-gray-200 transition"
                          >
                            Cancel
                          </button>
                        )}

                        {booking.status === 'completed' && !isProvider && (
                          <button className="flex items-center bg-yellow-50 text-yellow-700 px-6 py-2 rounded-xl font-bold hover:bg-yellow-100 transition">
                            <Star className="w-4 h-4 mr-2" />
                            Leave Review
                          </button>
                        )}

                        <Link 
                          href="/messages"
                          className="flex items-center bg-gray-50 text-gray-700 px-6 py-2 rounded-xl font-bold hover:bg-gray-100 transition"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl py-20 px-8 text-center border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-gray-300" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">No bookings yet</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">
              {isProvider 
                ? "When clients book your services, they will appear here. Make sure your profile is complete!" 
                : "You haven't booked any services yet. Explore amazing pros in your area to get started."}
            </p>
            <Link 
              href={isProvider ? "/profile" : "/search"}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-lg inline-block"
            >
              {isProvider ? "Update Your Profile" : "Browse Services"}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
