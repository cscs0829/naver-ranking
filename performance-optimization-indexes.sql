-- 실시간 결과 페이지 성능 최적화를 위한 인덱스 추가
-- 이 SQL 파일을 Supabase SQL Editor에서 실행하세요

-- 1. auto_search_results 테이블 인덱스 추가
-- config_id와 created_at을 함께 조회하는 쿼리가 많으므로 복합 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_auto_search_results_config_created 
ON auto_search_results(config_id, created_at DESC);

-- 2. auto_search_results 테이블에 total_rank 인덱스 추가
-- 순위별 정렬을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_auto_search_results_total_rank 
ON auto_search_results(total_rank);

-- 3. auto_search_logs 테이블 인덱스 추가
-- 최근 활동 조회를 위한 started_at 인덱스
CREATE INDEX IF NOT EXISTS idx_auto_search_logs_started_at 
ON auto_search_logs(started_at DESC);

-- 4. auto_search_logs 테이블 복합 인덱스 추가
-- config_id와 시간으로 조회하는 경우를 위해
CREATE INDEX IF NOT EXISTS idx_auto_search_logs_config_time 
ON auto_search_logs(config_id, started_at DESC, completed_at DESC);

-- 5. auto_search_configs 테이블 인덱스 추가
-- 활성 설정만 조회하는 쿼리가 많으므로
CREATE INDEX IF NOT EXISTS idx_auto_search_configs_is_active 
ON auto_search_configs(is_active) WHERE is_active = true;

-- 인덱스 생성 확인
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM 
    pg_indexes
WHERE 
    schemaname = 'public' 
    AND tablename IN ('auto_search_results', 'auto_search_logs', 'auto_search_configs')
ORDER BY 
    tablename, indexname;

