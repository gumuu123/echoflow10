'use client'

import { 
  Search, 
  MapPin, 
  MessageCircle, 
  Calendar, 
  Settings, 
  ShieldCheck, 
  Rocket, 
  ArrowRight,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'motion/react'

export default function AboutPage() {
  const features = [
    {
      title: 'Find Services',
      description: 'Search for professional services by category or location. Our platform prioritizes boosted top-rated providers to ensure quality.',
      icon: Search,
      color: 'bg-blue-100 text-blue-600',
      href: '/search'
    },
    {
      title: 'Live Tracking',
      description: 'See provider locations in real-time on our interactive map. Find exactly who is nearby and ready to help.',
      icon: MapPin,
      color: 'bg-green-100 text-green-600',
      href: '/map'
    },
    {
      title: 'Direct Chat',
      description: 'Communicate directly with providers. Negotiate prices, discuss project details, and send images seamlessly.',
      icon: MessageCircle,
      color: 'bg-purple-100 text-purple-600',
      href: '/messages'
    },
    {
      title: 'Easy Bookings',
      description: 'Schedule appointments and manage your service history in one place. Keep track of status from pending to completed.',
      icon: Calendar,
      color: 'bg-yellow-100 text-yellow-600',
      href: '/bookings'
    },
    {
      title: 'Global Profile',
      description: 'Manage your portfolio and personal information. Providers can showcase their work with multiple image uploads.',
      icon: UserIcon,
      color: 'bg-pink-100 text-pink-600',
      href: '/profile'
    },
    {
      title: 'Safety First',
      description: 'Our dispute resolution system ensures a safe environment. Report issues directly to our admin team with evidence.',
      icon: ShieldCheck,
      color: 'bg-red-100 text-red-600',
      href: '/report'
    }
  ]

  const steps = [
    { step: '01', title: 'Create Account', desc: 'Sign up as a Client or Provider.' },
    { step: '02', title: 'Complete Profile', desc: 'Add your skills or find what you need.' },
    { step: '03', title: 'Connect & Pay', desc: 'Discuss and pay off-platform via cash or GCash.' },
    { step: '04', title: 'Review & Grow', desc: 'Leave feedback to build the community trust.' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gray-900 text-white py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 italic">
              Empowering local <span className="text-blue-500 underline decoration-8 underline-offset-8">expertise</span>.
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-medium leading-relaxed">
              EchoFlow is a modern discovery and communication bridge connecting skilled individuals with clients. 
              Built for speed, transparency, and simplicity.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Guide Section */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-5xl font-black text-gray-900 mb-6 font-sans tracking-tight leading-none">
                How to navigate <br/> EchoFlow platform
              </h2>
              <p className="text-gray-500 font-bold text-lg">Everything you need to know about our features and tools.</p>
            </div>
            <Link href="/register" className="bg-blue-600 text-white px-10 py-5 rounded-3xl font-black text-xl flex items-center hover:bg-blue-700 transition shadow-xl shadow-blue-200">
              Start Now <ArrowRight className="ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
              >
                <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed mb-8">{feature.description}</p>
                <Link href={feature.href} className="text-gray-400 hover:text-blue-600 flex items-center font-bold text-sm">
                  Explore feature <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-[60px] p-12 md:p-24 text-white relative overflow-hidden">
             <div className="relative z-10">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                   <div>
                      <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">Mastering our <br/> ecosystem</h2>
                      <p className="text-gray-400 text-lg mb-12 font-medium italic">Peer-to-peer transactions made easy. No integrated gateways, purely direct deals.</p>
                      <div className="space-y-4">
                         <div className="flex items-center text-blue-400 font-black tracking-widest text-xs uppercase">
                            <Rocket className="mr-2 w-4 h-4" />
                            Fast Onboarding
                         </div>
                         <div className="flex items-center text-green-400 font-black tracking-widest text-xs uppercase">
                            <ShieldCheck className="mr-2 w-4 h-4" />
                            Verified Reviews
                         </div>
                      </div>
                   </div>

                   <div className="grid sm:grid-cols-2 gap-8">
                      {steps.map((item) => (
                        <div key={item.step} className="bg-white/5 backdrop-blur border border-white/10 p-8 rounded-[40px]">
                           <span className="text-4xl font-black text-blue-600 opacity-50 block mb-4">{item.step}</span>
                           <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                           <p className="text-sm text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none">
                <Rocket className="w-1/2 h-1/2 mx-auto mt-20 rotate-[35deg]" />
             </div>
          </div>
        </div>
      </section>

      {/* Monetization Explanation */}
      <section className="py-32 border-t border-gray-100">
         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-black text-gray-900 mb-8 font-sans">Our Monetization Strategy</h2>
            <div className="bg-blue-600 text-white p-12 rounded-[50px] shadow-2xl shadow-blue-200">
               <p className="text-xl md:text-2xl font-bold leading-relaxed italic">
                 "We generate revenue through <span className="p-1 px-4 bg-yellow-400 text-yellow-900 rounded-xl">Service Boosting</span>. Providers pay a small fee to have their listings prioritized in search results, giving them maximum visibility to potential clients."
               </p>
            </div>
         </div>
      </section>
    </div>
  )
}

function UserIcon({ size }: { size: number }) {
  return <Plus size={size} />
}
