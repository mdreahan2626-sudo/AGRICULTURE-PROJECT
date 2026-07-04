'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { 
  Search, RefreshCw, MapPin, Thermometer, Droplets, CloudRain, Wind, Cpu, ClipboardCheck
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function WeatherPage() {
  const [weatherLocation, setWeatherLocation] = useState('Mumbai')
  const [isWeatherLoading, setIsWeatherLoading] = useState(false)
  const [weatherResult, setWeatherResult] = useState(null)

  useEffect(() => {
    handleWeatherQuery()
  }, [])

  const handleWeatherQuery = async (e) => {
    if (e) e.preventDefault()
    if (!weatherLocation.trim()) {
      toast.error('Please enter a location')
      return
    }

    setIsWeatherLoading(true)
    try {
      const res = await fetch('/api/weather-advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location: weatherLocation }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Weather lookup failed')
      }

      setWeatherResult(data)
    } catch (err) {
      toast.error(err.message || 'Failed to resolve location weather')
    } finally {
      setIsWeatherLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 w-full">
      {/* Search Input Widget */}
      <Card className="border-white/5 bg-[#0e1626]/40 backdrop-blur-xl shadow-xl">
        <CardContent className="pt-6">
          <form onSubmit={handleWeatherQuery} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                type="text"
                placeholder="Enter city or district name (e.g. Mumbai, Punjab, Nairobi)..."
                className="pl-10 bg-black/25 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-emerald-500 h-11 text-sm rounded-lg"
                value={weatherLocation}
                onChange={(e) => setWeatherLocation(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              disabled={isWeatherLoading}
              className="h-11 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold active:scale-[0.98] transition rounded-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {isWeatherLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Query Location
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Weather & AI Recommendations */}
      {weatherResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Weather details widget (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Current conditions */}
            <Card className="border-white/5 bg-[#0e1626]/50 backdrop-blur-xl shadow-xl">
              <CardHeader className="pb-2 border-b border-white/5">
                <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Resolved Coordinate Location
                </span>
                <CardTitle className="text-xl font-bold text-white mt-1">
                  {weatherResult.location.name}, {weatherResult.location.country}
                </CardTitle>
                {weatherResult.location.state && (
                  <CardDescription className="text-slate-400 text-xs">
                    State/Province: {weatherResult.location.state}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-2 gap-6">
                
                {/* Metric 1 */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Thermometer className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Temperature</span>
                    <span className="text-xl font-black text-white">{weatherResult.currentWeather.temp}°C</span>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                    <Droplets className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Humidity</span>
                    <span className="text-xl font-black text-white">{weatherResult.currentWeather.humidity}%</span>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3 col-span-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <CloudRain className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Current Rain Rate</span>
                    <span className="text-sm font-bold text-white">
                      {weatherResult.currentWeather.precipitation > 0 
                        ? `${weatherResult.currentWeather.precipitation} mm/h` 
                        : 'No active precipitation'
                      }
                    </span>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* 3-Day Forecast Grid */}
            <Card className="border-white/5 bg-[#0e1626]/50 backdrop-blur-xl shadow-xl">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">
                  3-Day Farm Forecast
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 p-0 divide-y divide-white/5">
                {weatherResult.dailyForecast.dates.map((date, i) => (
                  <div key={date} className="px-5 py-3.5 flex justify-between items-center text-xs">
                    <div>
                      <span className="block font-semibold text-white">
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Temp Range: {weatherResult.dailyForecast.tempsMin[i]}° - {weatherResult.dailyForecast.tempsMax[i]}°C
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-blue-400 flex items-center justify-end gap-1 font-sans">
                        <CloudRain className="w-3.5 h-3.5" />
                        {weatherResult.dailyForecast.rainSum[i]} mm
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Chance: {weatherResult.dailyForecast.rainChance[i]}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>

          {/* AI Advice Advisor Box (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-[-10%] right-[-10%] w-[150px] h-[150px] rounded-full bg-emerald-500/5 blur-[50px] pointer-events-none" />
              
              <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-900 shadow-md">
                  <Cpu className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-none">Smart Farming Advisor</h4>
                  <span className="text-[9px] text-emerald-400 font-semibold tracking-wide uppercase leading-none mt-1 block">Powered by Gemini AI</span>
                </div>
              </div>

              <div className="space-y-4">
                {weatherResult.advisorSuggestions && weatherResult.advisorSuggestions.length > 0 ? (
                  weatherResult.advisorSuggestions.map((suggestion, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex gap-3.5 items-start hover:bg-white/[0.04] transition duration-200"
                    >
                      <div className="w-6.5 h-6.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-extrabold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-slate-200 text-sm leading-relaxed font-semibold">
                        {suggestion}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-xs">No specific advisory tips received.</p>
                )}
              </div>

              <div className="mt-8 flex gap-3 text-[10px] text-slate-500 border-t border-white/5 pt-4">
                <span className="flex items-center gap-1">
                  <ClipboardCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Real-time weather telemetry analysis active
                </span>
              </div>

            </div>

          </div>

        </div>
      ) : (
        <div className="py-24 text-center text-slate-500 text-sm">
          No location weather loaded. Query a location to retrieve agricultural AI suggestions.
        </div>
      )}
    </div>
  )
}
