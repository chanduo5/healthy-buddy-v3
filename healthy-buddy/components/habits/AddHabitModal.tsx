'use client'
// components/habits/AddHabitModal.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useHabitStore } from '@/lib/store'
import { X, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

const ICONS = ['⭐', '🏃', '🧘', '📚', '💧', '🍎', '💪', '🧠', '🎯', '✍️', '🎸', '🛏️', '🚿', '🥗', '🏋️', '🚴', '🌅', '📝', '🎨', '🧘‍♂️']
const COLORS = ['#4ade80', '#60a5fa', '#f59e0b', '#f43f5e', '#a78bfa', '#fb923c', '#34d399', '#e879f9', '#38bdf8', '#fbbf24']

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(60),
  description: z.string().max(200).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  category: z.string().default('health'),
  target_count: z.number().min(1).default(1),
  unit: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
}

const DIFFICULTY_INFO = {
  easy:   { label: 'Easy',   xp: 10, color: '#4ade80', desc: 'Quick wins' },
  medium: { label: 'Medium', xp: 20, color: '#fb923c', desc: 'Real effort' },
  hard:   { label: 'Hard',   xp: 30, color: '#f43f5e', desc: 'Willpower test' },
}

export default function AddHabitModal({ open, onClose }: Props) {
  const [selectedIcon, setSelectedIcon] = useState('⭐')
  const [selectedColor, setSelectedColor] = useState('#4ade80')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { setHabits, habits } = useHabitStore()

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { difficulty: 'medium', target_count: 1 },
  })

  const difficulty = watch('difficulty')

  async function onSubmit(data: FormData) {
    setIsSubmitting(true)
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, icon: selectedIcon, color: selectedColor }),
    })
    const json = await res.json()
    if (res.ok) {
      setHabits([...habits, { ...json.data, completed_today: false }])
      toast.success(`${selectedIcon} "${data.name}" added!`)
      reset()
      setSelectedIcon('⭐')
      setSelectedColor('#4ade80')
      onClose()
    } else {
      toast.error(json.error ?? 'Failed to create habit')
    }
    setIsSubmitting(false)
  }

  function handleClose() {
    reset()
    onClose()
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
              <h2 className="font-display text-xl font-bold">Add New Habit</h2>
              <button onClick={handleClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-[var(--text-muted)]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Icon picker */}
              <div>
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setSelectedIcon(icon)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all
                        ${selectedIcon === icon ? 'bg-green-500/20 border border-green-500/40 scale-110' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Habit Name *</label>
                <input
                  {...register('name')}
                  placeholder="e.g. Morning Run, Read 30 min, Meditate..."
                  className="input-glass"
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Description (optional)</label>
                <textarea
                  {...register('description')}
                  placeholder="Why does this habit matter to you?"
                  rows={2}
                  className="input-glass resize-none"
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Difficulty</label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.entries(DIFFICULTY_INFO) as any[]).map(([key, info]) => (
                    <label key={key} className="cursor-pointer">
                      <input type="radio" {...register('difficulty')} value={key} className="sr-only" />
                      <div className={`rounded-xl p-3 text-center border transition-all
                        ${difficulty === key
                          ? 'border-current bg-white/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/8'}`}
                        style={{ color: difficulty === key ? info.color : undefined }}
                      >
                        <div className="font-semibold text-sm">{info.label}</div>
                        <div className="text-xs opacity-70">{info.desc}</div>
                        <div className="flex items-center justify-center gap-1 mt-1 text-xs font-bold">
                          <Zap size={10} /> +{info.xp} XP
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Accent Color</label>
                <div className="flex gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${selectedColor === color ? 'scale-125 ring-2 ring-white/40' : ''}`}
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="glass-card rounded-xl p-3 flex items-center gap-3"
                style={{ borderLeft: `3px solid ${selectedColor}` }}>
                <span className="text-2xl">{selectedIcon}</span>
                <div>
                  <p className="font-semibold text-sm">{watch('name') || 'Your habit name'}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {DIFFICULTY_INFO[difficulty]?.label} · +{DIFFICULTY_INFO[difficulty]?.xp} XP per day
                  </p>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleClose} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                  {isSubmitting ? 'Adding...' : `Add Habit`}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
