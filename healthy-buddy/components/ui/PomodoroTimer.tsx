'use client'
// components/ui/PomodoroTimer.tsx
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Habit } from '@/types'
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react'
import toast from 'react-hot-toast'

const MODES = {
  focus:       { label: 'Focus',        duration: 25 * 60, color: '#4ade80' },
  short_break: { label: 'Short Break',  duration:  5 * 60, color: '#60a5fa' },
  long_break:  { label: 'Long Break',   duration: 15 * 60, color: '#a78bfa' },
}

interface Props { habits: Habit[] }

export default function PomodoroTimer({ habits }: Props) {
  const [mode, setMode] = useState<keyof typeof MODES>('focus')
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [selectedHabit, setSelectedHabit] = useState<string>('')

  const total = MODES[mode].duration
  const progress = (timeLeft / total) * 100
  const circumference = 2 * Math.PI * 88  // radius=88

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  }

  const handleComplete = useCallback(() => {
    setRunning(false)
    if (mode === 'focus') {
      setSessions(s => s + 1)
      const newSessions = sessions + 1
      toast.success(`🎉 Focus session complete! ${newSessions} session${newSessions > 1 ? 's' : ''} today`, { duration: 4000 })
      // Auto-switch to break
      const nextMode = newSessions % 4 === 0 ? 'long_break' : 'short_break'
      setMode(nextMode)
      setTimeLeft(MODES[nextMode].duration)
    } else {
      toast('☕ Break over! Ready to focus?', { duration: 3000 })
      setMode('focus')
      setTimeLeft(MODES.focus.duration)
    }
  }, [mode, sessions])

  useEffect(() => {
    if (!running) return
    if (timeLeft <= 0) { handleComplete(); return }
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(id)
  }, [running, timeLeft, handleComplete])

  function switchMode(m: keyof typeof MODES) {
    setMode(m)
    setTimeLeft(MODES[m].duration)
    setRunning(false)
  }

  function reset() {
    setRunning(false)
    setTimeLeft(MODES[mode].duration)
  }

  const color = MODES[mode].color
  const dashOffset = circumference - (circumference * (1 - timeLeft / total))

  return (
    <div className="max-w-md mx-auto">
      <div className="glass-card rounded-2xl p-8 text-center">
        {/* Mode tabs */}
        <div className="flex gap-2 mb-8 glass-card rounded-xl p-1">
          {(Object.entries(MODES) as [keyof typeof MODES, typeof MODES[keyof typeof MODES]][]).map(([key, m]) => (
            <button
              key={key}
              onClick={() => switchMode(key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                ${mode === key ? 'bg-white/15 text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Timer ring */}
        <div className="relative w-52 h-52 mx-auto mb-8">
          <svg className="w-full h-full pomodoro-ring" viewBox="0 0 200 200">
            {/* Track */}
            <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            {/* Progress */}
            <circle
              cx="100" cy="100" r="88"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="pomodoro-ring-progress"
              style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
            />
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-5xl font-bold tracking-tight" style={{ color }}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-sm text-[var(--text-muted)] mt-1">{MODES[mode].label}</span>
          </div>
        </div>

        {/* Sessions count */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${i < (sessions % 4) ? 'bg-green-400 shadow-glow-green' : 'bg-white/10'}`}
            />
          ))}
          <span className="text-xs text-[var(--text-muted)] ml-2">{sessions} sessions today</span>
        </div>

        {/* Habit selector */}
        <select
          value={selectedHabit}
          onChange={e => setSelectedHabit(e.target.value)}
          className="input-glass mb-6 text-sm"
        >
          <option value="">— Focus session (no habit) —</option>
          {habits.map(h => (
            <option key={h.id} value={h.id}>{h.icon} {h.name}</option>
          ))}
        </select>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={reset} className="btn-ghost w-12 h-12 p-0 rounded-full flex items-center justify-center">
            <RotateCcw size={18} />
          </button>

          <motion.button
            onClick={() => setRunning(r => !r)}
            whileTap={{ scale: 0.93 }}
            className="w-16 h-16 rounded-full flex items-center justify-center text-black font-bold shadow-lg"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 8px 24px ${color}50` }}
          >
            {running ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
          </motion.button>

          <div className="w-12 h-12" /> {/* spacer */}
        </div>

        {/* Tip */}
        <p className="text-xs text-[var(--text-muted)] mt-6">
          {mode === 'focus'
            ? '🧠 Close all distractions. You got this.'
            : mode === 'short_break'
            ? '☕ Stretch, drink water, rest your eyes.'
            : '🌿 Take a real break. Walk around.'}
        </p>
      </div>
    </div>
  )
}
