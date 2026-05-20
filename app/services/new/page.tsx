'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, ArrowLeft, Loader2, Save, Info, DollarSign, X, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function NewServicePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [images, setImages] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    price: '',
    price_unit: 'hour',
    is_boosted: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const supabase = createClient()

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('sort_order', { ascending: true })
      if (data) {
        setCategories(data)
      }
      setLoading(false)
    }
    fetchCategories()
  }, [])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.title) newErrors.title = 'Service title is required'
    if (!formData.description) newErrors.description = 'Please describe what you offer'
    if (formData.description.length < 50) newErrors.description = 'Description should be at least 50 characters for better visibility'
    if (!formData.category_id) newErrors.category_id = 'Please select a category'
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Please set a valid price'
    if (images.length === 0) newErrors.images = 'Please upload at least one image of your work'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (images.length >= 6) {
        alert('Maximum 6 images allowed')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages([...images, reader.result as string])
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
       // Scroll to first error
       window.scrollTo({ top: 0, behavior: 'smooth' })
       return
    }
    
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('services').insert({
      provider_id: user.id,
      title: formData.title,
      description: formData.description,
      category_id: formData.category_id || null,
      price: parseFloat(formData.price),
      price_unit: formData.price_unit,
      is_available: true,
      images: images,
      is_boosted: formData.is_boosted
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Service created successfully!')
      router.push('/dashboard')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center text-gray-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-blue-600 px-8 py-10 text-white">
            <h1 className="text-3xl font-extrabold">Create a New Service</h1>
            <p className="mt-2 text-blue-100 italic">Share your expertise and start growing your business.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Info */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-gray-900">
                <Info className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">Service Details</h2>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Service Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Professional Deep House Cleaning"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${
                    errors.title ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.title && <p className="text-red-500 text-xs font-bold mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${
                    errors.category_id ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.category_id && <p className="text-red-500 text-xs font-bold mt-1">{errors.category_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Detailed Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe what's included in your service, your process, and any requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${
                    errors.description ? 'border-red-500' : 'border-gray-200'
                  }`}
                ></textarea>
                {errors.description && <p className="text-red-500 text-xs font-bold mt-1">{errors.description}</p>}
              </div>

              {/* Portfolio Images */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Portfolio Images (At least 1)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group">
                      <img src={img} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                       <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < 6 && (
                    <label className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors group">
                      <Plus className="text-gray-400 group-hover:text-blue-600 mb-1" size={20} />
                      <span className="text-[10px] uppercase font-black text-gray-400 group-hover:text-blue-600">Add Photo</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
                {errors.images && <p className="text-red-500 text-xs font-bold mt-2">{errors.images}</p>}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Pricing */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-gray-900">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-bold">Pricing</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="25.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${
                        errors.price ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.price && <p className="text-red-500 text-xs font-bold mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Unit</label>
                  <select
                    value={formData.price_unit}
                    onChange={(e) => setFormData({ ...formData, price_unit: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  >
                    <option value="hour">per hour</option>
                    <option value="project">per project</option>
                    <option value="session">per session</option>
                    <option value="day">per day</option>
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Boosting Toggle */}
            <div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-100">
               <div className="flex items-start space-x-4">
                  <div className="bg-yellow-400 p-2 rounded-xl text-yellow-900">
                    <TrendingUp size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-gray-900">Boost your listing</h3>
                    <p className="text-sm text-gray-600 font-medium mb-4 italic">Prioritize your service in search results and reach more clients.</p>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={formData.is_boosted}
                          onChange={(e) => setFormData({...formData, is_boosted: e.target.checked})}
                        />
                        <div className={`block w-14 h-8 rounded-full transition-colors ${formData.is_boosted ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.is_boosted ? 'translate-x-6' : ''}`}></div>
                      </div>
                      <div className="ml-3 text-gray-700 font-bold">Enable Service Boosting</div>
                    </label>
                  </div>
               </div>
            </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 disabled:opacity-50 flex items-center justify-center"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Saving Service...
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6 mr-3" />
                    Create Service
                  </>
                )}
              </button>
          </form>
        </div>
      </div>
    </div>
  )
}
