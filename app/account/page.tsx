"use client"

import { useEffect, useState } from "react"

export default function AccountPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{ plan: string; searchesUsed: number; monthStart?: string; expiresAt?: string } | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/me/access')
        if (!res.ok) throw new Error(await res.text())
        const json = await res.json()
        setData(json)
      } catch (e) {
        setError('Failed to load account info')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Account</h1>
      <p className="text-muted-foreground mb-6">Manage your plan and usage</p>

      <div className="border rounded-md p-4 bg-card/50 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Current plan</div>
            <div className="text-xl font-semibold">{data?.plan || 'FREE'}</div>
            {data?.expiresAt && (
              <div className="text-sm text-muted-foreground">Expires on {new Date(data.expiresAt).toLocaleDateString()}</div>
            )}
          </div>
          <div className="flex gap-2">
            <a href="/" className="px-4 py-2 rounded border">Back</a>
            <a href="#upgrade" className="px-4 py-2 rounded bg-accent text-accent-foreground">Upgrade</a>
          </div>
        </div>
      </div>

      <div className="border rounded-md p-4 bg-card/50 mb-4">
        <div className="text-sm text-muted-foreground">Usage</div>
        <div className="text-lg">Searches used this month: {data?.searchesUsed ?? 0} / {data?.plan === 'BASIC' ? '5' : 'Unlimited'}</div>
      </div>

      <div className="border rounded-md p-4 bg-card/50">
        <div className="text-sm text-muted-foreground mb-2">Billing</div>
        <div className="text-sm">For Premium/Annual, your access updates immediately after payment is captured. Manage renewals via your PayPal account.</div>
      </div>
    </div>
  )
}
