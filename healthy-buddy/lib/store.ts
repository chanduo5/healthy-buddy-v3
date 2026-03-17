// lib/store.ts — Zustand global state
import { create } from 'zustand'
import { Habit, User, HabitLog, DashboardStats } from '@/types'

interface HabitStore {
  // State
  habits: Habit[]
  user: User | null
  todayLogs: HabitLog[]
  stats: DashboardStats | null
  isLoading: boolean
  // XP animation queue
  xpPopQueue: Array<{ id: string; amount: number; x: number; y: number }>

  // Actions
  setHabits: (habits: Habit[]) => void
  setUser: (user: User) => void
  setTodayLogs: (logs: HabitLog[]) => void
  setStats: (stats: DashboardStats) => void
  setLoading: (loading: boolean) => void

  markHabitComplete: (habitId: string, xpEarned: number) => void
  markHabitIncomplete: (habitId: string) => void
  addXpPop: (amount: number, x: number, y: number) => void
  removeXpPop: (id: string) => void
  updateUserXp: (xpGained: number) => void
  reorderHabits: (newOrder: Habit[]) => void
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  user: null,
  todayLogs: [],
  stats: null,
  isLoading: true,
  xpPopQueue: [],

  setHabits: (habits) => set({ habits }),
  setUser: (user) => set({ user }),
  setTodayLogs: (todayLogs) => set({ todayLogs }),
  setStats: (stats) => set({ stats }),
  setLoading: (isLoading) => set({ isLoading }),

  markHabitComplete: (habitId, xpEarned) => {
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === habitId
          ? { ...h, completed_today: true, current_streak: h.current_streak + 1 }
          : h
      ),
      stats: state.stats
        ? {
            ...state.stats,
            completedToday: state.stats.completedToday + 1,
            todayXp: state.stats.todayXp + xpEarned,
          }
        : null,
    }))
  },

  markHabitIncomplete: (habitId) => {
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === habitId ? { ...h, completed_today: false } : h
      ),
    }))
  },

  addXpPop: (amount, x, y) => {
    const id = Math.random().toString(36).slice(2)
    set((state) => ({
      xpPopQueue: [...state.xpPopQueue, { id, amount, x, y }],
    }))
    setTimeout(() => get().removeXpPop(id), 1200)
  },

  removeXpPop: (id) => {
    set((state) => ({
      xpPopQueue: state.xpPopQueue.filter((p) => p.id !== id),
    }))
  },

  updateUserXp: (xpGained) => {
    set((state) => {
      if (!state.user) return {}
      const newXp = state.user.xp + xpGained
      const { calculateLevel } = require('@/lib/gamification')
      return {
        user: { ...state.user, xp: newXp, level: calculateLevel(newXp) },
      }
    })
  },

  reorderHabits: (newOrder) => set({ habits: newOrder }),
}))
