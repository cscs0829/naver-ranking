import { supabase, checkSupabaseConfig } from './supabase'

export interface ApiKey {
  id: number
  key_name: string
  key_value: string
  is_active: boolean
  description?: string
  created_at: string
  updated_at: string
}

export interface ApiKeyProfile {
  id: number
  name: string
  client_id: string
  client_secret: string
  api_type: 'shopping' | 'insights'
  is_active: boolean
  is_default: boolean
  created_at: string
  updated_at: string
}

export async function getNaverApiKeys(): Promise<{ clientId: string; clientSecret: string } | null> {
  checkSupabaseConfig()
  if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.')
  
  const { data, error } = await supabase
    .from('api_keys')
    .select('key_name, key_value')
    .in('key_name', ['NAVER_CLIENT_ID', 'NAVER_CLIENT_SECRET'])
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching Naver API keys:', error)
    return null
  }

  const clientId = data?.find(key => key.key_name === 'NAVER_CLIENT_ID')?.key_value
  const clientSecret = data?.find(key => key.key_name === 'NAVER_CLIENT_SECRET')?.key_value

  if (!clientId || !clientSecret) {
    console.error('NAVER_CLIENT_ID or NAVER_CLIENT_SECRET not found or inactive in DB.')
    return null
  }

  return { clientId, clientSecret }
}

export async function getActiveProfile(profileId?: number, apiType: 'shopping' | 'insights' = 'shopping'): Promise<{ clientId: string; clientSecret: string } | null> {
  checkSupabaseConfig()
  if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.')

  let query = supabase.from('api_key_profiles').select('*').eq('is_active', true).eq('api_type', apiType)
  if (profileId) {
    query = query.eq('id', profileId)
  } else {
    query = query.eq('is_default', true)
  }
  const { data, error } = await query.limit(1)
  if (error) {
    console.error('Error fetching active profile:', error)
    return null
  }
  const p = data?.[0]
  if (!p) return null
  return { clientId: p.client_id, clientSecret: p.client_secret }
}

export async function getAllProfiles(apiType?: 'shopping' | 'insights'): Promise<ApiKeyProfile[]> {
  checkSupabaseConfig()
  if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.')
  
  let query = supabase
    .from('api_key_profiles')
    .select('*')
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })
  
  if (apiType) {
    query = query.eq('api_type', apiType)
  }
  
  const { data, error } = await query
  if (error) {
    console.error('Error fetching profiles:', error)
    return []
  }
  return data || []
}

export async function upsertProfile(name: string, clientId: string, clientSecret: string, apiType: 'shopping' | 'insights' = 'shopping', makeDefault?: boolean, id?: number): Promise<boolean> {
  checkSupabaseConfig()
  if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.')
  const payload: any = { name, client_id: clientId, client_secret: clientSecret, api_type: apiType, is_active: true }
  if (typeof makeDefault !== 'undefined') payload.is_default = makeDefault
  const { error } = await supabase
    .from('api_key_profiles')
    .upsert(id ? { id, ...payload } : payload)
  if (error) {
    console.error('Error upserting profile:', error)
    return false
  }
  if (makeDefault) {
    // 같은 API 타입 내에서만 기본값 설정
    await supabase
      .from('api_key_profiles')
      .update({ is_default: false })
      .eq('api_type', apiType)
      .neq('name', name)
  }
  return true
}

export async function setDefaultProfile(id: number): Promise<boolean> {
  checkSupabaseConfig()
  if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.')
  const { error } = await supabase.from('api_key_profiles').update({ is_default: true }).eq('id', id)
  if (error) {
    console.error('Error setting default profile:', error)
    return false
  }
  await supabase.from('api_key_profiles').update({ is_default: false }).neq('id', id)
  return true
}

export async function deactivateProfile(id: number): Promise<boolean> {
  checkSupabaseConfig()
  if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.')
  const { error } = await supabase.from('api_key_profiles').update({ is_active: false, is_default: false }).eq('id', id)
  if (error) {
    console.error('Error deactivating profile:', error)
    return false
  }
  return true
}

export async function deleteApiKey(keyName: string): Promise<boolean> {
  checkSupabaseConfig()
  if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.')
  const { error } = await supabase.from('api_keys').delete().eq('key_name', keyName)
  if (error) {
    console.error('Error deleting api key:', error)
    return false
  }
  return true
}

export async function deleteProfile(id: number): Promise<boolean> {
  checkSupabaseConfig()
  if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.')
  const { error } = await supabase.from('api_key_profiles').delete().eq('id', id)
  if (error) {
    console.error('Error deleting profile:', error)
    return false
  }
  return true
}

export async function getAllApiKeys(): Promise<ApiKey[]> {
  checkSupabaseConfig()
  if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.')
  
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all API keys:', error)
    return []
  }
  return data || []
}

export async function upsertApiKey(keyName: string, keyValue: string, description?: string): Promise<boolean> {
  checkSupabaseConfig()
  if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.')
  
  const { error } = await supabase
    .from('api_keys')
    .upsert({ key_name: keyName, key_value: keyValue, description, is_active: true }, { onConflict: 'key_name' })

  if (error) {
    console.error('Error upserting API key:', error)
    return false
  }
  return true
}

export async function deactivateApiKey(keyName: string): Promise<boolean> {
  checkSupabaseConfig()
  if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.')
  
  const { error } = await supabase
    .from('api_keys')
    .update({ is_active: false })
    .eq('key_name', keyName)

  if (error) {
    console.error('Error deactivating API key:', error)
    return false
  }
  return true
}