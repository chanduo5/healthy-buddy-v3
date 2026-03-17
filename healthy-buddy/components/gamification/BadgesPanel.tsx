'use client'
// components/gamification/BadgesPanel.tsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Star } from 'lucide-react'
import { format } from 'date-fns'

interface BadgeData {
  id: string; slug: string; name: string; description: string; icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  xp_bonus: number; earned: boolean; earned_at: string | null
  condition_type: string; condition_value: number
}

const RARITY_STYLES = {
  common:    { label: 'Common',    class: 'badge-common',    glow: '' },
  rare:      { label: 'Rare',      class: 'badge-rare',      glow: 'shadow-[0_0_15px_rgba(96,165,250,0.3)]' },
  epic:      { label: 'Epic',      class: 'badge-epic',      glow: 'shadow-[0_0_15px_rgba(167,139,250,0.3)]' },
  legendary: { label: 'Legendary', class: 'badge-legendary', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]' },
}

export default function BadgesPanel() {
  const [badges, setBadges] = useState<BadgeData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all')

  useEffect(() => {
    fetch('/api/badges')
      .then(r => r.json())
      .then(j => { setBadges(j.data ?? []); setLoading(false) })
  }, [])

  const earnedCount = badges.filter(b => b.earned).length
  const filtered = badges.filter(b =>
    filter === 'all' ? true : filter === 'earned' ? b.earned : !b.earned
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold mb-1">Badges</h2>
          <p className="text-sm text-[var(--text-muted)]">{earnedCount} of {badges.length} earned</p>
        </div>
        <div className="flex gap-2">
          {(['all','earned','locked'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full transition-all capitalize
                ${filter === f ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'glass-card text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array(9).fill(0).map((_, i) => (
            <div key={i} className="glass-card rounded-xl h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((badge, i) => {
            const style = RARITY_STYLES[badge.rarity]
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className={`glass-card rounded-xl p-4 text-center border relative transition-all
                  ${badge.earned ? `${style.class} ${style.glow}` : 'opacity-50 border-white/5'}
                `}
              >
                {/* Rarity chip */}
                <div className={`absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full
                  ${badge.rarity === 'legendary' ? 'text-yellow-400 bg-yellow-400/10' :
                    badge.rarity === 'epic' ? 'text-purple-400 bg-purple-400/10' :
                    badge.rarity === 'rare' ? 'text-blue-400 bg-blue-400/10' :
                    'text-[var(--text-muted)] bg-white/5'}`}>
                  {style.label}
                </div>

                {/* Icon */}
                <div className={`text-3xl mb-2 ${!badge.earned ? 'grayscale opacity-40' : ''}`}>
                  {badge.earned ? badge.icon : <Lock size={28} className="mx-auto text-[var(--text-muted)]" />}
                </div>

                <p className="font-semibold text-sm mb-0.5">{badge.name}</p>
                <p className="text-[10px] text-[var(--text-muted)] mb-2">{badge.description}</p>

                {badge.earned ? (
                  <p className="text-[10px] text-green-400">
                    Earned {badge.earned_at ? format(new Date(badge.earned_at), 'MMM d') : ''}
                  </p>
                ) : (
                  <p className="text-[10px] text-yellow-400 flex items-center justify-center gap-1">
                    <Star size={9} /> +{badge.xp_bonus} XP bonus
                  </p>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
