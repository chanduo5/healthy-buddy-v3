'use client'
// components/habits/HabitGrid.tsx  — FIXED: dynamic DnD to avoid SSR crash
import { useState, useEffect } from 'react'
import { useHabitStore } from '@/lib/store'
import { Habit } from '@/types'
import HabitCard from './HabitCard'
import { Plus, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Dynamic import of DnD to avoid SSR issues
import dynamic from 'next/dynamic'
const DragDropContext = dynamic(() => import('@hello-pangea/dnd').then(m => m.DragDropContext), { ssr: false })
const Droppable      = dynamic(() => import('@hello-pangea/dnd').then(m => m.Droppable),      { ssr: false })
const Draggable      = dynamic(() => import('@hello-pangea/dnd').then(m => m.Draggable),      { ssr: false })

interface Props { habits: Habit[]; onAddHabit: () => void }

export default function HabitGrid({ habits, onAddHabit }: Props) {
  const { reorderHabits } = useHabitStore()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  async function onDragEnd(result: any) {
    if (!result.destination) return
    const items = Array.from(habits)
    const [moved] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, moved)
    reorderHabits(items)
    fetch('/api/habits/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: items.map(h => h.id) }),
    }).catch(() => {})
  }

  if (habits.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-16 text-center">
        <div className="text-5xl mb-4">🌱</div>
        <h3 className="font-display text-xl font-semibold mb-2">No habits yet</h3>
        <p className="text-[var(--text-muted)] mb-6 text-sm">Add your first habit to start earning XP and streaks</p>
        <button onClick={onAddHabit} className="btn-primary gap-2 mx-auto">
          <Plus size={18} /> Add your first habit
        </button>
      </div>
    )
  }

  const completedCount = habits.filter(h => h.completed_today).length
  const allDone = completedCount === habits.length && habits.length > 0

  // Fallback grid (before DnD hydrates)
  if (!mounted) {
    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-xl font-semibold">Today's Habits</h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">{completedCount}/{habits.length} completed</p>
          </div>
          <button onClick={onAddHabit} className="btn-ghost gap-2 text-sm py-2 px-4">
            <Plus size={16} /> Add
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map(h => <HabitCard key={h.id} habit={h} />)}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-xl font-semibold">Today's Habits</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {completedCount}/{habits.length} completed
            {allDone && <span className="text-green-400 ml-2">— Perfect day! 🏆</span>}
          </p>
        </div>
        <button onClick={onAddHabit} className="btn-ghost gap-2 text-sm py-2 px-4">
          <Plus size={16} /> Add habit
        </button>
      </div>

      <AnimatePresence>
        {allDone && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
            className="glass-card border-green-500/30 rounded-xl p-4 mb-5 flex items-center gap-3">
            <Sparkles size={20} className="text-yellow-400" />
            <div>
              <p className="font-semibold text-sm">All habits complete!</p>
              <p className="text-xs text-[var(--text-muted)]">Amazing day. Keep the streak alive tomorrow.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="habits">
          {(provided: any) => (
            <div ref={provided.innerRef} {...provided.droppableProps}
              className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {habits.map((habit, index) => (
                <Draggable key={habit.id} draggableId={habit.id} index={index}>
                  {(drag: any, snapshot: any) => (
                    <motion.div ref={drag.innerRef} {...drag.draggableProps}
                      initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                      transition={{ delay: index * 0.04 }}
                      className={snapshot.isDragging ? 'opacity-90 scale-[1.03] z-50' : ''}>
                      <HabitCard habit={habit} dragHandleProps={drag.dragHandleProps} />
                    </motion.div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
