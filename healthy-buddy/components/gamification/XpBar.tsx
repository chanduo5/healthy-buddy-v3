'use client'
// components/gamification/XpBar.tsx
import { motion } from 'framer-motion'
import { LevelInfo } from '@/types'

interface Props {
  levelInfo: LevelInfo
  className?: string
}

export default function XpBar({ levelInfo, className = '' }: Props) {
  const { level, progress, title, currentXp, xpForNextLevel } = levelInfo
  const xpToNext = xpForNextLevel - currentXp

  return (
    <div className={`glass-card rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center font-display font-bold text-black text-sm shadow-glow-green">
            {level}
          </div>
          <div>
            <p className="font-display font-semibold text-sm">{title}</p>
            <p className="text-xs text-[var(--text-muted)]">Level {level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm font-semibold text-[var(--accent-gold)]">{currentXp.toLocaleString()} XP</p>
          <p className="text-xs text-[var(--text-muted)]">{xpToNext} XP to next level</p>
        </div>
      </div>

      <div className="xp-bar">
        <motion.div
          className="xp-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-[var(--text-muted)]">Level {level}</span>
        <span className="text-[10px] text-[var(--text-muted)]">{progress}%</span>
        <span className="text-[10px] text-[var(--text-muted)]">Level {level + 1}</span>
      </div>
    </div>
  )
}
