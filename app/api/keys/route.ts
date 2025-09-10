import { NextRequest, NextResponse } from 'next/server'
import { getAllApiKeys, upsertApiKey, deactivateApiKey } from '../../utils/api-keys'

// GET: 모든 API 키 조회
export async function GET() {
  try {
    const keys = await getAllApiKeys()
    return NextResponse.json({ keys }, { status: 200 })
  } catch (error) {
    console.error('API 키 조회 오류:', error)
    return NextResponse.json(
      { error: 'API 키 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST: API 키 추가/수정
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { keyName, keyValue, description } = body

    if (!keyName || !keyValue) {
      return NextResponse.json(
        { error: '키 이름과 값은 필수입니다.' },
        { status: 400 }
      )
    }

    const success = await upsertApiKey(keyName, keyValue, description)
    
    if (success) {
      return NextResponse.json(
        { message: 'API 키가 성공적으로 저장되었습니다.' },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: 'API 키 저장에 실패했습니다.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('API 키 저장 오류:', error)
    return NextResponse.json(
      { error: 'API 키 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE: API 키 비활성화
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const keyName = searchParams.get('keyName')

    if (!keyName) {
      return NextResponse.json(
        { error: '키 이름이 필요합니다.' },
        { status: 400 }
      )
    }

    const success = await deactivateApiKey(keyName)
    
    if (success) {
      return NextResponse.json(
        { message: 'API 키가 비활성화되었습니다.' },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: 'API 키 비활성화에 실패했습니다.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('API 키 비활성화 오류:', error)
    return NextResponse.json(
      { error: 'API 키 비활성화 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
