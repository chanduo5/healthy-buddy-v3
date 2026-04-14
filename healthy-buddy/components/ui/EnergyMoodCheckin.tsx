'use client'
// components/ui/EnergyMoodCheckin.tsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Battery, Smile } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  open: boolean
  onClose: () => void
  onComplete: (energy: number, mood: number) => void
}

export default function EnergyMoodCheckin({ open, onClose, onComplete }: Props) {
  const [energy, setEnergy] = useState(5)
  const [mood, setMood] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/mood-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ energy_level: energy, mood_level: mood }),
      })

      if (res.ok) {
        onComplete(energy, mood)
        toast.success('Check-in saved! Thanks for sharing how you\'re feeling.')
        onClose()
      } else {
        toast.error('Failed to save check-in')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getEnergyLabel = (level: number) => {
    if (level <= 3) return 'Low Energy'
    if (level <= 7) return 'Moderate Energy'
    return 'High Energy'
  }

  const getMoodLabel = (level: number) => {
    if (level <= 3) return 'Low Mood'
    if (level <= 7) return 'Neutral Mood'
    return 'Great Mood'
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
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto glass-card-elevated rounded-2xl p-6 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-bold">Daily Check-in</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  How are you feeling today?
                </p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-[var(--text-muted)]">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-8">
              {/* Energy Slider */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Battery size={20} className="text-blue-400" />
                  <span className="font-semibold">Energy Level</span>
                </div>

                <div className="space-y-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energy}
                    onChange={(e) => setEnergy(Number(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                  />

                  <div className="flex justify-between text-xs text-[var(--text-muted)]">
                    <span>1</span>
                    <span className="font-semibold text-blue-400">{energy}</span>
                    <span>10</span>
                  </div>

                  <p className="text-sm text-center text-[var(--text-secondary)]">
                    {getEnergyLabel(energy)}
                  </p>
                </div>
              </div>

              {/* Mood Slider */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Smile size={20} className="text-green-400" />
                  <span className="font-semibold">Mood Level</span>
                </div>

                <div className="space-y-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={mood}
                    onChange={(e) => setMood(Number(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                  />

                  <div className="flex justify-between text-xs text-[var(--text-muted)]">
                    <span>1</span>
                    <span className="font-semibold text-green-400">{mood}</span>
                    <span>10</span>
                  </div>

                  <p className="text-sm text-center text-[var(--text-secondary)]">
                    {getMoodLabel(mood)}
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                onClick={handleSubmit}
                disabled={isSubmitting}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
              >
                {isSubmitting ? 'Saving...' : 'Save Check-in'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}