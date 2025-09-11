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
        if (res.status === 401) {
          window.location.href = '/auth/signin'
          return
        }
        if (!res.ok) {
          const txt = await res.text().catch(()=> 'Failed')
          throw new Error(txt || 'Failed')
        }
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

  const [pwState, setPwState] = useState<{cur:string; next:string; confirm:string; saving:boolean; msg:string|null}>({cur:'',next:'',confirm:'',saving:false,msg:null})
  const [cancelState, setCancelState] = useState<{loading:boolean; msg:string|null}>({loading:false,msg:null})
  const [subStatus, setSubStatus] = useState<{status?:string; next?:string} | null>(null)

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const res = await fetch('/api/me/subscription/status')
      if (res.ok) {
      const j = await res.json()
    setSubStatus({ status: j.status, next: j.nextBillingTime })
  }
  } catch {}
  }
  if (data?.plan && data.plan !== 'FREE') loadStatus()
  }, [data?.plan])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (pwState.next !== pwState.confirm) {
      setPwState(s => ({...s, msg: 'Passwords do not match'})); return
    }
    setPwState(s => ({...s, saving:true, msg:null}))
    try {
      const res = await fetch('/api/me/password', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ currentPassword: pwState.cur, newPassword: pwState.next }) })
      if (res.ok) setPwState({cur:'',next:'',confirm:'',saving:false,msg:'Password updated'})
      else setPwState(s => ({...s, saving:false, msg: 'Update failed'}))
    } catch { setPwState(s => ({...s, saving:false, msg:'Error'})) }
  }

  async function cancelSubscription() {
    setCancelState({loading:true,msg:null})
    try {
      const res = await fetch('/api/me/subscription/cancel', { method:'POST' })
      if (res.ok) { setCancelState({loading:false,msg:'Subscription cancelled'}); window.location.reload() }
      else {
        const txt = await res.text().catch(()=> null)
        setCancelState({loading:false,msg: txt || 'Cancellation failed'})
      }
    } catch { setCancelState({loading:false,msg:'Error'}) }
  }

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
            {subStatus?.next && (
              <div className="text-sm text-muted-foreground">Next payment: {new Date(subStatus.next).toLocaleString()}</div>
            )}
          </div>
          <div className="flex gap-2">
            <a href="#" aria-label="Go back" onClick={(e)=>{e.preventDefault(); history.back()}} className="px-4 py-2 rounded border">Back</a>
            <a href="/upgrade" className="px-4 py-2 rounded bg-accent text-accent-foreground">Upgrade</a>
            {(data?.plan === 'BASIC' || data?.plan === 'PREMIUM' || data?.plan === 'ANNUAL') && (
              <button onClick={cancelSubscription} className="px-4 py-2 rounded border" disabled={cancelState.loading}>
                {cancelState.loading ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            )}
          </div>
        </div>
        {cancelState.msg && <div className="text-sm mt-2">{cancelState.msg}</div>}
      </div>

      <div className="border rounded-md p-4 bg-card/50 mb-4">
        <div className="text-sm text-muted-foreground">Usage</div>
        <div className="text-lg">Searches used this month: {data?.searchesUsed ?? 0} / {data?.plan === 'BASIC' ? '5' : 'Unlimited'}</div>
      </div>

      <div className="border rounded-md p-4 bg-card/50">
        <div className="text-sm text-muted-foreground mb-2">Change password</div>
        <form onSubmit={changePassword} className="space-y-3">
          <input type="password" placeholder="Current password" className="w-full border rounded p-2 bg-background" value={pwState.cur} onChange={e=>setPwState(s=>({...s,cur:e.target.value}))} required />
          <input type="password" placeholder="New password (min 8 chars)" className="w-full border rounded p-2 bg-background" value={pwState.next} onChange={e=>setPwState(s=>({...s,next:e.target.value}))} required />
          <input type="password" placeholder="Confirm new password" className="w-full border rounded p-2 bg-background" value={pwState.confirm} onChange={e=>setPwState(s=>({...s,confirm:e.target.value}))} required />
          <button type="submit" className="px-4 py-2 rounded bg-accent text-accent-foreground" disabled={pwState.saving}>{pwState.saving?'Saving...':'Update Password'}</button>
        </form>
        {pwState.msg && <div className="text-sm mt-2">{pwState.msg}</div>}
      </div>
    </div>
  )
}
