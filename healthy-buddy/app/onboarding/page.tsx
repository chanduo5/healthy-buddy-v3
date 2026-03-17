'use client'
// app/onboarding/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const STARTER_HABITS = [
  { name: 'Morning Walk',    icon: '🚶', difficulty: 'easy',   desc: '10–15 min outside' },
  { name: 'Drink 2L Water',  icon: '💧', difficulty: 'easy',   desc: 'Stay hydrated' },
  { name: 'Read 30 Minutes', icon: '📚', difficulty: 'medium', desc: 'Books, not social media' },
  { name: 'Meditate',        icon: '🧘', difficulty: 'medium', desc: '10 min mindfulness' },
  { name: 'Workout',         icon: '💪', difficulty: 'hard',   desc: '45 min gym or home' },
  { name: 'No Social Media', icon: '📵', difficulty: 'hard',   desc: 'Before 10am' },
  { name: 'Journaling',      icon: '✍️', difficulty: 'easy',   desc: '5 min reflection' },
  { name: 'Cold Shower',     icon: '🚿', difficulty: 'hard',   desc: '2 min cold blast' },
]

const STEPS = ['Welcome', 'Pick Habits', 'You\'re ready!']

export default function OnboardingPage() {
  const { user } = useUser()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  function toggleHabit(name: string) {
    setSelected(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  async function finish() {
    setLoading(true)
    try {
      // Create selected habits
      const selectedHabits = STARTER_HABITS.filter(h => selected.includes(h.name))
      await Promise.all(
        selectedHabits.map(h =>
          fetch('/api/habits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: h.name, icon: h.icon, difficulty: h.difficulty, description: h.desc }),
          })
        )
      )
      toast.success('Welcome to Healthy Buddy! 🌿')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-mesh" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${i < step ? 'bg-green-500 text-black' : i === step ? 'bg-green-500/20 border border-green-500 text-green-400' : 'bg-white/10 text-[var(--text-muted)]'}`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`w-12 h-0.5 ${i < step ? 'bg-green-500' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="welcome" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="glass-card-elevated rounded-2xl p-10 text-center">
              <div className="text-6xl mb-6">🌿</div>
              <h1 className="font-display text-3xl font-bold mb-3">
                Welcome, {user?.firstName ?? 'Champion'}!
              </h1>
              <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
                Healthy Buddy turns your daily habits into a game. Earn XP, level up, build streaks, and get coached by AI. Let's set you up in 60 seconds.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                {[['🎮', 'Earn XP'], ['🔥', 'Build Streaks'], ['🤖', 'AI Coach']].map(([icon, label]) => (
                  <div key={label} className="glass-card rounded-xl p-3">
                    <div className="text-2xl mb-1">{icon}</div>
                    <div className="text-[var(--text-secondary)] text-xs">{label}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="btn-primary w-full py-3 text-base gap-2">
                Get started <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="habits" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="glass-card-elevated rounded-2xl p-8">
              <h2 className="font-display text-2xl font-bold mb-1">Choose starter habits</h2>
              <p className="text-[var(--text-secondary)] text-sm mb-6">Pick 1–5 to start. You can add more anytime. Free plan includes 5 habits.</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {STARTER_HABITS.map(h => {
                  const isSelected = selected.includes(h.name)
                  const atLimit = selected.length >= 5 && !isSelected
                  return (
                    <button
                      key={h.name}
                      onClick={() => !atLimit && toggleHabit(h.name)}
                      disabled={atLimit}
                      className={`glass-card rounded-xl p-3 text-left transition-all relative
                        ${isSelected ? 'border-green-500/40 bg-green-500/10' : atLimit ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/8'}`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <Check size={12} className="text-black" />
                        </div>
                      )}
                      <span className="text-xl mb-1 block">{h.icon}</span>
                      <p className="font-semibold text-sm">{h.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{h.desc}</p>
                      <span className={`text-[10px] font-bold mt-1 inline-block
                        ${h.difficulty === 'easy' ? 'text-green-400' : h.difficulty === 'medium' ? 'text-orange-400' : 'text-red-400'}`}>
                        {h.difficulty}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-ghost flex-1">Back</button>
                <button onClick={() => setStep(2)} disabled={selected.length === 0} className="btn-primary flex-1 disabled:opacity-40">
                  Continue ({selected.length} selected) <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="ready" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="glass-card-elevated rounded-2xl p-10 text-center">
              <div className="text-6xl mb-4 animate-bounce">🚀</div>
              <h2 className="font-display text-3xl font-bold mb-3">You're all set!</h2>
              <p className="text-[var(--text-secondary)] mb-6">
                {selected.length} habit{selected.length > 1 ? 's' : ''} ready to track. Your first completions will earn XP and start your streaks.
              </p>
              <div className="glass-card rounded-xl p-4 mb-8 text-left space-y-2">
                {STARTER_HABITS.filter(h => selected.includes(h.name)).map(h => (
                  <div key={h.name} className="flex items-center gap-3 text-sm">
                    <span>{h.icon}</span>
                    <span className="font-medium">{h.name}</span>
                    <span className={`ml-auto text-xs ${h.difficulty === 'easy' ? 'text-green-400' : h.difficulty === 'medium' ? 'text-orange-400' : 'text-red-400'}`}>
                      {h.difficulty === 'easy' ? '+10' : h.difficulty === 'medium' ? '+20' : '+30'} XP/day
                    </span>
                  </div>
                ))}
              </div>
              <button onClick={finish} disabled={loading} className="btn-primary w-full py-3 text-base">
                {loading ? 'Setting up...' : 'Go to Dashboard →'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
