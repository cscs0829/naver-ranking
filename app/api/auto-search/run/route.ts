import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { NaverShoppingRankChecker } from '@/utils/naver-api';

// 환경변수 체크
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Supabase 환경변수가 설정되지 않았습니다.');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
);

export async function POST(request: NextRequest) {
  try {
    const { configId, apiKeyProfileId } = await request.json();

    if (!configId) {
      return NextResponse.json(
        { error: '설정 ID가 필요합니다.' },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: '활성화된 설정을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

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

      // 네이버 쇼핑 순위 검색 실행 (자동 검색용 - 정확히 매칭된 상품만 저장)
      const checker = new NaverShoppingRankChecker(
        apiKeyProfile.client_id,
        apiKeyProfile.client_secret
      );

      // 자동 검색에서는 정확히 매칭된 상품들만 찾기 (엄격한 매칭 사용)
      const searchResult = await checker.findAllMatches(
        config.search_query,
        config.target_product_name,
        config.target_mall_name,
        config.target_brand,
        config.max_pages,
        true // useExactMatching = true
      );

      if (searchResult.items && searchResult.items.length > 0) {
        // 자동 검색에서는 정확히 매칭된 상품들만 저장
        // 같은 설정의 기존 데이터 삭제
        await supabase
          .from('auto_search_results')
          .delete()
          .eq('config_id', configId);

        // 매칭된 상품들을 auto_search_results 테이블에 저장
        const resultsToInsert = searchResult.items.map(item => ({
          config_id: configId,
          search_query: config.search_query,
          target_mall_name: config.target_mall_name,
          target_brand: config.target_brand,
          target_product_name: config.target_product_name,
          page: item.page,
          rank_in_page: item.rank_in_page,
          total_rank: item.total_rank,
          product_title: item.product_title,
          mall_name: item.mall_name,
          brand: item.brand,
          price: item.price,
          product_link: item.product_link,
          product_id: item.product_id,
          category1: item.category1,
          category2: item.category2,
          category3: item.category3,
          is_exact_match: true,
          match_confidence: 1.00,
          check_date: new Date().toISOString().split('T')[0]
        }));

        const { error: insertError } = await supabase
          .from('auto_search_results')
          .insert(resultsToInsert);

        if (insertError) {
          console.error('검색 결과 저장 실패:', insertError);
          throw new Error('검색 결과 저장에 실패했습니다.');
        }

        resultsCount = searchResult.items.length;

        // 로그에 검색 결과 저장
        if (log) {
          await supabase
            .from('auto_search_logs')
            .update({
              search_results: {
                total_items: resultsCount,
                items: searchResult.items.slice(0, 10), // 처음 10개만 저장
                found_products: searchResult.items.map(item => ({
                  product_title: item.product_title,
                  mall_name: item.mall_name,
                  brand: item.brand,
                  total_rank: item.total_rank,
                  page: item.page,
                  rank_in_page: item.rank_in_page
                }))
              }
            })
            .eq('id', log.id);
        }
      } else {
        // 매칭된 상품이 없는 경우에도 로그 업데이트
        resultsCount = 0;
        console.log(`자동 검색 완료: "${config.search_query}" - 매칭된 상품 없음`);
        
        if (log) {
          await supabase
            .from('auto_search_logs')
            .update({
              search_results: {
                total_items: 0,
                items: [],
                found_products: []
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

      // 성공 알림 생성
      await supabase
        .from('auto_search_notifications')
        .insert({
          type: 'success',
          title: '자동 검색 완료',
          message: `"${config.search_query}" 검색이 성공적으로 완료되었습니다. (${resultsCount}개 결과)`,
          config_id: configId,
          priority: 'normal'
        });

      return NextResponse.json({
        success: true,
        message: '자동 검색이 성공적으로 완료되었습니다.',
        resultsCount,
        configId
      });

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

      // 오류 알림 생성
      await supabase
        .from('auto_search_notifications')
        .insert({
          type: 'error',
          title: '자동 검색 실패',
          message: `"${config.search_query}" 검색 중 오류가 발생했습니다: ${errorMessage}`,
          config_id: configId,
          priority: 'high'
        });

      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          configId 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API 요청 처리 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 설정 목록 조회
export async function GET() {
  try {
    const { data: configs, error } = await supabase
      .from('auto_search_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ configs });
  } catch (error) {
    console.error('설정 조회 오류:', error);
    return NextResponse.json(
      { error: '설정을 조회할 수 없습니다.' },
      { status: 500 }
    );
  }
}