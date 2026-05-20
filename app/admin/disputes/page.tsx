'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  ShieldAlert, 
  Clock, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  User,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react'

export default function DisputeManagement() {
  const [disputes, setDisputes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDispute, setSelectedDispute] = useState<any>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchDisputes()
  }, [])

  const fetchDisputes = async () => {
    const { data } = await supabase
      .from('disputes')
      .select(`
        *,
        reporter:profiles!reporter_id(full_name, email),
        target:profiles!target_id(full_name, email),
        booking:bookings(*)
      `)
      .order('created_at', { ascending: false })
    
    setDisputes(data || [])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    setProcessing(id)
    const { error } = await supabase
      .from('disputes')
      .update({ status })
      .eq('id', id)

    if (error) {
      alert(error.message)
    } else {
      setDisputes(disputes.map(d => d.id === id ? { ...d, status } : d))
      if (selectedDispute?.id === id) {
        setSelectedDispute({ ...selectedDispute, status })
      }
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
    <div className="flex flex-col lg:flex-row h-full gap-8">
      {/* Sidebar List */}
      <div className="lg:w-96 flex flex-col space-y-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <ShieldAlert size={32} className="text-red-500" />
            <h2 className="text-4xl font-black italic text-gray-900">Disputes</h2>
          </div>
          <p className="text-gray-500 font-bold">Manage community conflicts and reports.</p>
        </div>

        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h4 className="font-black text-gray-900">Active Tickets</h4>
            <Filter size={18} className="text-gray-400" />
          </div>
          <div className="overflow-y-auto max-h-[600px] divide-y divide-gray-50">
            {disputes.map((dispute) => (
              <button
                key={dispute.id}
                onClick={() => setSelectedDispute(dispute)}
                className={`w-full p-6 text-left hover:bg-gray-50 transition-colors flex items-start space-x-4 ${selectedDispute?.id === dispute.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''}`}
              >
                <div className={`mt-1 h-3 w-3 rounded-full shrink-0 ${
                  dispute.status === 'open' ? 'bg-red-500 animate-pulse' :
                  dispute.status === 'resolved' ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="font-black text-gray-900 truncate mb-1">{dispute.type}</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{dispute.reporter?.full_name}</div>
                  <div className="text-[10px] text-gray-400 mt-2 font-medium">
                    {new Date(dispute.created_at).toLocaleDateString()}
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Detail View */}
      <div className="flex-1">
        {selectedDispute ? (
          <div className="bg-white rounded-[60px] border border-gray-100 shadow-xl overflow-hidden h-full flex flex-col">
            <div className="p-8 lg:p-12 border-b border-gray-100 bg-gray-50/50">
              <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                  selectedDispute.status === 'open' ? 'bg-red-100 text-red-600' :
                  selectedDispute.status === 'resolved' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {selectedDispute.status}
                </span>
                <div className="flex items-center space-x-3 text-gray-400 font-bold text-sm">
                   <Clock size={16} />
                   <span>Opened {new Date(selectedDispute.created_at).toLocaleString()}</span>
                </div>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">{selectedDispute.type}</h1>
              <p className="text-xl text-gray-500 font-medium italic border-l-4 border-blue-600 pl-6 py-2">
                {selectedDispute.description}
              </p>
            </div>

            <div className="p-8 lg:p-12 space-y-12 flex-1 overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
                    <User size={14} className="mr-2" /> Reporter Details
                  </h4>
                  <div className="bg-gray-50 p-6 rounded-3xl">
                     <p className="font-black text-gray-900 text-lg">{selectedDispute.reporter?.full_name}</p>
                     <p className="text-gray-500 font-bold text-sm">{selectedDispute.reporter?.email}</p>
                     <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-tighter">ID: {selectedDispute.reporter_id}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
                    <ShieldAlert size={14} className="mr-2" /> Target/Accused Details
                  </h4>
                  <div className="bg-red-50 p-6 rounded-3xl">
                     <p className="font-black text-red-900 text-lg">{selectedDispute.target?.full_name}</p>
                     <p className="text-red-600/70 font-bold text-sm">{selectedDispute.target?.email}</p>
                     <p className="text-xs text-red-400 mt-2 font-bold uppercase tracking-tighter">ID: {selectedDispute.target_id}</p>
                  </div>
                </div>
              </div>

              {selectedDispute.booking_id && (
                <div className="bg-gray-900 rounded-[40px] p-8 text-white relative overflow-hidden group">
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                      <h4 className="text-blue-400 text-xs font-black uppercase tracking-widest mb-2">Linked Booking</h4>
                      <p className="text-xl font-bold mb-1">Booking #{selectedDispute.booking_id.slice(0, 8)}</p>
                      <p className="text-gray-400 text-sm font-medium">Status: {selectedDispute.booking?.status}</p>
                    </div>
                    <Link href={`/bookings/${selectedDispute.booking_id}`} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl font-black text-sm transition-colors flex items-center">
                      <span>Inspect Transaction</span>
                      <ChevronRight size={16} className="ml-2" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 lg:p-12 border-t border-gray-100 flex items-center justify-between gap-6 bg-gray-50/30">
               <div className="flex items-center space-x-4">
                  <button className="p-4 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                    <MessageSquare size={20} />
                  </button>
                  <button className="p-4 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                    <ExternalLink size={20} />
                  </button>
               </div>

               <div className="flex items-center space-x-4">
                  <button 
                    disabled={processing === selectedDispute.id || selectedDispute.status === 'dismissed'}
                    onClick={() => updateStatus(selectedDispute.id, 'dismissed')}
                    className="px-8 py-4 rounded-2xl font-black text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all flex items-center space-x-2"
                  >
                    <XCircle size={20} />
                    <span>Dismiss</span>
                  </button>
                  <button 
                    disabled={processing === selectedDispute.id || selectedDispute.status === 'resolved'}
                    onClick={() => updateStatus(selectedDispute.id, 'resolved')}
                    className="px-10 py-4 rounded-2xl bg-green-600 text-white font-black hover:bg-green-700 transition-all shadow-lg hover:shadow-green-200 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <CheckCircle size={20} />
                    <span>Mark Resolved</span>
                  </button>
               </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[60px] border border-dashed border-gray-200 h-full flex flex-col items-center justify-center text-center p-12">
             <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mb-8">
                <ShieldAlert className="text-gray-200" size={48} />
             </div>
             <h3 className="text-3xl font-black text-gray-900 mb-4">No Ticket Selected</h3>
             <p className="text-gray-400 font-medium max-w-sm">Select a dispute from the list on the left to begin arbitration and review official details.</p>
          </div>
        )}
      </div>
    </div>
  )
}
