'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Search, 
  MapPin, 
  Star, 
  Filter, 
  Loader2, 
  Zap,
  TrendingUp,
  X,
  CreditCard,
  MessageSquare,
  Sparkles
} from 'lucide-react'
import Link from 'next/router'
import NextLink from 'next/link'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  "House Cleaning",
  "Garden Maintenance",
  "Electrical Repair",
  "Plumbing leak",
  "Pest Control",
  "Home Massage/Spa",
  "AC/Aircon Cleaning",
  "Roof Leak Repair",
  "Carpentry work",
  "Laundry service"
]

export default function SearchPage() {
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [category, setCategory] = useState('all')
  const [locationFilter, setLocationFilter] = useState('')
  
  const supabase = createClient()
  const searchRef = useRef<HTMLDivElement>(null)

  const categories = [
    { id: 'all', label: 'Cozy Marketplace' },
    { id: 'cleaning', label: 'Cleaning' },
    { id: 'plumbing', label: 'Plumbing' },
    { id: 'electrical', label: 'Electrical' },
    { id: 'moving', label: 'Moving' },
    { id: 'beauty', label: 'Beauty & Wellness' }
  ]

  useEffect(() => {
    fetchServices()
    
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchServices = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('services')
      .select(`
        *,
        provider:profiles!services_provider_id_fkey(*)
      `)
      .eq('is_available', true)
      .order('is_boosted', { ascending: false })
      .order('created_at', { ascending: false })
    
    setServices(data || [])
    setLoading(false)
  }

  const filteredServices = services.filter(s => {
    const term = searchTerm.toLowerCase().trim()
    const matchesSearch = !term ||
                          s.title?.toLowerCase().includes(term) || 
                          s.description?.toLowerCase().includes(term) ||
                          s.category?.toLowerCase().includes(term) ||
                          s.provider?.offered_services?.some((tag: string) => tag.toLowerCase().includes(term)) ||
                          s.provider?.full_name?.toLowerCase().includes(term)
    
    const matchesCategory = category === 'all' || s.category?.toLowerCase() === category.toLowerCase()
    const matchesLocation = !locationFilter || 
                            s.provider?.city?.toLowerCase().includes(locationFilter.toLowerCase()) ||
                            s.provider?.barangay?.toLowerCase().includes(locationFilter.toLowerCase())
    
    return matchesSearch && matchesCategory && matchesLocation
  })

  const boostedServices = filteredServices.filter(s => s.is_boosted)
  const regularServices = filteredServices.filter(s => !s.is_boosted)

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Search Header */}
      <div className="bg-white border-b border-slate-100 pt-32 pb-20 overflow-visible relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <span className="bg-indigo-650 text-indigo-600 p-2 bg-indigo-50 rounded-xl scale-90">
               <Sparkles size={16} className="fill-indigo-600/20" />
            </span>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Cozy Local Neighborhood Hub</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-display font-black text-slate-900 mb-12 tracking-tighter leading-none italic">
            Connecting Neighbor <span className="text-indigo-650">Talents.</span>
          </h1>
          
          <div className="flex flex-col xl:flex-row gap-5" ref={searchRef}>
            <div className="flex-[2] relative overflow-visible">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400" />
              <input
                type="text"
                placeholder="What helper or service are you looking for?"
                value={searchTerm}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-indigo-100/50 outline-none transition-all text-lg font-bold placeholder:text-slate-400 shadow-inner font-sans"
              />
              
              {/* Thumbtack/Yelp Suggestion Box */}
              {showSuggestions && (
                <div className="absolute left-0 right-0 top-full mt-4 bg-white rounded-[2rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 p-6 animate-in slide-in-from-top-4 duration-300 z-50">
                  <div className="px-4 py-3 flex items-center justify-between mb-2">
                     <span className="text-[10px] font-black uppercase text-slate-450 tracking-widest flex items-center">
                        <TrendingUp size={14} className="mr-2 text-indigo-600" /> Popular in your community
                     </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {SUGGESTIONS.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase())).map((suggest, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSearchTerm(suggest)
                          setShowSuggestions(false)
                        }}
                        className="text-left px-5 py-3 hover:bg-slate-50/80 rounded-2xl transition-all font-semibold text-slate-705 flex items-center group text-sm"
                      >
                        <Search size={14} className="mr-3 text-slate-300 group-hover:text-indigo-650 shrink-0" />
                        <span className="font-bold">{suggest}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400" />
              <input
                type="text"
                placeholder="Near Barangay or City..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-16 pr-6 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-indigo-100/50 outline-none transition-all text-lg font-bold placeholder:text-slate-400 shadow-inner font-sans"
              />
            </div>
          </div>

          <div className="flex overflow-x-auto pb-4 gap-3 mt-10 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-2",
                  category === cat.id
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100"
                    : "bg-white border-slate-100 text-slate-400 hover:border-indigo-600 hover:text-indigo-600"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tiered Marketplace Grid Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Tier 1: Boosted Services (Featured Showcase) */}
        {boostedServices.length > 0 && (
          <section className="mb-24 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-4 mb-12">
               <h2 className="text-3xl font-display font-black text-slate-900 italic tracking-tight uppercase">Boosted Services</h2>
               <div className="h-px bg-slate-100 flex-1" />
               <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em] bg-amber-50 px-4 py-2 rounded-full border border-amber-100">Highly Recommended</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {boostedServices.map(service => (
                <ServiceCard key={service.id} service={service} featured />
              ))}
            </div>
          </section>
        )}

        {/* Tier 2: Regular Services (General Area Discovery) */}
        <section className="animate-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-3xl font-display font-black text-slate-900 italic tracking-tight uppercase px-2">Discovery Area</h2>
            <div className="h-px bg-slate-100 flex-1" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{regularServices.length} neighbor listings found</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
               <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
               <p className="text-slate-400 font-bold mt-6 uppercase tracking-widest text-xs">Finding available neighbors...</p>
            </div>
          ) : regularServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {regularServices.map(service => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center max-w-lg mx-auto">
              <div className="bg-white w-24 h-24 rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-indigo-50 border border-slate-55 rotate-12">
                <Search className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-3xl font-display font-black text-slate-900 mb-6 italic">No listings found</h3>
              <p className="text-slate-405 font-medium leading-relaxed mb-8">We couldn't locate any listings matching your search coordinates. Try clearing filters or expanding keywords.</p>
              <button 
                onClick={() => { setSearchTerm(''); setCategory('all') }}
                className="grad-primary text-white px-12 py-5 rounded-[2.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:-translate-y-1 transition-all"
              >
                Clear Search Filter
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function ServiceCard({ service, featured }: { service: any, featured?: boolean }) {
  // Aggregate star calc
  const displayRating = service.provider?.rating ? service.provider.rating : 4.8

  return (
    <div
      className={cn(
        "group relative bg-white rounded-[3rem] overflow-hidden transition-all duration-500 flex flex-col justify-between border-2",
        featured 
          ? "border-amber-400 shadow-2xl shadow-amber-50" 
          : "border-slate-100 hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-1"
      )}
    >
      <NextLink href={`/services/${service.id}`} className="block relative h-72 overflow-hidden shrink-0">
        {service.images?.[0] ? (
          <img src={service.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
        ) : (
          <div className="w-full h-full grad-primary flex items-center justify-center text-white font-display font-black text-4xl italic px-10 text-center">
            {service.title}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        
        {/* Tier Priority Marker */}
        <div className="absolute top-6 left-6 flex gap-2">
          {service.is_boosted && (
             <div className="bg-amber-400 text-amber-950 px-4 py-2 rounded-2xl flex items-center shadow-lg text-[9px] font-black uppercase tracking-widest">
               <Zap size={14} className="mr-1.5 fill-amber-950" /> Boosted Pro
             </div>
          )}
        </div>

        {/* 100% Anonymous Aggregate Stars indicator on Discovery views */}
        <div className="absolute top-6 right-6 bg-slate-900/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl flex items-center text-white shadow-xl">
          <Star size={12} className="text-amber-400 mr-2 fill-amber-400 shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-widest">{displayRating.toFixed(1)}</span>
        </div>

        {/* Info Overlay */}
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#a5b4fc] mb-1">{service.category}</p>
          <h3 className="font-display font-black tracking-tight leading-tight italic text-2xl truncate">
             {service.title}
          </h3>
          <div className="flex items-center mt-2 text-white/70 text-[9px] font-black uppercase tracking-widest">
             <MapPin size={11} className="mr-1 md:mr-1.5" /> {service.provider?.barangay || 'Local area'}, {service.provider?.city || 'Local Area'}
          </div>
        </div>
      </NextLink>

      <div className="p-8 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-white shadow-md overflow-hidden shrink-0">
                   {service.provider?.avatar_url ? (
                     <img src={service.provider.avatar_url} className="w-full h-full object-cover" alt="" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center font-black text-slate-350 uppercase text-xs font-sans">
                        {service.provider?.full_name?.charAt(0)}
                     </div>
                   )}
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cozy Neighbor</p>
                   <h5 className="font-semibold text-slate-900 text-sm truncate max-w-[130px] italic">
                     {service.provider?.full_name || 'Neighbor Pro'}
                   </h5>
                </div>
             </div>
             <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Start Rate</p>
                <p className="text-xl font-display font-black text-indigo-650 italic leading-none">${service.price}</p>
             </div>
          </div>
          
          <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-2 mb-6 font-sans">
            {service.description || 'Verified local provider providing high-quality domestic services.'}
          </p>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-50 gap-4">
           {/* Accepted Payment Structures */}
           <div className="flex items-center gap-2 min-w-0">
              <CreditCard size={14} className="text-slate-400 shrink-0" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">
                {service.provider?.mode_of_payment || 'Direct Cash'}
              </span>
           </div>
           
           <div className="flex items-center gap-2 shrink-0">
             {/* Primary Chat Launcher Button */}
             {service.provider?.id && (
               <NextLink 
                 href={`/messages?userId=${service.provider.id}`} 
                 className="px-4 py-2.5 bg-slate-50 hover:bg-indigo-650 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest text-[#4f46e5] border border-indigo-100 transition-all font-sans"
               >
                  Chat with Pro
               </NextLink>
             )}
             <NextLink 
               href={`/services/${service.id}`} 
               className="px-3.5 py-2.5 bg-indigo-600 hover:bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all font-sans"
             >
                Details
             </NextLink>
           </div>
        </div>
      </div>
    </div>
  )
}
