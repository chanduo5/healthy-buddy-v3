'use client'
// lib/theme.tsx — theme engine with localStorage persistence
import { createContext, useContext, useEffect, useState } from 'react'

export type ThemeAccent = 'green' | 'blue' | 'purple' | 'orange' | 'pink' | 'cyan'
export type ThemeDarkness = 'darker' | 'dark' | 'midnight'
export type ThemeFont = 'default' | 'mono' | 'rounded'

export interface Theme {
  accent:   ThemeAccent
  darkness: ThemeDarkness
  font:     ThemeFont
  glassIntensity: 'low' | 'medium' | 'high'
}

const DEFAULT_THEME: Theme = {
  accent: 'green', darkness: 'dark', font: 'default', glassIntensity: 'medium'
}

// Accent palettes: [primary, glow, mesh1, mesh2]
const ACCENT_MAP: Record<ThemeAccent, { primary: string; glow: string; mesh1: string; mesh2: string; textDark: string }> = {
  green:  { primary: '#4ade80', glow: 'rgba(74,222,128,0.25)',  mesh1: 'rgba(74,222,128,0.12)',  mesh2: 'rgba(167,139,250,0.08)', textDark: '#052e16' },
  blue:   { primary: '#60a5fa', glow: 'rgba(96,165,250,0.25)',  mesh1: 'rgba(96,165,250,0.12)',  mesh2: 'rgba(74,222,128,0.06)',  textDark: '#1e3a5f' },
  purple: { primary: '#a78bfa', glow: 'rgba(167,139,250,0.25)', mesh1: 'rgba(167,139,250,0.12)', mesh2: 'rgba(96,165,250,0.07)',  textDark: '#2e1065' },
  orange: { primary: '#fb923c', glow: 'rgba(251,146,60,0.25)',  mesh1: 'rgba(251,146,60,0.12)',  mesh2: 'rgba(245,158,11,0.08)', textDark: '#431407' },
  pink:   { primary: '#f472b6', glow: 'rgba(244,114,182,0.25)', mesh1: 'rgba(244,114,182,0.12)', mesh2: 'rgba(167,139,250,0.07)', textDark: '#500724' },
  cyan:   { primary: '#22d3ee', glow: 'rgba(34,211,238,0.25)',  mesh1: 'rgba(34,211,238,0.12)',  mesh2: 'rgba(96,165,250,0.08)', textDark: '#083344' },
}

const DARKNESS_MAP: Record<ThemeDarkness, { bg1: string; bg2: string; bg3: string }> = {
  midnight: { bg1: '#020407', bg2: '#060a0f', bg3: '#0a0f14' },
  dark:     { bg1: '#080d08', bg2: '#0d1a0d', bg3: '#111f11' },
  darker:   { bg1: '#0a0505', bg2: '#140a0a', bg3: '#1a0f0f' },
}

const GLASS_MAP: Record<string, { g1: string; g2: string; g3: string; border: string }> = {
  low:    { g1: 'rgba(255,255,255,0.03)', g2: 'rgba(255,255,255,0.06)', g3: 'rgba(255,255,255,0.09)', border: 'rgba(255,255,255,0.07)' },
  medium: { g1: 'rgba(255,255,255,0.05)', g2: 'rgba(255,255,255,0.09)', g3: 'rgba(255,255,255,0.13)', border: 'rgba(255,255,255,0.11)' },
  high:   { g1: 'rgba(255,255,255,0.08)', g2: 'rgba(255,255,255,0.13)', g3: 'rgba(255,255,255,0.18)', border: 'rgba(255,255,255,0.16)' },
}

interface ThemeContextType {
  theme: Theme
  setTheme: (t: Partial<Theme>) => void
}

const ThemeCtx = createContext<ThemeContextType>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hb-theme')
      if (saved) setThemeState({ ...DEFAULT_THEME, ...JSON.parse(saved) })
    } catch {}
  }, [])

  useEffect(() => {
    applyTheme(theme)
    try { localStorage.setItem('hb-theme', JSON.stringify(theme)) } catch {}
  }, [theme])

  function setTheme(partial: Partial<Theme>) {
    setThemeState(prev => ({ ...prev, ...partial }))
  }

  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>
}

export function useTheme() { return useContext(ThemeCtx) }

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const accent  = ACCENT_MAP[theme.accent]
  const bg      = DARKNESS_MAP[theme.darkness]
  const glass   = GLASS_MAP[theme.glassIntensity]

  root.style.setProperty('--accent-primary',   accent.primary)
  root.style.setProperty('--accent-glow',       accent.glow)
  root.style.setProperty('--accent-text-dark',  accent.textDark)
  root.style.setProperty('--mesh-color-1',      accent.mesh1)
  root.style.setProperty('--mesh-color-2',      accent.mesh2)

  root.style.setProperty('--bg-primary',        bg.bg1)
  root.style.setProperty('--bg-secondary',      bg.bg2)
  root.style.setProperty('--bg-tertiary',       bg.bg3)

  root.style.setProperty('--glass-1',           glass.g1)
  root.style.setProperty('--glass-2',           glass.g2)
  root.style.setProperty('--glass-3',           glass.g3)
  root.style.setProperty('--glass-border',      glass.border)

  // Font
  const fontMap: Record<ThemeFont, string> = {
    default: '"Plus Jakarta Sans", sans-serif',
    mono:    '"JetBrains Mono", monospace',
    rounded: '"Space Grotesk", sans-serif',
  }
  root.style.setProperty('--font-ui', fontMap[theme.font])
  document.body.style.fontFamily = fontMap[theme.font]
}
