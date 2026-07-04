'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { 
  LayoutDashboard, Sprout, CloudRain, Droplets, Gauge, 
  FlaskConical, Thermometer, Activity, ChevronRight, CheckCircle, 
  AlertTriangle, RefreshCw, Info, Zap
} from 'lucide-react'
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  BarChart, Bar
} from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const CROP_TARGETS = {
  Maize: { optN: 45, optP: 35, optK: 35, optMoisture: 50, optPH: 6.5, baseYield: 6.5, unit: 'Tons/Ha' },
  Wheat: { optN: 40, optP: 35, optK: 30, optMoisture: 40, optPH: 6.8, baseYield: 4.8, unit: 'Tons/Ha' },
  Paddy: { optN: 50, optP: 40, optK: 40, optMoisture: 80, optPH: 6.0, baseYield: 5.6, unit: 'Tons/Ha' },
  Cotton: { optN: 35, optP: 25, optK: 30, optMoisture: 35, optPH: 7.2, baseYield: 3.2, unit: 'Tons/Ha' },
  Millets: { optN: 20, optP: 20, optK: 20, optMoisture: 25, optPH: 7.0, baseYield: 2.5, unit: 'Tons/Ha' },
}

export default function FarmHealthPage() {
  const [selectedCrop, setSelectedCrop] = useState('Maize')
  const [soilN, setSoilN] = useState(40)
  const [soilP, setSoilP] = useState(30)
  const [soilK, setSoilK] = useState(30)
  const [soilMoisture, setSoilMoisture] = useState(45)
  const [soilPH, setSoilPH] = useState(6.5)
  const [temperature, setTemperature] = useState(28)
  const [loading, setLoading] = useState(true)
  const [isIrrigating, setIsIrrigating] = useState(false)
  const [autoIrrigation, setAutoIrrigation] = useState(true)

  useEffect(() => {
    async function loadLatestPrediction() {
      try {
        const res = await fetch('/api/predictions')
        if (res.ok) {
          const data = await res.json()
          if (data.predictions && data.predictions.length > 0) {
            const latest = data.predictions[0]
            setSoilN(latest.nitrogen)
            setSoilP(latest.phosphorous)
            setSoilK(latest.potassium)
            setSoilMoisture(latest.moisture)
            setTemperature(Math.round(latest.temperature))
            
            // Try to match predicted crop
            const cropName = latest.predictedCrop
            const normalized = Object.keys(CROP_TARGETS).find(
              c => c.toLowerCase() === cropName.toLowerCase()
            )
            if (normalized) {
              setSelectedCrop(normalized)
            }
            toast.success('Loaded initial parameters from latest crop analysis')
          }
        }
      } catch (err) {
        console.error('Failed to load past predictions', err)
      } finally {
        setLoading(false)
      }
    }
    loadLatestPrediction()
  }, [])

  // Agricultural Calculation Logic
  const target = CROP_TARGETS[selectedCrop]
  const nRatio = Math.max(0, 1 - Math.abs(soilN - target.optN) / 100)
  const pRatio = Math.max(0, 1 - Math.abs(soilP - target.optP) / 100)
  const kRatio = Math.max(0, 1 - Math.abs(soilK - target.optK) / 100)
  const moistureRatio = Math.max(0, 1 - Math.abs(soilMoisture - target.optMoisture) / 100)
  const pHDeviation = Math.abs(soilPH - target.optPH)
  const pHScore = Math.max(0, 1 - pHDeviation / 5)

  // Calculations
  const soilHealthScore = Math.round((nRatio * 0.25 + pRatio * 0.25 + kRatio * 0.2 + moistureRatio * 0.2 + pHScore * 0.1) * 100)
  const yieldMultiplier = (nRatio * 0.3 + pRatio * 0.25 + kRatio * 0.2 + moistureRatio * 0.2 + pHScore * 0.05)
  const predictedYield = (target.baseYield * Math.min(1.2, Math.max(0.4, yieldMultiplier * 1.35))).toFixed(2)
  const ndviVal = (0.35 + 0.55 * (nRatio * 0.4 + moistureRatio * 0.4 + pHScore * 0.2)).toFixed(2)

  let cropHealthStatus = 'Optimal'
  let cropHealthColor = 'text-emerald-400'
  if (ndviVal >= 0.75) {
    cropHealthStatus = 'Excellent'
    cropHealthColor = 'text-emerald-400'
  } else if (ndviVal >= 0.60) {
    cropHealthStatus = 'Good'
    cropHealthColor = 'text-teal-400'
  } else if (ndviVal >= 0.45) {
    cropHealthStatus = 'Fair'
    cropHealthColor = 'text-amber-400'
  } else {
    cropHealthStatus = 'Stressed'
    cropHealthColor = 'text-rose-400'
  }

  // Handle manual irrigation toggle simulation
  const handleIrrigate = () => {
    setIsIrrigating(true)
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2500)),
      {
        loading: 'Opening solenoid irrigation valves...',
        success: () => {
          setIsIrrigating(false)
          setSoilMoisture(prev => Math.min(100, prev + 12))
          return 'Irrigation completed: Applied 12 L/m²'
        },
        error: 'Failed to trigger valves'
      }
    )
  }

  // Radar chart data comparing Target vs Current
  const radarData = [
    { subject: 'Nitrogen', Current: soilN, Target: target.optN, fullMark: 100 },
    { subject: 'Phosphorous', Current: soilP, Target: target.optP, fullMark: 100 },
    { subject: 'Potassium', Current: soilK, Target: target.optK, fullMark: 100 },
    { subject: 'Moisture', Current: soilMoisture, Target: target.optMoisture, fullMark: 100 },
    { subject: 'pH Score', Current: Math.round(pHScore * 100), Target: 100, fullMark: 100 }
  ]

  // NDVI history chart data
  const ndviHistory = [
    { week: 'Wk -4', NDVI: Math.max(0.15, (parseFloat(ndviVal) - 0.12).toFixed(2)) },
    { week: 'Wk -3', NDVI: Math.max(0.20, (parseFloat(ndviVal) - 0.08).toFixed(2)) },
    { week: 'Wk -2', NDVI: Math.max(0.25, (parseFloat(ndviVal) - 0.03).toFixed(2)) },
    { week: 'Wk -1', NDVI: Math.max(0.25, (parseFloat(ndviVal) - 0.01).toFixed(2)) },
    { week: 'Current', NDVI: parseFloat(ndviVal) },
    { week: 'Proj +1', NDVI: Math.min(0.99, (parseFloat(ndviVal) + (ndviVal > 0.6 ? 0.02 : -0.05)).toFixed(2)) },
    { week: 'Proj +2', NDVI: Math.min(0.99, (parseFloat(ndviVal) + (ndviVal > 0.6 ? 0.04 : -0.1)).toFixed(2)) }
  ]

  // Rainfall and irrigation data
  const waterHistory = [
    { day: 'Mon', Rainfall: 4, Irrigation: autoIrrigation ? 6 : 0 },
    { day: 'Tue', Rainfall: 10, Irrigation: 0 },
    { day: 'Wed', Rainfall: 0, Irrigation: autoIrrigation ? 12 : 8 },
    { day: 'Thu', Rainfall: 0, Irrigation: autoIrrigation ? 10 : 0 },
    { day: 'Fri', Rainfall: 16, Irrigation: 2 },
    { day: 'Sat', Rainfall: 2, Irrigation: autoIrrigation ? 8 : 12 },
    { day: 'Sun', Rainfall: 0, Irrigation: autoIrrigation ? 10 : 0 }
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-300 w-full">
      {/* Top Banner Header */}
      <div className="p-6 rounded-2xl border border-white/5 bg-[#0e1626]/40 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="absolute top-[-20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[80px] pointer-events-none" />
        <div className="relative z-10 space-y-1.5 text-left">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard className="w-5.5 h-5.5 text-emerald-400" />
            Farm Health Console
          </h2>
          <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
            Consolidated intelligence metrics matching soil chemistry to crop targets. Use the crop dropdown and sliders below to simulate adjustments and see immediate yield and nutrient forecasts.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <label className="text-xs text-slate-400 font-semibold">Target Crop:</label>
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger className="w-40 bg-black/35 border-white/10 text-white rounded-lg h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0e1626] border-white/10 text-white rounded-lg">
              {Object.keys(CROP_TARGETS).map(crop => (
                <SelectItem key={crop} value={crop} className="text-xs">{crop}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Top Level Quick Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Soil Score */}
        <Card className="border-white/5 bg-[#0e1626]/30 backdrop-blur-md shadow-lg p-5 flex items-center justify-between">
          <div className="space-y-1 text-left">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Soil Health Score</span>
            <div className="text-2xl font-black text-white">{soilHealthScore}%</div>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-0.5">
              <CheckCircle className="w-3 h-3" /> {soilHealthScore > 75 ? 'Optimal Index' : soilHealthScore > 50 ? 'Moderate Index' : 'Deficiency Alert'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity className="w-6 h-6" />
          </div>
        </Card>

        {/* Metric 2: NDVI Index */}
        <Card className="border-white/5 bg-[#0e1626]/30 backdrop-blur-md shadow-lg p-5 flex items-center justify-between">
          <div className="space-y-1 text-left">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Crop Health (NDVI)</span>
            <div className="text-2xl font-black text-white">{ndviVal}</div>
            <span className={`text-[10px] font-bold ${cropHealthColor}`}>
              {cropHealthStatus} Status
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Sprout className="w-6 h-6" />
          </div>
        </Card>

        {/* Metric 3: Yield Projection */}
        <Card className="border-white/5 bg-[#0e1626]/30 backdrop-blur-md shadow-lg p-5 flex items-center justify-between">
          <div className="space-y-1 text-left">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Yield Projection</span>
            <div className="text-2xl font-black text-white">{predictedYield} <span className="text-xs font-semibold text-slate-400">{target.unit}</span></div>
            <span className="text-[10px] text-slate-500">Based on soil balance curve</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Gauge className="w-6 h-6" />
          </div>
        </Card>

        {/* Metric 4: Irrigation/Rainfall */}
        <Card className="border-white/5 bg-[#0e1626]/30 backdrop-blur-md shadow-lg p-5 flex items-center justify-between">
          <div className="space-y-1 text-left">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Weekly Rainfall</span>
            <div className="text-2xl font-black text-white">34 <span className="text-xs font-semibold text-slate-400">mm</span></div>
            <span className="text-[10px] text-sky-400 flex items-center gap-0.5">
              <CloudRain className="w-3 h-3" /> 16mm Forecasted (48h)
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <CloudRain className="w-6 h-6" />
          </div>
        </Card>

      </div>

      {/* Main Grid: Inputs Sliders vs Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sliders Input Panel (5 cols) */}
        <Card className="border-white/5 bg-[#0e1626]/40 backdrop-blur-xl shadow-xl lg:col-span-5 p-6 space-y-6">
          <div className="border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Soil Chemistry Sliders
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Drag parameters to simulate addition of nutrients or moisture changes.</p>
          </div>

          <div className="space-y-5">
            {/* Slider N */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5"><FlaskConical className="w-3.5 h-3.5 text-emerald-400" />Nitrogen (N)</span>
                <span className="font-mono text-emerald-400 bg-white/5 px-2 py-0.5 rounded text-[10px]">{soilN} mg/kg</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={soilN} 
                onChange={(e) => setSoilN(parseInt(e.target.value))} 
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>Min: 0</span>
                <span>Optimum: {target.optN}</span>
                <span>Max: 100</span>
              </div>
            </div>

            {/* Slider P */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5"><FlaskConical className="w-3.5 h-3.5 text-teal-400" />Phosphorous (P)</span>
                <span className="font-mono text-teal-400 bg-white/5 px-2 py-0.5 rounded text-[10px]">{soilP} mg/kg</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={soilP} 
                onChange={(e) => setSoilP(parseInt(e.target.value))} 
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500" 
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>Min: 0</span>
                <span>Optimum: {target.optP}</span>
                <span>Max: 100</span>
              </div>
            </div>

            {/* Slider K */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5"><FlaskConical className="w-3.5 h-3.5 text-indigo-400" />Potassium (K)</span>
                <span className="font-mono text-indigo-400 bg-white/5 px-2 py-0.5 rounded text-[10px]">{soilK} mg/kg</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={soilK} 
                onChange={(e) => setSoilK(parseInt(e.target.value))} 
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>Min: 0</span>
                <span>Optimum: {target.optK}</span>
                <span>Max: 100</span>
              </div>
            </div>

            {/* Slider Moisture */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5 text-blue-400" />Soil Moisture</span>
                <span className="font-mono text-blue-400 bg-white/5 px-2 py-0.5 rounded text-[10px]">{soilMoisture}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={soilMoisture} 
                onChange={(e) => setSoilMoisture(parseInt(e.target.value))} 
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" 
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>Min: 0</span>
                <span>Optimum: {target.optMoisture}%</span>
                <span>Max: 100</span>
              </div>
            </div>

            {/* Slider pH */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5"><Thermometer className="w-3.5 h-3.5 text-amber-500" />Soil pH Index</span>
                <span className="font-mono text-amber-400 bg-white/5 px-2 py-0.5 rounded text-[10px]">{soilPH.toFixed(1)}</span>
              </div>
              <input 
                type="range" 
                min="4" 
                max="9" 
                step="0.1"
                value={soilPH} 
                onChange={(e) => setSoilPH(parseFloat(e.target.value))} 
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500" 
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>Acidic: 4.0</span>
                <span>Optimum: {target.optPH}</span>
                <span>Alkaline: 9.0</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Soil Radar Chart & Explanatory Summary (7 cols) */}
        <Card className="border-white/5 bg-[#0e1626]/40 backdrop-blur-xl shadow-xl lg:col-span-7 flex flex-col justify-between">
          <CardHeader className="pb-2 border-b border-white/5 text-left">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-400" />
              Nutrient Suitability Radar
            </CardTitle>
            <CardDescription className="text-slate-500 text-[10px]">
              Visualizes current parameters against targets required for maximum {selectedCrop} yields.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Chart Area */}
            <div className="md:col-span-7 h-[250px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" radius="70%" data={radarData}>
                  <PolarGrid stroke="#ffffff0a" />
                  <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={9} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" fontSize={8} />
                  <Radar name="Current" dataKey="Current" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                  <Radar name="Target" dataKey="Target" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.05} strokeDasharray="3 3" />
                  <Tooltip contentStyle={{ backgroundColor: '#0e1626', borderColor: '#ffffff10', borderRadius: '8px', fontSize: '10px' }} />
                  <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '10px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Explanation Area */}
            <div className="md:col-span-5 space-y-4 text-left border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-4">
              <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Soil Evaluation</h4>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  Your current parameters result in a soil balance of <strong className="text-emerald-400">{soilHealthScore}%</strong> relative to {selectedCrop}'s requirements.
                </p>
              </div>
              <div className="space-y-2 font-sans">
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-[10px] space-y-1">
                  <div className="font-semibold text-slate-200">Recommended Action:</div>
                  <div className="text-slate-400">
                    {soilHealthScore > 85 ? (
                      'Nutrients balanced perfectly. Maintain current conditions.'
                    ) : (
                      'Adjust sliders to observe NPK recommendations below.'
                    )}
                  </div>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Charts & Prescriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Fertilizer & Irrigation recommendations (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6 text-left">
          {/* Fertilizer Card */}
          <Card className="border-white/5 bg-[#0e1626]/40 backdrop-blur-xl shadow-xl p-5 space-y-4 flex-grow">
            <h3 className="text-xs uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Fertilizer prescription
            </h3>
            
            <div className="space-y-3">
              {/* N Recommendations */}
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-[11px]">
                <div className="font-bold text-slate-300 mb-0.5">Urea (Nitrogen Source)</div>
                <div className="text-slate-400">
                  {soilN < target.optN - 5 ? (
                    <span>Deficient. Apply <strong className="text-amber-400">{Math.round((target.optN - soilN) * 2.2)} kg/acre</strong> of Urea.</span>
                  ) : soilN > target.optN + 15 ? (
                    <span className="text-rose-400">Excess. Suspend nitrogen fertilizers to prevent root burn.</span>
                  ) : (
                    <span className="text-emerald-400">Optimal N-Index. No addition required.</span>
                  )}
                </div>
              </div>

              {/* P Recommendations */}
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-[11px]">
                <div className="font-bold text-slate-300 mb-0.5">DAP (Phosphorous Source)</div>
                <div className="text-slate-400">
                  {soilP < target.optP - 5 ? (
                    <span>Deficient. Apply <strong className="text-amber-400">{Math.round((target.optP - soilP) * 1.8)} kg/acre</strong> of DAP.</span>
                  ) : (
                    <span className="text-emerald-400">Optimal P-Index. No addition required.</span>
                  )}
                </div>
              </div>

              {/* K Recommendations */}
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-[11px]">
                <div className="font-bold text-slate-300 mb-0.5">MOP (Potassium Source)</div>
                <div className="text-slate-400">
                  {soilK < target.optK - 5 ? (
                    <span>Deficient. Apply <strong className="text-amber-400">{Math.round((target.optK - soilK) * 1.5)} kg/acre</strong> of MOP.</span>
                  ) : (
                    <span className="text-emerald-400">Optimal K-Index. No addition required.</span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Irrigation Card */}
          <Card className="border-white/5 bg-[#0e1626]/40 backdrop-blur-xl shadow-xl p-5 space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              Irrigation Scheduler
            </h3>
            
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-[11px] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold">Auto-Irrigation:</span>
                <button 
                  onClick={() => setAutoIrrigation(!autoIrrigation)}
                  className={`text-[9px] font-bold px-2 py-0.5 rounded cursor-pointer transition ${autoIrrigation ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400'}`}
                >
                  {autoIrrigation ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
              <div className="text-slate-400 leading-relaxed">
                {soilMoisture < target.optMoisture - 10 ? (
                  <span>Moisture deficient. <strong className="text-sky-400">Required: 15 L/m²</strong> of water.</span>
                ) : soilMoisture > target.optMoisture + 15 ? (
                  <span className="text-amber-400">High soil moisture. Suspend scheduled watering cycles.</span>
                ) : (
                  <span className="text-emerald-400">Soil moisture optimal. Normal scheduling active.</span>
                )}
              </div>
            </div>

            <button 
              onClick={handleIrrigate}
              disabled={isIrrigating}
              className="w-full h-9 text-xs rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 active:scale-[0.98] transition font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isIrrigating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CloudRain className="w-3.5 h-3.5 text-sky-400" />
              )}
              Run Manual Irrigation Cycle
            </button>
          </Card>
        </div>

        {/* Charts: NDVI Trend & Rainfall vs Irrigation (8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* NDVI Trend Chart */}
          <Card className="border-white/5 bg-[#0e1626]/40 backdrop-blur-xl shadow-xl flex flex-col justify-between">
            <CardHeader className="pb-2 border-b border-white/5 text-left">
              <CardTitle className="text-xs font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                NDVI Vegetation Projection
              </CardTitle>
              <CardDescription className="text-slate-500 text-[10px]">
                Historical index (past 4 weeks) and AI-modeled 2-week projection based on current parameters.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 h-[220px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ndviHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" />
                  <XAxis dataKey="week" stroke="#64748b" fontSize={9} />
                  <YAxis stroke="#64748b" fontSize={9} domain={[0.0, 1.0]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0e1626', borderColor: '#ffffff10', borderRadius: '8px', fontSize: '10px' }} />
                  <Line type="monotone" dataKey="NDVI" stroke="#10b981" strokeWidth={2} activeDot={{ r: 4 }} name="NDVI Value" dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Rainfall vs Irrigation Chart */}
          <Card className="border-white/5 bg-[#0e1626]/40 backdrop-blur-xl shadow-xl flex flex-col justify-between">
            <CardHeader className="pb-2 border-b border-white/5 text-left">
              <CardTitle className="text-xs font-bold text-white flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-sky-400" />
                Rainfall vs Irrigation (Past 7d)
              </CardTitle>
              <CardDescription className="text-slate-500 text-[10px]">
                Displays daily precipitation ( Rainfall ) against mechanical irrigation events (mm).
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 h-[220px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waterHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={9} />
                  <YAxis stroke="#64748b" fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: '#0e1626', borderColor: '#ffffff10', borderRadius: '8px', fontSize: '10px' }} />
                  <Bar dataKey="Rainfall" fill="#38bdf8" fillOpacity={0.65} name="Rainfall (mm)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Irrigation" fill="#10b981" fillOpacity={0.65} name="Irrigation (mm)" radius={[2, 2, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '10px' }} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  )
}
