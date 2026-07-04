'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { 
  ShoppingBag, Sprout, Coins, MapPin, TrendingUp, 
  Sparkles, Wrench, Search, Info, CheckCircle, AlertTriangle, RefreshCw
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function MarketplacePage() {
  const [crop, setCrop] = useState('Maize')
  const [budget, setBudget] = useState('10000')
  const [location, setLocation] = useState('Punjab')
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!crop || !budget || !location) {
      toast.error('Please fill in all inputs')
      return
    }

    setLoading(true)
    setRecommendations(null)

    try {
      const res = await fetch('/api/marketplace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crop,
          budget: parseFloat(budget),
          location
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch recommendations')
      }

      setRecommendations(data.recommendations)
      toast.success('Marketplace recommendations generated!')
    } catch (err) {
      toast.error(err.message || 'Failed to query marketplace recommendations')
    } finally {
      setLoading(false)
    }
  }

  const handleSimulatePurchase = (itemName, type) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: `Locating authorized ${type} dealers near ${location}...`,
        success: `Found 3 dealers for ${itemName} in ${location}! Simulated quote sent.`,
        error: 'Dealer lookup failed'
      }
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 w-full text-left">
      
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl border border-white/5 bg-[#0e1626]/40 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="absolute top-[-20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-violet-500/5 blur-[80px] pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5.5 h-5.5 text-violet-400" />
            Seed & Fertilizer Marketplace
          </h2>
          <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
            Get personalized seed, fertilizer, and mechanical tool recommendations matching your crop target, local geography, and budget limits. Supported by Gemini 2.5 Flash.
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-400 flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0 relative z-10">
          <ShoppingBag className="w-6 h-6 text-slate-900" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Input Form (4 cols) */}
        <Card className="border-white/5 bg-[#0e1626]/40 backdrop-blur-xl shadow-xl lg:col-span-4">
          <CardHeader className="pb-4 border-b border-white/5">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-violet-400" />
              Configure Constraints
            </CardTitle>
            <CardDescription className="text-slate-500 text-[10px]">
              Set parameters to filter supply options.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-1.5">
                <Label htmlFor="crop" className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                  Target Crop Type
                </Label>
                <Select value={crop} onValueChange={setCrop}>
                  <SelectTrigger className="bg-black/25 border-white/10 text-white rounded-lg h-10 text-sm focus:border-violet-500 focus:ring-violet-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0e1626] border-white/10 text-white rounded-lg">
                    <SelectItem value="Maize">Maize (Corn)</SelectItem>
                    <SelectItem value="Wheat">Wheat</SelectItem>
                    <SelectItem value="Paddy">Paddy (Rice)</SelectItem>
                    <SelectItem value="Cotton">Cotton</SelectItem>
                    <SelectItem value="Millets">Millets</SelectItem>
                    <SelectItem value="Sugarcane">Sugarcane</SelectItem>
                    <SelectItem value="Barley">Barley</SelectItem>
                    <SelectItem value="Ground Nuts">Ground Nuts</SelectItem>
                    <SelectItem value="Oil seeds">Oil Seeds</SelectItem>
                    <SelectItem value="Pulses">Pulses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="budget" className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  Budget Limit (₹ / acre)
                </Label>
                <Input 
                  id="budget" 
                  type="number" 
                  className="bg-black/25 border-white/10 text-white focus:border-violet-500 focus:ring-violet-500 text-sm h-10 rounded-lg" 
                  value={budget} 
                  onChange={(e) => setBudget(e.target.value)} 
                  placeholder="e.g. 12000"
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  State / Regional Location
                </Label>
                <Input 
                  id="location" 
                  type="text" 
                  className="bg-black/25 border-white/10 text-white focus:border-violet-500 focus:ring-violet-500 text-sm h-10 rounded-lg" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  placeholder="e.g. Punjab, West Bengal"
                  required 
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-10 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 text-white font-bold active:scale-[0.99] transition rounded-lg shadow-lg cursor-pointer flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Querying Supply Advisor...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Recommendations
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Output Panels (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {loading && (
            <div className="p-16 text-center border border-white/5 rounded-2xl bg-[#0e1626]/20 backdrop-blur-md flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-violet-400" />
              <div className="text-sm font-semibold text-slate-300">Evaluating Regional Seed Catalogs...</div>
              <div className="text-xs text-slate-500 max-w-sm">
                AgroMarket AI is searching agricultural databases for high-yielding seeds, fertilizers, and mechanical tools matching your target budget.
              </div>
            </div>
          )}

          {!loading && !recommendations && (
            <div className="p-16 text-center border border-white/5 rounded-2xl bg-[#0e1626]/20 backdrop-blur-md flex flex-col items-center justify-center gap-3">
              <ShoppingBag className="w-10 h-10 text-slate-600" />
              <div className="text-sm font-semibold text-slate-400">Configure parameters on the left to start recommendation search.</div>
            </div>
          )}

          {recommendations && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Budget Check Alert Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                recommendations.summary?.budgetStatus?.toLowerCase().includes('over')
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}>
                <div className="flex items-center gap-2">
                  {recommendations.summary?.budgetStatus?.toLowerCase().includes('over') ? (
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                  ) : (
                    <CheckCircle className="w-5 h-5 shrink-0" />
                  )}
                  <div className="text-xs text-left">
                    <span className="font-bold uppercase tracking-wider block">Budget Advisor Notice</span>
                    <span>
                      Combined Seed & Fertilizer Estimate is <strong className="text-white">{recommendations.summary?.combinedEstimate || 'N/A'}</strong> ({recommendations.summary?.budgetStatus || 'Status Unknown'}).
                    </span>
                  </div>
                </div>
                <div className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-400">
                  Target: ₹{budget}/acre
                </div>
              </div>

              {/* 1. Recommended Seeds */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-emerald-400" />
                  Recommended Seed Varieties
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.seeds?.map((seed, idx) => (
                    <div key={idx} className="p-5 rounded-xl border border-white/5 bg-[#0e1626]/20 backdrop-blur-md flex flex-col justify-between h-full hover:border-violet-500/25 transition">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">{seed.brand}</span>
                            <h4 className="font-bold text-white text-sm">{seed.name}</h4>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded">
                            {seed.expectedYieldBoost}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed">{seed.suitabilityReason}</p>
                      </div>
                      <div className="pt-4 border-t border-white/5 mt-4 flex justify-between items-center">
                        <span className="text-xs font-bold text-violet-300">{seed.priceEstimate}</span>
                        <button 
                          onClick={() => handleSimulatePurchase(seed.name, 'seed')}
                          className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white cursor-pointer active:scale-95 transition"
                        >
                          Find Dealer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Recommended Fertilizers */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Targeted Fertilizer Blends
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.fertilizers?.map((fert, idx) => (
                    <div key={idx} className="p-5 rounded-xl border border-white/5 bg-[#0e1626]/20 backdrop-blur-md flex flex-col justify-between h-full hover:border-violet-500/25 transition">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">{fert.brand}</span>
                            <h4 className="font-bold text-white text-sm">{fert.name}</h4>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-white/5 border border-white/5 text-slate-400 rounded">
                            {fert.quantityNeeded}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed">{fert.suitabilityReason}</p>
                        <div className="p-2.5 rounded-lg bg-black/10 border border-white/5 text-[10px] text-slate-300">
                          <strong className="text-slate-400">Timing:</strong> {fert.applicationSchedule}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/5 mt-4 flex justify-between items-center">
                        <span className="text-xs font-bold text-violet-300">{fert.priceEstimate}</span>
                        <button 
                          onClick={() => handleSimulatePurchase(fert.name, 'fertilizer')}
                          className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white cursor-pointer active:scale-95 transition"
                        >
                          Find Dealer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Recommended Tools */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-violet-400" />
                  Recommended Mechanical & Smart Tools
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.tools?.map((tool, idx) => (
                    <div key={idx} className="p-5 rounded-xl border border-white/5 bg-[#0e1626]/20 backdrop-blur-md flex flex-col justify-between h-full hover:border-violet-500/25 transition">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-white text-sm">{tool.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded">
                            Utility Option
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed">{tool.description}</p>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Benefit: {tool.utility}</span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/5 mt-4 flex justify-between items-center">
                        <span className="text-xs font-bold text-violet-300">{tool.priceEstimate}</span>
                        <button 
                          onClick={() => handleSimulatePurchase(tool.name, 'tool')}
                          className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white cursor-pointer active:scale-95 transition"
                        >
                          Get Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  )
}
