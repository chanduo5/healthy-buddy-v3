// lib/gamification.ts — XP, level, badge logic
import { LevelInfo, LEVEL_TITLES, XP_BY_DIFFICULTY, Difficulty } from '@/types'

// ─── Level Calculation ────────────────────────────────
export function calculateLevel(xp: number): number {
  return Math.max(1, Math.floor(1 + Math.sqrt(xp / 100)))
}

export function xpForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100
}

export function getLevelInfo(totalXp: number): LevelInfo {
  const level = calculateLevel(totalXp)
  const xpForCurrentLevel = xpForLevel(level)
  const xpForNextLevel = xpForLevel(level + 1)
  const progress = Math.round(
    ((totalXp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100
  )

  // Find the closest title at or below current level
  const titleLevel = Math.max(...Object.keys(LEVEL_TITLES).map(Number).filter(l => l <= level))
  const title = LEVEL_TITLES[titleLevel] ?? 'Beginner'

  return { level, currentXp: totalXp, xpForCurrentLevel, xpForNextLevel, progress, title }
}

// ─── XP Calculation ──────────────────────────────────
export function calculateXpReward(difficulty: Difficulty, streakBonus: number = 0): number {
  const base = XP_BY_DIFFICULTY[difficulty]
  // +5% XP per 7 days of streak, capped at 50% bonus
  const bonus = Math.min(0.5, Math.floor(streakBonus / 7) * 0.05)
  return Math.round(base * (1 + bonus))
}

// ─── Momentum Score (0–100) ───────────────────────────
export function calculateMomentum(
  completedThisWeek: number,
  totalHabitsThisWeek: number,
  currentStreak: number
): number {
  if (totalHabitsThisWeek === 0) return 0
  const completionRate = (completedThisWeek / totalHabitsThisWeek) * 70
  const streakBonus = Math.min(30, currentStreak * 2)
  return Math.round(completionRate + streakBonus)
}

// ─── Heatmap Level ────────────────────────────────────
export function getHeatmapLevel(completed: number, total: number): 0 | 1 | 2 | 3 | 4 {
  if (total === 0 || completed === 0) return 0
  const ratio = completed / total
  if (ratio >= 1) return 4
  if (ratio >= 0.75) return 3
  if (ratio >= 0.5) return 2
  return 1
}

// ─── Badge Check ─────────────────────────────────────
export interface BadgeCheckInput {
  streak: number
  habitsCount: number
  level: number
  totalXp: number
}

export function checkBadgeEarned(
  conditionType: string,
  conditionValue: number,
  input: BadgeCheckInput
): boolean {
  switch (conditionType) {
    case 'streak': return input.streak >= conditionValue
    case 'habits_count': return input.habitsCount >= conditionValue
    case 'level': return input.level >= conditionValue
    case 'total_xp': return input.totalXp >= conditionValue
    default: return false
  }
}

// ─── AI Coaching Messages ────────────────────────────
export function getMomentumLabel(momentum: number): string {
  if (momentum >= 80) return 'Elite'
  if (momentum >= 60) return 'Strong'
  if (momentum >= 40) return 'Building'
  if (momentum >= 20) return 'Starting'
  return 'Dormant'
}

export function getMomentumColor(momentum: number): string {
  if (momentum >= 80) return '#4ade80'
  if (momentum >= 60) return '#60a5fa'
  if (momentum >= 40) return '#fb923c'
  if (momentum >= 20) return '#fbbf24'
  return '#94a3b8'
}
