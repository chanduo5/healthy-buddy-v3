'use client'
// app/page.tsx — Landing Page
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { 
  Zap, Target, Brain, Trophy, BarChart3, 
  Smartphone, ArrowRight, Star, Shield, Globe
} from 'lucide-react'

const FEATURES = [
  { icon: Zap, title: 'XP & Leveling', desc: 'Earn XP for every habit. Hard habits reward 3x more. Level up your real life.' },
  { icon: Target, title: 'Habit Streaks', desc: 'Build momentum with streak tracking. Break the chain and feel it.' },
  { icon: Brain, title: 'AI Coach', desc: 'Claude AI analyzes your patterns and gives personalized coaching advice.' },
  { icon: Trophy, title: 'Badges & Milestones', desc: 'Earn legendary badges for consistency. Rarity tiers keep it exciting.' },
  { icon: BarChart3, title: 'Year Heatmap', desc: 'GitHub-style 365-day heatmap. Turn your year into a visual trophy.' },
  { icon: Smartphone, title: 'Works Everywhere', desc: 'PWA support means it installs like a native app on any device.' },
]

const STATS = [
  { value: '10K+', label: 'Habits tracked' },
  { value: '500+', label: 'Active users' },
  { value: '4.9★', label: 'User rating' },
  { value: '30%', label: 'Better retention' },
]

export default function LandingPage() {
  const { isSignedIn } = useAuth()
  if (isSignedIn) redirect('/dashboard')

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="bg-mesh" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="font-display font-bold text-xl text-gradient">Healthy Buddy</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/sign-in" className="btn-ghost text-sm px-4 py-2">
            Sign in
          </Link>
          <Link href="/auth/sign-up" className="btn-primary text-sm px-4 py-2">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-8 text-sm">
            <Zap size={14} className="text-yellow-400" />
            <span className="text-text-secondary">Now with Claude AI coaching</span>
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full font-medium">New</span>
          </div>

          <h1 className="font-display text-6xl md:text-7xl font-bold leading-[1.05] mb-6">
            Master your routine.<br />
            <span className="text-gradient">Level up your life.</span>
          </h1>

          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
            A gamified habit ecosystem with XP, streaks, AI coaching, and a beautiful 
            glassmorphism dashboard. Stop tracking. Start becoming.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/auth/sign-up" className="btn-primary px-8 py-3 text-base gap-2">
              Start for free <ArrowRight size={18} />
            </Link>
            <Link href="#features" className="btn-ghost px-8 py-3 text-base">
              See features
            </Link>
          </div>
        </motion.div>

        {/* Hero preview card */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 glass-card-elevated rounded-2xl p-6 max-w-2xl mx-auto"
        >
          {/* Mini dashboard preview */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">Level 7 · Disciplined</p>
              <p className="font-display font-bold text-2xl">2,840 XP</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--text-muted)] mb-1">Today's streak</p>
              <p className="font-bold text-xl text-orange-400">🔥 12 days</p>
            </div>
          </div>
          <div className="xp-bar mb-4">
            <div className="xp-bar-fill" style={{ width: '68%' }} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['Morning Run 🏃', 'Meditate 🧘', 'Read 30min 📚'].map((h, i) => (
              <div key={i} className={`glass-card rounded-xl p-3 text-center text-sm font-medium ${i < 2 ? 'completed border-green-500/30' : ''}`}>
                {i < 2 && <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-[10px] mb-1 mx-auto">✓</div>}
                {h}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-5 text-center"
            >
              <p className="font-display font-bold text-3xl text-gradient">{s.value}</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display text-4xl font-bold mb-4">Everything you need to succeed</h2>
          <p className="text-[var(--text-secondary)] text-lg">Built with psychological habit-loop mechanics.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-card rounded-xl p-6"
            >
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                <f.icon size={20} className="text-green-400" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="glass-card-elevated rounded-2xl p-12">
          <h2 className="font-display text-4xl font-bold mb-4">Ready to level up?</h2>
          <p className="text-[var(--text-secondary)] mb-8">Join thousands building better habits. Free forever, Pro when you're ready.</p>
          <Link href="/auth/sign-up" className="btn-primary px-10 py-4 text-lg gap-2">
            Start for free <ArrowRight size={20} />
          </Link>
          <p className="text-xs text-[var(--text-muted)] mt-4">No credit card required. Free plan includes 5 habits.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-8 max-w-5xl mx-auto flex items-center justify-between text-[var(--text-muted)] text-sm">
        <div className="flex items-center gap-2">
          <span>🌿</span>
          <span>Healthy Buddy — Stop tracking. Start becoming.</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Terms</a>
          <a href="https://github.com/chanduo5/Healthy-Buddy" target="_blank" className="hover:text-[var(--text-primary)] transition-colors">GitHub</a>
        </div>
      </footer>
    </div>
  )
}
