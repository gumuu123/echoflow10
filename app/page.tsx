'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle, MapPin, MessageSquare, Shield, Star, Users, Plus, X } from 'lucide-react'
import { useState } from 'react'

// EDIT THESE IMAGES TO REPLACE THEM WITH YOUR OWN PHOTOS
const CATEGORY_SHOWCASE = {
  'Cleaners': [
    { title: "House Cleaning", img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800" },
    { title: "Carpet Cleaning", img: "https://images.unsplash.com/photo-1527515637-67c4ee97c234?auto=format&fit=crop&q=80&w=800" },
    { title: "Upholstery", img: "https://images.unsplash.com/photo-1550963295-019d8a8a61c5?auto=format&fit=crop&q=80&w=800" },
    { title: "Deep Cleaning", img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800" }
  ],
  'Handymen': [
    { title: "Furniture Assembly", img: "https://images.unsplash.com/photo-1513694490325-c44bfe95ef41?auto=format&fit=crop&q=80&w=800" },
    { title: "TV Mounting", img: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800" },
    { title: "Smart Home", img: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800" },
    { title: "General Repairs", img: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=800" }
  ],
  'Landscapers': [
    { title: "Lawn Mowing", img: "https://images.unsplash.com/photo-1558905619-17355201bd2c?auto=format&fit=crop&q=80&w=800" },
    { title: "Garden Design", img: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800" },
    { title: "Tree Trimming", img: "https://images.unsplash.com/photo-1597047084897-51e81819a4a7?auto=format&fit=crop&q=80&w=800" },
    { title: "Pool Care", img: "https://images.unsplash.com/photo-1534008897995-27a23e859048?auto=format&fit=crop&q=80&w=800" }
  ],
  'Movers': [
    { title: "Local Moving", img: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&q=80&w=800" },
    { title: "Packing Services", img: "https://images.unsplash.com/photo-1603803835020-137bc341bd7d?auto=format&fit=crop&q=80&w=800" },
    { title: "Office Relocation", img: "https://images.unsplash.com/photo-1517502884422-41eaadeff171?auto=format&fit=crop&q=80&w=800" },
    { title: "Junk Removal", img: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=800" }
  ],
  'Plumbers': [
    { title: "Drain Unclogging", img: "https://images.unsplash.com/photo-1504148450418-639446d32832?auto=format&fit=crop&q=80&w=800" },
    { title: "Leak Repair", img: "https://images.unsplash.com/photo-1585704032915-c3400ca1f963?auto=format&fit=crop&q=80&w=800" },
    { title: "Pipe Installation", img: "https://images.unsplash.com/photo-1621905252507-b354bc2addcc?auto=format&fit=crop&q=80&w=800" },
    { title: "Emergency", img: "https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?auto=format&fit=crop&q=80&w=800" }
  ],
  'Electricians': [
    { title: "Wiring Hubs", img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800" },
    { title: "Lighting Setup", img: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&q=80&w=800" },
    { title: "Panel Upgrades", img: "https://images.unsplash.com/photo-1454165833767-027eeef15931?auto=format&fit=crop&q=80&w=800" },
    { title: "Safety Inspection", img: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&q=80&w=800" }
  ],
  'Painters': [
    { title: "Interior House", img: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=800" },
    { title: "Cabinet Refinish", img: "https://images.unsplash.com/photo-1520004434532-668416209383?auto=format&fit=crop&q=80&w=800" },
    { title: "Wall Murals", img: "https://images.unsplash.com/photo-1563805030-cf2a9446d31b?auto=format&fit=crop&q=80&w=800" },
    { title: "Deck Staining", img: "https://images.unsplash.com/photo-1516750105099-4b8a83e217ee?auto=format&fit=crop&q=80&w=800" }
  ]
}

const FAQ_ITEMS = [
  {
    question: "How does EchoFlow verify service providers?",
    answer: "EchoFlow securely verifies every provider's credentials, background, and identity to ensure your safety and the highest quality of service. You can hire with confidence knowing every pro is vetted."
  },
  {
    question: "Can I use EchoFlow for both small tasks and major projects?",
    answer: "Yes! Our platform connects you with pros for everything from quick plumbing fixes to full house renovations and landscaping."
  },
  {
    question: "Do I need to pay before the service is complete?",
    answer: "No, payments are held securely and only released when you are 100% satisfied with the completed project. (Note: Payments are handled off-platform currently)."
  },
  {
    question: "What makes EchoFlow different from other platforms?",
    answer: "EchoFlow offers real-time tracking, an intuitive discovery experience, instant messaging, and a transparent directory without hidden fees."
  },
  {
    question: "Can I communicate with the provider directly?",
    answer: "Yes, our built-in instant messaging system allows you to chat, send photos, and discuss details securely within the."
  }
]

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [activeCategory, setActiveCategory] = useState('Cleaners')

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-white">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>
        
        {/* Gradient Blur elements */}
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-indigo-100 blur-[120px] rounded-full opacity-50 z-0"></div>
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-violet-100 blur-[120px] rounded-full opacity-50 z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2"></span>
              Join 10k+ users getting things done
            </div>
            <h1 className="text-6xl lg:text-8xl font-display font-bold text-slate-900 tracking-tight mb-8 leading-[1.1]">
              Connect with <span className="text-grad">Pros</span> in Real Time
            </h1>
            <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-2xl mx-auto">
              The modern way to find, book, and track top-rated service providers. 
              Reliability meets effortless discovery.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-5">
              <Link
                href="/register?role=client"
                className="grad-primary text-white px-10 py-4 rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-indigo-200 transition-all flex items-center justify-center transform hover:-translate-y-1"
              >
                Find a Pro
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/register?role=provider"
                className="bg-white text-slate-900 border border-slate-200 px-10 py-4 rounded-2xl text-lg font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center"
              >
                Become a Provider
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pros Section */}
      <section className="pt-24 pb-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-slate-900 tracking-tight">
              Pros for every project in
              <br />
              <span className="text-indigo-600">Your Area.</span>
            </h2>
          </div>

          {/* Categories icons */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-16 px-4">
            {[
              { name: 'Cleaners', icon: '🧹' },
              { name: 'Handymen', icon: '🔧' },
              { name: 'Landscapers', icon: '🌳' },
              { name: 'Movers', icon: '📦' },
              { name: 'Plumbers', icon: '🚿' },
              { name: 'Electricians', icon: '⚡' },
              { name: 'Painters', icon: '🎨' },
            ].map((cat, i) => (
              <div 
                key={i} 
                onClick={() => setActiveCategory(cat.name)}
                className={`flex items-center px-4 py-2 rounded-xl cursor-pointer transition-all border ${
                  activeCategory === cat.name 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                    : 'bg-white text-slate-600 border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                }`}
              >
                <div className="text-lg mr-2">{cat.icon}</div>
                <span className="text-sm font-semibold">{cat.name}</span>
              </div>
            ))}
          </div>

          {/* Image Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {CATEGORY_SHOWCASE[activeCategory as keyof typeof CATEGORY_SHOWCASE].map((item, i) => (
              <div key={i} className="relative h-[480px] rounded-[2rem] overflow-hidden group hover-lift cursor-pointer shadow-sm animate-in fade-in zoom-in-95 duration-500">
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                <div className="absolute bottom-10 left-8 right-8">
                  <p className="text-indigo-400 text-sm font-bold uppercase tracking-widest mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Book Now</p>
                  <div className="text-white text-3xl font-display font-bold">{item.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        {/* Background gradient hint */}
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-indigo-50 blur-[100px] rounded-full opacity-60"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-xl mb-20">
            <h2 className="text-4xl lg:text-6xl font-display font-bold text-slate-900 mb-6 leading-tight">Why Choose EchoFlow?</h2>
            <p className="text-slate-600 text-lg leading-relaxed">We've reimagined the service marketplace from the ground up to prioritize speed, trust, and quality.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Real-time Tracking',
                desc: 'See exactly where your provider is on a live map when they are on their way.',
                icon: MapPin,
                gradient: 'from-blue-500 to-indigo-600'
              },
              {
                title: 'Instant Messaging',
                desc: 'Chat directly with providers to discuss details and get quotes instantly.',
                icon: MessageSquare,
                gradient: 'from-blue-400 to-violet-500'
              },
              {
                title: 'Safe & Secure',
                desc: 'Every provider is verified, and payments are protected until you are satisfied.',
                icon: Shield,
                gradient: 'from-violet-500 to-indigo-600'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover-lift group">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-display font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 text-lg leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
            <div>
              <h2 className="text-5xl lg:text-7xl font-display font-bold text-slate-900 leading-none">FAQs</h2>
              <p className="text-slate-500 mt-4 text-lg">Common questions about our platform.</p>
            </div>
            <div className="h-px flex-1 bg-slate-100 mb-4 hidden md:block mx-8"></div>
          </div>
          <div className="border-t border-gray-200">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="border-b border-gray-200">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full py-8 flex items-center justify-between text-left focus:outline-none group"
                >
                  <div className="flex items-center space-x-8">
                    <span className="text-3xl font-display font-medium text-indigo-200 w-12 group-hover:text-indigo-600 transition-colors">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-2xl font-display font-bold text-slate-800">{item.question}</span>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <div className={`w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center transition-all ${openFaq === i ? 'bg-slate-900 border-slate-900 rotate-45' : 'group-hover:border-indigo-600 group-hover:text-indigo-600'}`}>
                      {openFaq === i ? (
                        <X className="w-5 h-5 text-white" strokeWidth={2.5} />
                      ) : (
                        <Plus className="w-5 h-5" strokeWidth={2.5} />
                      )}
                    </div>
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    openFaq === i ? 'max-h-96 opacity-100 pb-10' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="pl-20 pr-12">
                    <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-32 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grad-primary rounded-[3.5rem] p-12 lg:p-24 text-white relative overflow-hidden shadow-2xl shadow-indigo-200 text-center">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white opacity-5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-400 opacity-10 rounded-full -ml-20 -mb-20 blur-3xl"></div>
            
            <div className="relative z-10 max-w-4xl mx-auto">
              <h2 className="text-5xl lg:text-8xl font-display font-bold mb-8 leading-tight">Ready to get started?</h2>
              <p className="text-xl lg:text-2xl opacity-90 mb-12 max-w-2xl mx-auto leading-relaxed">
                Join our community of over 10,000 satisfied users and verified pros today.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link
                  href="/register"
                  className="bg-white text-indigo-600 px-12 py-5 rounded-2xl text-xl font-bold hover:bg-slate-50 transition-all inline-block shadow-xl transform hover:-translate-y-1"
                >
                  Create your account
                </Link>
                <Link href="/search" className="text-white font-bold text-lg hover:underline underline-offset-8">
                  Browse services first
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
