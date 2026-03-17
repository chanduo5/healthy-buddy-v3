'use client'
// app/dashboard/page.tsx  — FIXED: unified home, theme button, all panels on one page
import { useEffect, useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { useHabitStore } from '@/lib/store'
import { getLevelInfo, calculateMomentum, getMomentumColor, getMomentumLabel } from '@/lib/gamification'
import HabitGrid from '@/components/habits/HabitGrid'
import AddHabitModal from '@/components/habits/AddHabitModal'
import XpBar from '@/components/gamification/XpBar'
import HeatmapCard from '@/components/analytics/HeatmapCard'
import PomodoroTimer from '@/components/ui/PomodoroTimer'
import AiCoachPanel from '@/components/ui/AiCoachPanel'
import XpFloatingPop from '@/components/gamification/XpFloatingPop'
import DashboardSidebar from '@/components/layout/DashboardSidebar'
import ThemeSettingsPanel from '@/components/ui/ThemeSettingsPanel'
import { Plus, Zap, Flame, Target, TrendingUp, Palette } from 'lucide-react'
import toast from 'react-hot-toast'

export type PanelId = 'habits' | 'heatmap' | 'ai' | 'pomodoro' | 'badges'

export default function DashboardPage() {
  const { user: clerkUser } = useUser()
  const { user, habits, stats, isLoading, xpPopQueue, setHabits, setUser, setLoading } = useHabitStore()
  const [addHabitOpen, setAddHabitOpen]   = useState(false)
  const [themeOpen, setThemeOpen]         = useState(false)
  const [activePanel, setActivePanel]     = useState<PanelId>('habits')

  const fetchData = useCallback(async () => {
    if (!clerkUser?.id) return
    setLoading(true)
    try {
      const [habitsRes, userRes] = await Promise.all([
        fetch('/api/habits'),
        fetch('/api/auth/me'),
      ])
      const [habitsJson, userJson] = await Promise.all([habitsRes.json(), userRes.json()])
      if (habitsJson.data) setHabits(habitsJson.data)
      if (userJson.data)   setUser(userJson.data)
    } catch (e) {
      console.error('Dashboard fetch error:', e)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [clerkUser?.id])

  useEffect(() => { fetchData() }, [fetchData])

  // Show upgrade toast if returning from Stripe
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('upgraded=1')) {
      toast.success('🎉 Welcome to Pro! Unlimited habits unlocked.', { duration: 5000 })
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [])

  const levelInfo       = user ? getLevelInfo(user.xp) : null
  const completedToday  = habits.filter(h => h.completed_today).length
  const momentum        = calculateMomentum(completedToday, habits.length, user?.current_streak ?? 0)
  const todayXp         = habits.filter(h => h.completed_today).reduce((s, h) => s + h.xp_reward, 0)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-mesh" />
        <div className="relative z-10 text-center">
          <div className="text-4xl mb-4 animate-bounce">🌿</div>
          <p className="text-[var(--text-muted)] animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen relative">
      <div className="bg-mesh" />

      {/* Sidebar */}
      <DashboardSidebar
        user={user} levelInfo={levelInfo}
        activePanel={activePanel} setActivePanel={setActivePanel}
        onThemeClick={() => setThemeOpen(true)}
      />

      {/* Main */}
      <main className="flex-1 ml-64 relative z-10 p-6 overflow-y-auto min-h-screen">

        {/* Top header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[var(--text-muted)] text-sm mb-1">
              {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
            </p>
            <h1 className="font-display text-3xl font-bold">
              Good {getTimeOfDay()}, {clerkUser?.firstName ?? 'Champion'} 👋
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setThemeOpen(true)}
              className="btn-ghost gap-2 text-sm py-2 px-3">
              <Palette size={16} /> Theme
            </button>
            <button onClick={() => setAddHabitOpen(true)} className="btn-primary gap-2">
              <Plus size={18} /> Add Habit
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<Zap className="text-yellow-400" size={18} />}  label="Today's XP"      value={`+${todayXp}`} />
          <StatCard icon={<Target style={{color:'var(--accent-primary)'}} size={18}/>} label="Completed" value={`${completedToday}/${habits.length}`} />
          <StatCard icon={<Flame className="text-orange-400" size={18} />}  label="Streak"        value={`${user?.current_streak ?? 0}d`}
            glow={!!user?.current_streak && user.current_streak >= 3} />
          <StatCard icon={<TrendingUp style={{color: getMomentumColor(momentum)}} size={18} />} label="Momentum"
            value={getMomentumLabel(momentum)} sub={`${momentum}%`} />
        </div>

        {/* XP bar */}
        {levelInfo && <XpBar levelInfo={levelInfo} className="mb-6" />}

        {/* Main content panel */}
        <AnimatePresence mode="wait">
          <motion.div key={activePanel}
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:-8 }} transition={{ duration: 0.2 }}>
            {activePanel === 'habits'   && <HabitGrid habits={habits} onAddHabit={() => setAddHabitOpen(true)} />}
            {activePanel === 'heatmap'  && <HeatmapCard userId={user?.id ?? ''} />}
            {activePanel === 'ai'       && <AiCoachPanel user={user} habits={habits} momentum={momentum} />}
            {activePanel === 'pomodoro' && <PomodoroTimer habits={habits} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* XP floating pops */}
      {xpPopQueue.map(pop => (
        <XpFloatingPop key={pop.id} amount={pop.amount} x={pop.x} y={pop.y} />
      ))}

      <AddHabitModal open={addHabitOpen} onClose={() => setAddHabitOpen(false)} />
      <ThemeSettingsPanel open={themeOpen} onClose={() => setThemeOpen(false)} />
    </div>
  )
}

function StatCard({ icon, label, value, sub, glow }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; glow?: boolean
}) {
  return (
    <div className={`glass-card rounded-xl p-4 ${glow ? 'streak-active' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-display font-bold text-2xl">{value}</p>
      {sub && <p className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</p>}
    </div>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
