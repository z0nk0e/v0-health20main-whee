"use client"

export default function PaymentSuccessPage() {
  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="border rounded-md p-6 bg-card/50">
        <h1 className="text-2xl font-bold mb-2">Payment Successful</h1>
        <p className="text-muted-foreground mb-4">
          Thank you! Your payment has been processed. Your account will reflect the new access shortly.
        </p>
        <div className="flex gap-2">
          <a href="/account" className="px-4 py-2 rounded bg-accent text-accent-foreground">Go to Account</a>
          <a href="/" className="px-4 py-2 rounded border">Back to Dashboard</a>
        </div>
      </div>
    </div>
  )
}
