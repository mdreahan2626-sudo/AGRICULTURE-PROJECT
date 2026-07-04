'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { 
  ShieldAlert, UploadCloud, Cpu, RefreshCw, CheckCircle2, Pill
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DiseasePage() {
  const fileInputRef = useRef(null)
  const [diseaseImage, setDiseaseImage] = useState(null)
  const [diseasePreviewUrl, setDiseasePreviewUrl] = useState(null)
  const [isDiseaseLoading, setIsDiseaseLoading] = useState(false)
  const [diseaseProgressText, setDiseaseProgressText] = useState('')
  const [diseaseResult, setDiseaseResult] = useState(null)

  const handleImageUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setDiseasePreviewUrl(reader.result)
      setDiseaseImage(reader.result)
      setDiseaseResult(null)
    }
    reader.readAsDataURL(file)
  }

  const handleAnalyzeDisease = async () => {
    if (!diseaseImage) {
      toast.error('Please upload a leaf image first')
      return
    }

    setIsDiseaseLoading(true)
    setDiseaseResult(null)
    
    const phrases = [
      'Initializing computer vision scan...',
      'Isolating leaf shape & cell structures...',
      'Extracting color-histogram chlorophyll features...',
      'Comparing with CNN plant pathology vectors...',
      'Querying Gemini generative pathology node...',
      'Formatting organic & chemical prescription...'
    ]
    
    let phraseIdx = 0
    setDiseaseProgressText(phrases[0])
    const interval = setInterval(() => {
      phraseIdx = (phraseIdx + 1) % phrases.length
      setDiseaseProgressText(phrases[phraseIdx])
    }, 2000)

    try {
      const res = await fetch('/api/detect-disease', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: diseaseImage }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Diagnosis failed')
      }

      setDiseaseResult(data.diagnosis)
      toast.success('Diagnosis completed successfully!')
    } catch (err) {
      toast.error(err.message || 'Failed to run diagnosis')
    } finally {
      clearInterval(interval)
      setIsDiseaseLoading(false)
    }
  }

  const getSeverityStyle = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'healthy':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
      case 'mild':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
      case 'moderate':
        return 'bg-orange-500/10 border-orange-500/20 text-orange-400'
      case 'severe':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-400'
      default:
        return 'bg-slate-500/10 border-slate-500/20 text-slate-400'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300 w-full">
      
      {/* Image Uploader (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="border-white/5 bg-[#0e1626]/40 backdrop-blur-xl shadow-xl">
          <CardHeader className="pb-4 border-b border-white/5">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              Leaf Disease Pathology Scanner
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Upload a leaf image to scan and detect potential agricultural diseases.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            
            {diseasePreviewUrl ? (
              <div className="relative group w-full aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/20 flex items-center justify-center shadow-lg">
                <img src={diseasePreviewUrl} alt="Leaf preview" className="w-full h-full object-cover group-hover:scale-102 transition duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                  <Button onClick={handleImageUploadClick} variant="secondary" className="h-9 px-4 text-xs font-bold rounded-lg border border-white/10 cursor-pointer">Change Photo</Button>
                </div>
              </div>
            ) : (
              <div onClick={handleImageUploadClick} className="border-2 border-dashed border-white/10 hover:border-emerald-500/30 rounded-xl bg-black/20 hover:bg-black/30 p-10 flex flex-col items-center justify-center text-center cursor-pointer transition group">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition duration-300"><UploadCloud className="w-6 h-6" /></div>
                <span className="text-sm font-semibold text-white">Drag & drop leaf photo here</span>
                <span className="text-[10px] text-slate-500 mt-1 block">Supports JPG, PNG, WEBP</span>
              </div>
            )}
            
            <Button onClick={handleAnalyzeDisease} disabled={isDiseaseLoading || !diseaseImage} className="w-full h-11 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-bold active:scale-[0.99] transition rounded-lg shadow-lg cursor-pointer flex justify-center items-center gap-2">
              {isDiseaseLoading ? (<><RefreshCw className="w-4 h-4 animate-spin" />Classifying Leaf Pathologies...</>) : (<><Cpu className="w-4 h-4" />Run Diagnostic Scan</>)}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Diagnostics Results (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        {isDiseaseLoading && (
          <div className="p-8 rounded-2xl border border-white/5 bg-[#0e1626]/20 backdrop-blur-md flex flex-col items-center justify-center text-center py-20 animate-pulse">
            <RefreshCw className="w-10 h-10 animate-spin text-rose-400 mb-4" />
            <h4 className="text-white font-semibold text-sm">Running Computer Vision Inference</h4>
            <p className="text-slate-500 text-xs mt-2 italic font-mono">{diseaseProgressText}</p>
          </div>
        )}
        
        {diseaseResult ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="p-6 rounded-2xl border border-white/5 bg-[#0e1626]/50 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 mb-5 gap-4">
                <div>
                  <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Diagnostic Result</span>
                  <h3 className="text-2xl font-black text-white mt-0.5">{diseaseResult.diseaseName}</h3>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold tracking-wide ${getSeverityStyle(diseaseResult.severity)}`}>Severity: {diseaseResult.severity}</span>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1.5"><span>CNN Classification Confidence:</span><span className="font-bold text-white">{diseaseResult.confidenceScore}%</span></div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-rose-500 to-emerald-400 transition-all duration-500" style={{ width: `${diseaseResult.confidenceScore}%` }} />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-500/[0.02] border border-emerald-500/10">
                    <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2"><CheckCircle2 className="w-4 h-4" />Organic Treatment</h5>
                    <p className="text-slate-300 text-xs leading-relaxed">{diseaseResult.organicTreatment}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-rose-500/[0.02] border border-rose-500/10">
                    <h5 className="text-xs font-bold text-rose-400 flex items-center gap-1.5 mb-2"><ShieldAlert className="w-4 h-4" />Chemical Treatment</h5>
                    <p className="text-slate-300 text-xs leading-relaxed">{diseaseResult.chemicalTreatment}</p>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-blue-500/[0.02] border border-blue-500/10 flex gap-3.5 items-start">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0"><Pill className="w-4.5 h-4.5" /></div>
                  <div>
                    <h5 className="text-xs font-bold text-blue-400 mb-1">Local Formulation / Store Advice</h5>
                    <p className="text-slate-300 text-xs leading-relaxed">{diseaseResult.nearbyPesticide}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : ( !isDiseaseLoading && <div className="py-24 border border-dashed border-white/5 rounded-2xl text-center text-slate-500 text-sm">No active leaf diagnostics run. Upload a picture and click Diagnostic Scan.</div> )}
      </div>

    </div>
  )
}
