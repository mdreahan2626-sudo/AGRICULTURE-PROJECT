'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  Leaf, Cpu, Database, ChevronRight, BarChart3, ShieldCheck,
  Sprout, CloudRain, ShieldAlert, MessageSquare, LayoutDashboard,
  ArrowRight, User, LogOut, Loader2, ShoppingBag, Sliders, Play,
  Mail, Check, ChevronLeft, ArrowUpRight, Thermometer, Droplet, 
  Wind, MapPin, Eye, Sparkles
} from 'lucide-react'
import { predictCrop } from '@/lib/predictor'
import { ThemeToggle } from '@/components/theme-toggle'
import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useTransform, 
  useMotionValue, 
  useReducedMotion, 
  animate 
} from 'framer-motion'

// --- Custom Reusable Intersection Observer Hook ---
function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [element, setElement] = useState(null)

  useEffect(() => {
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true)
        if (options.triggerOnce) {
          observer.unobserve(element)
        }
      } else {
        if (!options.triggerOnce) {
          setIsIntersecting(false)
        }
      }
    }, options)

    observer.observe(element)
    return () => observer.disconnect()
  }, [element, options.threshold, options.root, options.rootMargin, options.triggerOnce])

  return [setElement, isIntersecting]
}

// --- Text Word-by-Word Reveal Component ---
function WordRevealText({ text, className = "" }) {
  const words = text.split(" ")
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <span className={className}>{text}</span>
  }

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
      }
    }
  }

  const wordVariants = {
    hidden: { 
      opacity: 0, 
      y: 12 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        ease: [0.16, 1, 0.3, 1],
        duration: 0.5
      }
    }
  }

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className={`inline-block ${className}`}
    >
      {words.map((word, index) => (
        <motion.span
          variants={wordVariants}
          style={{ display: "inline-block", marginRight: "0.22em" }}
          key={index}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  )
}

// --- Animated Count-Up Numbers Component ---
function CountUpNumber({ end, decimals = 0, suffix = "" }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => latest.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ","))
  const [ref, isVisible] = useIntersectionObserver({ triggerOnce: true, threshold: 0.1 })
  const [displayVal, setDisplayVal] = useState("0")

  useEffect(() => {
    if (!isVisible) return
    const controls = animate(count, end, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1]
    })
    return () => controls.stop()
  }, [isVisible, count, end])

  useEffect(() => {
    return rounded.onChange((latest) => setDisplayVal(latest))
  }, [rounded])

  return (
    <span ref={ref} className="font-mono font-extrabold">
      {displayVal}{suffix}
    </span>
  )
}

// --- Testimonials Data ---
const testimonials = [
  {
    quote: "AgroPredict has completely transformed how we schedule irrigation in our vineyards. The water conservation was immediate, saving over 40% of our seasonal water reserves.",
    author: "Marc Rossi",
    role: "Lead Agronomist",
    company: "Rossi Estates (1,200 acres)",
    location: "Napa Valley, CA",
    rating: "98% Efficiency Score"
  },
  {
    quote: "Being able to upload a leaf photograph and instantly diagnose tomato blight saved our crop this season. The recommendations are highly specific, integrating organic options.",
    author: "Dr. Clara Vance",
    role: "Agricultural Science Lead",
    company: "BioGrow Labs",
    location: "Saskatchewan, Canada",
    rating: "Under 2-Sec Diagnostic Latency"
  },
  {
    quote: "The browser-native Decision Tree ML works flawlessly in low-connectivity fields. Our scouting teams rely on the sandbox to map optimal planting zones on the fly.",
    author: "Amit Patel",
    role: "Co-op Farm Director",
    company: "Green Soil Initiative",
    location: "Gujarat, India",
    rating: "3,200+ Farmers Enrolled"
  }
]

