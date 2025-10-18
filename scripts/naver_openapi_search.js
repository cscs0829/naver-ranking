#!/usr/bin/env node

// One-off Naver Shopping OpenAPI fetcher (no browser). Prints basic fields.
// Keys: pulled the same way as scripts/auto-search.js (Supabase api_key_profiles)
// Usage: node scripts/naver_openapi_search.js "푸꾸옥커플검색" [display=20] [sort=sim]

const https = require('https');
const { URL } = require('url');
const { createClient } = require('@supabase/supabase-js');

function getEnv(name) {
  return process.env[name] || '';
}

async function resolveNaverKeys() {
  // 1) Prefer explicit env override
  const envId = getEnv('NAVER_CLIENT_ID');
  const envSecret = getEnv('NAVER_CLIENT_SECRET');
  if (envId && envSecret) return { clientId: envId, clientSecret: envSecret };

  // 2) Fetch from Supabase default api_key_profiles (is_default=true, is_active=true)
  const supabaseUrl = getEnv('SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseKey = getEnv('SUPABASE_SERVICE_KEY') || getEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase env missing and NAVER_CLIENT_ID/SECRET not provided.');
  }
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: profile, error } = await supabase
    .from('api_key_profiles')
    .select('*')
    .eq('is_default', true)
    .eq('is_active', true)
    .limit(1)
    .single();
  if (error || !profile) {
    throw new Error('Failed to load default api_key_profiles from Supabase.');
  }
  if (!profile.client_id || !profile.client_secret) {
    throw new Error('api_key_profiles missing client_id/client_secret.');
  }
  return { clientId: profile.client_id, clientSecret: profile.client_secret };
}

async function main() {
  const query = process.argv[2] || '푸꾸옥커플검색';
  const display = Number(process.argv[3] || 20);
  const sort = process.argv[4] || 'sim'; // sim|date|asc|dsc

  const { clientId, clientSecret } = await resolveNaverKeys();

  const endpoint = new URL('https://openapi.naver.com/v1/search/shop.json');
  endpoint.searchParams.set('query', query);
  endpoint.searchParams.set('display', String(display));
  endpoint.searchParams.set('start', '1');
  endpoint.searchParams.set('sort', sort);

  const options = {
    headers: {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret,
      'Accept': 'application/json'
    }
  };

  https.get(endpoint, options, (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const items = Array.isArray(json.items) ? json.items : [];
        const simplified = items.map((it, idx) => ({
          index: idx + 1,
          title: it.title?.replace(/<[^>]*>/g, '') || '',
          mallName: it.mallName || '',
          brand: it.brand || '',
          price: it.lprice || '',
          link: it.link || ''
        }));
        console.table(simplified);
        console.log('\nJSON_START');
        console.log(JSON.stringify({ query, sort, display, items: simplified }, null, 2));
        console.log('JSON_END');
      } catch (e) {
        console.error('Failed to parse response:', e.message);
        console.error(data);
        process.exit(2);
      }
    });
  }).on('error', (err) => {
    console.error('Request error:', err.message);
    process.exit(3);
  });
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e.message || e);
    process.exit(1);
  });
}


