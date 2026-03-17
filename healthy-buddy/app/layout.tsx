// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'react-hot-toast'
import { Plus_Jakarta_Sans, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/lib/theme'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'], variable: '--font-jakarta',
  weight: ['300','400','500','600','700','800'], display: 'swap',
})
const grotesk = Space_Grotesk({
  subsets: ['latin'], variable: '--font-grotesk',
  weight: ['300','400','500','600'], display: 'swap',
})
const mono = JetBrains_Mono({
  subsets: ['latin'], variable: '--font-mono-var',
  weight: ['400','500'], display: 'swap',
})

export const metadata: Metadata = {
  title: 'Healthy Buddy — Master Your Routine',
  description: 'Gamified habit tracker with AI coaching, XP leveling, and beautiful analytics.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'Healthy Buddy', statusBarStyle: 'black-translucent' },
}

export const viewport: Viewport = {
  themeColor: '#080d08',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#4ade80',
          colorBackground: '#0d1a0d',
          colorText: '#e2e8f0',
          colorInputBackground: 'rgba(255,255,255,0.06)',
          colorInputText: '#e2e8f0',
          borderRadius: '12px',
        },
      }}
    >
      <html lang="en" className={`${jakarta.variable} ${grotesk.variable} ${mono.variable}`}>
        <body className="antialiased">
          <ThemeProvider>
            {children}
          </ThemeProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'rgba(15,25,15,0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(74,222,128,0.2)',
                color: '#e2e8f0',
              },
              success: { iconTheme: { primary: '#4ade80', secondary: '#0a0f0a' } },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  )
}
