// app/auth/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-mesh" />
      <div className="relative z-10">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🌿</div>
          <h1 className="font-display text-2xl font-bold text-gradient">Join Healthy Buddy</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Start earning XP for your habits today</p>
        </div>
        <SignUp />
      </div>
    </div>
  )
}
