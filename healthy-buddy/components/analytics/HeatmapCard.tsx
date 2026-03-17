'use client'
// components/analytics/HeatmapCard.tsx
import { useEffect, useState } from 'react'
import { HeatmapDay } from '@/types'
import { format, parseISO, getDay, startOfWeek, eachWeekOfInterval, startOfYear } from 'date-fns'
import { motion } from 'framer-motion'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

interface Props { userId: string }

export default function HeatmapCard({ userId }: Props) {
  const [data, setData] = useState<HeatmapDay[]>([])
  const [loading, setLoading] = useState(true)
  const [tooltip, setTooltip] = useState<{ day: HeatmapDay; x: number; y: number } | null>(null)

  useEffect(() => {
    fetch('/api/habits/heatmap')
      .then(r => r.json())
      .then(json => { setData(json.data ?? []); setLoading(false) })
  }, [userId])

  const totalXp = data.reduce((s, d) => s + d.xp, 0)
  const totalCompleted = data.reduce((s, d) => s + d.count, 0)
  const activeDays = data.filter(d => d.count > 0).length
  const currentYear = new Date().getFullYear()

  // Build week-column grid
  const today = new Date()
  const yearStart = startOfYear(today)
  const weeks = eachWeekOfInterval({ start: yearStart, end: today })

  // Map date string → day
  const dayMap = new Map(data.map(d => [d.date, d]))

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-40 mb-4" />
        <div className="h-24 bg-white/5 rounded" />
      </div>
    )
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold mb-1">{currentYear} Activity</h2>
          <p className="text-sm text-[var(--text-muted)]">Your consistency at a glance</p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-right">
          <div>
            <p className="font-mono text-lg font-bold text-[var(--accent-green)]">{activeDays}</p>
            <p className="text-xs text-[var(--text-muted)]">active days</p>
          </div>
          <div>
            <p className="font-mono text-lg font-bold text-yellow-400">{totalXp.toLocaleString()}</p>
            <p className="text-xs text-[var(--text-muted)]">total XP</p>
          </div>
          <div>
            <p className="font-mono text-lg font-bold text-blue-400">{totalCompleted}</p>
            <p className="text-xs text-[var(--text-muted)]">completions</p>
          </div>
        </div>
      </div>

      {/* Day labels */}
      <div className="flex gap-0.5 mb-1 ml-8">
        {MONTHS.map(m => (
          <div key={m} className="text-[10px] text-[var(--text-muted)] flex-1 text-left">{m}</div>
        ))}
      </div>

      <div className="flex gap-1">
        {/* Day of week labels */}
        <div className="flex flex-col gap-0.5 mr-1">
          {DAYS.map((d, i) => (
            <div key={d} className={`text-[10px] text-[var(--text-muted)] h-[13px] flex items-center ${i % 2 !== 0 ? 'opacity-0' : ''}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-0.5 flex-1 overflow-x-auto">
          {weeks.map((weekStart, wi) => {
            const cells = Array.from({ length: 7 }, (_, di) => {
              const date = new Date(weekStart)
              date.setDate(date.getDate() + di)
              const dateStr = format(date, 'yyyy-MM-dd')
              return { date: dateStr, day: dayMap.get(dateStr) ?? null, future: date > today }
            })
            return (
              <div key={wi} className="flex flex-col gap-0.5">
                {cells.map(({ date, day, future }) => (
                  <motion.div
                    key={date}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: wi * 0.002 }}
                    className={`heatmap-cell w-[13px] h-[13px] heatmap-${future ? 0 : (day?.level ?? 0)}`}
                    onMouseEnter={(e) => {
                      if (!future && day) {
                        setTooltip({ day, x: e.clientX, y: e.clientY })
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px] text-[var(--text-muted)]">Less</span>
        {[0,1,2,3,4].map(l => (
          <div key={l} className={`w-3 h-3 rounded-sm heatmap-${l}`} />
        ))}
        <span className="text-[10px] text-[var(--text-muted)]">More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 glass-card-elevated rounded-lg px-3 py-2 text-xs pointer-events-none"
          style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
        >
          <p className="font-semibold">{format(parseISO(tooltip.day.date), 'MMM d, yyyy')}</p>
          <p className="text-[var(--text-muted)]">{tooltip.day.count} habits · +{tooltip.day.xp} XP</p>
        </div>
      )}
    </div>
  )
}
