import { NextRequest, NextResponse } from 'next/server'
import { getAllApiKeys, upsertApiKey, deactivateApiKey, getAllProfiles, upsertProfile, setDefaultProfile, deactivateProfile, deleteApiKey, deleteProfile } from '@/utils/api-keys'
import { checkSupabaseConfig } from '@/utils/supabase'

// GET: 모든 API 키 조회
export async function GET() {
  try {
    checkSupabaseConfig()
    const keys = await getAllApiKeys()
    const profiles = await getAllProfiles()
    return NextResponse.json({ keys, profiles }, { status: 200 })
  } catch (error) {
    console.error('API 키 조회 오류:', error)
    return NextResponse.json(
      { error: 'API 키 조회 중 오류가 발생했습니다.', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST: API 키 추가/수정
export async function POST(request: NextRequest) {
  try {
    checkSupabaseConfig()
    const body = await request.json()
    const { keyName, keyValue, description, profile, setDefaultProfileId } = body

    if (setDefaultProfileId) {
      const ok = await setDefaultProfile(Number(setDefaultProfileId))
      if (ok) return NextResponse.json({ message: '기본 프로필이 설정되었습니다.' }, { status: 200 })
      return NextResponse.json({ error: '기본 프로필 설정에 실패했습니다.' }, { status: 500 })
    }

    if (profile) {
      const { name, clientId, clientSecret, apiType, makeDefault, id } = profile
      if (!name || !clientId || !clientSecret) {
        return NextResponse.json({ error: '프로필 name, clientId, clientSecret는 필수입니다.' }, { status: 400 })
      }
      const success = await upsertProfile(name, clientId, clientSecret, apiType || 'shopping', makeDefault, id)
      if (success) return NextResponse.json({ message: '프로필이 저장되었습니다.' }, { status: 200 })
      return NextResponse.json({ error: '프로필 저장에 실패했습니다.' }, { status: 500 })
    }

    if (!keyName || !keyValue) {
      return NextResponse.json({ error: '키 이름과 값은 필수입니다.' }, { status: 400 })
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
      { error: 'API 키 저장 중 오류가 발생했습니다.', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// DELETE: API 키 비활성화
export async function DELETE(request: NextRequest) {
  try {
    checkSupabaseConfig()
    const { searchParams } = new URL(request.url)
    const keyName = searchParams.get('keyName')
    const profileId = searchParams.get('profileId')
    const hard = searchParams.get('hard') === 'true'

    if (profileId) {
      const success = hard ? await deleteProfile(Number(profileId)) : await deactivateProfile(Number(profileId))
      if (success) return NextResponse.json({ message: hard ? '프로필이 삭제되었습니다.' : '프로필이 비활성화되었습니다.' }, { status: 200 })
      return NextResponse.json({ error: hard ? '프로필 삭제에 실패했습니다.' : '프로필 비활성화에 실패했습니다.' }, { status: 500 })
    }

    if (!keyName) {
      return NextResponse.json({ error: '키 이름이 필요합니다.' }, { status: 400 })
    }

    const success = hard ? await deleteApiKey(keyName) : await deactivateApiKey(keyName)
    
    if (success) {
      return NextResponse.json({ message: hard ? 'API 키가 삭제되었습니다.' : 'API 키가 비활성화되었습니다.' }, { status: 200 })
    } else {
      return NextResponse.json(
        { error: 'API 키 비활성화에 실패했습니다.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('API 키 비활성화 오류:', error)
    return NextResponse.json(
      { error: 'API 키 비활성화 중 오류가 발생했습니다.', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
