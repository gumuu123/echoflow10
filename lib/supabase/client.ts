import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.warn('Supabase URL or Anon Key is missing. This is expected during build time if not provided.')
    // Return a dummy client or handle it in components. 
    // Most 'use client' components will only call this in useEffect or handlers.
  }

  return createBrowserClient(
    url || 'https://placeholder.supabase.co',
    key || 'placeholder'
  )
}
