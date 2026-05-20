'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, User, Phone, MapPin, ArrowRight } from 'lucide-react'

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleFromUrl = searchParams.get('role') || 'client'
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    repeatPassword: '',
    fullName: '',
    phone: '',
    city: 'Lapu-Lapu City',
    barangay: '',
    street: '',
    role: roleFromUrl,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.repeatPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          role: formData.role,
          phone: formData.phone || '',
          city: formData.city || '',
          barangay: formData.barangay || '',
          street: formData.street || '',
        },
      },
    })

    console.log("Auth Data:", authData)

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      // Profile creation is handled natively by the Supabase database trigger on the auth.users table.
      // Route the user straight to the dashboard.
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center space-x-2 group">
            <div className="w-12 h-12 grad-primary rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:rotate-6 transition-transform">
              <span className="text-white font-display font-black text-2xl italic">E</span>
            </div>
            <span className="text-3xl font-display font-bold tracking-tight">
              <span className="text-slate-900">Echo</span>
              <span className="text-indigo-600">Flow</span>
            </span>
          </Link>
          <h2 className="mt-8 text-4xl font-display font-bold text-slate-900 tracking-tight">Join EchoFlow</h2>
          <p className="mt-2 text-slate-500 font-medium">Empowering connections between pros and clients</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 p-10 border border-slate-100">
          {error && (
            <div className="mb-8 bg-red-50 border border-red-100 text-red-600 px-4 py-4 rounded-2xl text-sm font-bold flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div className="mb-10">
            <label className="block text-sm font-bold text-slate-700 mb-4 px-1">
              Select your path:
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'client' })}
                className={`py-6 px-4 rounded-2xl border-2 text-center transition-all group ${
                  formData.role === 'client'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-lg shadow-indigo-100'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-100'
                }`}
              >
                <div className="font-display font-bold text-lg mb-1">Hire Services</div>
                <div className={`text-xs font-bold transition-colors ${formData.role === 'client' ? 'text-indigo-500' : 'text-slate-400 uppercase tracking-widest'}`}>Client</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'provider' })}
                className={`py-6 px-4 rounded-2xl border-2 text-center transition-all group ${
                  formData.role === 'provider'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-lg shadow-indigo-100'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-100'
                }`}
              >
                <div className="font-display font-bold text-lg mb-1">Offer Skills</div>
                <div className={`text-xs font-bold transition-colors ${formData.role === 'provider' ? 'text-indigo-500' : 'text-slate-400 uppercase tracking-widest'}`}>Provider</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-bold text-slate-700 mb-2 px-1">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all font-medium"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-slate-700 mb-2 px-1">
                  Phone (optional)
                </label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all font-medium"
                    placeholder="(555) 000-0000"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2 px-1">
                Email address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all font-medium"
                  placeholder="you@email.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2 px-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all font-medium"
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="repeatPassword" className="block text-sm font-bold text-slate-700 mb-2 px-1">
                  Repeat Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    id="repeatPassword"
                    type="password"
                    value={formData.repeatPassword}
                    onChange={(e) => setFormData({ ...formData, repeatPassword: e.target.value })}
                    className={`w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-medium ${
                      formData.repeatPassword && formData.password !== formData.repeatPassword 
                        ? 'border-red-300 focus:border-red-600' 
                        : 'border-slate-200 focus:border-indigo-600'
                    }`}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="city" className="block text-sm font-bold text-slate-700 mb-2 px-1">
                  City
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all font-medium"
                    placeholder="Lapu-Lapu City"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="barangay" className="block text-sm font-bold text-slate-700 mb-2 px-1">
                  Barangay
                </label>
                <input
                  id="barangay"
                  type="text"
                  value={formData.barangay}
                  onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all font-medium"
                  placeholder="e.g. Basak"
                  required
                />
              </div>
              <div>
                <label htmlFor="street" className="block text-sm font-bold text-slate-700 mb-2 px-1">
                  Street
                </label>
                <input
                  id="street"
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all font-medium"
                  placeholder="e.g. Maximo Patalinghug"
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full grad-primary text-white py-5 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:shadow-2xl hover:shadow-indigo-200 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:transform-none flex items-center justify-center text-lg"
              >
                {loading ? 'Creating account...' : 'Start your journey'}
                {!loading && <ArrowRight className="ml-2 w-6 h-6" />}
              </button>
            </div>
          </form>

          <div className="mt-10 text-center pt-8 border-t border-slate-50">
            <p className="text-sm font-medium text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline underline-offset-4 transition-all">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}