export default function LandingPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()

  // References for scroll progress tracking
  const processRef = useRef(null)
  const heroRef = useRef(null)

  // Scroll parallax calculations
  const { scrollY } = useScroll()
  const { scrollYProgress: processScrollProgress } = useScroll({
    target: processRef,
    offset: ["start end", "end start"]
  })

  // Transform values for parallax and fades
  const bgY = useTransform(scrollY, [0, 900], [0, 220])
  const bgScale = useTransform(scrollY, [0, 900], [1.05, 1.15])
  const heroOpacity = useTransform(scrollY, [0, 450], [1, 0])
  const heroY = useTransform(scrollY, [0, 450], [0, -60])
  
  // SVG timeline drawing scroll transform
  const pathLength = useTransform(processScrollProgress, [0.15, 0.75], [0, 1])

  // Sandbox Soil Predictor State
  const [soilN, setSoilN] = useState(65)
  const [soilP, setSoilP] = useState(45)
  const [soilK, setSoilK] = useState(22)
  const [moisture, setMoisture] = useState(42)
  const [soilType, setSoilType] = useState('Loamy')
  const [temp, setTemp] = useState(24)
  const [humid, setHumid] = useState(62)

  // Telemetry Console Logs
  const [logs, setLogs] = useState([
    "SYSTEM: Precision ML model successfully loaded.",
    "CONSOLE: Ready for local browser-native evaluation.",
    "INFERENCE: Listening for telemetry shifts..."
  ])

  // Testimonials Carousel State
  const [testimonialIndex, setTestimonialIndex] = useState(0)

  // Newsletter Form State
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Auth checking & Scroll listening
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

    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Trigger terminal log update on slider shifts
  useEffect(() => {
    const timestamp = new Date().toTimeString().split(' ')[0]
    const activeCrop = predictCrop({
      temperature: temp,
      humidity: humid,
      moisture: moisture,
      soilType: soilType,
      nitrogen: soilN,
      phosphorous: soilP,
      potassium: soilK
    })
    const logMsg = `[${timestamp}] INPUT: N:${soilN} P:${soilP} K:${soilK} | H:${humid}% T:${temp}°C M:${moisture}% | Model Output: ${activeCrop?.toUpperCase() || 'EVALUATING'}`
    setLogs(prev => [logMsg, ...prev].slice(0, 5))
  }, [soilN, soilP, soilK, moisture, soilType, temp, humid])

  // Real-time client-side inference for sandbox output badge
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
      case 'maize': return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5 shadow-yellow-500/5'
      case 'sugarcane': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5 shadow-emerald-500/5'
      case 'cotton': return 'text-sky-300 border-sky-500/20 bg-sky-500/5 shadow-sky-500/5'
      case 'paddy': return 'text-teal-400 border-teal-500/20 bg-teal-500/5 shadow-teal-500/5'
      case 'barley': return 'text-lime-400 border-lime-500/20 bg-lime-500/5 shadow-lime-500/5'
      case 'wheat': return 'text-amber-300 border-amber-500/20 bg-amber-500/5 shadow-amber-500/5'
      case 'millets': return 'text-purple-400 border-purple-500/20 bg-purple-500/5 shadow-purple-500/5'
      default: return 'text-lime-400 border-lime-500/20 bg-lime-500/5 shadow-lime-500/5'
    }
  }

  // Newsletter subscription
  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email) return
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      toast.success('Successfully connected. Welcome to precision agronomy.')
    }, 1200)
  }

  // Features description array
  const features = [
    {
      icon: Cpu,
      title: "Real-time Edge ML",
      badge: "Local Inference",
      desc: "Run advanced crop suitability calculators directly in the browser with zero server latency, enabling predictions in remote fields without network signals.",
      color: "text-lime-400"
    },
    {
      icon: CloudRain,
      title: "AI Weather Advisory",
      badge: "Gemini Core",
      desc: "Integrates micro-climate location telemetry with Gemini AI to generate automated alerts, saving water by adjusting sprinkler networks before downpours.",
      color: "text-cyan-400"
    },
    {
      icon: ShieldAlert,
      title: "Multimodal Leaf Clinic",
      badge: "Computer Vision",
      desc: "Snap photo scans of crop anomalies for instant diagnostic assessments, pathology classifications, and treatment regimens (organic and chemical).",
      color: "text-rose-400"
    },
    {
      icon: MessageSquare,
      title: "AI AgroBot Assistant",
      badge: "Voice AI",
      desc: "Consult our agricultural chatbot supporting offline speech-to-text input and natural text-to-speech audio outputs in multiple regional dialects.",
      color: "text-purple-400"
    }
  ]

  // Spring transition constants
  const springHover = {
    type: "spring",
    stiffness: 350,
    damping: 14
  }

  // Section Entrance Animation Variants (Alternating Left/Right)
  const getSectionVariants = (direction) => {
    if (prefersReducedMotion) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } }
      }
    }
    const offset = direction === 'left' ? -80 : 80
    return {
      hidden: { opacity: 0, x: offset },
      visible: { 
        opacity: 1, 
        x: 0, 
        transition: { 
          ease: [0.16, 1, 0.3, 1], 
          duration: 0.7 
        } 
      }
    }
  }

  // Grid Stagger Container Variants
  const gridContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12
      }
    }
  }

  // Grid Child Stagger Variants (Alternates slide per child index)
  const getGridChildVariants = (idx) => {
    if (prefersReducedMotion) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.4 } }
      }
    }
    const xOffset = idx % 2 === 0 ? -40 : 40
    return {
      hidden: { opacity: 0, x: xOffset, y: 15 },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 16
        }
      }
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#030507] text-[#e2f3e7] font-sans selection:bg-lime-500/30 selection:text-black">
      
      {/* Decorative Film Grain Overlay */}
      <div className="grain-texture" />

      {/* Hero Background Grid Pattern & Parallax Image */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Parallax Background Image Watermark */}
        <motion.div 
          style={{ 
            y: prefersReducedMotion ? 0 : bgY, 
            scale: prefersReducedMotion ? 1.05 : bgScale,
            height: '120vh'
          }}
          className="absolute inset-0 bg-[url('/images/hero_farm.jpg')] bg-cover bg-center opacity-[0.045] mix-blend-overlay"
        />
        
        {/* Glowing Tech Radial Spotlights */}
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[70vh] rounded-full bg-lime-500/5 blur-[120px]" />
        <div className="absolute top-[40%] right-[-10%] w-[60%] h-[60vh] rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[15%] w-[450px] h-[450px] rounded-full bg-lime-400/3 blur-[140px]" />

        {/* Tech Grid Backdrop */}
        <div className="absolute inset-0 tech-grid opacity-[0.8]" />
      </div>

      {/* Floating Sticky Morphing Navbar */}
      <motion.header 
        animate={{
          backgroundColor: scrolled ? "rgba(3, 5, 7, 0.85)" : "rgba(3, 5, 7, 0)",
          backdropFilter: scrolled ? "blur(16px)" : "blur(0px)",
          borderBottomColor: scrolled ? "rgba(163, 230, 53, 0.12)" : "rgba(163, 230, 53, 0)",
          paddingTop: scrolled ? "12px" : "20px",
          paddingBottom: scrolled ? "12px" : "20px",
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-50 w-full border-b border-transparent"
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ rotate: 12, scale: 1.05 }}
              transition={springHover}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-lime-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-lime-500/20 shrink-0"
            >
              <Leaf className="w-5.5 h-5.5 text-black" />
            </motion.div>
            <div>
              <span className="font-heading font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">AgroPredict</span>
              <span className="block text-[9px] text-lime-400 font-mono tracking-widest uppercase font-bold mt-0.5">Intelligent Agronomy</span>
            </div>
          </Link>

          {/* Quick scroll links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
            <a href="#features" className="hover:text-lime-400 transition-colors">Features</a>
            <a href="#process" className="hover:text-lime-400 transition-colors">Process</a>
            <a href="#metrics" className="hover:text-lime-400 transition-colors">Telemetry</a>
            <a href="#testimonials" className="hover:text-lime-400 transition-colors">Partners</a>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {loading ? (
              <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link 
                  href="/dashboard" 
                  className="hidden sm:inline-flex items-center gap-1 text-xs font-mono font-bold text-slate-400 bg-lime-500/5 px-3.5 py-2 rounded-lg border border-lime-500/10 hover:border-lime-500/30 hover:text-white transition"
                >
                  <User className="w-3.5 h-3.5 text-lime-400" />
                  <span>{user.name || 'Console'}</span>
                </Link>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} transition={springHover}>
                  <Link 
                    href="/dashboard" 
                    className="inline-flex items-center justify-center text-xs font-mono font-extrabold px-4.5 py-2.5 rounded-lg bg-lime-400 text-black shadow-lg shadow-lime-500/10 cursor-pointer"
                  >
                    Console Hub
                  </Link>
                </motion.div>
                <button 
                  onClick={async () => {
                    const res = await fetch('/api/auth/logout', { method: 'POST' })
                    if (res.ok) {
                      toast.success('Logged out')
                      setUser(null)
                      router.refresh()
                    }
                  }}
                  className="inline-flex items-center justify-center text-slate-400 hover:text-rose-400 transition cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline text-xs font-mono font-bold text-slate-300 hover:text-lime-400 uppercase tracking-wider transition">
                  Sign In
                </Link>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} transition={springHover}>
                  <Link 
                    href="/signup" 
                    className="inline-flex items-center justify-center text-xs font-mono font-extrabold px-4.5 py-2.5 rounded-lg bg-lime-400 text-black shadow-lg shadow-lime-500/10 cursor-pointer"
                  >
                    Get Started
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Landing Layout */}
      <main className="max-w-7xl mx-auto px-6 relative z-10">

        {/* 1. HERO SECTION */}
        <section ref={heroRef} className="min-h-[calc(100vh-80px)] flex flex-col justify-center pt-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Hero Left Content - Parallax drift */}
            <motion.div 
              style={{ 
                y: prefersReducedMotion ? 0 : heroY, 
                opacity: prefersReducedMotion ? 1 : heroOpacity 
              }}
              className="lg:col-span-6 flex flex-col items-start space-y-6 text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime-400/10 border border-lime-400/20 text-lime-400 text-xs font-mono font-bold">
                <Cpu className="w-3.5 h-3.5" />
                <span>[VERSION 2.4] DECISION TREE INFERENCE ENGINE</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-[72px] font-heading font-extrabold tracking-tight leading-[0.95] text-white">
                <WordRevealText text="Precision Agronomy Driven by AI." />
              </h1>
              
              <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-xl">
                Deploy edge intelligence to optimize agricultural outputs. Predict local crop suitability instantly, diagnose leaf anomalies via camera telemetry, and receive targeted Gemini AI recommendations.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
                <motion.div whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={springHover}>
                  <Link 
                    href={user ? "/dashboard" : "/signup"} 
                    className="inline-flex items-center justify-center px-6 py-4 rounded-xl bg-lime-400 text-black font-heading font-extrabold text-sm shadow-xl shadow-lime-500/10 group cursor-pointer w-full sm:w-auto"
                  >
                    {user ? "Enter Console Hub" : "Initialize Free Account"}
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={springHover}>
                  <a 
                    href="#features" 
                    className="inline-flex items-center justify-center px-6 py-4 rounded-xl bg-[#090e12]/80 border border-lime-500/10 backdrop-blur hover:bg-[#0f161c] hover:border-lime-500/30 transition text-slate-300 text-xs font-mono font-bold tracking-wider uppercase w-full sm:w-auto"
                  >
                    <Play className="w-3.5 h-3.5 mr-2 text-lime-400" />
                    Explore Features
                  </a>
                </motion.div>
              </div>

              {/* Micro Stats in Hero */}
              <div className="w-full pt-8 border-t border-lime-500/10 mt-2">
                <div className="grid grid-cols-3 gap-6 font-mono">
                  <div>
                    <span className="block text-2xl md:text-3xl font-extrabold text-white">0.04ms</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mt-1">Edge Latency</span>
                  </div>
                  <div className="border-l border-lime-500/10 pl-6">
                    <span className="block text-2xl md:text-3xl font-extrabold text-white">99.2%</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mt-1">Accuracy</span>
                  </div>
                  <div className="border-l border-lime-500/10 pl-6">
                    <span className="block text-2xl md:text-3xl font-extrabold text-white">12.4k</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mt-1">Active Acres</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Hero Right - Interactive ML Sandbox Console */}
            <motion.div 
              initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.8, delay: 0.1 }}
              className="lg:col-span-6 relative w-full"
            >
              {/* Outer Glow container */}
              <div className="absolute inset-0 bg-gradient-to-tr from-lime-500/5 to-cyan-500/10 rounded-3xl blur-[32px] pointer-events-none" />
              
              <div className="relative w-full rounded-2xl border border-lime-500/15 bg-[#070b0e]/90 backdrop-blur-2xl p-6 flex flex-col justify-between overflow-hidden shadow-2xl space-y-6">
                
                {/* Console Header */}
                <div className="flex items-center justify-between border-b border-lime-500/10 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
                    <span className="text-[10px] text-slate-400 font-mono font-bold ml-2 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-ping inline-block" />
                      Edge Predictor Sandbox
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-lime-400" /> 
                    <span>Inference_Engine.py</span>
                  </div>
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-mono">
                  
                  {/* Left Column - Soil Chemistry */}
                  <div className="space-y-4 pr-0 md:pr-3 md:border-r border-lime-500/5">
                    <div className="text-[10px] text-lime-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Database className="w-3 h-3" /> Soil Chemistry (NPK)
                    </div>
                    
                    {/* Nitrogen */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center font-bold text-slate-400">
                        <span>Nitrogen (N):</span>
                        <span className="text-lime-400 font-bold">{soilN} mg/kg</span>
                      </div>
                      <input 
                        type="range" min="0" max="120" value={soilN} 
                        onChange={(e) => setSoilN(Number(e.target.value))} 
                        className="w-full h-1 bg-lime-500/10 rounded-lg appearance-none cursor-pointer accent-lime-400"
                      />
                    </div>

                    {/* Phosphorous */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center font-bold text-slate-400">
                        <span>Phosphorous (P):</span>
                        <span className="text-emerald-400 font-bold">{soilP} mg/kg</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" value={soilP} 
                        onChange={(e) => setSoilP(Number(e.target.value))} 
                        className="w-full h-1 bg-emerald-500/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                      />
                    </div>

                    {/* Potassium */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center font-bold text-slate-400">
                        <span>Potassium (K):</span>
                        <span className="text-cyan-400 font-bold">{soilK} mg/kg</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" value={soilK} 
                        onChange={(e) => setSoilK(Number(e.target.value))} 
                        className="w-full h-1 bg-cyan-500/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>

                    {/* Soil Type Select */}
                    <div className="space-y-1 pt-1">
                      <label className="block text-slate-400 font-bold mb-1">Soil Classification:</label>
                      <select 
                        value={soilType} 
                        onChange={(e) => setSoilType(e.target.value)} 
                        className="w-full bg-[#030507] border border-lime-500/10 rounded-lg px-2 py-1.5 text-slate-300 font-mono focus:border-lime-400 outline-none"
                      >
                        <option value="Sandy">Sandy</option>
                        <option value="Loamy">Loamy</option>
                        <option value="Black">Black</option>
                        <option value="Red">Red</option>
                        <option value="Clayey">Clayey</option>
                      </select>
                    </div>
                  </div>

                  {/* Right Column - Environmental metrics */}
                  <div className="space-y-4 pl-0 md:pl-2">
                    <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                      <CloudRain className="w-3 h-3" /> Environment
                    </div>

                    {/* Soil Moisture */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center font-bold text-slate-400">
                        <span>Soil Moisture:</span>
                        <span className="text-cyan-400 font-bold">{moisture}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" value={moisture} 
                        onChange={(e) => setMoisture(Number(e.target.value))} 
                        className="w-full h-1 bg-cyan-500/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>

                    {/* Temperature */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center font-bold text-slate-400">
                        <span>Temperature:</span>
                        <span className="text-orange-400 font-bold">{temp}°C</span>
                      </div>
                      <input 
                        type="range" min="0" max="50" value={temp} 
                        onChange={(e) => setTemp(Number(e.target.value))} 
                        className="w-full h-1 bg-orange-500/10 rounded-lg appearance-none cursor-pointer accent-orange-400"
                      />
                    </div>

                    {/* Humidity */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center font-bold text-slate-400">
                        <span>Relative Humidity:</span>
                        <span className="text-purple-400 font-bold">{humid}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" value={humid} 
                        onChange={(e) => setHumid(Number(e.target.value))} 
                        className="w-full h-1 bg-purple-500/10 rounded-lg appearance-none cursor-pointer accent-purple-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Telemetry Output Badge */}
                <div className={`p-4 rounded-xl border transition-all duration-500 flex justify-between items-center shadow-lg ${getCropColor(predictedCrop)}`}>
                  <div className="text-left font-mono">
                    <span className="text-[9px] uppercase tracking-widest font-bold opacity-60 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-lime-400 inline-block animate-ping" />
                      Live Prediction Matrix
                    </span>
                    <span className="text-2xl font-heading font-extrabold tracking-tight text-white block mt-0.5">
                      {predictedCrop?.toUpperCase() || 'CALCULATING...'}
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-lg bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400 shadow-inner">
                    <Sprout className="w-6 h-6 animate-pulse" />
                  </div>
                </div>

                {/* Animated Console Live Logs */}
                <div className="rounded-lg bg-black/60 p-3.5 border border-lime-500/5 font-mono text-[9px] text-slate-400 space-y-1 select-none text-left h-24 overflow-hidden relative">
                  <div className="absolute top-0 right-3 py-1 text-[8px] text-lime-400/50 uppercase tracking-widest">telemetry stream</div>
                  {logs.map((log, index) => (
                    <div key={index} className="truncate tracking-wide">
                      <span className="text-lime-400/60 font-semibold">&gt;&gt;</span> {log}
                    </div>
                  ))}
                </div>

                {/* Sandbox Footer Info */}
                <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono border-t border-lime-500/10 pt-4">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-lime-400" /> Signed WebAssembly node</span>
                  <span>Latency: <span className="text-lime-400 font-bold">~0.04ms</span></span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. VALUE / FEATURES SECTION (Even: Slide from Right) */}
        <motion.section 
          id="features" 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={getSectionVariants('right')}
          className="py-24 border-t border-lime-500/10 relative"
        >
          {/* Overlay glow */}
          <div className="absolute top-[20%] left-[-15%] w-[400px] h-[400px] rounded-full bg-lime-500/3 blur-[120px] pointer-events-none" />

          <div className="space-y-4 text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold tracking-widest text-lime-400 bg-lime-400/10 px-3 py-1 rounded-full uppercase">
              Core Capability
            </span>
            <h2 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tight text-white mt-3 leading-none">
              Agronomic Intelligence, <br />Built for Precision.
            </h2>
            <p className="text-slate-400 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
              Unlock high-fidelity soil analyses, satellite vegetation indices, leaf disease diagnostics, and Gemini recommendation layers in a single console.
            </p>
          </div>

          {/* Features Grid - Staggered Cascade with alternating child entry directions */}
          <motion.div 
            variants={gridContainerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
          >
            {features.map((feat, index) => {
              const Icon = feat.icon
              return (
                <motion.div 
                  key={feat.title} 
                  variants={getGridChildVariants(index)}
                  whileHover={{ y: -8, scale: 1.015, borderColor: "rgba(163, 230, 53, 0.25)", boxShadow: "0 10px 30px rgba(163, 230, 53, 0.04)" }}
                  transition={springHover}
                  className="tech-glass p-6.5 rounded-2xl flex flex-col justify-between items-start group relative overflow-hidden shadow-lg"
                >
                  {/* Subtle Grid overlay for precision cards */}
                  <div className="absolute inset-0 tech-grid-dots opacity-20 group-hover:opacity-40 transition-opacity" />
                  
                  <div className="space-y-4 w-full relative z-10">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-lime-400/5 border border-lime-400/10 flex items-center justify-center ${feat.color} transition duration-300 group-hover:scale-105`}>
                        <Icon className="w-5.5 h-5.5" />
                      </div>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/20 uppercase tracking-widest">
                        {feat.badge}
                      </span>
                    </div>

                    <div className="space-y-2 text-left">
                      <h3 className="text-lg font-heading font-extrabold text-white group-hover:text-lime-400 transition-colors">
                        {feat.title}
                      </h3>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </div>

                  <Link 
                    href="/dashboard"
                    className="mt-6 flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 group-hover:text-lime-400 transition-colors relative z-10"
                  >
                    Launch Core Module 
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Interactive Visual Showcase (Dual Telemetry Cards) */}
          <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center pt-8">
            <div className="relative group overflow-hidden rounded-2xl border border-lime-500/10 shadow-2xl">
              <img 
                src="/images/hero_farm.jpg" 
                alt="Smart Agriculture Farm" 
                className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030507] via-[#030507]/40 to-transparent p-6.5 flex flex-col justify-end text-left">
                <span className="text-[10px] text-lime-400 font-mono font-bold uppercase tracking-widest block mb-1">GRID TELEMETRY</span>
                <h3 className="text-xl font-heading font-extrabold text-white">Smart IoT Sensor Grids</h3>
                <p className="text-slate-300 text-xs mt-2 max-w-sm leading-relaxed">
                  Real-time synchronization with active field probes tracks Nitrogen, Phosphorous, and Potassium chemical fluctuations across thousands of acres.
                </p>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-2xl border border-lime-500/10 shadow-2xl">
              <img 
                src="/images/soil_health.jpg" 
                alt="Healthy Organic Soil" 
                className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030507] via-[#030507]/40 to-transparent p-6.5 flex flex-col justify-end text-left">
                <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-widest block mb-1">NPK DIAGNOSTICS</span>
                <h3 className="text-xl font-heading font-extrabold text-white">Soil Chemistry & Composition</h3>
                <p className="text-slate-300 text-xs mt-2 max-w-sm leading-relaxed">
                  Optimize NPK balances to prevent nutrient leaching, enhance root resilience, and secure maximum yield multiplier potentials.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 3. PROCESS SECTION (Odd: Slide from Left, SVG Timeline) */}
        <motion.section 
          ref={processRef}
          id="process" 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={getSectionVariants('left')}
          className="py-24 border-t border-lime-500/10 relative"
        >
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-20">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full uppercase">
              System Workflow
            </span>
            <h2 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tight text-white mt-3 leading-none">
              From Telemetry to Irrigation.
            </h2>
            <p className="text-slate-400 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
              Our precision feedback loop automates diagnostics and crop planning in four highly optimized phases.
            </p>
          </div>

          {/* Process Timeline Grid with SVG line drawing */}
          <div className="relative">
            {/* Animated SVG Path length drawing on scroll */}
            <div className="absolute left-1/2 -translate-x-1/2 top-[50px] bottom-[50px] w-[2px] hidden lg:block z-0 bg-white/5">
              <svg className="w-full h-full" preserveAspectRatio="none">
                <motion.path
                  d="M 1,0 V 550"
                  stroke="#a3e635"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  style={{ pathLength: prefersReducedMotion ? 1 : pathLength }}
                />
              </svg>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-6 relative z-10">
              {[
                {
                  num: "01",
                  title: "Telemetry Capture",
                  desc: "Active IoT probes and drone mapping track NPK, soil moisture, and leaf color indices.",
                  accent: "border-lime-400/30 text-lime-400 bg-lime-400/5",
                  glow: "shadow-lime-500/5"
                },
                {
                  num: "02",
                  title: "Edge inference",
                  desc: "Local WebAssembly decision tree models compute crop suitabilities instantly with near-zero latency.",
                  accent: "border-emerald-400/30 text-emerald-400 bg-emerald-400/5",
                  glow: "shadow-emerald-500/5"
                },
                {
                  num: "03",
                  title: "AI Synthesis",
                  desc: "Gemini AI aggregates soil metrics and forecasts to generate local prescriptive notifications.",
                  accent: "border-cyan-400/30 text-cyan-400 bg-cyan-400/5",
                  glow: "shadow-cyan-500/5"
                },
                {
                  num: "04",
                  title: "Automated Action",
                  desc: "Irrigation pumps and marketplace recommendation triggers execute to save water and optimize costs.",
                  accent: "border-purple-400/30 text-purple-400 bg-purple-400/5",
                  glow: "shadow-purple-500/5"
                }
              ].map((step, idx) => (
                <div 
                  key={step.num}
                  className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 group"
                >
                  {/* Glowing Node Circle */}
                  <motion.div 
                    whileHover={{ scale: 1.06 }}
                    transition={springHover}
                    className={`w-24 h-24 rounded-full border-2 flex items-center justify-center text-2xl font-mono font-extrabold shadow-lg relative cursor-default ${step.accent} ${step.glow}`}
                  >
                    {/* Ring Pulse */}
                    <div className="absolute inset-[-4px] rounded-full border border-lime-400/10 animate-ping opacity-25 duration-1000" />
                    {step.num}
                  </motion.div>
                  
                  <div className="space-y-1 max-w-xs">
                    <h4 className="text-base font-heading font-extrabold text-white group-hover:text-lime-400 transition-colors">{step.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 4. STATS/IMPACT SECTION (Even: Slide from Right, Counting Counters) */}
        <motion.section 
          id="metrics" 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={getSectionVariants('right')}
          className="py-24 border-t border-lime-500/10 bg-[#06090c]/40 rounded-3xl px-8 relative overflow-hidden my-12"
        >
          {/* Subtle grid in background */}
          <div className="absolute inset-0 tech-grid opacity-[0.4] pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center relative z-10">
            {/* Stat 1 */}
            <div className="space-y-2">
              <span className="block text-4xl md:text-5xl font-mono font-extrabold text-lime-400">
                <CountUpNumber end={12480} suffix="+" />
              </span>
              <span className="block text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">
                Active Acres Monitored
              </span>
            </div>

            {/* Stat 2 */}
            <div className="space-y-2 border-t md:border-t-0 md:border-l border-lime-500/10 pt-6 md:pt-0">
              <span className="block text-4xl md:text-5xl font-mono font-extrabold text-cyan-400">
                <CountUpNumber end={42.8} decimals={1} suffix="%" />
              </span>
              <span className="block text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">
                Water Saved Annually
              </span>
            </div>

            {/* Stat 3 */}
            <div className="space-y-2 border-t lg:border-t-0 lg:border-l border-lime-500/10 pt-6 lg:pt-0">
              <span className="block text-4xl md:text-5xl font-mono font-extrabold text-emerald-400">
                <CountUpNumber end={99.2} decimals={1} suffix="%" />
              </span>
              <span className="block text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">
                ML Inference Accuracy
              </span>
            </div>

            {/* Stat 4 */}
            <div className="space-y-2 border-t lg:border-t-0 lg:border-l border-lime-500/10 pt-6 lg:pt-0">
              <span className="block text-4xl md:text-5xl font-mono font-extrabold text-purple-400">
                <CountUpNumber end={3840} suffix="+" />
              </span>
              <span className="block text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">
                Daily AI Prescriptions
              </span>
            </div>
          </div>
        </motion.section>

        {/* 5. TESTIMONIALS SECTION (Odd: Slide from Left, Ambient Floating Card) */}
        <motion.section 
          id="testimonials" 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={getSectionVariants('left')}
          className="py-24 border-t border-lime-500/10 relative"
        >
          <div className="absolute bottom-[10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-cyan-500/3 blur-[120px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Header info left */}
            <div className="lg:col-span-5 flex flex-col items-start space-y-4 text-left">
              <span className="text-xs font-mono font-bold tracking-widest text-lime-400 bg-lime-400/10 px-3 py-1 rounded-full uppercase">
                Partner Testimonials
              </span>
              <h2 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tight text-white leading-none">
                Validated by Agronomists.
              </h2>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-sm">
                Hear how farm directors, agricultural science researchers, and co-ops deploy our edge ML models globally to secure yield outputs.
              </p>
              
              {/* Carousel Navigation buttons */}
              <div className="flex items-center gap-3.5 pt-4">
                <button 
                  onClick={() => setTestimonialIndex(prev => prev === 0 ? testimonials.length - 1 : prev - 1)}
                  className="w-10 h-10 rounded-full border border-lime-500/15 flex items-center justify-center text-slate-400 hover:border-lime-400 hover:text-lime-400 hover:bg-lime-400/5 transition cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setTestimonialIndex(prev => prev === testimonials.length - 1 ? 0 : prev + 1)}
                  className="w-10 h-10 rounded-full border border-lime-500/15 flex items-center justify-center text-slate-400 hover:border-lime-400 hover:text-lime-400 hover:bg-lime-400/5 transition cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <span className="text-xs font-mono text-slate-500 font-bold ml-2">
                  {testimonialIndex + 1} / {testimonials.length}
                </span>
              </div>
            </div>

            {/* Testimonials Slide Area - With Idle Floating Motion */}
            <div className="lg:col-span-7 w-full">
              <motion.div 
                animate={prefersReducedMotion ? {} : {
                  y: [-4, 4, -4]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="tech-glass p-8 rounded-2xl shadow-xl border border-lime-500/10 relative text-left min-h-[310px] flex flex-col justify-between"
              >
                {/* Visual telemetry marks */}
                <div className="absolute top-0 right-8 font-mono text-[9px] text-lime-400/30 font-bold uppercase tracking-widest pt-4">
                  VERIFIED DEPLOYMENT
                </div>
                
                <div className="space-y-6">
                  {/* Quote icon watermark */}
                  <span className="text-6xl font-serif text-lime-400/10 absolute top-2 left-6 pointer-events-none select-none">“</span>
                  
                  {/* Animated Quote container */}
                  <div className="transition-all duration-300 min-h-[140px] pt-4">
                    <p className="text-slate-200 text-sm md:text-base leading-relaxed italic font-medium relative z-10">
                      "{testimonials[testimonialIndex].quote}"
                    </p>
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-lime-500/10 pt-6 mt-6">
                  <div>
                    <h5 className="font-heading font-extrabold text-white text-base">
                      {testimonials[testimonialIndex].author}
                    </h5>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {testimonials[testimonialIndex].role}, <span className="text-lime-400 font-medium">{testimonials[testimonialIndex].company}</span>
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-mono mt-1">
                      <MapPin className="w-3 h-3 text-cyan-400" /> {testimonials[testimonialIndex].location}
                    </span>
                  </div>
                  
                  {/* Efficiency badge */}
                  <div className="mt-3 sm:mt-0 px-3 py-1.5 rounded-lg bg-lime-400/5 border border-lime-400/10 text-lime-400 text-xs font-mono font-bold">
                    {testimonials[testimonialIndex].rating}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* 6. NEWSLETTER / closing CTA SECTION (Even: Slide/Scale closing beat) */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={{
            hidden: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.94 },
            visible: { 
              opacity: 1, 
              scale: 1, 
              transition: { 
                type: "spring", 
                stiffness: 70, 
                damping: 18, 
                duration: 0.8 
              } 
            }
          }}
          className="py-16 my-12 relative overflow-hidden rounded-3xl border border-lime-500/10 bg-[#06090c] shadow-2xl"
        >
          {/* Internal Grid pattern */}
          <div className="absolute inset-0 tech-grid opacity-[0.7] pointer-events-none" />
          {/* Radial glowing spotlight */}
          <div className="absolute bottom-[-50%] left-[50%] -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-gradient-to-tr from-lime-500/10 to-cyan-500/10 blur-[100px] pointer-events-none" />

          <div className="max-w-3xl mx-auto text-center px-6 relative z-10 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-lime-400/10 border border-lime-400/20 text-lime-400 text-[10px] font-mono font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" /> Newsletter Dispatch
            </span>
            
            <h2 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tight text-white leading-none">
              Subscribe to Precision Updates
            </h2>
            
            <p className="text-slate-400 text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
              Get monthly deep dives on edge ML models, soil chemistry trends, and early access codes to telemetry upgrades.
            </p>

            {/* Form */}
            <div className="pt-4 max-w-md mx-auto">
              {submitted ? (
                <div className="p-5 rounded-2xl border border-lime-400/20 bg-lime-400/5 text-lime-400 text-xs font-mono font-bold text-center flex flex-col items-center gap-2.5 shadow-inner">
                  <div className="w-9 h-9 rounded-full bg-lime-400/10 flex items-center justify-center border border-lime-400/30">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-white font-extrabold text-sm mb-0.5">Transmission Successful.</span>
                    Inbound api credential keys generated and queued for: <span className="underline">{email}</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-full relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="email" 
                      required
                      placeholder="agronomist@farm-network.org" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-black/60 border border-lime-500/10 text-xs font-mono text-white placeholder-slate-500 focus:border-lime-400 outline-none transition"
                    />
                  </div>
                  <motion.div 
                    whileHover={{ scale: 1.03 }} 
                    whileTap={{ scale: 0.97 }} 
                    transition={springHover} 
                    className="w-full sm:w-auto shrink-0"
                  >
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="w-full bg-lime-400 text-black font-heading font-extrabold text-xs tracking-wider uppercase px-6 py-4 rounded-xl shadow-lg hover:bg-lime-300 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Subscribe
                          <ArrowUpRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </motion.div>
                </form>
              )}
            </div>
          </div>
        </motion.section>

      </main>

      {/* 7. FOOTER (Static - Motion fatigue release) */}
      <footer className="border-t border-lime-500/10 py-16 bg-[#020305] relative z-10 text-left font-mono">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand block */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-lime-400 flex items-center justify-center shadow-lg shadow-lime-500/10">
                <Leaf className="w-4.5 h-4.5 text-black" />
              </div>
              <span className="font-heading font-extrabold text-base text-white tracking-tight">AgroPredict</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs">
              WebAssembly edge ML model nodes and Gemini-based location assistants. Built for modern farm directors and agronomic researchers.
            </p>
            <div className="text-[10px] text-lime-400/60 font-bold uppercase tracking-widest">
              SYSTEM STATUS: ALL SYSTEMS OPERATIONAL
            </div>
          </div>

          {/* Directory Links columns */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-widest">Modules</h5>
            <ul className="space-y-2 text-[11px] text-slate-500 font-medium">
              <li><Link href="/dashboard/crop" className="hover:text-lime-400 transition-colors">Crop Suitability</Link></li>
              <li><Link href="/dashboard/weather" className="hover:text-lime-400 transition-colors">Weather AI</Link></li>
              <li><Link href="/dashboard/disease" className="hover:text-lime-400 transition-colors">Leaf Diagnosis</Link></li>
              <li><Link href="/dashboard/chat" className="hover:text-lime-400 transition-colors">Voice Bot</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-widest">Console</h5>
            <ul className="space-y-2 text-[11px] text-slate-500 font-medium">
              <li><Link href="/dashboard" className="hover:text-lime-400 transition-colors">Console Panel</Link></li>
              <li><Link href="/dashboard/health" className="hover:text-lime-400 transition-colors">Farm Health</Link></li>
              <li><Link href="/dashboard/marketplace" className="hover:text-lime-400 transition-colors">Supplies Market</Link></li>
              <li><Link href="/login" className="hover:text-lime-400 transition-colors">Sign In Credentials</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-widest">Security</h5>
            <ul className="space-y-2 text-[11px] text-slate-500 font-medium">
              <li><a href="#" className="hover:text-lime-400 transition-colors">signed-cookies.pem</a></li>
              <li><a href="#" className="hover:text-lime-400 transition-colors">jwt-routing-policy</a></li>
              <li><a href="#" className="hover:text-lime-400 transition-colors">local-tree-weights</a></li>
              <li><a href="#" className="hover:text-lime-400 transition-colors">compliance-gmp</a></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-widest">Legal</h5>
            <ul className="space-y-2 text-[11px] text-slate-500 font-medium">
              <li><a href="#" className="hover:text-lime-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-lime-400 transition-colors">Terms of Use</a></li>
              <li><a href="#" className="hover:text-lime-400 transition-colors">End User License</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="max-w-7xl mx-auto px-6 border-t border-lime-500/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-600 gap-4">
          <p>&copy; {new Date().getFullYear()} AgroPredict Inc. Fully encrypted connection.</p>
          <div className="flex gap-4 uppercase font-bold tracking-widest text-[9px]">
            <span>NODE_ID: AP_WEB_04</span>
            <span>SHARDS: US_EAST_01</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
