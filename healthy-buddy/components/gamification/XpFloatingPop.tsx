'use client'
// components/gamification/XpFloatingPop.tsx
interface Props { amount: number; x: number; y: number }

export default function XpFloatingPop({ amount, x, y }: Props) {
  return (
    <div
      className="xp-float"
      style={{ left: x, top: y, transform: 'translateX(-50%)' }}
    >
      +{amount} XP ⚡
    </div>
  )
}
