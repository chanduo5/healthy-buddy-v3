'use client'
// components/ui/VoiceDumpModal.tsx
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Square, X, Brain } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  open: boolean
  onClose: () => void
}

export default function VoiceDumpModal({ open, onClose }: Props) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [insights, setInsights] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const MAX_RECORDING_TIME = 60 // seconds

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_TIME) {
            stopRecording()
            return MAX_RECORDING_TIME
          }
          return prev + 1
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await processAudio(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      toast.success('Recording started - you have 60 seconds!')
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'voice-dump.webm')

      const res = await fetch('/api/voice-dump', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setTranscript(data.transcript || 'No transcript available')
        setInsights(data.insights || 'Your voice has been recorded and analyzed.')
        toast.success('Voice dump processed! Check your insights below.')
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error('Voice dump API error:', errorData)
        toast.error(errorData.details || 'Failed to process voice dump')
      }
    } catch (error) {
      console.error('Error processing audio:', error)
      toast.error('Something went wrong processing your voice dump')
    } finally {
      setIsProcessing(false)
    }
  }

  const resetModal = () => {
    setIsRecording(false)
    setRecordingTime(0)
    setIsProcessing(false)
    setTranscript('')
    setInsights('')
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto glass-card-elevated rounded-2xl p-6 z-50 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Brain className="text-purple-400" size={24} />
                <div>
                  <h2 className="font-display text-xl font-bold">Voice Dump</h2>
                  <p className="text-sm text-[var(--text-muted)]">
                    Talk about your day for up to 60 seconds
                  </p>
                </div>
              </div>
              <button onClick={handleClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-[var(--text-muted)]">
                <X size={18} />
              </button>
            </div>

            {/* Recording Interface */}
            {!transcript && (
              <div className="text-center space-y-6">
                <div className="relative">
                  <motion.div
                    animate={isRecording ? {
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        '0 0 0 0 rgba(168, 85, 247, 0.4)',
                        '0 0 0 20px rgba(168, 85, 247, 0)',
                        '0 0 0 0 rgba(168, 85, 247, 0)'
                      ]
                    } : {}}
                    transition={{ duration: 1, repeat: isRecording ? Infinity : 0 }}
                    className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                      isRecording
                        ? 'bg-purple-500/20 border-2 border-purple-400'
                        : 'bg-white/5 border-2 border-white/20'
                    }`}
                  >
                    {isRecording ? (
                      <Mic className="text-purple-400" size={32} />
                    ) : (
                      <MicOff className="text-[var(--text-muted)]" size={32} />
                    )}
                  </motion.div>

                  {isRecording && (
                    <div className="mt-4 text-center">
                      <div className="text-2xl font-mono font-bold text-purple-400">
                        {formatTime(recordingTime)}
                      </div>
                      <div className="text-sm text-[var(--text-muted)] mt-1">
                        {MAX_RECORDING_TIME - recordingTime}s remaining
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {!isRecording ? (
                    <motion.button
                      onClick={startRecording}
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-3 bg-purple-500/20 border border-purple-400/50 rounded-xl font-semibold text-purple-400 hover:bg-purple-500/30 transition-all"
                    >
                      Start Recording
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={stopRecording}
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-3 bg-red-500/20 border border-red-400/50 rounded-xl font-semibold text-red-400 hover:bg-red-500/30 transition-all"
                    >
                      <Square size={16} className="inline mr-2" />
                      Stop Recording
                    </motion.button>
                  )}

                  {isProcessing && (
                    <div className="text-center py-4">
                      <div className="inline-block w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mr-2" />
                      Processing your voice dump...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Results */}
            {transcript && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-purple-400">Your Transcript</h3>
                  <div className="glass-card rounded-xl p-4 text-sm leading-relaxed">
                    {transcript}
                  </div>
                </div>

                {insights && (
                  <div>
                    <h3 className="font-semibold mb-2 text-green-400">AI Insights</h3>
                    <div className="glass-card rounded-xl p-4 text-sm leading-relaxed">
                      {insights}
                    </div>
                  </div>
                )}

                <motion.button
                  onClick={resetModal}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-3 bg-white/10 rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  Record Another Dump
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}