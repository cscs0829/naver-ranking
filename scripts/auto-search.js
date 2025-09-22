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

// 유틸: HTML 태그/URL 제거 및 정규화
function removeHtmlTags(text = '') {
  return String(text).replace(/<[^>]*>/g, '');
}

function removeUrls(text = '') {
  return String(text).replace(/https?:\/\/\S+/gi, '');
}

function normalizeWhitespace(text = '') {
  return String(text).replace(/\s+/g, ' ').trim();
}

function normalizeText(text = '') {
  // 카테고리 접두부가 '@'로 구분되어 붙는 경우 뒤쪽 실제 제목만 사용
  const withoutHtml = removeHtmlTags(text);
  const withoutUrls = removeUrls(withoutHtml);
  const splitted = withoutUrls.split('@');
  const tail = splitted.length > 1 ? splitted[splitted.length - 1] : splitted[0];
  return normalizeWhitespace(tail).toLowerCase();
}

// 자동검색용: 정확 일치 여부 판단
function isExactTargetProduct(item, targetProductName, targetMallName, targetBrand) {
  const productTitleNorm = normalizeText(item.title);
  const mallNameNorm = normalizeText(item.mallName);
  const brandNorm = normalizeText(item.brand);

  const targetTitleNorm = normalizeText(targetProductName || '');
  const targetMallNorm = normalizeText(targetMallName || '');
  const targetBrandNorm = normalizeText(targetBrand || '');

  // 타겟 정보가 하나도 없으면 매칭하지 않음 (엄격 모드)
  if (!targetTitleNorm && !targetMallNorm && !targetBrandNorm) {
    return false;
  }

  if (targetTitleNorm && productTitleNorm !== targetTitleNorm) {
    return false;
  }
  if (targetMallNorm && mallNameNorm !== targetMallNorm) {
    return false;
  }
  if (targetBrandNorm && brandNorm !== targetBrandNorm) {
    return false;
  }
  return true;
}

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

      // 네이버 쇼핑 검색 실행 (API 제한 준수: display<=100, start<=1000)
      const maxWanted = Math.min((config.max_pages || 1) * 20, 1000);
      const aggregatedItems = [];
      let startIndex = 1; // 1-base
      while (aggregatedItems.length < maxWanted && startIndex <= 1000) {
        const remaining = maxWanted - aggregatedItems.length;
        const display = Math.min(remaining, 100); // API limit
        const batch = await searchNaverShopping(
          config.search_query,
          {
            clientId: apiKeyProfile.client_id,
            clientSecret: apiKeyProfile.client_secret,
            display,
            start: startIndex,
            sort: 'sim'
          }
        );
        if (!batch || !Array.isArray(batch.items) || batch.items.length === 0) {
          break;
        }
        aggregatedItems.push(...batch.items);
        startIndex += display; // 다음 구간
        // 안전장치: 과도한 루프 방지
        if (startIndex > 1000) break;
      }

      if (aggregatedItems.length > 0) {
        console.log(`📊 검색 결과: ${aggregatedItems.length}개 상품`);

        // 정확 매칭 필터 적용
        const matchedItems = aggregatedItems
          .filter(item => isExactTargetProduct(
            item,
            config.target_product_name,
            config.target_mall_name,
            config.target_brand
          ));

        console.log(`🎯 정확 매칭 결과: ${matchedItems.length}개 상품`);

        // 히스토리 보존: 삭제하지 않고 매 실행마다 결과를 누적 저장
        const todayStr = new Date().toISOString().split('T')[0];

        // 검색 결과를 데이터베이스에 저장 (정확 매칭만)
        const resultsToInsert = matchedItems.map((item) => {
          // 원본 집합에서의 인덱스를 기준으로 순위 계산
          const originalIndex = aggregatedItems.indexOf(item);
          const totalRank = originalIndex >= 0 ? originalIndex + 1 : 0;
          // 네이버 쇼핑 웹페이지는 1페이지에 40개씩 표시됨 (API는 100개씩 처리)
          const page = originalIndex >= 0 ? Math.floor(originalIndex / 40) + 1 : 0;
          const rankInPage = originalIndex >= 0 ? ((originalIndex) % 40) + 1 : 0;

          return {
          search_query: config.search_query,
          target_mall_name: config.target_mall_name,
          target_brand: config.target_brand,
          target_product_name: config.target_product_name,
          page,
          rank_in_page: rankInPage,
          total_rank: totalRank,
          product_title: normalizeWhitespace(removeHtmlTags(item.title)),
          mall_name: normalizeWhitespace(removeHtmlTags(item.mallName)),
          brand: normalizeWhitespace(removeHtmlTags(item.brand || '')),
          price: item.lprice,
          product_link: item.link,
          product_id: item.productId,
          category1: item.category1,
          category2: item.category2,
          category3: item.category3,
          is_exact_match: true,
          match_confidence: 1.00,
          check_date: todayStr,
          created_at: new Date().toISOString()
          };
        });

        if (resultsToInsert.length > 0) {
          // 순위 계산 디버깅 로그
          console.log('📊 순위 계산 디버깅:');
          resultsToInsert.slice(0, 3).forEach((result, idx) => {
            console.log(`  ${idx + 1}. 전체순위: ${result.total_rank}, 페이지: ${result.page}, 페이지내순위: ${result.rank_in_page}`);
          });

          const { error: insertError } = await supabase
            .from('auto_search_results')
            .insert(resultsToInsert.map(result => ({
              ...result,
              config_id: configId
            })));

          if (insertError) {
            console.error('검색 결과 저장 실패:', insertError);
          } else {
            resultsCount = resultsToInsert.length;
            console.log(`✅ 정확 매칭 ${resultsCount}개 결과 저장 완료`);

            // 저장 검증: DB 카운트 확인
            const { count: verifyCount, error: verifyError } = await supabase
              .from('auto_search_results')
              .select('*', { count: 'exact', head: true })
              .eq('config_id', configId);

            if (verifyError) {
              console.warn('⚠️ 저장 검증 중 오류:', verifyError);
            } else {
              console.log(`🔎 DB 검증: config_id=${configId} 현재 저장된 결과 수 = ${verifyCount}`);
            }
          }
        } else {
          resultsCount = 0;
          console.log('⚠️ 정확 매칭되는 결과가 없습니다. 저장을 건너뜁니다.');
        }

        // 로그에 검색 결과 저장
        if (log) {
          await supabase
            .from('auto_search_logs')
            .update({
              search_results: {
                total_items: aggregatedItems.length,
                items: matchedItems.slice(0, 10) // 처음 10개만 저장 (정확 매칭 기준)
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

      // 설정의 last_run_at 업데이트
      await supabase
        .from('auto_search_configs')
        .update({
          last_run_at: new Date().toISOString(),
          success_count: (config.success_count || 0) + 1
        })
        .eq('id', configId);

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

      // 설정의 last_run_at 업데이트 (실패해도 실행 시간은 기록)
      await supabase
        .from('auto_search_configs')
        .update({
          last_run_at: new Date().toISOString(),
          error_count: (config.error_count || 0) + 1,
          last_error: errorMessage
        })
        .eq('id', configId);

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
