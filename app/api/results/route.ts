import { NextRequest, NextResponse } from 'next/server'
import { supabase, checkSupabaseConfig } from '@/utils/supabase'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  try {
    checkSupabaseConfig()
    if (!supabase) {
      throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.')
    }
    
    const { searchParams } = new URL(request.url)
    const searchQuery = searchParams.get('searchQuery')
    const targetMallName = searchParams.get('targetMallName')
    const exportExcel = searchParams.get('export') === 'excel'
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const rankSortOrder = searchParams.get('rankSortOrder') || 'asc' // 순위 정렬 순서

    let query = supabase
      .from('search_results')
      .select('*')

    // 정렬 옵션에 따른 쿼리 변경
    switch (sortBy) {
      case 'search_query':
        query = query.order('search_query', { ascending: sortOrder === 'asc' })
        break
      case 'total_rank':
        // 순위 정렬인 경우 rankSortOrder 사용
        query = query.order('total_rank', { ascending: rankSortOrder === 'asc' })
        break
      case 'mall_name':
        query = query.order('mall_name', { ascending: sortOrder === 'asc' })
        break
      case 'created_at':
      default:
        query = query.order('created_at', { ascending: sortOrder === 'asc' })
    }

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

    if (exportExcel) {
      const exportRows = (data || []).map((r: any) => ({
        검색어: r.search_query,
        상품명: (r.product_title || '').replaceAll('\n',' '),
        몰명: r.mall_name,
        브랜드: r.brand || '',
        가격: r.price || '',
        페이지: r.page,
        페이지내순위: r.rank_in_page,
        전체순위: r.total_rank,
        링크: r.product_link || '',
        생성일시: r.created_at || ''
      }))
      const ws = XLSX.utils.json_to_sheet(exportRows, { header: ['검색어','상품명','몰명','브랜드','가격','페이지','페이지내순위','전체순위','링크','생성일시'] })
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'results')
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="results.xlsx"'
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: data || []
    })

  } catch (error) {
    console.error('결과 조회 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', detail: error instanceof Error ? error.message : String(error) },
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
    const deleteAll = searchParams.get('deleteAll') === 'true'

    // 전체 삭제인 경우
    if (deleteAll) {
      const { error } = await supabase
        .from('search_results')
        .delete()
        .neq('id', 0) // 모든 데이터 삭제

      if (error) {
        console.error('전체 데이터 삭제 중 오류:', error)
        return NextResponse.json(
          { error: '전체 데이터 삭제 중 오류가 발생했습니다.' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: '모든 데이터가 삭제되었습니다.'
      })
    }

    // 개별 삭제인 경우
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
      { error: '서버 오류가 발생했습니다.', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
