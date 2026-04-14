'use client'
// components/ui/MentalHealthShield.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, X, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  open: boolean
  onClose: () => void
  userXp: number
  onShieldActivated: () => void
}

const SHIELD_COST = 100

export default function MentalHealthShield({ open, onClose, userXp, onShieldActivated }: Props) {
  const [isActivating, setIsActivating] = useState(false)
  const [reason, setReason] = useState('')

  const canAfford = userXp >= SHIELD_COST

  const handleActivate = async () => {
    if (!canAfford) {
      toast.error(`You need ${SHIELD_COST} XP to activate a Mental Health Shield`)
      return
    }

    setIsActivating(true)
    try {
      const res = await fetch('/api/mental-health-shield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() || null }),
      })

      if (res.ok) {
        onShieldActivated()
        toast.success('🛡️ Mental Health Shield activated! Your streaks are protected for 24 hours.')
        onClose()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to activate shield')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsActivating(false)
    }
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
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Shield className="text-blue-400" size={24} />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">Mental Health Shield</h2>
                  <p className="text-sm text-[var(--text-muted)]">
                    Protect your streaks for 24 hours
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-[var(--text-muted)]">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Description */}
              <div className="glass-card rounded-xl p-4">
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  Life happens. Taking a break from your habits doesn't mean you've failed.
                  Use this shield to protect your current streaks for 24 hours while you focus on your mental health.
                </p>
              </div>

              {/* Cost */}
              <div className="flex items-center justify-between p-4 glass-card rounded-xl">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-yellow-400" />
                  <span className="font-semibold">Cost</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                    {SHIELD_COST} XP
                  </span>
                  <span className="text-sm text-[var(--text-muted)]">
                    (You have {userXp})
                  </span>
                </div>
              </div>

              {/* Optional Reason */}
              <div>
                <label className="text-sm text-[var(--text-muted)] mb-2 block">
                  Reason (optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why are you taking a break today?"
                  rows={2}
                  className="input-glass resize-none"
                  maxLength={200}
                />
              </div>

              {/* Activate Button */}
              <motion.button
                onClick={handleActivate}
                disabled={isActivating || !canAfford}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  canAfford
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl'
                    : 'bg-white/10 text-[var(--text-muted)] cursor-not-allowed'
                }`}
              >
                {isActivating ? 'Activating...' : 'Activate Shield'}
              </motion.button>

              {!canAfford && (
                <p className="text-xs text-center text-red-400">
                  Complete more habits to earn XP for your shield
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}