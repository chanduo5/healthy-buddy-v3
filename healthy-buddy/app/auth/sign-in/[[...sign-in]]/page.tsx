// app/auth/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-mesh" />
      <div className="relative z-10">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🌿</div>
          <h1 className="font-display text-2xl font-bold text-gradient">Healthy Buddy</h1>
        </div>
        <SignIn />
      </div>
    </div>
  )
}
