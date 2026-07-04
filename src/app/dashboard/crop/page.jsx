'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { 
  Sprout, Thermometer, Wind, Droplets, Layers, FlaskConical, 
  AlertCircle, History, LineChart, Cpu, Calendar, RefreshCw, Leaf
} from 'lucide-react'
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Crop Details Mapping
const CROP_DETAILS = {
  Maize: {
    description: "Maize (Corn) is a versatile cereal grain. It requires well-drained loamy soils and warm weather.",
    care: "Keep soil moist but not waterlogged. Apply nitrogen-rich fertilizer during growth stages.",
    fertilizer: "Urea / 28-28",
    color: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30 text-yellow-400"
  },
  Sugarcane: {
    description: "Sugarcane is a tall, perennial grass used for sugar extraction. It needs deep, moisture-retaining soils.",
    care: "Requires abundant watering and rich nitrogen-phosphorus soil inputs.",
    fertilizer: "DAP / Urea",
    color: "from-emerald-600/20 to-green-500/20 border-emerald-500/30 text-emerald-400"
  },
  Cotton: {
    description: "Cotton is a soft, fluffy staple fiber. It grows best in black soil under hot, dry conditions.",
    care: "Needs deep soil watering followed by dry spells. Control pests carefully during flowering.",
    fertilizer: "14-35-14 / DAP",
    color: "from-blue-400/20 to-sky-400/20 border-sky-400/30 text-sky-300"
  },
  Tobacco: {
    description: "Tobacco is an agricultural leaf crop. It requires warm climates and rich, sandy-loam soils.",
    care: "Prune lower leaves periodically and manage moisture levels to prevent leaf rot.",
    fertilizer: "Urea / 28-28",
    color: "from-orange-500/20 to-amber-600/20 border-orange-500/30 text-orange-400"
  },
  Paddy: {
    description: "Paddy (Rice) is the staple crop of wet tropical climates. It requires clayey soils that hold standing water.",
    care: "Keep fields flooded during early stages. Apply balanced NPK nutrients.",
    fertilizer: "Urea / 28-28",
    color: "from-teal-500/20 to-emerald-500/20 border-teal-500/30 text-teal-400"
  },
  Barley: {
    description: "Barley is a major cereal grain. It is highly tolerant of soil salinity and grows well in cooler climates.",
    care: "Avoid excess nitrogen to prevent lodging. Water moderately.",
    fertilizer: "17-17-17 / DAP",
    color: "from-lime-500/20 to-emerald-600/20 border-lime-500/30 text-lime-400"
  },
  Wheat: {
    description: "Wheat is a globally cultivated grass. It prefers clayey-loam soils and temperate, dry conditions for ripening.",
    care: "Irrigate during crown root initiation. Ensure good soil nitrogen levels.",
    fertilizer: "Urea / DAP",
    color: "from-amber-400/20 to-yellow-600/20 border-amber-400/30 text-amber-300"
  },
  Millets: {
    description: "Millets are small-seeded grasses. They are highly drought-resistant and grow well in poor, sandy soils.",
    care: "Minimal watering required. Excellent for crop rotation in dry areas.",
    fertilizer: "28-28 / 20-20",
    color: "from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-400"
  },
  'Oil seeds': {
    description: "Oilseeds (like mustard, sunflower) are grown for vegetable oil. They require moderate rainfall and loamy soil.",
    care: "Ensure sulfur availability in soil. Avoid waterlogging.",
    fertilizer: "14-35-14 / DAP",
    color: "from-red-400/20 to-pink-500/20 border-pink-400/30 text-pink-400"
  },
  Pulses: {
    description: "Pulses (beans, lentils) are nitrogen-fixing legume crops. They enrich soil fertility naturally.",
    care: "Requires minimal nitrogen fertilizers. Ensure phosphorus is present.",
    fertilizer: "DAP / 17-17-17",
    color: "from-rose-500/20 to-red-500/20 border-rose-500/30 text-rose-400"
  },
  'Ground Nuts': {
    description: "Groundnuts (Peanuts) grow subterraneanly. They thrive in loose, sandy-loam soils that permit pod development.",
    care: "Keep soil loose around the base. Ensure calcium levels are adequate during pegging.",
    fertilizer: "DAP / 20-20",
    color: "from-orange-400/20 to-yellow-500/20 border-yellow-600/30 text-amber-400"
  }
}

