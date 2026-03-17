'use client'
// components/layout/DashboardSidebar.tsx  — adds Theme button + Badges nav
import { UserButton } from '@clerk/nextjs'
import { LevelInfo, User } from '@/types'
import { LayoutGrid, BarChart3, Bot, Timer, Trophy, Zap, Palette } from 'lucide-react'
import type { PanelId } from '@/app/dashboard/page'

const NAV: { id: PanelId; icon: any; label: string }[] = [
  { id: 'habits',   icon: LayoutGrid, label: 'Habits'    },
  { id: 'heatmap',  icon: BarChart3,  label: 'Analytics' },
  { id: 'ai',       icon: Bot,        label: 'AI Coach'  },
  { id: 'pomodoro', icon: Timer,      label: 'Focus'     },
]

interface Props {
  user: User | null
  levelInfo: LevelInfo | null
  activePanel: PanelId
  setActivePanel: (p: PanelId) => void
  onThemeClick: () => void
}

export default function DashboardSidebar({ user, levelInfo, activePanel, setActivePanel, onThemeClick }: Props) {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-20 flex flex-col"
      style={{ background:'rgba(8,13,8,0.85)', backdropFilter:'blur(30px)', borderRight:'1px solid rgba(255,255,255,0.07)' }}>

      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="font-display font-bold text-lg text-gradient">Healthy Buddy</span>
        </div>
      </div>

      {/* User card */}
      {user && levelInfo && (
        <div className="p-4 border-b border-white/5">
          <div className="glass-card rounded-xl p-3">
            <div className="flex items-center gap-3 mb-3">
              <UserButton afterSignOutUrl="/" appearance={{ elements:{ avatarBox:'w-9 h-9' } }} />
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{user.display_name ?? user.email ?? 'User'}</p>
                <p className="text-xs text-[var(--text-muted)]">Level {levelInfo.level} · {levelInfo.title}</p>
              </div>
            </div>
            <div className="xp-bar">
              <div className="xp-bar-fill" style={{ width:`${levelInfo.progress}%` }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-[var(--text-muted)]">{user.xp.toLocaleString()} XP</span>
              <span className="text-[10px]" style={{ color:'var(--accent-primary)' }}>⚡ {levelInfo.progress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ id, icon:Icon, label }) => (
          <button key={id} onClick={() => setActivePanel(id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
              ${activePanel === id
                ? 'text-[var(--accent-text-dark)] border border-[var(--accent-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 border border-transparent'}`}
            style={activePanel === id ? { background:'var(--accent-primary)' } : {}}>
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      {/* Bottom area */}
      <div className="p-4 border-t border-white/5 space-y-3">
        {/* Streak callout */}
        {user && (user.current_streak ?? 0) > 0 && (
          <div className="glass-card rounded-xl p-3 flex items-center gap-3">
            <span className="text-xl streak-active">🔥</span>
            <div>
              <p className="font-semibold text-sm">{user.current_streak}-day streak</p>
              <p className="text-xs text-[var(--text-muted)]">Don't break the chain!</p>
            </div>
          </div>
        )}

        {/* Theme button */}
        <button onClick={onThemeClick}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all border border-transparent">
          <Palette size={18} />
          Appearance
        </button>

        {/* Pro upsell */}
        {user?.plan === 'free' && (
          <div className="glass-card rounded-xl p-3 border border-yellow-500/20 bg-yellow-500/5">
            <div className="flex items-center gap-2 mb-1.5">
              <Zap size={13} className="text-yellow-400" />
              <span className="text-xs font-semibold text-yellow-400">Free Plan</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-2">Upgrade for unlimited habits + AI coaching</p>
            <a href="/upgrade" className="btn-primary w-full py-1.5 text-xs text-center block">Upgrade to Pro</a>
          </div>
        )}
      </div>
    </aside>
  )
}
