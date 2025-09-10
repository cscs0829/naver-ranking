import { NextRequest, NextResponse } from 'next/server'
import { supabase, checkSupabaseConfig } from '@/utils/supabase'

export async function GET(request: NextRequest) {
  try {
    checkSupabaseConfig()
    if (!supabase) {
      throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.')
    }
    
    const { searchParams } = new URL(request.url)
    const searchQuery = searchParams.get('searchQuery')
    const targetMallName = searchParams.get('targetMallName')

    let query = supabase
      .from('search_results')
      .select('*')
      .order('created_at', { ascending: false })

    if (searchQuery) {
      query = query.eq('search_query', searchQuery)
    }

    if (targetMallName) {
      query = query.eq('target_mall_name', targetMallName)
    }

    const { data, error } = await query

    if (error) {
      console.error('데이터 조회 중 오류:', error)
      return NextResponse.json(
        { error: '데이터 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || []
    })

  } catch (error) {
    console.error('결과 조회 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    checkSupabaseConfig()
    if (!supabase) {
      throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.')
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID는 필수입니다.' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('search_results')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('데이터 삭제 중 오류:', error)
      return NextResponse.json(
        { error: '데이터 삭제 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '데이터가 삭제되었습니다.'
    })

  } catch (error) {
    console.error('삭제 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
