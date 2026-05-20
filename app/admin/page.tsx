'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Users, 
  ShoppingBag, 
  AlertCircle, 
  TrendingUp,
  ArrowRight,
  Shield,
  ShieldOff,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  ExternalLink,
  Zap
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingProviders: 0,
    openDisputes: 0,
    totalBookings: 0,
    activeServices: 0,
    pendingRequests: 0,
    boostedRevenue: 0
  })
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
    fetchUsers()
  }, [])

  const fetchStats = async () => {
    const [
      usersCount, 
      providersCount, 
      disputesCount, 
      bookingsCount, 
      servicesCount, 
      pendingBookings, 
      boostedServices
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('provider_status', 'pending'),
      supabase.from('disputes').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
      supabase.from('services').select('id', { count: 'exact', head: true }).eq('is_available', true),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('services').select('id', { count: 'exact', head: true }).eq('is_boosted', true)
    ])

    // Assume $15 per boosted service for demonstration
    const REVENUE_PER_BOOST = 15 

    setStats({
      totalUsers: usersCount.count || 0,
      pendingProviders: providersCount.count || 0,
      openDisputes: disputesCount.count || 0,
      totalBookings: bookingsCount.count || 0,
      activeServices: servicesCount.count || 0,
      pendingRequests: pendingBookings.count || 0,
      boostedRevenue: (boostedServices.count || 0) * REVENUE_PER_BOOST
    })
  }

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setUsers(data)
    setLoading(false)
  }

  const handleUpdateStatus = async (userId: string, updates: any) => {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (!error) fetchUsers()
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this account? This action is irreversible.')) return
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (!error) fetchUsers()
  }

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id?.includes(searchTerm)
  )

  const statCards = [
    { name: 'Total Community', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', desc: 'Registered user nodes' },
    { name: 'Active Services', value: stats.activeServices, icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-100', desc: 'Live marketplace offers' },
    { name: 'On-Hold / Pending', value: stats.pendingRequests, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100', desc: 'Awaiting provider action' },
    { name: 'Boost Revenue', value: `$${stats.boostedRevenue}`, icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-100', desc: 'Revenue from promoted tiers' },
  ]

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-900 mb-2 italic">Control Center</h2>
          <p className="text-gray-500 font-bold">Comprehensive platform management and user oversight.</p>
        </div>
        <div className="flex bg-white p-2 rounded-3xl border border-gray-100 shadow-sm">
          <Link href="/admin/services" className="px-6 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors">Services</Link>
          <Link href="/admin/disputes" className="px-6 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors">Disputes</Link>
          <Link href="/admin/finance" className="px-6 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors">Finance</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.name} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
            <div className={`w-14 h-14 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
              <card.icon size={28} />
            </div>
            <div className="text-4xl font-black text-gray-900 mb-1">{card.value}</div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">{card.name}</div>
          </div>
        ))}
      </div>

      {/* User Management */}
      <div className="bg-white rounded-[50px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black text-gray-900">User Management</h3>
            <p className="text-sm font-bold text-gray-400">Manage all registered accounts across the platform.</p>
          </div>
          <div className="relative group min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name, email or ID..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">User Details</th>
                <th className="px-6 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Role & Status</th>
                <th className="px-6 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Online</th>
                <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center font-bold text-gray-400 italic">Scanning database...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center font-bold text-gray-400 italic">No matches found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className={`group hover:bg-gray-50/50 transition-colors ${user.is_banned ? 'bg-red-50/10' : ''}`}>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 relative border-2 border-white shadow-sm">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-black text-gray-400 text-xl">
                              {user.full_name?.[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                            {user.full_name || 'Anonymous'}
                            {user.is_banned && <Shield size={14} className="text-red-500" />}
                          </div>
                          <div className="text-sm font-bold text-gray-400">{user.email}</div>
                          <div className="text-[10px] font-mono text-gray-300 mt-1 uppercase">{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-8">
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'provider' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {user.role}
                        </span>
                        {user.role === 'provider' && (
                          <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit ${
                            user.provider_status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                            user.provider_status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {user.provider_status}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-8 text-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                        <span className="text-xs font-bold text-gray-400">{user.is_online ? 'Live' : 'Offline'}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/profile/${user.id}`} target="_blank" className="p-3 hover:bg-white rounded-2xl text-gray-400 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100 shadow-sm hover:shadow-md">
                          <ExternalLink size={20} />
                        </Link>
                        
                        {user.role === 'provider' && user.provider_status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(user.id, { provider_status: 'approved' })}
                              className="p-3 hover:bg-emerald-50 rounded-2xl text-gray-400 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100 shadow-sm hover:shadow-md"
                            >
                              <CheckCircle size={20} />
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(user.id, { provider_status: 'rejected' })}
                              className="p-3 hover:bg-amber-50 rounded-2xl text-gray-400 hover:text-amber-600 transition-all border border-transparent hover:border-amber-100 shadow-sm hover:shadow-md"
                            >
                              <XCircle size={20} />
                            </button>
                          </>
                        )}

                        <button 
                          onClick={() => handleUpdateStatus(user.id, { is_banned: !user.is_banned })}
                          className={`p-3 rounded-2xl transition-all border shadow-sm hover:shadow-md ${
                            user.is_banned 
                              ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' 
                              : 'bg-white text-gray-400 border-gray-100 hover:text-red-600 hover:border-red-100'
                          }`}
                        >
                          {user.is_banned ? <ShieldOff size={20} /> : <Shield size={20} />}
                        </button>

                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-3 bg-white text-gray-400 border border-gray-100 hover:text-red-600 hover:border-red-100 rounded-2xl shadow-sm hover:shadow-md transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
