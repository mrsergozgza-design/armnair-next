import { NextResponse } from 'next/server'
import { getUsdToAmd } from '@/lib/currency'

export const revalidate = 86400

export async function GET() {
  const rate = await getUsdToAmd()
  return NextResponse.json({ rate })
}
