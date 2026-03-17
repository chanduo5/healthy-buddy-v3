'use client'
// app/upgrade/page.tsx
import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Check, Zap, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const FREE_FEATURES  = ['5 habits', 'XP & streak tracking', 'Basic heatmap', 'Pomodoro timer']
const PRO_FEATURES   = ['Unlimited habits', 'AI Coach (Claude)', 'Full year analytics', 'Badge collection', 'Priority support', 'Habit challenges', 'Data export', 'Everything in Free']

export default function UpgradePage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/create-checkout', { method: 'POST' })
      const { url } = await res.json()
      if (url) window.location.href = url
      else toast.error('Could not start checkout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="bg-mesh" />
      <div className="relative z-10 max-w-3xl mx-auto pt-10">

        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>

        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold mb-3">Unlock your full potential</h1>
          <p className="text-[var(--text-secondary)] text-lg">Upgrade to Pro for unlimited habits, AI coaching, and advanced analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-7">
            <p className="text-[var(--text-muted)] text-sm uppercase tracking-wider mb-2">Free</p>
            <p className="font-display text-4xl font-bold mb-1">$0</p>
            <p className="text-[var(--text-muted)] text-sm mb-6">Forever free</p>
            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <Check size={16} className="text-[var(--text-muted)]" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/dashboard" className="btn-ghost w-full text-center py-3">Current plan</Link>
          </motion.div>

          {/* Pro */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card-elevated rounded-2xl p-7 border border-green-500/20 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={18} className="text-yellow-400" />
              <p className="text-yellow-400 text-sm uppercase tracking-wider font-bold">Pro</p>
            </div>
            <p className="font-display text-4xl font-bold mb-1">$4.99</p>
            <p className="text-[var(--text-muted)] text-sm mb-6">per month, cancel anytime</p>
            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <Check size={16} className="text-green-400 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button onClick={handleUpgrade} disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Redirecting to checkout...' : 'Upgrade to Pro →'}
            </button>
            <p className="text-xs text-[var(--text-muted)] text-center mt-3">Secure payment via Stripe</p>
          </motion.div>
        </div>

        {/* FAQ */}
        <div className="mt-14 glass-card rounded-2xl p-8">
          <h2 className="font-display text-xl font-bold mb-6">Frequently asked</h2>
          <div className="space-y-5 text-sm">
            {[
              ['Can I cancel anytime?', 'Yes. Cancel from your account settings and you keep Pro access until the end of your billing period.'],
              ['What happens to my data if I downgrade?', 'Your history, heatmap, and XP are kept forever. If you have more than 5 active habits, the extras are archived (not deleted).'],
              ['Is the AI Coach unlimited on Pro?', 'Yes — unlimited messages with your Claude AI coach, with full context of your habits and progress.'],
            ].map(([q, a]) => (
              <div key={q}>
                <p className="font-semibold mb-1">{q}</p>
                <p className="text-[var(--text-secondary)]">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
