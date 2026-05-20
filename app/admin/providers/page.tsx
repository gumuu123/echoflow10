'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  Check, 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react'

export default function ProviderVerification() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'provider')
      .eq('provider_status', 'pending')
      .order('created_at', { ascending: true })
    
    setRequests(data || [])
    setLoading(false)
  }

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setProcessing(id)
    const { error } = await supabase
      .from('profiles')
      .update({ 
        provider_status: status,
        verified: status === 'approved' 
      })
      .eq('id', id)

    if (error) {
      alert(error.message)
    } else {
      setRequests(requests.filter(r => r.id !== id))
    }
    setProcessing(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <ShieldCheck className="text-blue-600" size={32} />
          <h2 className="text-4xl font-black text-gray-900 italic">Provider Verification</h2>
        </div>
        <p className="text-gray-500 font-bold">Review and approve new professionals joining the EchoFlow ecosystem.</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-[40px] p-20 border border-dashed border-gray-200 text-center">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="text-gray-300" size={40} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Zero Pending Requests</h3>
            <p className="text-gray-400 font-medium">All provider applications have been processed. Great job!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all">
               <div className="flex flex-col lg:flex-row">
                  {/* Left: Avatar & Bio */}
                  <div className="p-8 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-gray-100 bg-gray-50/50">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-md">
                        {request.avatar_url ? (
                          <img src={request.avatar_url} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <div className="w-full h-full bg-blue-100 flex items-center justify-center text-2xl font-black text-blue-600 rounded-xl">
                            {request.full_name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-gray-900 leading-tight">{request.full_name}</h4>
                        <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                          <Check className="w-3 h-3 mr-1" /> Profile Ready
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-500 font-medium text-sm leading-relaxed line-clamp-3 italic">"{request.bio || 'No biography provided.'}"</p>
                  </div>

                  {/* Right: Details & Actions */}
                  <div className="flex-1 p-8">
                     <div className="grid sm:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-4 text-sm font-bold text-gray-600">
                           <div className="flex items-center space-x-3">
                              <Mail size={18} className="text-gray-400" />
                              <span>{request.email}</span>
                           </div>
                           <div className="flex items-center space-x-3">
                              <Phone size={18} className="text-gray-400" />
                              <span>{request.phone || 'N/A'}</span>
                           </div>
                        </div>
                        <div className="space-y-4 text-sm font-bold text-gray-600">
                           <div className="flex items-center space-x-3">
                              <MapPin size={18} className="text-gray-400" />
                              <span>{request.city || 'N/A'}</span>
                           </div>
                           <div className="flex items-center space-x-3 text-blue-600">
                              <ExternalLink size={18} />
                              <Link href={`/profile/${request.id}`} className="hover:underline">View Public Profile</Link>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center justify-end space-x-4">
                        <button 
                          disabled={processing === request.id}
                          onClick={() => handleAction(request.id, 'rejected')}
                          className="px-8 py-4 rounded-2xl font-black text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                        >
                          <X size={20} />
                          <span>Reject</span>
                        </button>
                        <button 
                          disabled={processing === request.id}
                          onClick={() => handleAction(request.id, 'approved')}
                          className="px-8 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 flex items-center space-x-2"
                        >
                          <Check size={20} />
                          <span>Approve Access</span>
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
