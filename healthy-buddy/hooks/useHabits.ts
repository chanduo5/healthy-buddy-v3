// hooks/useHabits.ts — Custom hook for habit data & mutations
import { useCallback } from 'react'
import { useHabitStore } from '@/lib/store'
import { Habit } from '@/types'
import toast from 'react-hot-toast'

export function useHabits() {
  const store = useHabitStore()

  const refresh = useCallback(async () => {
    store.setLoading(true)
    try {
      const res = await fetch('/api/habits')
      const json = await res.json()
      if (json.data) store.setHabits(json.data)
    } finally {
      store.setLoading(false)
    }
  }, [])

  const createHabit = useCallback(async (data: Partial<Habit>) => {
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error)
    store.setHabits([...store.habits, { ...json.data, completed_today: false }])
    return json.data
  }, [store.habits])

  const updateHabit = useCallback(async (id: string, data: Partial<Habit>) => {
    const res = await fetch(`/api/habits/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error)
    store.setHabits(store.habits.map(h => h.id === id ? { ...h, ...json.data } : h))
    return json.data
  }, [store.habits])

  const deleteHabit = useCallback(async (id: string) => {
    const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Delete failed')
    store.setHabits(store.habits.filter(h => h.id !== id))
  }, [store.habits])

  return {
    habits: store.habits,
    isLoading: store.isLoading,
    refresh,
    createHabit,
    updateHabit,
    deleteHabit,
  }
}
