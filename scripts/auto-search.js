#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// 환경변수 확인
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경변수가 설정되지 않았습니다.');
  console.error('SUPABASE_URL과 SUPABASE_SERVICE_KEY를 설정해주세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 네이버 쇼핑 API 검색 함수
async function searchNaverShopping(query, options = {}) {
  const { clientId, clientSecret, display = 100, start = 1, sort = 'sim' } = options;
  
  if (!clientId || !clientSecret) {
    throw new Error('네이버 API 키가 설정되지 않았습니다.');
  }

  const url = 'https://openapi.naver.com/v1/search/shop.json';
  const params = new URLSearchParams({
    query,
    display: display.toString(),
    start: start.toString(),
    sort
  });

  try {
    const response = await axios.get(`${url}?${params}`, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret
      }
    });

    return response.data;
  } catch (error) {
    console.error('네이버 API 호출 오류:', error.response?.data || error.message);
    throw error;
  }
}

// 자동 검색 실행 함수
async function runAutoSearch(configId, apiKeyProfileId = null) {
  try {
    console.log(`🔍 설정 ${configId} 자동 검색 시작...`);

    // 설정 정보 조회
    const { data: config, error: configError } = await supabase
      .from('auto_search_configs')
      .select(`
        *,
        api_key_profiles (
          id,
          name,
          client_id,
          client_secret,
          is_active
        )
      `)
      .eq('id', configId)
      .eq('is_active', true)
      .single();

    if (configError || !config) {
      throw new Error('활성화된 설정을 찾을 수 없습니다.');
    }

    console.log(`📋 검색어: ${config.search_query}`);
    console.log(`📄 최대 페이지: ${config.max_pages}`);

    // 실행 로그 생성
    const { data: log, error: logError } = await supabase
      .from('auto_search_logs')
      .insert({
        config_id: configId,
        status: 'running',
        search_results: {}
      })
      .select()
      .single();

    if (logError) {
      console.error('로그 생성 실패:', logError);
    }

    const startTime = Date.now();
    let resultsCount = 0;
    let errorMessage = null;

    try {
      // API 키 프로필 조회
      let apiKeyProfile = null;
      if (apiKeyProfileId) {
        const { data: profile } = await supabase
          .from('api_key_profiles')
          .select('*')
          .eq('id', apiKeyProfileId)
          .eq('is_active', true)
          .single();
        apiKeyProfile = profile;
      } else if (config.api_key_profiles) {
        apiKeyProfile = config.api_key_profiles;
      } else {
        // 기본 API 키 프로필 조회
        const { data: profile } = await supabase
          .from('api_key_profiles')
          .select('*')
          .eq('is_default', true)
          .eq('is_active', true)
          .single();
        apiKeyProfile = profile;
      }

      if (!apiKeyProfile) {
        throw new Error('활성화된 API 키 프로필을 찾을 수 없습니다.');
      }

      console.log(`🔑 API 키 프로필 사용: ${apiKeyProfile.name}`);

      // 네이버 쇼핑 검색 실행
      const searchResults = await searchNaverShopping({
        query: config.search_query,
        display: Math.min(config.max_pages * 20, 1000),
        start: 1,
        sort: 'sim'
      }, {
        clientId: apiKeyProfile.client_id,
        clientSecret: apiKeyProfile.client_secret
      });

      if (searchResults && searchResults.items) {
        console.log(`📊 검색 결과: ${searchResults.items.length}개 상품`);

        // 검색 결과를 데이터베이스에 저장
        const resultsToInsert = searchResults.items.map((item, index) => ({
          search_query: config.search_query,
          target_mall_name: config.target_mall_name,
          target_brand: config.target_brand,
          target_product_name: config.target_product_name,
          page: Math.floor(index / 20) + 1,
          rank_in_page: (index % 20) + 1,
          total_rank: index + 1,
          product_title: item.title,
          mall_name: item.mallName,
          brand: item.brand,
          price: item.lprice,
          product_link: item.link,
          product_id: item.productId,
          category1: item.category1,
          category2: item.category2,
          category3: item.category3,
          created_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabase
          .from('search_results')
          .insert(resultsToInsert);

        if (insertError) {
          console.error('검색 결과 저장 실패:', insertError);
        } else {
          resultsCount = resultsToInsert.length;
          console.log(`✅ ${resultsCount}개 결과 저장 완료`);
        }

        // 로그에 검색 결과 저장
        if (log) {
          await supabase
            .from('auto_search_logs')
            .update({
              search_results: {
                total_items: searchResults.total,
                items: searchResults.items.slice(0, 10) // 처음 10개만 저장
              }
            })
            .eq('id', log.id);
        }
      }

      // 로그 업데이트 (성공)
      if (log) {
        const duration = Date.now() - startTime;
        await supabase
          .from('auto_search_logs')
          .update({
            status: 'success',
            completed_at: new Date().toISOString(),
            duration_ms: duration,
            results_count: resultsCount
          })
          .eq('id', log.id);
      }

      console.log(`✅ 설정 ${configId} 자동 검색 완료 (${resultsCount}개 결과)`);

    } catch (error) {
      console.error('자동 검색 실행 중 오류:', error);
      errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';

      // 로그 업데이트 (실패)
      if (log) {
        const duration = Date.now() - startTime;
        await supabase
          .from('auto_search_logs')
          .update({
            status: 'error',
            completed_at: new Date().toISOString(),
            duration_ms: duration,
            error_message: errorMessage
          })
          .eq('id', log.id);
      }

      throw error;
    }

  } catch (error) {
    console.error(`❌ 설정 ${configId} 실행 실패:`, error.message);
    throw error;
  }
}

// 메인 실행 함수
async function main() {
  try {
    const configId = process.argv[2];
    const apiKeyProfileId = process.argv[3];

    if (!configId) {
      console.log('📋 활성화된 모든 설정 조회 중...');
      
      const { data: configs, error } = await supabase
        .from('auto_search_configs')
        .select('id, name, search_query')
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      if (!configs || configs.length === 0) {
        console.log('⚠️  활성화된 설정이 없습니다.');
        return;
      }

      console.log(`📋 발견된 활성 설정: ${configs.length}개`);
      
      for (const config of configs) {
        console.log(`\n🔄 설정 "${config.name}" 실행 중...`);
        await runAutoSearch(config.id, apiKeyProfileId);
      }
    } else {
      await runAutoSearch(configId, apiKeyProfileId);
    }

    console.log('\n🎉 모든 자동 검색이 완료되었습니다!');

  } catch (error) {
    console.error('❌ 자동 검색 실행 실패:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { runAutoSearch, searchNaverShopping };
