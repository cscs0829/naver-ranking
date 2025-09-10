import { NextResponse } from 'next/server'
import { supabase, checkSupabaseConfig } from '@/utils/supabase'

export async function GET() {
  try {
    checkSupabaseConfig()
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.')
    const { error } = await supabase.from('api_keys').select('id').limit(1)
    if (error) {
      return NextResponse.json({ ok: false, supabase: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true, supabase: true }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}


