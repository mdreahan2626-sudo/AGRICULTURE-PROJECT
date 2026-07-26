'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  Leaf, Cpu, Database, ChevronRight, BarChart3, ShieldCheck,
  Sprout, CloudRain, ShieldAlert, MessageSquare, LayoutDashboard,
  ArrowRight, User, LogOut, Loader2, ShoppingBag, Sliders, Play
} from 'lucide-react'
import { predictCrop } from '@/lib/predictor'

export default function LandingPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Sandbox Soil Predictor State
  const [soilN, setSoilN] = useState(38)
  const [soilP, setSoilP] = useState(0)
  const [soilK, setSoilK] = useState(0)
  const [moisture, setMoisture] = useState(38)
  const [soilType, setSoilType] = useState('Sandy')
  const [temp, setTemp] = useState(26)
  const [humid, setHumid] = useState(55)

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } catch (err) {
        console.error('Auth check error:', err)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        toast.success('Logged out successfully')
        setUser(null)
        router.refresh()
      } else {
        toast.error('Logout failed')
      }
    } catch (err) {
      toast.error('Logout failed')
    }
  }

  // Real-time client-side inference
  const predictedCrop = predictCrop({
    temperature: temp,
    humidity: humid,
    moisture: moisture,
    soilType: soilType,
    nitrogen: soilN,
    phosphorous: soilP,
    potassium: soilK
  })

  // Set color accents based on crop prediction
  const getCropColor = (crop) => {
    switch (crop?.toLowerCase()) {
      case 'maize': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
      case 'sugarcane': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
      case 'cotton': return 'text-sky-300 border-sky-500/30 bg-sky-500/10'
      case 'paddy': return 'text-teal-400 border-teal-500/30 bg-teal-500/10'
      case 'barley': return 'text-lime-400 border-lime-500/30 bg-lime-500/10'
      case 'wheat': return 'text-amber-300 border-amber-500/30 bg-amber-500/10'
      case 'millets': return 'text-purple-400 border-purple-500/30 bg-purple-500/10'
      default: return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    }
  }

  const modules = [
    {
      href: '/dashboard/crop',
      title: 'Crop Suitability Calculator',
      description: 'Predict the optimal crop to grow based on Nitrogen, Phosphorous, Potassium, temperature, and moisture levels locally using a trained Decision Tree model.',
      icon: Sprout,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-emerald-500/5',
      badge: 'ML Engine'
    },
    {
      href: '/dashboard/weather',
      title: 'Weather-Based Farming Advisor',
      description: 'Fetch real-time location forecasts combined with Gemini AI to generate direct farming alerts: "Rain expected tomorrow, suspend irrigation."',
      icon: CloudRain,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20 hover:border-sky-500/40 hover:shadow-sky-500/5',
      badge: 'Location AI'
    },
    {
      href: '/dashboard/disease',
      title: 'Leaf Disease Clinic',
      description: 'Upload crop leaf photographs for instant multimodal computer vision diagnostic analysis, severity assessments, and organic/chemical prescriptions.',
      icon: ShieldAlert,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20 hover:border-rose-500/40 hover:shadow-rose-500/5',
      badge: 'Computer Vision'
    },
    {
      href: '/dashboard/chat',
      title: 'AI AgroBot Assistant',
      description: 'Consult our agricultural chatbot supporting six languages with browser-native speech-to-text recording and text-to-speech audio feedback.',
      icon: MessageSquare,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20 hover:border-teal-500/40 hover:shadow-teal-500/5',
      badge: 'Voice AI'
    },
    {
      href: '/dashboard/health',
      title: 'Farm Health Dashboard',
      description: 'Aggregates soil nutrient radar charts, weekly water logs, vegetation NDVI tracking, and interactive crop yield calculators in a single console.',
      icon: LayoutDashboard,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40 hover:shadow-amber-500/5',
      badge: 'Unified Console'
    },
    {
      href: '/dashboard/marketplace',
      title: 'Seed & Fertilizer Marketplace',
      description: 'Find optimal seeds, custom fertilizers, and mechanical tools suited for your crop and soil type under your budget constraints.',
      icon: ShoppingBag,
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/20 hover:border-violet-500/40 hover:shadow-violet-500/5',
      badge: 'AI Recommendations'
    }
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-radial-[circle_at_top,_var(--tw-gradient-stops)] from-[#122c1b] via-[#070d09] to-[#070d09] bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:32px_32px] font-sans selection:bg-emerald-500/30 text-left">
      
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] left-[25%] w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[150px] pointer-events-none animate-pulse duration-[8s]" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#070d09]/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:rotate-6 transition duration-300">
              <Leaf className="w-5.5 h-5.5 text-slate-900" />
            </div>
            <div>
              <span className="font-bold text-lg leading-none bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">AgroPredict</span>
              <span className="block text-[10px] text-emerald-400 font-semibold tracking-wider uppercase leading-none mt-0.5">Intelligent Agronomy</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {loading ? (
              <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{user.name || 'Farmer'}</span>
                </div>
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center justify-center text-xs font-semibold px-4 py-2.5 rounded-lg bg-emerald-500 text-slate-900 hover:bg-emerald-400 active:scale-[0.98] transition shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  Console Panel
                </Link>
                <button 
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center text-xs font-semibold text-slate-400 hover:text-rose-400 transition gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition">
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="inline-flex items-center justify-center text-xs font-semibold px-4 py-2.5 rounded-lg bg-emerald-500 text-slate-900 hover:bg-emerald-400 active:scale-[0.98] transition shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-28 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Hero Left */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-fade-in">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              Unified AI & ML Agronomy Suite
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.08]">
              The Intelligent <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">AI Console</span> for Modern Farming
            </h1>
            
            <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-xl">
              Optimize agricultural output. Predict crops dynamically, receive weather forecasts paired with Gemini advice, diagnose leaf pathology, speak in regional languages, and shop budget-friendly supplies.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {user ? (
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-900 font-bold hover:opacity-95 active:scale-[0.98] transition shadow-xl shadow-emerald-500/25 group cursor-pointer"
                >
                  Go to Console Hub
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
                </Link>
              ) : (
                <>
                  <Link 
                    href="/signup" 
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-900 font-bold hover:opacity-95 active:scale-[0.98] transition shadow-xl shadow-emerald-500/25 group cursor-pointer"
                  >
                    Create Free Account
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
                  </Link>
                  <Link 
                    href="/login" 
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-white font-medium cursor-pointer"
                  >
                    Access Dashboard
                  </Link>
                </>
              )}
            </div>

            {/* Micro Stats */}
            <div className="mt-6 flex gap-8 border-t border-white/5 pt-8 w-full">
              <div>
                <span className="block text-2xl font-black text-white">8,000+</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mt-0.5">ML Data Rows</span>
              </div>
              <div className="w-px bg-white/5" />
              <div>
                <span className="block text-2xl font-black text-white">Gemini 2.5</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mt-0.5">Multimodal Core</span>
              </div>
              <div className="w-px bg-white/5" />
              <div>
                <span className="block text-2xl font-black text-white">6 Modules</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mt-0.5">Integrated Tools</span>
              </div>
            </div>
          </div>

          {/* Hero Right (Interactive Live Predictor Sandbox) */}
          <div className="lg:col-span-5 relative w-full">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-violet-400/15 rounded-3xl blur-[40px] pointer-events-none" />
            
            <div className="relative w-full rounded-2xl border border-emerald-500/10 bg-[#0b170e]/80 backdrop-blur-xl p-6 flex flex-col justify-between overflow-hidden shadow-2xl space-y-6">
              
              {/* Sandbox Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-slate-400 font-bold ml-2 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Interactive Sandbox
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-emerald-400" /> client_inference.js
                </div>
              </div>

              {/* Sliders Input Elements */}
              <div className="space-y-4 text-xs font-sans">
                {/* Nitrogen */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center font-semibold text-slate-400">
                    <span>Nitrogen (N):</span>
                    <span className="text-emerald-400 font-mono font-bold">{soilN} mg/kg</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={soilN} 
                    onChange={(e) => setSoilN(Number(e.target.value))} 
                    className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>

                {/* Phosphorous */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center font-semibold text-slate-400">
                    <span>Phosphorous (P):</span>
                    <span className="text-teal-400 font-mono font-bold">{soilP} mg/kg</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={soilP} 
                    onChange={(e) => setSoilP(Number(e.target.value))} 
                    className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-teal-400"
                  />
                </div>

                {/* Potassium */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center font-semibold text-slate-400">
                    <span>Potassium (K):</span>
                    <span className="text-indigo-400 font-mono font-bold">{soilK} mg/kg</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={soilK} 
                    onChange={(e) => setSoilK(Number(e.target.value))} 
                    className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                  />
                </div>

                {/* Moisture */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center font-semibold text-slate-400">
                    <span>Soil Moisture:</span>
                    <span className="text-sky-400 font-mono font-bold">{moisture}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={moisture} 
                    onChange={(e) => setMoisture(Number(e.target.value))} 
                    className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>
              </div>

              {/* Dynamic Live Prediction Badge */}
              <div className={`p-4 rounded-xl border ${getCropColor(predictedCrop)} flex justify-between items-center shadow-inner transition duration-300 transform hover:scale-[1.01]`}>
                <div className="text-left">
                  <span className="text-[9px] uppercase tracking-wider font-bold block opacity-70">Client-Side ML Output</span>
                  <span className="text-lg font-black tracking-tight text-white block mt-0.5">{predictedCrop?.toUpperCase() || 'EVALUATING...'}</span>
                </div>
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/5">
                  <Sprout className="w-5 h-5" />
                </div>
              </div>

              {/* Sandbox Footer */}
              <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-white/5 pt-4">
                <span>Decision Tree evaluation</span>
                <span className="font-mono text-emerald-400">Latency: ~0.04ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Visual Showcase */}
        <div className="mt-32 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center border-y border-white/5 py-16">
          <div className="relative group overflow-hidden rounded-2xl border border-emerald-500/10 shadow-2xl">
            <img 
              src="/images/hero_farm.jpg" 
              alt="Smart Agriculture Farm" 
              className="w-full h-80 object-cover transition duration-500 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">IoT Sensor Grids</span>
              <h3 className="text-xl font-bold text-white mt-1">Smart Farm Integration</h3>
              <p className="text-slate-300 text-xs mt-2 max-w-sm">
                Our models analyze micro-climate metrics, soil type maps, and chemical composition to prescribe specific crop management cycles.
              </p>
            </div>
          </div>
          
          <div className="relative group overflow-hidden rounded-2xl border border-emerald-500/10 shadow-2xl">
            <img 
              src="/images/soil_health.jpg" 
              alt="Healthy Organic Soil Health" 
              className="w-full h-80 object-cover transition duration-500 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">NPK Diagnostics</span>
              <h3 className="text-xl font-bold text-white mt-1">Soil Composition Analysis</h3>
              <p className="text-slate-300 text-xs mt-2 max-w-sm">
                Understand the chemical balance of your land. Optimize Nitrogen, Phosphorous, and Potassium levels for healthier crop yields.
              </p>
            </div>
          </div>
        </div>

        {/* Modules Option Hub Grid */}
        <div className="mt-32 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-black tracking-tight text-white">Integrated Agricultural Modules</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 mx-auto rounded-full" />
            <p className="text-slate-400 text-sm leading-relaxed pt-2">
              AgroPredict links multiple AI engines and soil calculators into a unified console. Explore our tools below:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {modules.map((mod) => {
              const Icon = mod.icon
              const colorParts = mod.color.split(' ')
              const borderHoverColor = colorParts.find(p => p.startsWith('hover:border-')) || 'hover:border-emerald-500/40'
              const textIconColor = colorParts[0]

              return (
                <div 
                  key={mod.href} 
                  onClick={() => router.push(user ? mod.href : '/login')}
                  className={`group relative p-6 rounded-2xl bg-white/[0.01] border border-white/5 ${borderHoverColor} hover:bg-white/[0.03] transition duration-300 cursor-pointer flex flex-col justify-between h-full shadow-lg hover:shadow-2xl hover:scale-[1.01]`}
                >
                  {/* Decorative card glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.01] to-white/0 pointer-events-none" />
                  
                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center ${textIconColor} transition group-hover:scale-105 duration-300`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-slate-400 uppercase tracking-wider">
                        {mod.badge}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition duration-200">
                        {mod.title}
                      </h3>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        {mod.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 flex items-center text-xs font-bold text-slate-300 group-hover:text-emerald-400 transition gap-1.5 relative z-10">
                    Launch Tool
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition duration-200" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tech Stack Metrics */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/5 pt-16">
          
          <div className="p-6 rounded-2xl bg-[#0b170e]/40 border border-emerald-500/5 hover:border-emerald-500/15 transition flex items-start gap-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Local Decision Tree ML</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Trained crop predictions are calculated locally in the browser with near-zero latency, avoiding remote network overheads.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0b170e]/40 border border-emerald-500/5 hover:border-emerald-500/15 transition flex items-start gap-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Prisma PostgreSQL Sync</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                User accounts, past credentials, and prediction history logs are stored securely in a remote Supabase Postgres cluster.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0b170e]/40 border border-emerald-500/5 hover:border-emerald-500/15 transition flex items-start gap-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Secure JWT Cookies</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Session tokens are stored inside signed, HTTP-only cookie keys and verified dynamically via Next.js routing middleware.
              </p>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-slate-500 text-xs">
        <p>&copy; {new Date().getFullYear()} AgroPredict Inc. All rights reserved.</p>
      </footer>
    </div>
  )
}