export default function CropPage() {
  const [predictions, setPredictions] = useState([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)
  const [temperature, setTemperature] = useState('28')
  const [humidity, setHumidity] = useState('55')
  const [moisture, setMoisture] = useState('45')
  const [soilType, setSoilType] = useState('Sandy')
  const [nitrogen, setNitrogen] = useState('25')
  const [potassium, setPotassium] = useState('10')
  const [phosphorous, setPhosphorous] = useState('15')
  const [isPredicting, setIsPredicting] = useState(false)
  const [currentPrediction, setCurrentPrediction] = useState(null)

  useEffect(() => {
    fetchPredictionHistory()
  }, [])

  const fetchPredictionHistory = async () => {
    setIsHistoryLoading(true)
    try {
      const res = await fetch('/api/predictions')
      if (res.ok) {
        const data = await res.json()
        setPredictions(data.predictions)
      }
    } catch (err) {
      console.error('Failed to fetch predictions', err)
    } finally {
      setIsHistoryLoading(false)
    }
  }

  const handlePredict = async (e) => {
    e.preventDefault()
    if (!temperature || !humidity || !moisture || !soilType || !nitrogen || !potassium || !phosphorous) {
      toast.error('Please fill in all inputs')
      return
    }

    setIsPredicting(true)
    setCurrentPrediction(null)

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          temperature: parseFloat(temperature),
          humidity: parseFloat(humidity),
          moisture: parseFloat(moisture),
          soilType,
          nitrogen: parseFloat(nitrogen),
          potassium: parseFloat(potassium),
          phosphorous: parseFloat(phosphorous)
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Prediction failed')
      }

      setCurrentPrediction(data.prediction)
      toast.success(`Predicted Crop: ${data.prediction.predictedCrop.toUpperCase()}`)
      fetchPredictionHistory()
    } catch (err) {
      toast.error(err.message || 'Failed to generate prediction')
    } finally {
      setIsPredicting(false)
    }
  }

  const loadSample = (index) => {
    const samples = [
      { t: '26', h: '52', m: '38', s: 'Sandy', n: '37', k: '0', p: '0' },
      { t: '28', h: '54', m: '46', s: 'Clayey', n: '35', k: '0', p: '0' },
      { t: '34', h: '65', m: '62', s: 'Black', n: '7', k: '9', p: '30' },
      { t: '30', h: '60', m: '27', s: 'Loamy', n: '12', k: '0', p: '40' },
      { t: '26', h: '52', m: '31', s: 'Red', n: '14', k: '0', p: '41' }
    ]
    const sample = samples[index]
    setTemperature(sample.t)
    setHumidity(sample.h)
    setMoisture(sample.m)
    setSoilType(sample.s)
    setNitrogen(sample.n)
    setPotassium(sample.k)
    setPhosphorous(sample.p)
    toast.success(`Loaded Sample #${index + 1}`)
  }

  const chartData = predictions
    .slice(0, 10)
    .reverse()
    .map((pred, i) => ({
      name: `P-${i + 1}`,
      N: pred.nitrogen,
      P: pred.phosphorous,
      K: pred.potassium,
    }))

  const activeDetails = currentPrediction ? CROP_DETAILS[currentPrediction.predictedCrop] || {
    description: "No details available.",
    care: "Standard agricultural maintenance.",
    fertilizer: "General NPK fertilizer",
    color: "from-slate-500/20 to-slate-600/20 border-slate-500/30 text-slate-300"
  } : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300 w-full">
      {/* Form & Active Prediction (7 cols) */}
      <div className="lg:col-span-7 space-y-8">
        <Card className="border-white/5 bg-[#0e1626]/40 backdrop-blur-xl shadow-xl">
          <CardHeader className="flex flex-row justify-between items-start pb-4 border-b border-white/5">
            <div>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-400" />
                Crop Suitability Calculator
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs mt-1">
                Predict the ideal crop based on Nitrogen, Phosphorous, Potassium, Moisture, and Temperature.
              </CardDescription>
            </div>
            <div className="flex gap-1.5 font-sans">
              <Button onClick={() => loadSample(0)} variant="outline" className="h-7 text-[10px] px-2.5 border-white/5 hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer">Maize Sample</Button>
              <Button onClick={() => loadSample(2)} variant="outline" className="h-7 text-[10px] px-2.5 border-white/5 hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer">Cotton Sample</Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handlePredict} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="temperature" className="text-slate-300 text-xs font-semibold flex items-center gap-1"><Thermometer className="w-3.5 h-3.5 text-amber-500" />Temperature (°C)</Label>
                  <Input id="temperature" type="number" step="any" className="bg-black/25 border-white/10 text-white focus:border-emerald-500 focus:ring-emerald-500 text-sm h-10 rounded-lg" value={temperature} onChange={(e) => setTemperature(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="humidity" className="text-slate-300 text-xs font-semibold flex items-center gap-1"><Wind className="w-3.5 h-3.5 text-sky-400" />Humidity (%)</Label>
                  <Input id="humidity" type="number" step="any" className="bg-black/25 border-white/10 text-white focus:border-emerald-500 focus:ring-emerald-500 text-sm h-10 rounded-lg" value={humidity} onChange={(e) => setHumidity(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="moisture" className="text-slate-300 text-xs font-semibold flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-blue-400" />Soil Moisture (%)</Label>
                  <Input id="moisture" type="number" step="any" className="bg-black/25 border-white/10 text-white focus:border-emerald-500 focus:ring-emerald-500 text-sm h-10 rounded-lg" value={moisture} onChange={(e) => setMoisture(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="soilType" className="text-slate-300 text-xs font-semibold flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-yellow-600" />Soil Type</Label>
                  <Select value={soilType} onValueChange={setSoilType}>
                    <SelectTrigger className="bg-black/25 border-white/10 text-white focus:border-emerald-500 focus:ring-emerald-500 text-sm h-10 rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#0e1626] border-white/10 text-white rounded-lg">
                      <SelectItem value="Sandy">Sandy</SelectItem>
                      <SelectItem value="Loamy">Loamy</SelectItem>
                      <SelectItem value="Black">Black</SelectItem>
                      <SelectItem value="Red">Red</SelectItem>
                      <SelectItem value="Clayey">Clayey</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nitrogen" className="text-slate-300 text-xs font-semibold flex items-center gap-1"><FlaskConical className="w-3.5 h-3.5 text-emerald-400" />Nitrogen (N)</Label>
                  <Input id="nitrogen" type="number" className="bg-black/25 border-white/10 text-white focus:border-emerald-500 focus:ring-emerald-500 text-sm h-10 rounded-lg" value={nitrogen} onChange={(e) => setNitrogen(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phosphorous" className="text-slate-300 text-xs font-semibold flex items-center gap-1"><FlaskConical className="w-3.5 h-3.5 text-teal-400" />Phosphorous (P)</Label>
                  <Input id="phosphorous" type="number" className="bg-black/25 border-white/10 text-white focus:border-emerald-500 focus:ring-emerald-500 text-sm h-10 rounded-lg" value={phosphorous} onChange={(e) => setPhosphorous(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="potassium" className="text-slate-300 text-xs font-semibold flex items-center gap-1"><FlaskConical className="w-3.5 h-3.5 text-indigo-400" />Potassium (K)</Label>
                  <Input id="potassium" type="number" className="bg-black/25 border-white/10 text-white focus:border-emerald-500 focus:ring-emerald-500 text-sm h-10 rounded-lg" value={potassium} onChange={(e) => setPotassium(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" disabled={isPredicting} className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-900 font-bold active:scale-[0.99] transition rounded-lg shadow-lg cursor-pointer flex justify-center items-center gap-2">
                {isPredicting ? (<><RefreshCw className="w-4 h-4 animate-spin" />Evaluating Model Splits...</>) : (<><Cpu className="w-4 h-4" />Predict Suitability</>)}
              </Button>
            </form>
          </CardContent>
        </Card>

        {currentPrediction && (
          <div className={`p-6 rounded-2xl border bg-gradient-to-r ${activeDetails.color} backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-300`}>
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center border-b border-white/10 pb-4 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Calculation Completed</span>
                <h2 className="text-3xl font-black tracking-tight text-white mt-1">{currentPrediction.predictedCrop.toUpperCase()}</h2>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-400" /><span className="text-xs font-semibold text-white">Tree Path Match</span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Crop Overview</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{activeDetails.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cultivation Guide</h5>
                  <p className="text-slate-200 text-xs leading-relaxed">{activeDetails.care}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fertilizer Formulation</h5>
                  <p className="text-slate-200 text-xs leading-relaxed font-semibold">{activeDetails.fertilizer}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* History & Charts (5 cols) */}
      <div className="lg:col-span-5 space-y-8">
        <Card className="border-white/5 bg-[#0e1626]/40 backdrop-blur-xl shadow-xl">
          <CardHeader className="pb-2 border-b border-white/5">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2"><LineChart className="w-4 h-4 text-emerald-400" />Nutrient Index History</CardTitle>
            <CardDescription className="text-slate-500 text-[10px]">Visual tracking of soil Nitrogen, Phosphorous, Potassium levels.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 h-[200px] flex items-center justify-center">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorN" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#34d399" stopOpacity={0.15}/><stop offset="95%" stopColor="#34d399" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.15}/><stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorK" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#818cf8" stopOpacity={0.15}/><stop offset="95%" stopColor="#818cf8" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                  <YAxis stroke="#64748b" fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: '#0e1626', borderColor: '#ffffff10', borderRadius: '8px', fontSize: '10px' }} />
                  <Area type="monotone" dataKey="N" stroke="#34d399" fillOpacity={1} fill="url(#colorN)" strokeWidth={1.5} name="Nitrogen" />
                  <Area type="monotone" dataKey="P" stroke="#2dd4bf" fillOpacity={1} fill="url(#colorP)" strokeWidth={1.5} name="Phosphorous" />
                  <Area type="monotone" dataKey="K" stroke="#818cf8" fillOpacity={1} fill="url(#colorK)" strokeWidth={1.5} name="Potassium" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-500 text-xs">
                <AlertCircle className="w-5 h-5 text-slate-600" /><span>Execute calculations to generate metrics history.</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-[#0e1626]/40 backdrop-blur-xl shadow-xl flex flex-col max-h-[420px]">
          <CardHeader className="pb-3 border-b border-white/5"><CardTitle className="text-sm font-bold text-white flex items-center gap-2"><History className="w-4 h-4 text-emerald-400" />Calculation History Log</CardTitle></CardHeader>
          <CardContent className="p-0 overflow-y-auto flex-grow divide-y divide-white/5 scrollbar-thin">
            {isHistoryLoading ? (
              <div className="py-12 flex justify-center items-center text-xs text-slate-500 gap-2"><RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />Syncing logs...</div>
            ) : predictions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">No prediction logs found.</div>
            ) : (
              predictions.map((pred) => {
                const cropColor = CROP_DETAILS[pred.predictedCrop]?.color || '';
                const cropTextColor = cropColor.split(' ').pop();
                return (
                  <div key={pred.id} onClick={() => setCurrentPrediction(pred)} className="p-4 hover:bg-white/[0.02] active:bg-white/[0.04] transition cursor-pointer text-left">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-sm font-bold tracking-tight ${cropTextColor || 'text-white'}`}>{pred.predictedCrop.toUpperCase()}</span>
                      <span className="text-[9px] text-slate-500 flex items-center gap-1 font-mono"><Calendar className="w-2.5 h-2.5" />{new Date(pred.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-400 font-mono">
                      <div>N: <span className="text-white">{pred.nitrogen}</span></div><div>P: <span className="text-white">{pred.phosphorous}</span></div><div>K: <span className="text-white">{pred.potassium}</span></div><div>Soil: <span className="text-white">{pred.soilType}</span></div>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
