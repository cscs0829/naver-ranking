-- 자동 검색과 순위 검색 분리를 위한 마이그레이션
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- =============================================
-- 자동 검색 설정 테이블 (기존 auto_search_configs 대신)
-- =============================================
CREATE TABLE IF NOT EXISTS auto_search_configs (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR(255) NOT NULL,
  search_query VARCHAR(255) NOT NULL,
  target_mall_name VARCHAR(255),
  target_brand VARCHAR(255),
  target_product_name VARCHAR(255),
  max_pages INTEGER DEFAULT 10,
  profile_id INTEGER REFERENCES api_key_profiles(id),
  interval_hours INTEGER DEFAULT 2,
  is_active BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  run_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  description TEXT
);

ALTER TABLE auto_search_configs ENABLE ROW LEVEL SECURITY;

-- 기존 정책이 있는지 확인하고 생성
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'auto_search_configs' 
        AND policyname = 'Enable all operations for all users'
    ) THEN
        CREATE POLICY "Enable all operations for all users" ON auto_search_configs
          FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 트리거가 이미 있는지 확인하고 생성
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_auto_search_configs_updated_at'
    ) THEN
        CREATE TRIGGER update_auto_search_configs_updated_at
          BEFORE UPDATE ON auto_search_configs
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =============================================
-- 자동 검색 결과 테이블 (순위 검색과 분리)
-- =============================================
CREATE TABLE IF NOT EXISTS auto_search_results (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  config_id INTEGER NOT NULL REFERENCES auto_search_configs(id) ON DELETE CASCADE,
  search_query VARCHAR(255) NOT NULL,
  target_mall_name VARCHAR(255),
  target_brand VARCHAR(255),
  target_product_name VARCHAR(255),
  page INTEGER NOT NULL,
  rank_in_page INTEGER NOT NULL,
  total_rank INTEGER NOT NULL,
  product_title TEXT NOT NULL,
  mall_name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  price VARCHAR(50),
  product_link TEXT,
  product_id VARCHAR(255),
  category1 VARCHAR(255),
  category2 VARCHAR(255),
  category3 VARCHAR(255),
  -- 자동 검색 특화 필드
  is_exact_match BOOLEAN DEFAULT TRUE, -- 정확히 매칭된 상품인지 여부
  match_confidence DECIMAL(3,2) DEFAULT 1.00, -- 매칭 신뢰도 (0.00 ~ 1.00)
  check_date DATE NOT NULL DEFAULT CURRENT_DATE -- 체크 날짜 (시간별 그룹핑용)
);

ALTER TABLE auto_search_results ENABLE ROW LEVEL SECURITY;

-- 기존 정책이 있는지 확인하고 생성
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'auto_search_results' 
        AND policyname = 'Enable all operations for all users'
    ) THEN
        CREATE POLICY "Enable all operations for all users" ON auto_search_results
          FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 트리거가 이미 있는지 확인하고 생성
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_auto_search_results_updated_at'
    ) THEN
        CREATE TRIGGER update_auto_search_results_updated_at
          BEFORE UPDATE ON auto_search_results
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =============================================
-- 자동 검색 로그 테이블 (기존과 연결)
-- =============================================
-- 기존 auto_search_logs 테이블이 있으므로 config_id 컬럼 추가
ALTER TABLE auto_search_logs 
ADD COLUMN IF NOT EXISTS config_id INTEGER REFERENCES auto_search_configs(id) ON DELETE CASCADE;

-- 기존 schedule_id가 있다면 config_id로 마이그레이션
-- (필요시 수동으로 처리)

-- =============================================
-- 인덱스 생성
-- =============================================
-- 자동 검색 설정 인덱스
CREATE INDEX IF NOT EXISTS idx_auto_search_configs_active ON auto_search_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_auto_search_configs_next_run ON auto_search_configs(next_run_at);
CREATE INDEX IF NOT EXISTS idx_auto_search_configs_last_run ON auto_search_configs(last_run_at);

-- 자동 검색 결과 인덱스
CREATE INDEX IF NOT EXISTS idx_auto_search_results_config_id ON auto_search_results(config_id);
CREATE INDEX IF NOT EXISTS idx_auto_search_results_check_date ON auto_search_results(check_date);
CREATE INDEX IF NOT EXISTS idx_auto_search_results_total_rank ON auto_search_results(total_rank);
CREATE INDEX IF NOT EXISTS idx_auto_search_results_exact_match ON auto_search_results(is_exact_match);
CREATE INDEX IF NOT EXISTS idx_auto_search_results_created_at ON auto_search_results(created_at);

-- 자동 검색 로그 인덱스
CREATE INDEX IF NOT EXISTS idx_auto_search_logs_config_id ON auto_search_logs(config_id);

-- =============================================
-- 기존 데이터 마이그레이션 (필요시)
-- =============================================
-- 기존 search_results에서 자동 검색 관련 데이터를 auto_search_results로 이동
-- (자동 검색 설정이 있는 경우에만)

-- =============================================
-- 뷰 생성 (대시보드용)
-- =============================================
CREATE OR REPLACE VIEW auto_search_dashboard_stats AS
SELECT 
  c.id as config_id,
  c.name as config_name,
  c.search_query,
  c.target_product_name,
  c.target_mall_name,
  c.target_brand,
  c.is_active,
  c.run_count,
  c.success_count,
  c.error_count,
  c.last_run_at,
  c.next_run_at,
  -- 최신 순위 결과
  r.total_rank as latest_rank,
  r.page as latest_page,
  r.rank_in_page as latest_rank_in_page,
  r.product_title as latest_product_title,
  r.mall_name as latest_mall_name,
  r.brand as latest_brand,
  r.price as latest_price,
  r.created_at as latest_check_at
FROM auto_search_configs c
LEFT JOIN LATERAL (
  SELECT *
  FROM auto_search_results r
  WHERE r.config_id = c.id
  ORDER BY r.created_at DESC
  LIMIT 1
) r ON true;

-- =============================================
-- 함수 생성 (순위 변화 추적)
-- =============================================
CREATE OR REPLACE FUNCTION get_rank_history(
  p_config_id INTEGER,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  check_date DATE,
  total_rank INTEGER,
  page INTEGER,
  rank_in_page INTEGER,
  product_title TEXT,
  mall_name VARCHAR(255),
  brand VARCHAR(255),
  price VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.check_date,
    r.total_rank,
    r.page,
    r.rank_in_page,
    r.product_title,
    r.mall_name,
    r.brand,
    r.price
  FROM auto_search_results r
  WHERE r.config_id = p_config_id
    AND r.check_date >= CURRENT_DATE - INTERVAL '1 day' * p_days
  ORDER BY r.check_date DESC, r.total_rank ASC;
END;
$$ LANGUAGE plpgsql;
