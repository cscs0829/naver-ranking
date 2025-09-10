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