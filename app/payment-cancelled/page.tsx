"use client"

export default function PaymentCancelledPage() {
  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="border rounded-md p-6 bg-card/50">
        <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
        <p className="text-muted-foreground mb-4">
          Your payment was cancelled. No charges have been made to your account.
        </p>
        <div className="flex gap-2">
          <a href="/upgrade" className="px-4 py-2 rounded bg-accent text-accent-foreground">View Plans</a>
          <a href="#" onClick={(e)=>{e.preventDefault(); history.back()}} className="px-4 py-2 rounded border">Back</a>
        </div>
      </div>
    </div>
  )
}
