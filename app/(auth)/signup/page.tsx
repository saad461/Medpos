import { SignupForm } from '@/components/auth/signup-form'

interface SignupPageProps {
  searchParams: {
    invite_token?: string
    email?: string
    name?: string
    role?: string
    store_name?: string
  }
}

export default function SignupPage({ searchParams }: SignupPageProps) {
  const isInvite = !!searchParams.invite_token

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
              &ldquo;MedPOS has completely transformed how we manage our pharmacy.
              Inventory management and POS have never been this easy.&rdquo;
            </p>
            <footer className="text-sm">Ahmed Khan, Al-Madina Pharmacy</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {isInvite ? 'Accept Your Invitation' : 'Create an account'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isInvite
                ? `Complete your registration to join ${searchParams.store_name} on MedPOS`
                : 'Enter your email below to create your account'}
            </p>
          </div>
          <SignupForm
            inviteData={isInvite ? {
              token: searchParams.invite_token!,
              email: searchParams.email!,
              name: searchParams.name!,
              role: searchParams.role!,
              storeName: searchParams.store_name!
            } : undefined}
          />
        </div>
      </div>
    </div>
  )
}
