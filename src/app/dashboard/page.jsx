'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  Sprout, CloudRain, ShieldAlert, MessageSquare, ArrowRight, Leaf, 
  LayoutDashboard, ShoppingBag, TrendingUp, Coins, Calendar, User, 
  Plus, Search, FileText, CheckCircle, Clock, Trash2, Tag, ShieldCheck, RefreshCw
} from 'lucide-react'
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'

const DEFAULT_SALES = [
  { id: '1', date: '2026-06-08', crop: 'Maize', quantity: 15, price: 18000, buyer: 'Kisan Mandi', status: 'Completed' },
  { id: '2', date: '2026-06-14', crop: 'Paddy', quantity: 12, price: 21500, buyer: 'Nafed Warehouse', status: 'Completed' },
  { id: '3', date: '2026-06-20', crop: 'Wheat', quantity: 8, price: 19500, buyer: 'Grains Syndicate', status: 'Completed' },
  { id: '4', date: '2026-06-24', crop: 'Cotton', quantity: 5, price: 32000, buyer: 'Textile Coop', status: 'Pending' }
]

// Framer Motion staggered grid variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: 'spring', 
      stiffness: 120, 
      damping: 18 
    } 
  }
}

export default function DashboardHomePage() {
  const router = useRouter()
  const [sales, setSales] = useState(DEFAULT_SALES)
  const [mounted, setMounted] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  // Form states
  const [formCrop, setFormCrop] = useState('Maize')
  const [formQuantity, setFormQuantity] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formBuyer, setFormBuyer] = useState('')
  const [formStatus, setFormStatus] = useState('Completed')

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('crop_sales_log')
    if (stored) {
      try {
        setSales(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse sales from localStorage', e)
      }
    }
  }, [])

  const saveSales = (newSales) => {
    setSales(newSales)
    localStorage.setItem('crop_sales_log', JSON.stringify(newSales))
  }

  const handleAddSale = (e) => {
    e.preventDefault()
    if (!formQuantity || !formPrice || !formBuyer) {
      toast.error('Please fill in all sales details')
      return
    }

    const newSale = {
      id: String(Date.now()),
      date: new Date().toISOString().split('T')[0],
      crop: formCrop,
      quantity: parseFloat(formQuantity),
      price: parseFloat(formPrice),
      buyer: formBuyer,
      status: formStatus
    }

    const updated = [newSale, ...sales]
    saveSales(updated)
    toast.success(`Logged sale for ${formCrop.toUpperCase()} - ₹${(newSale.quantity * newSale.price).toLocaleString()}`)

    // Clear form
    setFormQuantity('')
    setFormPrice('')
    setFormBuyer('')
    setFormStatus('Completed')
    setIsAdding(false)
  }

  const handleDeleteSale = (id, cropName) => {
    const filtered = sales.filter(s => s.id !== id)
    saveSales(filtered)
    toast.success(`Deleted transaction log for ${cropName}`)
  }

  // Dashboard calculations
  const totalRevenue = sales.reduce((sum, s) => sum + (s.quantity * s.price), 0)
  const totalTons = sales.reduce((sum, s) => sum + s.quantity, 0)
  const averagePrice = totalTons > 0 ? Math.round(totalRevenue / totalTons) : 0
  const pendingRevenue = sales.filter(s => s.status === 'Pending').reduce((sum, s) => sum + (s.quantity * s.price), 0)

  // Chart data calculations
  const sortedSales = [...sales].sort((a, b) => new Date(a.date) - new Date(b.date))
  let runningTotal = 0
  const areaChartData = sortedSales.map((sale) => {
    runningTotal += sale.quantity * sale.price
    return {
      name: new Date(sale.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      'Cumulative Revenue': runningTotal,
      'Sale Value': sale.quantity * sale.price
    }
  })

  const cropTotals = {}
  sales.forEach(sale => {
    cropTotals[sale.crop] = (cropTotals[sale.crop] || 0) + (sale.quantity * sale.price)
  })
  const barChartData = Object.keys(cropTotals).map(crop => ({
    crop,
    Revenue: cropTotals[crop]
  }))

  const hubs = [
    {
      href: '/dashboard/crop',
      title: 'Crop Suitability',
      description: 'Predict crop suitability based on NPK inputs.',
      icon: Sprout,
      color: 'text-lime-400',
      badge: 'ML Engine'
    },
    {
      href: '/dashboard/weather',
      title: 'Weather Advisor',
      description: 'AI recommendation location alerts.',
      icon: CloudRain,
      color: 'text-cyan-400',
      badge: 'Location AI'
    },
    {
      href: '/dashboard/disease',
      title: 'Leaf Clinic',
      description: 'Diagnose leaf diseases with computer vision.',
      icon: ShieldAlert,
      color: 'text-rose-400',
      badge: 'Vision AI'
    },
    {
      href: '/dashboard/chat',
      title: 'AI AgroBot',
      description: 'Multilingual chat assistant with speech tools.',
      icon: MessageSquare,
      color: 'text-purple-400',
      badge: 'Voice AI'
    },
    {
      href: '/dashboard/health',
      title: 'Farm Health',
      description: 'Unified dashboard indices tracker.',
      icon: LayoutDashboard,
      color: 'text-amber-400',
      badge: 'Console Hub'
    },
    {
      href: '/dashboard/marketplace',
      title: 'Marketplace',
      description: 'AI recommended seeds, fertilizers, and tools.',
      icon: ShoppingBag,
      color: 'text-pink-400',
      badge: 'Smart E-comm'
    }
  ]

  const getCropTextColor = (crop) => {
    switch (crop?.toLowerCase()) {
      case 'maize': return 'text-yellow-400'
      case 'sugarcane': return 'text-emerald-400'
      case 'cotton': return 'text-sky-300'
      case 'paddy': return 'text-teal-400'
      case 'barley': return 'text-lime-400'
      case 'wheat': return 'text-amber-300'
      case 'millets': return 'text-purple-400'
      default: return 'text-slate-300'
    }
  }

  if (!mounted) {
    return (
      <div className="py-24 flex justify-center items-center text-xs font-mono text-slate-500 gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-lime-400" />
        Loading Farm Console Analytics...
      </div>
    )
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full text-left font-sans"
    >
      
      {/* Left Column - Main Sales Dashboard (8 cols) */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* Welcome Section */}
        <motion.div 
          variants={itemVariants}
          className="p-6 rounded-2xl border border-white/5 bg-[#0b170e]/40 backdrop-blur-xl relative overflow-hidden flex justify-between items-center shadow-xl"
        >
          <div className="absolute top-[-20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-lime-500/5 blur-[80px] pointer-events-none" />
          <div className="space-y-1 z-10">
            <h2 className="text-xl font-heading font-extrabold text-white tracking-tight">Farm Performance & Revenue Dashboard</h2>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
              Track crop sales logs, review cumulative agricultural income charts, and record new crop transactions to maintain structured financial sheets.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-lime-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-lime-500/20 shrink-0">
            <Leaf className="w-5.5 h-5.5 text-black" />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Revenue */}
          <motion.div 
            whileHover={{ y: -4, transition: { duration: 0.15 } }}
            className="rounded-xl border border-white/5 bg-[#0e1626]/30 backdrop-blur-md p-4 flex flex-col justify-between"
          >
            <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-500">Total Revenue</span>
            <div className="text-lg font-mono font-black text-lime-400 mt-1">₹{totalRevenue.toLocaleString()}</div>
            <span className="text-[9px] text-slate-500 mt-0.5">Sowing cycle income</span>
          </motion.div>

          {/* Tons Sold */}
          <motion.div 
            whileHover={{ y: -4, transition: { duration: 0.15 } }}
            className="rounded-xl border border-white/5 bg-[#0e1626]/30 backdrop-blur-md p-4 flex flex-col justify-between"
          >
            <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-500">Crop Quantity Sold</span>
            <div className="text-lg font-mono font-black text-white mt-1">{totalTons} Tons</div>
            <span className="text-[9px] text-slate-500 mt-0.5">Total yield log weight</span>
          </motion.div>

          {/* Average Price */}
          <motion.div 
            whileHover={{ y: -4, transition: { duration: 0.15 } }}
            className="rounded-xl border border-white/5 bg-[#0e1626]/30 backdrop-blur-md p-4 flex flex-col justify-between"
          >
            <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-500">Average price</span>
            <div className="text-lg font-mono font-black text-white mt-1">₹{averagePrice.toLocaleString()} <span className="text-[10px] text-slate-400 font-semibold">/Ton</span></div>
            <span className="text-[9px] text-slate-500 mt-0.5">Sales value mean</span>
          </motion.div>

          {/* Pending */}
          <motion.div 
            whileHover={{ y: -4, transition: { duration: 0.15 } }}
            className="rounded-xl border border-white/5 bg-[#0e1626]/30 backdrop-blur-md p-4 flex flex-col justify-between"
          >
            <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-500">Pending Payments</span>
            <div className="text-lg font-mono font-black text-amber-400 mt-1">₹{pendingRevenue.toLocaleString()}</div>
            <span className="text-[9px] text-slate-500 mt-0.5">Awaiting settlement</span>
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cumulative Revenue Area Chart */}
          <Card className="border-white/5 bg-[#0e1626]/40 backdrop-blur-xl shadow-xl flex flex-col justify-between overflow-hidden">
            <CardHeader className="pb-2 border-b border-white/5">
              <CardTitle className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-lime-400" />
                Revenue Growth Timeline
              </CardTitle>
              <CardDescription className="text-slate-500 text-[9px]">Chronological trend of cumulative sales revenue.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 h-[200px] flex items-center justify-center">
              {areaChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#84cc16" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                    <YAxis stroke="#64748b" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: '#070b0e', borderColor: 'rgba(163, 230, 53, 0.1)', borderRadius: '8px', fontSize: '10px' }} />
                    <Area type="monotone" dataKey="Cumulative Revenue" stroke="#84cc16" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={1.5} name="Total Income" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-500 text-xs font-mono">No transaction records logged.</div>
              )}
            </CardContent>
          </Card>

          {/* Revenue distribution by crop Bar Chart */}
          <Card className="border-white/5 bg-[#0e1626]/40 backdrop-blur-xl shadow-xl flex flex-col justify-between overflow-hidden">
            <CardHeader className="pb-2 border-b border-white/5">
              <CardTitle className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-cyan-400" />
                Sales Breakdown by Crop
              </CardTitle>
              <CardDescription className="text-slate-500 text-[9px]">Total crop revenue distribution comparisons.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 h-[200px] flex items-center justify-center">
              {barChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" />
                    <XAxis dataKey="crop" stroke="#64748b" fontSize={9} />
                    <YAxis stroke="#64748b" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: '#070b0e', borderColor: 'rgba(163, 230, 53, 0.1)', borderRadius: '8px', fontSize: '10px' }} />
                    <Bar dataKey="Revenue" fill="#06b6d4" fillOpacity={0.7} radius={[4, 4, 0, 0]} name="Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-500 text-xs font-mono">No crop breakdown available.</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Log New Sale Form Panel */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-lime-400" />
              Transactions Log
            </h3>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg bg-lime-400 text-black hover:bg-lime-300 transition cursor-pointer active:scale-95 shadow-md shadow-lime-500/10"
            >
              <Plus className="w-3.5 h-3.5" />
              {isAdding ? 'Close logger' : 'Log Crop Sale'}
            </button>
          </div>

          <AnimatePresence>
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0, transition: { height: { type: 'spring', stiffness: 100, damping: 15 }, opacity: { duration: 0.2 } } }}
                exit={{ opacity: 0, height: 0, y: -10, transition: { height: { duration: 0.2 }, opacity: { duration: 0.1 } } }}
                className="overflow-hidden"
              >
                <Card className="border-white/5 bg-[#0e1626]/50 backdrop-blur-xl p-6 shadow-xl mb-4">
                  <form onSubmit={handleAddSale} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="space-y-1.5">
                      <Label htmlFor="crop" className="text-slate-300 text-xs font-semibold">Crop Type</Label>
                      <Select value={formCrop} onValueChange={setFormCrop}>
                        <SelectTrigger className="bg-black/25 border-white/10 text-white rounded-lg h-9 text-xs font-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0e1626] border-white/10 text-white rounded-lg font-mono">
                          <SelectItem value="Maize" className="text-xs">Maize</SelectItem>
                          <SelectItem value="Paddy" className="text-xs">Paddy (Rice)</SelectItem>
                          <SelectItem value="Wheat" className="text-xs">Wheat</SelectItem>
                          <SelectItem value="Cotton" className="text-xs">Cotton</SelectItem>
                          <SelectItem value="Sugarcane" className="text-xs">Sugarcane</SelectItem>
                          <SelectItem value="Barley" className="text-xs">Barley</SelectItem>
                          <SelectItem value="Millets" className="text-xs">Millets</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="quantity" className="text-slate-300 text-xs font-semibold">Tons Sold</Label>
                      <Input id="quantity" type="number" step="any" placeholder="e.g. 10" className="bg-black/25 border-white/10 text-white text-xs h-9 rounded-lg font-mono" value={formQuantity} onChange={(e) => setFormQuantity(e.target.value)} required />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="price" className="text-slate-300 text-xs font-semibold">Price per Ton (₹)</Label>
                      <Input id="price" type="number" placeholder="e.g. 18000" className="bg-black/25 border-white/10 text-white text-xs h-9 rounded-lg font-mono" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} required />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="buyer" className="text-slate-300 text-xs font-semibold">Buyer / Market</Label>
                      <Input id="buyer" type="text" placeholder="e.g. Local Mandi" className="bg-black/25 border-white/10 text-white text-xs h-9 rounded-lg font-mono" value={formBuyer} onChange={(e) => setFormBuyer(e.target.value)} required />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="status" className="text-slate-300 text-xs font-semibold">Payment Status</Label>
                      <Select value={formStatus} onValueChange={setFormStatus}>
                        <SelectTrigger className="bg-black/25 border-white/10 text-white rounded-lg h-9 text-xs font-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0e1626] border-white/10 text-white rounded-lg font-mono">
                          <SelectItem value="Completed" className="text-xs">Completed</SelectItem>
                          <SelectItem value="Pending" className="text-xs">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-5 flex justify-end gap-3 pt-2">
                      <Button type="button" variant="outline" className="h-9 text-xs border-white/10 text-slate-400 hover:bg-white/5 cursor-pointer font-mono" onClick={() => setIsAdding(false)}>Cancel</Button>
                      <Button type="submit" className="h-9 text-xs bg-lime-400 text-black font-heading font-extrabold hover:bg-lime-300 cursor-pointer">Save Transaction</Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transactions Log Table */}
          <Card className="border-white/5 bg-[#0e1626]/40 backdrop-blur-xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[9px] font-mono">
                    <th className="p-4">Date</th>
                    <th className="p-4">Crop</th>
                    <th className="p-4">Tons</th>
                    <th className="p-4">Rate (₹/Ton)</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Buyer</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {sales.map((sale) => (
                    <motion.tr 
                      key={sale.id} 
                      whileHover={{ backgroundColor: "rgba(163, 230, 53, 0.02)" }}
                      className="hover:bg-white/[0.01] transition"
                    >
                      <td className="p-4 text-slate-400">{new Date(sale.date).toLocaleDateString()}</td>
                      <td className="p-4 font-bold font-sans"><span className={getCropTextColor(sale.crop)}>{sale.crop}</span></td>
                      <td className="p-4 font-semibold text-slate-200">{sale.quantity}</td>
                      <td className="p-4 text-slate-300">₹{sale.price.toLocaleString()}</td>
                      <td className="p-4 font-bold text-white">₹{(sale.quantity * sale.price).toLocaleString()}</td>
                      <td className="p-4 text-slate-400 font-medium font-sans">{sale.buyer}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          sale.status === 'Completed' ? 'bg-lime-500/10 text-lime-400 border border-lime-500/10' : 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                        }`}>
                          {sale.status === 'Completed' ? (
                            <><CheckCircle className="w-2.5 h-2.5" /> Settled</>
                          ) : (
                            <><Clock className="w-2.5 h-2.5" /> Pending</>
                          )}
                        </span>
                      </td>
                      <td className="p-4 text-center font-sans">
                        <button 
                          onClick={() => handleDeleteSale(sale.id, sale.crop)}
                          className="p-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 cursor-pointer active:scale-95 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                  {sales.length === 0 && (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-500 font-sans">No transactions recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

      </div>

      {/* Right Column - Compact Launch Console (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        
        <motion.div 
          variants={itemVariants}
          className="rounded-2xl border border-white/5 bg-[#0e1626]/40 backdrop-blur-xl shadow-xl p-5 space-y-4"
        >
          <div className="border-b border-white/5 pb-3">
            <h3 className="text-sm font-heading font-extrabold text-white flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-lime-400" />
              Agronomy Tool Launcher
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Select a core workspace module below to calculate or configure options.</p>
          </div>

          <div className="space-y-3">
            {hubs.map((hub) => {
              const Icon = hub.icon
              return (
                <Link key={hub.href} href={hub.href} className="group block">
                  <motion.div 
                    whileHover={{ y: -4, scale: 1.01, borderColor: "rgba(163, 230, 53, 0.2)" }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className="p-3 rounded-xl border border-white/5 bg-white/[0.01] transition duration-200 cursor-pointer flex items-center justify-between gap-3 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center ${hub.color} transition shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-sans font-bold text-white group-hover:text-lime-400 transition duration-150">{hub.title}</h4>
                        <p className="text-[9px] text-slate-500 leading-tight mt-0.5 truncate max-w-[170px]">{hub.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-slate-400 uppercase tracking-wider">{hub.badge}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-lime-400 group-hover:translate-x-0.5 transition duration-150" />
                    </div>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </motion.div>

        {/* Console Health Check Status */}
        <motion.div 
          variants={itemVariants}
          className="rounded-2xl border border-white/5 bg-[#0e1626]/30 backdrop-blur-md p-4 space-y-3 text-xs text-left"
        >
          <div className="flex items-center gap-2 font-mono font-bold text-slate-300">
            <ShieldCheck className="w-4 h-4 text-lime-400" />
            <span>Workspace Security status</span>
          </div>
          <div className="text-slate-400 text-[10px] leading-relaxed space-y-1.5 font-mono">
            <div className="flex justify-between"><span>SSL Encryption:</span> <span className="text-lime-400 font-bold">ACTIVE</span></div>
            <div className="flex justify-between"><span>Supabase Cluster:</span> <span className="text-lime-400 font-bold">CONNECTED</span></div>
            <div className="flex justify-between"><span>ML Engine splits:</span> <span className="text-lime-400 font-bold">LOCAL RUN</span></div>
          </div>
        </motion.div>

      </div>

    </motion.div>
  )
}
