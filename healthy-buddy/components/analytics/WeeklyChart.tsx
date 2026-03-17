'use client'
// components/analytics/WeeklyChart.tsx
import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { format, subDays, eachDayOfInterval } from 'date-fns'

Chart.register(...registerables)

interface DayData { date: string; completed: number; xp: number }

interface Props { data: DayData[] }

export default function WeeklyChart({ data }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    chartRef.current?.destroy()

    const last7 = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    })

    const labels = last7.map(d => format(d, 'EEE'))
    const dataMap = new Map(data.map(d => [d.date, d]))

    const completedData = last7.map(d => dataMap.get(format(d, 'yyyy-MM-dd'))?.completed ?? 0)
    const xpData = last7.map(d => dataMap.get(format(d, 'yyyy-MM-dd'))?.xp ?? 0)

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Habits completed',
            data: completedData,
            backgroundColor: 'rgba(74,222,128,0.4)',
            borderColor: 'rgba(74,222,128,0.8)',
            borderWidth: 1.5,
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: 'XP earned',
            data: xpData,
            backgroundColor: 'rgba(245,158,11,0.25)',
            borderColor: 'rgba(245,158,11,0.6)',
            borderWidth: 1.5,
            borderRadius: 6,
            borderSkipped: false,
            yAxisID: 'xp',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: {
            labels: { color: 'rgba(255,255,255,0.5)', font: { size: 12 }, boxWidth: 12 },
          },
          tooltip: {
            backgroundColor: 'rgba(15,25,15,0.95)',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            titleColor: '#f1f5f0',
            bodyColor: 'rgba(255,255,255,0.6)',
            padding: 10,
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 12 } },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 12 }, stepSize: 1 },
          },
          xp: {
            position: 'right',
            grid: { display: false },
            ticks: { color: 'rgba(245,158,11,0.5)', font: { size: 11 } },
          },
        },
      },
    })

    return () => chartRef.current?.destroy()
  }, [data])

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="font-display font-semibold mb-4">This week</h3>
      <div style={{ height: 200 }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}
