'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  MessageSquare, 
  Search, 
  Send, 
  User, 
  Loader2, 
  Paperclip, 
  Image as ImageIcon, 
  File as FileIcon,
  X,
  Archive,
  Maximize2,
  Volume2,
  VolumeX,
  ChevronLeft,
  Activity,
  Sparkles
} from 'lucide-react'
import { format } from 'date-fns'
import { uploadFiles } from '@/lib/storage'
import { cn } from '@/lib/utils'

export default function MessagesPage() {
  const [loading, setLoading] = useState(true)
  const [chats, setChats] = useState<any[]>([])
  const [filteredChats, setFilteredChats] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [sending, setSending] = useState(false)
  const [showMediaVault, setShowMediaVault] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const config = localStorage.getItem('echo_audio_enabled')
    if (config !== null) setSoundEnabled(config === 'true')
    fetchInitialData()
  }, [])

  useEffect(() => {
    localStorage.setItem('echo_audio_enabled', soundEnabled.toString())
  }, [soundEnabled])

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id)
      markAsRead(selectedChat.id)

      const channel = supabase
        .channel(`chat-${selectedChat.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `sender_id=eq.${selectedChat.id},receiver_id=eq.${profile?.id}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new])
            if (soundEnabled) playNotificationSound()
            markAsRead(selectedChat.id)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [selectedChat, profile])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Asynchronous conversation thread search by profile's full name
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      const term = searchTerm.toLowerCase().trim()
      if (!term) {
        setFilteredChats(chats)
        return
      }

      // 1. Search existing local threads first
      const matches = chats.filter(chat => 
        chat.partner?.full_name?.toLowerCase().includes(term) ||
        chat.partner?.email?.toLowerCase().includes(term)
      )

      if (matches.length > 0) {
        setFilteredChats(matches)
      } else {
        // 2. Fall back to an asynchronous database query matching other profiles
        const { data: matchedProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, role, email')
          .ilike('full_name', `%${term}%`)
          .neq('id', profile?.id || '')
          .limit(10)

        if (matchedProfiles && matchedProfiles.length > 0) {
          const generatedChats = matchedProfiles.map(p => ({
            id: p.id,
            partner: p,
            lastMessage: 'Tap to start a conversation',
            lastDate: new Date().toISOString()
          }))
          setFilteredChats(generatedChats)
        } else {
          setFilteredChats([])
        }
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchTerm, chats, profile])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3')
      audio.play().catch((e) => console.log('Chime wait:', e))
    } catch (e) {}
  }

  const fetchInitialData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    setProfile(profileData)

    if (profileData) {
      // Get all unique conversations
      const { data: sentMessages } = await supabase
        .from('messages')
        .select('receiver_id, created_at, message_text')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false })

      const { data: receivedMessages } = await supabase
        .from('messages')
        .select('sender_id, created_at, message_text')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })

      const contactIds = new Set<string>()
      const lastMessages: Record<string, any> = {}

      sentMessages?.forEach(m => {
        if (!contactIds.has(m.receiver_id)) {
          contactIds.add(m.receiver_id)
          lastMessages[m.receiver_id] = m
        }
      })

      receivedMessages?.forEach(m => {
        if (!contactIds.has(m.sender_id)) {
          contactIds.add(m.sender_id)
          lastMessages[m.sender_id] = m
        } else {
          const currentLast = lastMessages[m.sender_id]
          if (new Date(m.created_at) > new Date(currentLast.created_at)) {
            lastMessages[m.sender_id] = m
          }
        }
      })

      // Fetch unread message counts per thread
      const { data: unreads } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('receiver_id', user.id)
        .eq('is_read', false)

      const counts: Record<string, number> = {}
      unreads?.forEach((u) => {
        counts[u.sender_id] = (counts[u.sender_id] || 0) + 1
      })
      setUnreadCounts(counts)

      if (contactIds.size > 0) {
        const { data: partners } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, role, email')
          .in('id', Array.from(contactIds))

        const formattedChats = partners?.map(p => ({
          id: p.id,
          partner: p,
          lastMessage: lastMessages[p.id]?.message_text || 'Sent an attachment',
          lastDate: lastMessages[p.id]?.created_at
        })).sort((a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime())

        setChats(formattedChats || [])
        setFilteredChats(formattedChats || [])
      }
    }
    setLoading(false)
  }

  const fetchMessages = async (partnerId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
    
    setMessages(data || [])
  }

  const markAsRead = async (partnerId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', user.id)
      .eq('sender_id', partnerId)
      .eq('is_read', false)

    // Clear local count immediately
    setUnreadCounts(prev => ({ ...prev, [partnerId]: 0 }))
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if ((!newMessage.trim() && attachments.length === 0) || !selectedChat || !profile) return

    setSending(true)
    try {
      let attachment_urls: string[] = []
      if (attachments.length > 0) {
        attachment_urls = await uploadFiles(attachments, 'message-attachments')
      }

      const messageObj = {
        sender_id: profile.id,
        receiver_id: selectedChat.id,
        message_text: newMessage.trim(),
        attachment_urls: attachment_urls.length > 0 ? attachment_urls : null,
      }

      const { data, error } = await supabase
        .from('messages')
        .insert(messageObj)
        .select()
        .single()

      if (error) throw error

      setMessages(prev => [...prev, data])
      setNewMessage('')
      setAttachments([])
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSending(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const mediaInChat = messages.flatMap(m => m.attachment_urls || []).filter(url => 
    url.match(/\.(jpeg|jpg|gif|png)$/i)
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto h-[calc(100vh-80px)] lg:h-[calc(100vh-140px)] flex shadow-2xl shadow-indigo-100/50 bg-white rounded-[2.5rem] overflow-hidden border border-white">
        
        {/* Chats Sidebar */}
        <div className={cn(
          "w-full md:w-80 lg:w-[400px] border-r border-slate-100 flex flex-col bg-white transition-all",
          selectedChat ? "hidden md:flex" : "flex"
        )}>
          <div className="p-8 pb-4">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight italic">Messages</h1>
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2.5 rounded-2xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
            </div>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                placeholder="Search neighbor names..."
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-8 mt-4 space-y-2">
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => {
                const count = unreadCounts[chat.id] || 0
                return (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={cn(
                      "w-full p-4 flex items-center space-x-4 rounded-3xl transition-all group relative border border-transparent",
                      selectedChat?.id === chat.id 
                        ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200" 
                        : "hover:bg-slate-50 text-slate-600 hover:border-slate-100"
                    )}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm relative">
                      {chat.partner?.avatar_url ? (
                        <img src={chat.partner.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-slate-400 text-lg uppercase">
                          {chat.partner?.full_name?.charAt(0)}
                        </div>
                      )}
                      
                      {/* Animated unread red notification badge */}
                      {count > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[9px] font-black text-white flex items-center justify-center animate-bounce shadow-lg ring-2 ring-white">
                          {count}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className={cn("font-bold truncate", selectedChat?.id === chat.id ? "text-white" : "text-slate-900")}>
                          {chat.partner?.full_name}
                        </h3>
                        <span className={cn("text-[10px] font-black uppercase", selectedChat?.id === chat.id ? "text-indigo-200" : "text-slate-400")}>
                          {chat.lastDate ? format(new Date(chat.lastDate), 'MMM d') : ''}
                        </span>
                      </div>
                      <p className={cn("text-xs truncate font-semibold opacity-70", selectedChat?.id === chat.id ? "text-white" : "text-slate-500")}>
                        {chat.lastMessage}
                      </p>
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="p-12 text-center text-slate-400">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-10 h-10 opacity-20 text-slate-900" />
                </div>
                <p className="font-bold text-slate-900">No neighbors found</p>
                <p className="text-xs mt-2 font-bold opacity-60">Try searching another friend name to start a conversation.</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={cn(
          "flex-1 flex flex-col bg-slate-50/30 transition-all relative",
          selectedChat ? "flex" : "hidden md:flex"
        )}>
          {selectedChat ? (
            <>
              {/* Header */}
              <div className="px-8 py-6 bg-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button onClick={() => setSelectedChat(null)} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-900">
                    <ChevronLeft size={24} />
                  </button>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600 text-lg uppercase shadow-sm">
                    {selectedChat.partner?.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg leading-tight italic">{selectedChat.partner?.full_name}</h3>
                    <div className="flex items-center text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />
                      Active Secure Session
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setShowMediaVault(!showMediaVault)}
                    className="p-3 bg-slate-50 text-slate-500 rounded-2xl hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100 flex items-center gap-1.5"
                    title="Media Vault"
                  >
                    <Archive size={18} />
                    <span className="text-[10px] font-black uppercase hidden sm:inline">Media Vault</span>
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-8 overflow-y-auto space-y-6">
                {messages.map((msg, idx) => {
                  const isOwn = msg.sender_id === profile?.id
                  return (
                    <div key={msg.id || idx} className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
                      <div className={cn(
                        "max-w-[80%] p-5 rounded-[2rem] shadow-sm border animate-in slide-in-from-bottom-2 duration-300",
                        isOwn 
                          ? "bg-indigo-600 text-white border-indigo-700 rounded-tr-none" 
                          : "bg-white text-slate-900 border-slate-100 rounded-tl-none"
                      )}>
                        {msg.message_text && (
                          <p className="text-sm font-bold leading-relaxed">{msg.message_text}</p>
                        )}
                        
                        {msg.attachment_urls && msg.attachment_urls.length > 0 && (
                          <div className={cn("grid gap-2 mt-3", msg.attachment_urls.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
                            {msg.attachment_urls.map((url: string, i: number) => {
                              const isImg = url.match(/\.(jpeg|jpg|gif|png)$/i)
                              return (
                                <div key={i} className="rounded-xl overflow-hidden bg-black/5 border border-white/10 group relative">
                                  {isImg ? (
                                    <img src={url} alt="attachment" className="w-full h-auto object-cover max-h-60" />
                                  ) : (
                                    <a href={url} target="_blank" className="flex items-center p-4 space-x-3 text-xs font-black uppercase text-indigo-600 hover:underline">
                                      <FileIcon className="w-5 h-5 text-indigo-600 shrink-0" />
                                      <span className="truncate">Download Attachment {i+1}</span>
                                    </a>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] mt-2 font-black text-slate-400 uppercase tracking-widest px-2">
                        {msg.created_at ? format(new Date(msg.created_at), 'h:mm a') : 'Just now'}
                      </span>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Media Vault Sidebar Drawer */}
              {showMediaVault && (
                <div className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-slate-100 z-10 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                  <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <h4 className="font-black text-slate-900 italic flex items-center gap-2">
                      <Sparkles size={16} className="text-indigo-600 animate-spin" /> Media vault
                    </h4>
                    <button onClick={() => setShowMediaVault(false)} className="text-slate-400 hover:text-red-500">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
                    {mediaInChat.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {mediaInChat.map((url, i) => (
                          <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-white border border-slate-100 hover:scale-105 transition-all cursor-pointer shadow-sm relative group">
                            <img src={url} className="w-full h-full object-cover" alt="" />
                            <a href={url} target="_blank" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Maximize2 size={16} />
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                        <Archive className="w-12 h-12 text-slate-200 mb-4" />
                        <p className="text-sm font-bold text-slate-450 italic">No media documents exchanged yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-8 bg-white border-t border-slate-100">
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-6">
                    {attachments.map((file, i) => (
                      <div key={i} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-2xl text-[10px] font-black uppercase flex items-center border border-indigo-100 shadow-sm animate-in zoom-in">
                        <FileIcon className="w-3 h-3 mr-2 text-indigo-605" />
                        <span className="max-w-[100px] truncate">{file.name}</span>
                        <button onClick={() => removeAttachment(i)} className="ml-3 hover:text-red-500">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <form className="flex items-center space-x-4" onSubmit={handleSendMessage}>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-4 bg-slate-50 text-slate-500 rounded-3xl hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-transparent hover:border-slate-100"
                    >
                      <Paperclip size={22} />
                    </button>
                    <input 
                      type="file" 
                      hidden 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      multiple 
                      accept="image/*,.pdf,.doc,.docx"
                    />
                  </div>
                  
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a friendly message to send..."
                    className="flex-1 bg-slate-50 border-none rounded-3xl px-8 py-5 focus:ring-4 focus:ring-indigo-50 font-bold text-slate-900 outline-none placeholder:text-slate-400 shadow-inner"
                  />
                  
                  <button
                    type="submit"
                    disabled={sending || (!newMessage.trim() && attachments.length === 0)}
                    className="grad-primary text-white p-5 rounded-3xl hover:shadow-2xl hover:shadow-indigo-200 transition-all disabled:opacity-50 active:scale-95 shadow-xl"
                  >
                    {sending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-12 text-center">
              <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center mb-10 shadow-2xl shadow-indigo-50">
                <MessageSquare className="w-20 h-20 opacity-10 text-indigo-600 rotate-12" />
              </div>
              <h2 className="text-3xl font-display font-black text-slate-900 mb-4 italic">Welcome to Inbox Settings</h2>
              <p className="font-bold text-slate-400 max-w-sm">Select a neighbor name from the left section to chat, or type their name to locate them asynchronously.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
