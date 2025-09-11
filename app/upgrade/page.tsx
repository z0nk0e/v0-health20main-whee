"use client"

import { useEffect, useState } from "react"
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"

const basicId = process.env.NEXT_PUBLIC_PAYPAL_PLAN_BASIC_ID
const premiumId = process.env.NEXT_PUBLIC_PAYPAL_PLAN_PREMIUM_ID
const annualId = process.env.NEXT_PUBLIC_PAYPAL_PLAN_ANNUAL_ID

export default function UpgradePage() {
  const [clientId, setClientId] = useState<string | null>(null)
  useEffect(() => {
    setClientId(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || null)
  }, [])

  if (!clientId) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <a href="#" aria-label="Go back" onClick={(e)=>{e.preventDefault(); history.back()}} className="px-3 py-1.5 rounded border">Back</a>
          <a href="/" aria-label="Close upgrade" className="px-3 py-1.5 rounded border">✕</a>
        </div>
        <h1 className="text-2xl font-bold mb-2">Upgrade</h1>
        <p className="text-muted-foreground">PayPal is not configured. Set NEXT_PUBLIC_PAYPAL_CLIENT_ID env var.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <a href="#" aria-label="Go back" onClick={(e)=>{e.preventDefault(); history.back()}} className="px-3 py-1.5 rounded border">Back</a>
        <a href="/" aria-label="Close upgrade" className="px-3 py-1.5 rounded border">✕</a>
      </div>
      <h1 className="text-2xl font-bold mb-2">Choose your plan</h1>
      <p className="text-muted-foreground mb-6">Unlock access to prescriber search</p>

      <PayPalScriptProvider options={{ clientId, intent: "subscription", vault: true }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PlanCard title="Basic" price="$9.99/mo" description="Single-drug searches, all substances, 5 searches/month">
            {basicId ? (
              <>
                <PayPalButtons
                  style={{ layout: "vertical" }}
                  createSubscription={(data, actions) => actions.subscription.create({ plan_id: basicId! })}
                  onApprove={async (data) => {
                    try {
                      await fetch('/api/paypal/subscriptions/activate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscriptionId: data.subscriptionID }) })
                      window.location.href = '/account'
                    } catch {}
                  }}
                />
                <div className="mt-2 text-center">
                  <button onClick={()=>history.back()} className="text-sm underline text-muted-foreground">Cancel</button>
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Missing NEXT_PUBLIC_PAYPAL_PLAN_BASIC_ID</div>
            )}
          </PlanCard>

          <PlanCard title="Premium" price="$19.99/mo" description="Multi-drug, multi-zipcode, unlimited, priority support">
            {premiumId ? (
              <>
                <PayPalButtons
                  style={{ layout: "vertical" }}
                  createSubscription={(data, actions) => actions.subscription.create({ plan_id: premiumId! })}
                  onApprove={async (data) => {
                    try {
                      await fetch('/api/paypal/subscriptions/activate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscriptionId: data.subscriptionID }) })
                      window.location.href = '/account'
                    } catch {}
                  }}
                />
                <div className="mt-2 text-center">
                  <button onClick={()=>history.back()} className="text-sm underline text-muted-foreground">Cancel</button>
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Missing NEXT_PUBLIC_PAYPAL_PLAN_PREMIUM_ID</div>
            )}
          </PlanCard>

          <PlanCard title="Annual Premium" price="$199.99/yr" description="Everything in Premium, 2 months free, priority customer support">
            {annualId ? (
              <>
                <PayPalButtons
                  style={{ layout: "vertical" }}
                  createSubscription={(data, actions) => actions.subscription.create({ plan_id: annualId! })}
                  onApprove={async (data) => {
                    try {
                      await fetch('/api/paypal/subscriptions/activate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscriptionId: data.subscriptionID }) })
                      window.location.href = '/account'
                    } catch {}
                  }}
                />
                <div className="mt-2 text-center">
                  <button onClick={()=>history.back()} className="text-sm underline text-muted-foreground">Cancel</button>
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Missing NEXT_PUBLIC_PAYPAL_PLAN_ANNUAL_ID</div>
            )}
          </PlanCard>
        </div>
      </PayPalScriptProvider>
    </div>
  )
}

function PlanCard({ title, price, description, children }: { title: string; price: string; description: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-md p-4 bg-card/50">
      <div className="text-lg font-semibold">{title}</div>
      <div className="text-2xl font-bold">{price}</div>
      <div className="text-sm text-muted-foreground mb-4">{description}</div>
      {children}
    </div>
  )
}
