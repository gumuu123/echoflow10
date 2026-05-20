'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Check, X, Shield, Star, MapPin, ExternalLink } from 'lucide-react'

export default function ProviderApprovals() {
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchPendingProviders()
  }, [])

  const fetchPendingProviders = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'provider')
      .eq('provider_status', 'pending')
      .order('created_at', { ascending: false })
    
    setProviders(data || [])
    setLoading(false)
  }

  const updateProviderStatus = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id)
    const { error } = await supabase
      .from('profiles')
      .update({ provider_status: status })
      .eq('id', id)

    if (error) {
      alert(error.message)
    } else {
      setProviders(providers.filter(p => p.id !== id))
    }
    setProcessingId(null)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 font-bold">Scanning for new applications...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 font-sans">Provider Approvals</h1>
        <p className="text-gray-500 mt-2 font-medium">Verify and onboard new professionals to our network.</p>
      </div>

      {providers.length > 0 ? (
        <div className="grid gap-6">
          {providers.map((provider) => (
            <div key={provider.id} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-start space-x-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-3xl text-gray-400 overflow-hidden shrink-0">
                    {provider.avatar_url ? <img src={provider.avatar_url} className="w-full h-full object-cover" /> : provider.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">{provider.full_name}</h3>
                    <p className="text-blue-600 font-bold text-sm tracking-wide lowercase mb-4">{provider.email}</p>
                    
                    <div className="flex flex-wrap gap-6 text-sm font-bold text-gray-400">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Verification Pending
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {provider.city || 'City not set'}
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-2" />
                        New Application
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 max-w-2xl">
                      <p className="text-sm text-gray-600 font-medium italic">"{provider.bio || 'No bio provided.'}"</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => updateProviderStatus(provider.id, 'approved')}
                    disabled={!!processingId}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition shadow-lg shadow-green-200 disabled:opacity-50"
                  >
                    {processingId === provider.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="mr-2" size={20} />}
                    Approve
                  </button>
                  <button 
                    onClick={() => updateProviderStatus(provider.id, 'rejected')}
                    disabled={!!processingId}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center px-8 py-4 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 transition disabled:opacity-50"
                  >
                    {processingId === provider.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="mr-2" size={20} />}
                    Reject
                  </button>
                  <button className="flex-1 sm:flex-none p-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl transition">
                    <ExternalLink size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl py-24 text-center border border-dashed border-gray-200">
          <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="text-green-600 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2 font-sans">No pending approvals</h2>
          <p className="text-gray-500 font-medium max-w-md mx-auto">All pros in the queue have been processed. Great job keeping up with the platform growth!</p>
        </div>
      )}
    </div>
  )
}
