import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDb } from '@/lib/db/connection'
import { usZipcodes, drugs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { searchPrescribers } from '@/lib/db/queries'
import { getOrCreateUserAccess, canConsumeSearch, consumeSearch } from '@/lib/db/access'

export async function POST(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
    }

    const body = await request.json()
    console.log('[prescriber-search] body', body)

    const pharmaName = String(body?.pharmaName || '').trim()
    const zip = String(body?.zip || '').trim()
    const radius = Number(body?.radius || 25)

    if (!pharmaName) {
      return NextResponse.json({ error: 'pharmaName is required' }, { status: 400 })
    }
    if (!zip || !/^\d{5}$/.test(zip)) {
      return NextResponse.json({ error: 'Valid 5-digit ZIP is required' }, { status: 400 })
    }

    // Entitlement gate (FREE blocked, BASIC limited)
    const access = await getOrCreateUserAccess(userId)
    const gate = await canConsumeSearch(userId)
    if (!gate.allowed) {
      return NextResponse.json({ error: 'Upgrade required', reason: gate.reason }, { status: 402 })
    }

    const db = getDb()

    // Lookup ZIP -> lat/lng, city, state
    const zipRows = await db
      .select({
        zipCode: usZipcodes.zipCode,
        latitude: usZipcodes.latitude,
        longitude: usZipcodes.longitude,
        city: usZipcodes.city,
        state: usZipcodes.state,
      })
      .from(usZipcodes)
      .where(eq(usZipcodes.zipCode, zip))
      .limit(1)

    const zipRow = zipRows[0]
    if (!zipRow) {
      return NextResponse.json({ error: 'ZIP not found' }, { status: 400 })
    }

    const lat = Number(zipRow.latitude)
    const lng = Number(zipRow.longitude)

    // Fetch drug meta for response fields
    const drugRows = await db
      .select({
        brandName: drugs.brandName,
        therapeuticClass: drugs.therapeuticClass,
        controlledSubstance: drugs.controlledSubstance,
      })
      .from(drugs)
      .where(eq(drugs.brandName, pharmaName.toUpperCase()))
      .limit(1)
    const drugMeta = drugRows[0]

    // Execute new DB-backed search
    const results = await searchPrescribers({ pharmaName, lat, lng, radius })

    // Record consumption for BASIC users
    await consumeSearch(userId)

    // Shape response to existing SearchResponse contract
    const response = {
      search_location: {
        zip,
        city: zipRow.city,
        state: zipRow.state,
      },
      search_params: {
        drug: pharmaName,
        drug_class: drugMeta?.therapeuticClass || '',
        therapeutic_class: drugMeta?.therapeuticClass || '',
        radius_miles: radius,
      },
      results_count: results.length,
      prescribers: results.map((r) => ({
        npi: Number(r.npi),
        name: r.name,
        specialty: r.specialty || '',
        specialty_group: '',
        address: {
          street: r.address.street || '',
          city: r.address.city || '',
          state: r.address.state || '',
          zip: r.address.zipCode || zip,
        },
        drug: {
          brand_name: pharmaName,
          generic_name: '',
          drug_class: drugMeta?.therapeuticClass || '',
          therapeutic_class: drugMeta?.therapeuticClass || '',
          drug_family: '',
          controlled_substance: Boolean(drugMeta?.controlledSubstance),
          controlled_schedule: '',
          route_of_administration: '',
        },
        distance_miles: Number(r.distance),
        total_claims: Number(r.totalClaims),
      })),
      is_premium: access.plan !== 'FREE',
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[prescriber-search] error', error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 })
  }
}
