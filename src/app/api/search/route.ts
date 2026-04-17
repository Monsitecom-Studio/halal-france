import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '10')

  if (!q || q.length < 2) {
    return NextResponse.json([])
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('boucheries')
    .select('slug, name, city, dept, certification')
    .eq('is_approved', true)
    .or(`name.ilike.%${q}%,city.ilike.%${q}%`)
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}
