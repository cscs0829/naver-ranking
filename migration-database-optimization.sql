-- 데이터베이스 최적화 마이그레이션
-- Supabase SQL Editor에서 실행하세요

-- 1. 키워드 분석 결과 테이블에 분석 타입 컬럼 추가
ALTER TABLE keyword_analysis_results 
ADD COLUMN IF NOT EXISTS analysis_type VARCHAR(50) DEFAULT 'keyword_trend' NOT NULL;

-- 2. 분석 타입에 대한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_results_type ON keyword_analysis_results(analysis_type);

-- 3. 검색 결과 테이블에 검색 타입 컬럼 추가 (향후 확장성)
ALTER TABLE search_results 
ADD COLUMN IF NOT EXISTS search_type VARCHAR(50) DEFAULT 'product_rank' NOT NULL;

-- 4. 검색 타입에 대한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_search_results_type ON search_results(search_type);

-- 5. API 키 프로필 테이블에 사용 통계 컬럼 추가
ALTER TABLE api_key_profiles 
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE;

-- 6. 사용 통계에 대한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_api_key_profiles_usage ON api_key_profiles(usage_count DESC, last_used_at DESC);

-- 7. 키워드 분석 결과 테이블에 결과 요약 컬럼 추가 (빠른 조회용)
ALTER TABLE keyword_analysis_results 
ADD COLUMN IF NOT EXISTS result_summary JSONB;

-- 8. 결과 요약에 대한 GIN 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_results_summary ON keyword_analysis_results USING GIN (result_summary);

-- 9. 검색 결과 테이블에 상품 카테고리 정규화
ALTER TABLE search_results 
ADD COLUMN IF NOT EXISTS normalized_category VARCHAR(255);

-- 10. 정규화된 카테고리에 대한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_search_results_normalized_category ON search_results(normalized_category);

-- 11. 테이블 통계 업데이트 (쿼리 플래너 최적화)
ANALYZE search_results;
ANALYZE keyword_analysis_results;
ANALYZE api_key_profiles;
ANALYZE api_keys;

-- 12. 불필요한 데이터 정리 (30일 이상 된 임시 데이터)
-- DELETE FROM search_results WHERE created_at < NOW() - INTERVAL '30 days' AND search_type = 'temp';
-- DELETE FROM keyword_analysis_results WHERE created_at < NOW() - INTERVAL '30 days' AND analysis_type = 'temp';

-- 13. 테이블 크기 모니터링을 위한 뷰 생성
CREATE OR REPLACE VIEW table_stats AS
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats 
WHERE schemaname = 'public' 
  AND tablename IN ('search_results', 'keyword_analysis_results', 'api_key_profiles', 'api_keys')
ORDER BY tablename, attname;
