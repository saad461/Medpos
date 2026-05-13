import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'

interface LoginPageProps {
  searchParams: {
    demo?: string
  }
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const isDemo = searchParams.demo === 'true'

  return (
    <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-[#1E3A5F]" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <span className="text-2xl font-bold">MedPOS</span>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;The best pharmacy management system in Pakistan. The POS is lightning fast and inventory tracking is seamless.&rdquo;
            </p>
            <footer className="text-sm">Dr. Sarah Ahmed, Green Cross Pharmacy</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {isDemo ? 'Try the Demo' : 'Welcome back'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isDemo
                ? 'Sign in with demo credentials to explore MedPOS'
                : 'Enter your credentials to access your store'}
            </p>
          </div>
          <LoginForm isDemo={isDemo} />
          {!isDemo && (
            <p className="px-8 text-center text-sm text-muted-foreground">
              New to MedPOS?{' '}
              <Link
                href="/signup"
                className="underline underline-offset-4 hover:text-primary font-bold"
              >
                Create an account
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
