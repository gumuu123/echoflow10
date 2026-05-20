'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, ArrowRight } from 'lucide-react'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
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
          <h2 className="mt-8 text-4xl font-display font-bold text-slate-900 tracking-tight">Welcome back</h2>
          <p className="mt-2 text-slate-500 font-medium">Please enter your details to sign in</p>
        </div>

        <div className="bg-white py-10 px-8 shadow-2xl shadow-indigo-100/50 sm:rounded-[2rem] border border-slate-100">
          {registered && (
            <div className="mb-6 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3.5 rounded-2xl text-sm font-bold flex items-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
              Registration successful! Please sign in.
            </div>
          )}
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3.5 rounded-2xl text-sm font-bold flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2 px-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all font-medium text-slate-900 shadow-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between px-1 mb-2">
                <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                  Password
                </label>
                <Link href="#" className="text-xs font-bold text-indigo-600 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all font-medium text-slate-900 shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-6 grad-primary rounded-2xl shadow-lg shadow-indigo-100 text-base font-bold text-white hover:shadow-2xl hover:shadow-indigo-200 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:transform-none"
              >
                {loading ? 'Signing in...' : 'Sign in to EchoFlow'}
                {!loading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-50">
            <p className="text-sm font-medium text-slate-500">
              New to EchoFlow?{' '}
              <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline underline-offset-4 transition-all">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
