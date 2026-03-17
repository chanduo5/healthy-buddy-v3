// =====================================================
// HEALTHY BUDDY — Type Definitions
// =====================================================

export type Difficulty = 'easy' | 'medium' | 'hard'
export type Frequency = 'daily' | 'weekly' | 'custom'
export type Plan = 'free' | 'pro' | 'enterprise'
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface User {
  id: string
  clerk_id: string
  email: string
  username: string | null
  avatar_url: string | null
  display_name: string | null
  bio: string | null
  timezone: string
  xp: number
  level: number
  total_habits_completed: number
  longest_streak: number
  current_streak: number
  plan: Plan
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  description: string | null
  icon: string
  color: string
  difficulty: Difficulty
  xp_reward: number
  frequency: Frequency
  frequency_days: number[]
  target_count: number
  unit: string | null
  category: string
  is_active: boolean
  sort_order: number
  current_streak: number
  longest_streak: number
  last_completed: string | null
  created_at: string
  updated_at: string
  // Computed on client
  completed_today?: boolean
  completion_rate?: number // 0-100
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  completed_at: string
  date: string
  count: number
  xp_earned: number
  note: string | null
  mood: number | null
}

export interface XpTransaction {
  id: string
  user_id: string
  amount: number
  reason: string
  habit_id: string | null
  created_at: string
}

export interface Badge {
  id: string
  slug: string
  name: string
  description: string | null
  icon: string
  rarity: BadgeRarity
  xp_bonus: number
  condition_type: string
  condition_value: number
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  badge?: Badge
}

export interface PomodoroSession {
  id: string
  user_id: string
  habit_id: string | null
  duration: number
  completed: boolean
  started_at: string
  completed_at: string | null
}

export interface AiCoachMessage {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  context_data: Record<string, unknown> | null
  created_at: string
}

// ─── API Response Types ───────────────────────────────
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

// ─── Dashboard State ─────────────────────────────────
export interface DashboardStats {
  todayXp: number
  completedToday: number
  totalHabits: number
  currentStreak: number
  momentum: number      // 0-100 score
  weekCompletion: number // percentage
}

// ─── Heatmap Data ────────────────────────────────────
export interface HeatmapDay {
  date: string
  count: number          // habits completed
  xp: number
  level: 0 | 1 | 2 | 3 | 4  // 0=none, 4=all habits done
}

// ─── Gamification ────────────────────────────────────
export interface LevelInfo {
  level: number
  currentXp: number
  xpForCurrentLevel: number
  xpForNextLevel: number
  progress: number       // 0-100 percent
  title: string
}

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Beginner',
  2: 'Apprentice',
  3: 'Committed',
  4: 'Consistent',
  5: 'Rising Star',
  6: 'Dedicated',
  7: 'Disciplined',
  8: 'Focused',
  9: 'Elite',
  10: 'Champion',
  15: 'Master',
  20: 'Legendary',
  30: 'Mythic',
  50: 'Transcendent',
}

export const XP_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 30,
}

export const DIFFICULTY_LABELS: Record<Difficulty, { label: string; color: string; multiplier: string }> = {
  easy: { label: 'Easy', color: '#4ade80', multiplier: '1x XP' },
  medium: { label: 'Medium', color: '#fb923c', multiplier: '2x XP' },
  hard: { label: 'Hard', color: '#f43f5e', multiplier: '3x XP' },
}

// ─── AI Coach ────────────────────────────────────────
export interface AiCoachContext {
  userName: string
  level: number
  totalXp: number
  currentStreak: number
  momentum: number
  weekCompletion: number
  activeHabits: Array<{ name: string; difficulty: Difficulty; streak: number; completedToday: boolean }>
  recentBadges: string[]
}
