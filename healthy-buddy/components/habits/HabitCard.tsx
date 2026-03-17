'use client'
// components/habits/HabitCard.tsx
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Habit, DIFFICULTY_LABELS } from '@/types'
import { useHabitStore } from '@/lib/store'
import { GripVertical, Flame, Check, RotateCcw, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  habit: Habit
  dragHandleProps?: any
}

export default function HabitCard({ habit, dragHandleProps }: Props) {
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { markHabitComplete, markHabitIncomplete, updateUserXp, addXpPop } = useHabitStore()
  const cardRef = useRef<HTMLDivElement>(null)

  const diffMeta = DIFFICULTY_LABELS[habit.difficulty]
  const isCompleted = habit.completed_today

  async function toggleComplete() {
    if (loading) return
    setLoading(true)

    if (isCompleted) {
      // Undo completion
      const res = await fetch(`/api/habits/${habit.id}/complete`, { method: 'DELETE' })
      const json = await res.json()
      if (res.ok) {
        markHabitIncomplete(habit.id)
        updateUserXp(-json.data.xpRefunded)
        toast('Completion undone', { icon: '↩️' })
      }
    } else {
      // Complete habit
      const rect = cardRef.current?.getBoundingClientRect()
      const res = await fetch(`/api/habits/${habit.id}/complete`, { method: 'POST' })
      const json = await res.json()
      if (res.ok) {
        const { xpEarned, newStreak, leveledUp } = json.data
        markHabitComplete(habit.id, xpEarned)
        updateUserXp(xpEarned)

        // Spawn XP pop
        if (rect) addXpPop(xpEarned, rect.left + rect.width / 2, rect.top)

        if (leveledUp) {
          toast.success(`🎉 Level Up! You reached Level ${json.data.newLevel}!`, { duration: 4000 })
        } else if (newStreak > 0 && newStreak % 7 === 0) {
          toast.success(`🔥 ${newStreak}-day streak! Keep going!`, { duration: 3000 })
        } else {
          toast.success(`+${xpEarned} XP — ${habit.name} done!`, { duration: 2000 })
        }
      } else {
        toast.error(json.error ?? 'Something went wrong')
      }
    }
    setLoading(false)
  }

  async function deleteHabit() {
    setMenuOpen(false)
    if (!confirm(`Delete "${habit.name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/habits/${habit.id}`, { method: 'DELETE' })
    if (res.ok) {
      const store = useHabitStore.getState()
      store.setHabits(store.habits.filter(h => h.id !== habit.id))
      toast.success('Habit deleted')
    }
  }

  return (
    <div
      ref={cardRef}
      className={`glass-card habit-card rounded-xl p-4 relative select-none
        ${isCompleted ? 'completed' : ''}`}
      style={{ borderLeftWidth: 3, borderLeftColor: habit.color }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Drag handle */}
          <span {...dragHandleProps} className="drag-handle flex-shrink-0">
            <GripVertical size={16} />
          </span>

          {/* Icon + name */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xl">{habit.icon}</span>
              <h3 className="font-display font-semibold text-sm leading-tight truncate">{habit.name}</h3>
            </div>
            {habit.description && (
              <p className="text-xs text-[var(--text-muted)] truncate-2">{habit.description}</p>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-all"
          >
            <MoreHorizontal size={16} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute right-0 top-8 glass-card-elevated rounded-xl p-1 z-50 w-36"
              >
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Pencil size={13} /> Edit habit
                </button>
                <button
                  onClick={deleteHabit}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Badges row */}
      <div className="flex items-center gap-2 mb-4">
        {/* Difficulty badge */}
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: `${diffMeta.color}18`,
            color: diffMeta.color,
            border: `1px solid ${diffMeta.color}40`,
          }}
        >
          {diffMeta.label} · {diffMeta.multiplier}
        </span>

        {/* Streak badge */}
        {habit.current_streak > 0 && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 flex items-center gap-1 ${habit.current_streak >= 7 ? 'streak-active' : ''}`}>
            <Flame size={10} /> {habit.current_streak}d
          </span>
        )}

        {/* XP reward */}
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
          +{habit.xp_reward} XP
        </span>
      </div>

      {/* Complete button */}
      <motion.button
        onClick={toggleComplete}
        disabled={loading}
        whileTap={{ scale: 0.96 }}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all
          ${isCompleted
            ? 'bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
            : 'bg-white/5 text-[var(--text-secondary)] border border-white/10 hover:bg-white/10 hover:text-[var(--text-primary)]'
          }
          ${loading ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isCompleted ? (
            <motion.span key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1.5">
              <Check size={15} /> Done! <span className="opacity-60 text-xs">(undo)</span>
            </motion.span>
          ) : (
            <motion.span key="todo" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1.5">
              Mark complete
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
