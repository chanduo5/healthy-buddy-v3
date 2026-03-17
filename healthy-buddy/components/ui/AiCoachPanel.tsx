'use client'
// components/ui/AiCoachPanel.tsx  — FIXED: robust SSE handling
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Habit } from '@/types'
import { getLevelInfo, getMomentumLabel } from '@/lib/gamification'
import { Send, Bot, Sparkles, RefreshCw, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Message { role: 'user' | 'assistant'; content: string; id: string }

const QUICK_PROMPTS = [
  "How am I doing this week?",
  "Which habit should I focus on?",
  "Give me a motivation boost 🔥",
  "Suggest a micro-habit for today",
  "Why do I keep skipping my habits?",
]

interface Props { user: any; habits: Habit[]; momentum: number }

export default function AiCoachPanel({ user, habits, momentum }: Props) {
  const [messages, setMessages]   = useState<Message[]>([])
  const [input, setInput]         = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef  = useRef<HTMLDivElement>(null)
  const readerRef  = useRef<ReadableStreamDefaultReader | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cancel any in-flight stream when unmounting
  useEffect(() => () => { readerRef.current?.cancel().catch(() => {}) }, [])

  const buildContext = useCallback(() => {
    const levelInfo = getLevelInfo(user?.xp ?? 0)
    return {
      userName:       user?.display_name?.split(' ')[0] ?? 'Champion',
      level:          levelInfo.level,
      totalXp:        user?.xp ?? 0,
      currentStreak:  user?.current_streak ?? 0,
      momentum,
      weekCompletion: Math.round((habits.filter(h => h.completed_today).length / Math.max(habits.length, 1)) * 100),
      activeHabits:   habits.map(h => ({
        name: h.name, difficulty: h.difficulty,
        streak: h.current_streak, completedToday: h.completed_today ?? false,
      })),
      recentBadges: [],
    }
  }, [user, habits, momentum])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || streaming) return

    const userMsg: Message = { role: 'user', content: trimmed, id: `u-${Date.now()}` }
    const assistantId = `a-${Date.now()}`

    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '', id: assistantId }])
    setInput('')
    setStreaming(true)

    try {
      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, context: buildContext() }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(err.error ?? `HTTP ${res.status}`)
      }

      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      readerRef.current = reader
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') { setStreaming(false); break }
          try {
            const parsed = JSON.parse(payload)
            if (parsed.text) {
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: m.content + parsed.text } : m
              ))
            }
          } catch { /* ignore malformed chunk */ }
        }
      }
    } catch (err: any) {
      console.error('AI coach panel error:', err)
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: "Sorry, I couldn't connect right now. Check your ANTHROPIC_API_KEY in .env.local and try again! 🙏" }
          : m
      ))
      toast.error('AI coach unavailable — check your API key')
    } finally {
      setStreaming(false)
      readerRef.current = null
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col" style={{ height: 580 }}>
      {/* Header */}
      <div className="p-5 border-b border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <h2 className="font-display font-semibold">AI Coach</h2>
          <p className="text-xs text-[var(--text-muted)]">Powered by Claude · knows your habits</p>
        </div>
        {messages.length > 0 && (
          <button onClick={() => { setMessages([]); setStreaming(false) }}
            className="ml-auto p-2 rounded-lg hover:bg-white/10 text-[var(--text-muted)] transition-colors">
            <RefreshCw size={15} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="mx-auto mb-3 text-purple-400" size={28} />
            <p className="font-display font-semibold mb-1">Your personal habit coach</p>
            <p className="text-sm text-[var(--text-muted)] mb-6">Ask anything about your habits, progress, or get personalised advice.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_PROMPTS.map(p => (
                <button key={p} onClick={() => sendMessage(p)} disabled={streaming}
                  className="text-xs px-3 py-1.5 glass-card rounded-full hover:bg-white/10 transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div key={msg.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                  <Bot size={13} className="text-white" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
                ${msg.role === 'user'
                  ? 'border text-[var(--text-primary)]'
                  : 'bg-white/6 text-[var(--text-primary)] border border-white/8'}`}
                style={msg.role === 'user' ? {
                  background: 'color-mix(in srgb, var(--accent-primary) 12%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--accent-primary) 25%, transparent)'
                } : {}}>
                {msg.content || (
                  streaming && msg.role === 'assistant'
                    ? <span className="flex items-center gap-1.5 text-purple-400">
                        <Loader2 size={14} className="animate-spin" /> Thinking...
                      </span>
                    : null
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={streaming ? 'Coach is typing...' : 'Ask your AI coach anything...'}
            disabled={streaming}
            className="input-glass flex-1 text-sm"
          />
          <button onClick={() => sendMessage(input)}
            disabled={!input.trim() || streaming}
            className="btn-primary px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed">
            {streaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] mt-2 text-center">
          Requires ANTHROPIC_API_KEY in .env.local
        </p>
      </div>
    </div>
  )
}
