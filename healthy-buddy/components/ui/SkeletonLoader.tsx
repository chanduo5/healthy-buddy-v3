'use client'
// components/ui/SkeletonLoader.tsx
import { motion } from 'framer-motion'

interface SkeletonLoaderProps {
  className?: string
  lines?: number
}

export function SkeletonLoader({ className = '', lines = 1 }: SkeletonLoaderProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className="h-4 bg-white/10 rounded mb-2 last:mb-0"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1
          }}
        />
      ))}
    </div>
  )
}

export function HabitCardSkeleton() {
  return (
    <div className="glass-card habit-card rounded-xl p-4">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Drag handle skeleton */}
          <div className="w-4 h-4 bg-white/10 rounded animate-pulse" />

          {/* Icon + name skeleton */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-6 h-6 bg-white/10 rounded animate-pulse" />
              <div className="h-4 bg-white/10 rounded flex-1 animate-pulse" />
            </div>
            <div className="h-3 bg-white/5 rounded w-3/4 animate-pulse" />
          </div>
        </div>

        {/* Menu skeleton */}
        <div className="w-7 h-7 bg-white/10 rounded-lg animate-pulse" />
      </div>

      {/* Badges row skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-5 bg-white/10 rounded-full w-16 animate-pulse" />
        <div className="h-5 bg-white/10 rounded-full w-12 animate-pulse" />
        <div className="h-5 bg-white/10 rounded-full w-14 animate-pulse" />
      </div>

      {/* Complete button skeleton */}
      <div className="w-full py-2.5 rounded-xl bg-white/5 animate-pulse" />
    </div>
  )
}

export function HabitGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <HabitCardSkeleton />
        </motion.div>
      ))}
    </div>
  )
}