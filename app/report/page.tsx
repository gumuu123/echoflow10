'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  ShieldAlert, 
  Send, 
  ArrowLeft, 
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

function ReportContent() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    type: 'Generic Issue',
    description: '',
    target_id: '', // The user being reported
    booking_id: '' // Optional booking reference
  })
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const targetId = searchParams.get('target')
    const bookingId = searchParams.get('booking')
    if (targetId) setFormData(prev => ({ ...prev, target_id: targetId }))
    if (bookingId) setFormData(prev => ({ ...prev, booking_id: bookingId }))
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login?next=/report')
      return
    }

    if (!formData.target_id || !formData.description) {
      alert('Please fill in all required fields.')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('disputes')
      .insert({
        reporter_id: user.id,
        target_id: formData.target_id,
        booking_id: formData.booking_id || null,
        type: formData.type,
        description: formData.description,
        status: 'open'
      })

    if (error) {
      alert(error.message)
    } else {
      setSubmitted(true)
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[50px] p-12 text-center shadow-xl">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Report Filed</h2>
          <p className="text-gray-500 font-medium mb-8 leading-relaxed italic">
            Thank you for helping keep our community safe. Our admin team will review this dispute and take appropriate action.
          </p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-3xl mx-auto w-full px-4 py-20">
        <Link href="/dashboard" className="inline-flex items-center text-gray-400 hover:text-gray-900 font-bold mb-8 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Back
        </Link>

        <div className="bg-white rounded-[60px] shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 lg:p-12 bg-red-600 text-white relative">
             <div className="relative z-10">
                <ShieldAlert size={48} className="mb-6 opacity-80" />
                <h1 className="text-4xl font-black italic mb-2">Report a Dispute</h1>
                <p className="text-red-100 font-medium italic">Help us maintain a safe and professional environment.</p>
             </div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -translate-y-12 translate-x-12"></div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-8">
            {/* Warning Box */}
            <div className="bg-yellow-50 border border-yellow-100 p-6 rounded-3xl flex items-start space-x-4">
               <AlertCircle className="text-yellow-600 shrink-0 mt-1" />
               <p className="text-sm text-yellow-800 font-bold leading-relaxed">
                 Falsifying reports or Harassment via this system will result in immediate account termination. Please provide accurate details.
               </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Issue Category</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-red-500 transition-all appearance-none cursor-pointer"
                >
                  <option>Payment Dispute</option>
                  <option>No-Show / Reliability</option>
                  <option>Unprofessional Behavior</option>
                  <option>Poor Service Quality</option>
                  <option>Scam or Fraud</option>
                  <option>Generic Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Target User ID (Required)</label>
                <input 
                  type="text"
                  required
                  placeholder="Paste user ID here..."
                  value={formData.target_id}
                  onChange={(e) => setFormData({...formData, target_id: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Booking ID (Optional)</label>
              <input 
                type="text"
                placeholder="Reference booking ID for better context..."
                value={formData.booking_id}
                onChange={(e) => setFormData({...formData, booking_id: e.target.value})}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Description of the Incident</label>
              <textarea 
                required
                rows={6}
                placeholder="Provide specific details about what happened. Include dates, times, and any relevant dialogue..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-inner min-h-[150px]"
              ></textarea>
            </div>

            <div className="pt-6">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-6 rounded-3xl font-black text-xl hover:bg-black transition-all shadow-xl flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    <Send size={24} />
                    <span>File Official Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <ReportContent />
    </Suspense>
  )
}
