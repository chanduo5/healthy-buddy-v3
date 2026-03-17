'use client'
// components/ui/ThemeSettingsPanel.tsx
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme, ThemeAccent, ThemeDarkness, ThemeFont } from '@/lib/theme'
import { X, Palette, Monitor, Type, Layers } from 'lucide-react'

const ACCENTS: { key: ThemeAccent; color: string; label: string }[] = [
  { key: 'green',  color: '#4ade80', label: 'Forest'   },
  { key: 'blue',   color: '#60a5fa', label: 'Ocean'    },
  { key: 'purple', color: '#a78bfa', label: 'Nebula'   },
  { key: 'orange', color: '#fb923c', label: 'Ember'    },
  { key: 'pink',   color: '#f472b6', label: 'Sakura'   },
  { key: 'cyan',   color: '#22d3ee', label: 'Electric' },
]

const DARKNESS: { key: ThemeDarkness; label: string; desc: string }[] = [
  { key: 'midnight', label: 'Midnight', desc: 'Near-black' },
  { key: 'dark',     label: 'Dark',     desc: 'Default'    },
  { key: 'darker',   label: 'Ember',    desc: 'Warm dark'  },
]

const FONTS: { key: ThemeFont; label: string; sample: string }[] = [
  { key: 'default', label: 'Jakarta',  sample: 'Aa' },
  { key: 'rounded', label: 'Grotesk',  sample: 'Ag' },
  { key: 'mono',    label: 'Mono',     sample: '01' },
]

const GLASS: { key: 'low'|'medium'|'high'; label: string }[] = [
  { key: 'low',    label: 'Minimal' },
  { key: 'medium', label: 'Glass'   },
  { key: 'high',   label: 'Frosted' },
]

interface Props { open: boolean; onClose: () => void }

export default function ThemeSettingsPanel({ open, onClose }: Props) {
  const { theme, setTheme } = useTheme()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />

          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 h-full w-80 z-50 overflow-y-auto"
            style={{ background:'rgba(10,15,10,0.95)', backdropFilter:'blur(40px)', borderLeft:'1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Palette size={18} style={{ color: 'var(--accent-primary)' }} />
                <h2 className="font-display font-bold">Appearance</h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-[var(--text-muted)]">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-7">

              {/* Accent color */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Palette size={14} className="text-[var(--text-muted)]" />
                  <h3 className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-semibold">Accent Color</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {ACCENTS.map(a => (
                    <button key={a.key} onClick={() => setTheme({ accent: a.key })}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border
                        ${theme.accent === a.key
                          ? 'border-white/30 bg-white/10'
                          : 'border-white/5 bg-white/4 hover:bg-white/8'}`}>
                      <span className="w-4 h-4 rounded-full flex-shrink-0 shadow"
                        style={{ background: a.color, boxShadow: theme.accent === a.key ? `0 0 10px ${a.color}80` : 'none' }} />
                      {a.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Darkness */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Monitor size={14} className="text-[var(--text-muted)]" />
                  <h3 className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-semibold">Background</h3>
                </div>
                <div className="space-y-2">
                  {DARKNESS.map(d => (
                    <button key={d.key} onClick={() => setTheme({ darkness: d.key })}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all border
                        ${theme.darkness === d.key
                          ? 'border-[var(--accent-primary)] bg-white/8'
                          : 'border-white/5 bg-white/4 hover:bg-white/7'}`}>
                      <span className="font-medium">{d.label}</span>
                      <span className="text-xs text-[var(--text-muted)]">{d.desc}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Glass intensity */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Layers size={14} className="text-[var(--text-muted)]" />
                  <h3 className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-semibold">Glass Intensity</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {GLASS.map(g => (
                    <button key={g.key} onClick={() => setTheme({ glassIntensity: g.key })}
                      className={`py-2.5 rounded-xl text-xs font-medium transition-all border
                        ${theme.glassIntensity === g.key
                          ? 'border-[var(--accent-primary)] bg-white/10 text-[var(--text-primary)]'
                          : 'border-white/5 bg-white/4 text-[var(--text-muted)] hover:bg-white/8'}`}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Font */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Type size={14} className="text-[var(--text-muted)]" />
                  <h3 className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-semibold">Font Style</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {FONTS.map(f => (
                    <button key={f.key} onClick={() => setTheme({ font: f.key })}
                      className={`flex flex-col items-center py-3 rounded-xl text-xs transition-all border
                        ${theme.font === f.key
                          ? 'border-[var(--accent-primary)] bg-white/10'
                          : 'border-white/5 bg-white/4 hover:bg-white/8'}`}>
                      <span className="text-xl font-bold mb-1"
                        style={{ fontFamily: f.key === 'mono' ? '"JetBrains Mono"' : f.key === 'rounded' ? '"Space Grotesk"' : '"Plus Jakarta Sans"' }}>
                        {f.sample}
                      </span>
                      <span className="text-[var(--text-muted)]">{f.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Live preview swatch */}
              <section>
                <h3 className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-semibold mb-3">Preview</h3>
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
                      style={{ background: `var(--accent-primary)`, color: 'var(--accent-text-dark)' }}>
                      7
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Level 7 · Disciplined</p>
                      <p className="text-xs text-[var(--text-muted)]">2,840 XP</p>
                    </div>
                  </div>
                  <div className="xp-bar">
                    <div className="xp-bar-fill" style={{ width:'68%' }} />
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
