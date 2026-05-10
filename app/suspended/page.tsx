export default function SuspendedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-2xl font-bold mb-4 text-danger">Account Suspended</h1>
      <p className="text-muted-foreground">
        Your account has been suspended. Contact support.
      </p>
    </div>
  )
}
