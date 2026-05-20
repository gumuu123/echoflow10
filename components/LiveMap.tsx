'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createClient } from '@/lib/supabase/client'

// Fix for default marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface ProviderLocation {
  provider_id: string
  latitude: number
  longitude: number
  profiles?: {
    full_name: string
    avatar_url?: string
    rating: number
  }
}

interface LiveMapProps {
  center?: [number, number]
  zoom?: number
  showProviders?: boolean
  bookingId?: string
}

// Component to handle map view updates
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

export default function LiveMap({ 
  center = [37.7749, -122.4194], // Default: San Francisco
  zoom = 12,
  showProviders = true,
  bookingId 
}: LiveMapProps) {
  const [providerLocations, setProviderLocations] = useState<ProviderLocation[]>([])
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const supabase = createClient()

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }, [])

  // Subscribe to provider locations in real-time
  useEffect(() => {
    if (!showProviders) return

    const fetchProviderLocations = async () => {
      const { data } = await supabase
        .from('provider_locations')
        .select(`
          provider_id,
          latitude,
          longitude,
          profiles!inner(full_name, avatar_url, rating)
        `)
        .eq('is_active', true)

      if (data) {
        const formattedData = data.map((item: any) => ({
          ...item,
          profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
        }))
        setProviderLocations(formattedData as ProviderLocation[])
      }
    }

    fetchProviderLocations()

    // Real-time subscription
    const channel = supabase
      .channel('provider-locations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'provider_locations',
        },
        () => {
          fetchProviderLocations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [showProviders])

  // Custom marker icons
  const createUserIcon = () => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div class="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <span class="text-white text-xs font-bold">You</span>
            </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })
  }

  const createProviderIcon = (providerName: string) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div class="w-10 h-10 bg-green-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <span class="text-white text-sm font-bold">${providerName.charAt(0)}</span>
            </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    })
  }

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden">
      <MapContainer
        center={userLocation || center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {(userLocation || center) && (
          <MapUpdater center={userLocation || center} zoom={zoom} />
        )}

        {/* User's location */}
        {userLocation && (
          <Marker position={userLocation} icon={createUserIcon()}>
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {/* Provider locations */}
        {showProviders && providerLocations.map((loc) => (
          <Marker
            key={loc.provider_id}
            position={[loc.latitude, loc.longitude]}
            icon={createProviderIcon(loc.profiles?.full_name || 'P')}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{loc.profiles?.full_name}</h3>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-500">★</span>
                  <span className="ml-1 text-sm">{loc.profiles?.rating.toFixed(1)}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md z-[1000]">
        <div className="text-sm font-semibold mb-2">Legend</div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            <span className="text-xs">Your Location</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-600 rounded-full"></div>
            <span className="text-xs">Available Providers</span>
          </div>
        </div>
      </div>
    </div>
  )
}
