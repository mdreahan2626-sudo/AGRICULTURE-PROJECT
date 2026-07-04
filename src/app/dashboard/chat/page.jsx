'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { 
  MessageSquare, Languages, Volume2, VolumeX, Mic, Send, RefreshCw
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Regional Language Options
const REGIONAL_LANGUAGES = [
  { code: 'hi-IN', label: 'Hindi (हिंदी)' },
  { code: 'bn-IN', label: 'Bengali (বাংলা)' },
  { code: 'mr-IN', label: 'Marathi (मराठी)' },
  { code: 'ta-IN', label: 'Tamil (தமிழ்)' },
  { code: 'te-IN', label: 'Telugu (తెలుగు)' },
  { code: 'en-IN', label: 'English (India)' }
]

export default function ChatPage() {
  const chatEndRef = useRef(null)
  const [chatLanguage, setChatLanguage] = useState('hi-IN')
  const [chatMessage, setChatMessage] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      content: 'नमस्ते! मैं एग्रोबॉट हूँ, आपका व्यक्तिगत कृषि सहायक। मैं आपकी फसलों, मिट्टी, खाद और मौसम से जुड़ी समस्याओं का समाधान कर सकता हूँ। आप मुझसे बोलकर या लिखकर सवाल पूछ सकते हैं।'
    }
  ])

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const handleSendChatMessage = async (e) => {
    if (e) e.preventDefault()
    if (!chatMessage.trim()) return

    const userMessageText = chatMessage
    setChatMessage('')
    
    const updatedHistory = [...chatHistory, { role: 'user', content: userMessageText }]
    setChatHistory(updatedHistory)
    setIsChatLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: updatedHistory }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Chat failed')
      }

      setChatHistory(prev => [...prev, { role: 'assistant', content: data.message }])

      if (autoSpeak) {
        speakText(data.message, chatLanguage)
      }
    } catch (err) {
      toast.error(err.message || 'Chatbot connection error')
    } finally {
      setIsChatLoading(false)
    }
  }

  // Speech Recognition (Speech-to-Text)
  const startListening = () => {
    if (typeof window === 'undefined') return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Voice input is not supported in this browser. Try Google Chrome.')
      return
    }

    window.speechSynthesis?.cancel()

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = chatLanguage

    recognition.onstart = () => {
      setIsListening(true)
      toast.info('Listening... Speak to the microphone now.')
    }

    recognition.onerror = (e) => {
      console.error(e)
      setIsListening(false)
      toast.error('Voice input failed. Please try again.')
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setChatMessage(transcript)
      toast.success('Speech captured!')
    }

    recognition.start()
  }

  // Speech Synthesis (Text-to-Speech)
  const speakText = (text, langCode) => {
    if (typeof window === 'undefined') return
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = langCode
    utterance.rate = 1.0
    utterance.pitch = 1.0

    const voices = window.speechSynthesis.getVoices()
    const matchingVoice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]))
    if (matchingVoice) {
      utterance.voice = matchingVoice
    }

    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    if (typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    toast.info('Read-aloud muted.')
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300 w-full">
      <Card className="border-white/5 bg-[#0e1626]/40 backdrop-blur-xl shadow-xl flex flex-col h-[600px] overflow-hidden rounded-2xl">
        
        {/* Chat Header controls */}
        <CardHeader className="p-4 border-b border-white/5 flex flex-row items-center justify-between bg-[#0e1626]/60 gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-md">
              <MessageSquare className="w-4.5 h-4.5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-white">AI AgroBot Assistant</CardTitle>
              <span className="block text-[9px] text-emerald-400 font-semibold tracking-wider uppercase leading-none mt-0.5">Farming Consultant</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-slate-400" />
              <Select value={chatLanguage} onValueChange={setChatLanguage}>
                <SelectTrigger className="h-8 w-[140px] bg-black/25 border-white/5 text-[11px] text-slate-200 focus:ring-0 focus:border-white/10 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0e1626] border-white/5 text-[11px] text-white rounded-lg">
                  {REGIONAL_LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <button 
              onClick={() => {
                setAutoSpeak(!autoSpeak)
                if (autoSpeak) stopSpeaking()
              }}
              className={`p-1.5 rounded-lg border transition ${
                autoSpeak 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'border-white/5 text-slate-500 hover:text-white'
              }`}
              title={autoSpeak ? "Auto Read Aloud (Active)" : "Auto Read Aloud (Muted)"}
            >
              {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button 
              onClick={stopSpeaking}
              className="p-1.5 rounded-lg border border-white/5 text-slate-500 hover:text-rose-400 transition"
              title="Mute Audio"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          </div>
        </CardHeader>

        {/* Chat Bubble Container */}
        <CardContent className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-thin">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}>
              <div className={`relative max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 rounded-tr-none'
                  : 'bg-white/[0.02] border border-white/5 text-slate-200 rounded-tl-none'
              }`}>
                {msg.role === 'assistant' && (
                  <button 
                    onClick={() => speakText(msg.content, chatLanguage)}
                    className="absolute top-3 right-3 text-slate-500 hover:text-emerald-400 transition cursor-pointer"
                    title="Read Aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className={msg.role === 'assistant' ? 'pr-4' : ''}>
                  {msg.content.split('\n').map((line, idx) => (
                    <p key={idx} className={idx > 0 ? 'mt-1.5' : ''}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {isChatLoading && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-white/[0.02] border border-white/5 text-slate-400 p-4 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                Consulting AgroBot data...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </CardContent>

        {/* Chat Input / Voice Microphone footer */}
        <CardFooter className="p-4 border-t border-white/5 bg-[#0e1626]/40 shrink-0">
          <form onSubmit={handleSendChatMessage} className="flex items-center gap-2 w-full">
            <button
              type="button"
              onClick={startListening}
              className={`p-3 rounded-xl border transition duration-300 cursor-pointer ${
                isListening 
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse' 
                  : 'bg-black/25 border-white/10 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30'
              }`}
              title="Speak Query (Microphone)"
            >
              <Mic className="w-5 h-5" />
            </button>

            <Input 
              type="text"
              placeholder={isListening ? "Listening... Speak now..." : "Ask AgroBot anything..."}
              className="flex-grow bg-black/25 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-emerald-500 h-11 text-xs rounded-xl"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              disabled={isListening || isChatLoading}
            />

            <Button 
              type="submit" 
              disabled={isChatLoading || isListening || !chatMessage.trim()}
              className="h-11 w-11 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Send className="w-4.5 h-4.5" />
            </Button>
          </form>
        </CardFooter>

      </Card>
    </div>
  )
}
