'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'

// Dynamic import for the Map component to avoid SSR issues with Leaflet
const LiveMap = dynamic(() => import('@/components/LiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Initializing live map...</p>
      </div>
    </div>
  )
})

export default function MapPage() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Map Search Bar - Overlay */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-lg px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-2 flex items-center border border-gray-200">
          <div className="p-3">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Find services near you..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-500 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition shadow-md">
            Go
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        <LiveMap />
      </div>
    </div>
  )
}
