'use client'

import { useState, useEffect } from 'react'
import { X, Upload, Send, ShieldAlert, MessageSquarePlus, LifeBuoy, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function FooterModals() {
  const [activeModal, setActiveModal] = useState<'feature' | 'support' | 'dispute' | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Form states
  const [featureData, setFeatureData] = useState({ feedback_text: '', suggested_feature: '' })
  const [supportData, setSupportData] = useState({ name: '', email: '', topic: '', subject: '', description: '' })
  const [disputeData, setDisputeData] = useState({ type: '', description: '', booking_id: '' })
  const [attachments, setAttachments] = useState<File[]>([])

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        let query = supabase
          .from('profiles')
          .select('id, full_name, role')
          .ilike('full_name', `%${searchQuery}%`)
          .limit(5)
        
        if (user) {
          query = query.neq('id', user.id)
        }

        const { data, error } = await query
        if (error) throw error
        setSearchResults(data || [])
      } catch (err) {
        console.error("Error searching users:", err)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, supabase])

  useEffect(() => {
    const openFeature = () => setActiveModal('feature')
    const openSupport = () => setActiveModal('support')
    const openDispute = () => setActiveModal('dispute')

    window.addEventListener('open-feature-modal', openFeature)
    window.addEventListener('open-support-modal', openSupport)
    window.addEventListener('open-dispute-modal', openDispute)

    return () => {
      window.removeEventListener('open-feature-modal', openFeature)
      window.removeEventListener('open-support-modal', openSupport)
      window.removeEventListener('open-dispute-modal', openDispute)
    }
  }, [])

  const closeModal = () => {
    setActiveModal(null)
    setSuccess(false)
    setError(null)
    setAttachments([])
    setFeatureData({ feedback_text: '', suggested_feature: '' })
    setSupportData({ name: '', email: '', topic: '', subject: '', description: '' })
    setDisputeData({ type: '', description: '', booking_id: '' })
    setSearchQuery('')
    setSearchResults([])
    setSelectedUser(null)
    setIsSearching(false)
  }

  const uploadFiles = async (files: File[], bucket: string) => {
    const urls: string[] = []
    for (const file of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${fileName}`

      try {
        const { error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, { cacheControl: '3600', upsert: false })

        if (error) {
          console.warn(`Storage interaction failed for ${bucket}:`, error.message)
          // If bucket is missing, we don't throw, we just don't add the URL
          if (error.message.includes('bucket not found') || error.message.includes('Forbidden')) {
             setError(`Warning: "${bucket}" bucket not found. Submission will continue without attachments.`)
             continue 
          }
          throw error
        }
        
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath)
        urls.push(publicUrl)
      } catch (e: any) {
        console.error(`Upload to ${bucket} failed:`, e)
        // Non-blocking for certain errors
        if (e.message?.includes('bucket')) continue
        throw e
      }
    }
    return urls
  }

  const handleFeatureSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error: insertError } = await supabase.from('feature_requests').insert({
        user_id: user?.id || null,
        feedback_text: featureData.feedback_text,
        suggested_feature: featureData.suggested_feature
      })

      if (insertError) throw insertError
      setSuccess(true)
    } catch (err: any) {
      console.error("Feature submission error:", err)
      setError(err.message || 'Transmission failed. Matrix connection interrupted.')
    } finally {
      setLoading(false)
    }
  }

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      let attachment_urls: string[] = []
      if (attachments.length > 0) {
        try {
          attachment_urls = await uploadFiles(attachments, 'support-attachments')
        } catch (uploadErr) {
          console.warn("Continuing support submission without attachments due to error")
        }
      }
      
      const { error: insertError } = await supabase.from('support_requests').insert({
        name: supportData.name,
        email: supportData.email,
        topic: supportData.topic,
        subject: supportData.subject,
        description: supportData.description,
        attachment_urls: attachment_urls.length > 0 ? attachment_urls : null
      })
      
      if (insertError) throw insertError
      setSuccess(true)
    } catch (err: any) {
      console.error("Support submission error:", err)
      setError(err.message || 'Support handshake failed. Try again shortly.')
    } finally {
      setLoading(false)
    }
  }

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Authentication required for secure dispute reporting.')
      
      if (!selectedUser) {
        throw new Error('Please select a target neighbor to report.')
      }

      let evidence_image_urls: string[] = []
      if (attachments.length > 0) {
        try {
          evidence_image_urls = await uploadFiles(attachments, 'dispute-evidence')
        } catch (uploadErr) {
          console.warn("Continuing dispute submission without evidence due to error")
        }
      }

      const { error: insertError } = await supabase.from('disputes').insert({
        reporter_id: user.id,
        target_id: selectedUser.id,
        type: disputeData.type,
        description: disputeData.description,
        evidence_image_urls: evidence_image_urls.length > 0 ? evidence_image_urls : null,
        status: 'open'
      })

      if (insertError) throw insertError
      setSuccess(true)
    } catch (err: any) {
      console.error("Dispute submission error:", err)
      setError(err.message || 'Dispute submission failed. Ensure you are authorized.')
    } finally {
      setLoading(false)
    }
  }

  if (!activeModal) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden relative border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">
              {activeModal === 'feature' && <MessageSquarePlus className="w-6 h-6" />}
              {activeModal === 'support' && <LifeBuoy className="w-6 h-6" />}
              {activeModal === 'dispute' && <ShieldAlert className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900">
                {activeModal === 'feature' && 'Request a Feature'}
                {activeModal === 'support' && 'Issues & Support'}
                {activeModal === 'dispute' && 'Report an Issue'}
              </h2>
              <p className="text-slate-500 text-sm">
                {activeModal === 'feature' && "Tell us how we can improve EchoFlow"}
                {activeModal === 'support' && "Get help with technical problems"}
                {activeModal === 'dispute' && "Report a problem with a service or pro"}
              </p>
            </div>
          </div>
          <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-xs font-bold flex items-center animate-in slide-in-from-top-2">
              <ShieldAlert className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}
          
          {success ? (
            <div className="text-center py-12 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">Message Sent!</h3>
              <p className="text-slate-600 mb-8">Thank you for helping us build a better platform.</p>
              <button onClick={closeModal} className="grad-primary text-white px-8 py-3 rounded-xl font-bold">
                Close Window
              </button>
            </div>
          ) : (
            <form 
              onSubmit={
                activeModal === 'feature' ? handleFeatureSubmit : 
                activeModal === 'support' ? handleSupportSubmit : 
                handleDisputeSubmit
              } 
              className="space-y-5"
            >
              {activeModal === 'feature' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Feature Name</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all outline-none font-medium"
                      placeholder="e.g. Dark Mode, Live Chat"
                      value={featureData.suggested_feature}
                      onChange={(e) => setFeatureData({...featureData, suggested_feature: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Details</label>
                    <textarea 
                      required 
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all outline-none font-medium resize-none"
                      placeholder="How would this benefit our community?"
                      value={featureData.feedback_text}
                      onChange={(e) => setFeatureData({...featureData, feedback_text: e.target.value})}
                    ></textarea>
                  </div>
                </>
              )}

              {activeModal === 'support' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Name</label>
                      <input 
                        type="text" required 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all outline-none font-medium"
                        value={supportData.name}
                        onChange={(e) => setSupportData({...supportData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                      <input 
                        type="email" required 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all outline-none font-medium"
                        value={supportData.email}
                        onChange={(e) => setSupportData({...supportData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Topic</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all outline-none font-medium"
                      value={supportData.topic}
                      onChange={(e) => setSupportData({...supportData, topic: e.target.value})}
                    >
                      <option value="">Select Topic</option>
                      <option value="technical">Technical Issue</option>
                      <option value="account">Account & Privacy</option>
                      <option value="billing">Billing & Payments</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                    <input 
                      type="text" required 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all outline-none font-medium"
                      value={supportData.subject}
                      onChange={(e) => setSupportData({...supportData, subject: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                    <textarea 
                      required rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all outline-none font-medium resize-none"
                      value={supportData.description}
                      onChange={(e) => setSupportData({...supportData, description: e.target.value})}
                    ></textarea>
                  </div>
                </>
              )}

              {activeModal === 'dispute' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Search Neighbor / Pro (Required)</label>
                    {selectedUser ? (
                      <div className="flex items-center justify-between p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{selectedUser.full_name}</p>
                          <p className="text-xs text-slate-500 capitalize">{selectedUser.role}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(null)
                            setSearchQuery('')
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-indigo-600 transition-colors"
                        >
                          Change User
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="relative">
                          <input
                            type="text"
                            required={!selectedUser}
                            placeholder="Type a neighbor's name..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all outline-none font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          {isSearching && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              <span className="block w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                            </div>
                          )}
                        </div>
                        {searchQuery.trim().length > 0 && searchResults.length > 0 && (
                          <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-[1.5rem] shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                            {searchResults.map((user) => (
                              <button
                                key={user.id}
                                type="button"
                                onClick={() => {
                                  setSelectedUser(user)
                                  setSearchResults([])
                                }}
                                className="w-full text-left px-5 py-3 hover:bg-indigo-50 flex flex-col transition-colors border-b last:border-0 border-slate-100 animate-in fade-in slide-in-from-top-1"
                              >
                                <span className="font-bold text-slate-900 text-sm">{user.full_name}</span>
                                <span className="text-[10px] uppercase font-black text-slate-300 tracking-wider font-mono">{user.role}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {searchQuery.trim().length > 0 && searchResults.length === 0 && !isSearching && (
                          <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-[1.5rem] p-4 text-center text-xs text-slate-400 shadow-xl font-medium animate-in fade-in slide-in-from-top-1">
                            No neighbors found matching "{searchQuery}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Issue Type</label>
                    <select 
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all outline-none font-medium"
                      value={disputeData.type}
                      onChange={(e) => setDisputeData({...disputeData, type: e.target.value})}
                    >
                      <option value="">Select Category</option>
                      <option value="no_show">No Show</option>
                      <option value="low_quality">Low Quality Work</option>
                      <option value="inappropriate_behavior">Inappropriate Behavior</option>
                      <option value="payment_dispute">Payment Dispute</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Describe the Incident</label>
                    <textarea 
                      required rows={4}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all outline-none font-medium resize-none"
                      value={disputeData.description}
                      onChange={(e) => setDisputeData({...disputeData, description: e.target.value})}
                    ></textarea>
                  </div>
                </>
              )}

              {/* Common File Upload for Support & Dispute */}
              {(activeModal === 'support' || activeModal === 'dispute') && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Attachments / Evidence</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      multiple 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => setAttachments(Array.from(e.target.files || []))}
                    />
                    <div className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center group-hover:border-indigo-400 transition-colors bg-slate-50/50">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                        <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                      <p className="text-sm font-medium text-slate-500">
                        {attachments.length > 0 ? `${attachments.length} files selected` : 'Click or drag to upload screenshots'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full grad-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
                {!loading && <Send className="w-5 h-5" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
