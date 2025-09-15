-- 네이버 랭킹 시스템 통합 데이터베이스 스키마
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- =============================================
-- 1. 공통 함수 및 트리거
-- =============================================

-- updated_at 자동 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- 2. API 키 프로필 테이블 (핵심)
-- =============================================
CREATE TABLE IF NOT EXISTS api_key_profiles (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR(100) NOT NULL UNIQUE,
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  api_type VARCHAR(20) NOT NULL CHECK (api_type IN ('shopping', 'insights')),
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- RLS 활성화
ALTER TABLE api_key_profiles ENABLE ROW LEVEL SECURITY;

-- 정책 생성
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'api_key_profiles' 
        AND policyname = 'Enable all operations for all users'
    ) THEN
        CREATE POLICY "Enable all operations for all users" ON api_key_profiles
          FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 트리거 생성
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_api_key_profiles_updated_at'
    ) THEN
        CREATE TRIGGER update_api_key_profiles_updated_at
          BEFORE UPDATE ON api_key_profiles
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =============================================
-- 3. 순위 검색 결과 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS search_results (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
  search_type VARCHAR(50) DEFAULT 'product_rank' NOT NULL,
  normalized_category VARCHAR(255)
);

-- RLS 활성화
ALTER TABLE search_results ENABLE ROW LEVEL SECURITY;

-- 정책 생성
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'search_results' 
        AND policyname = 'Enable all operations for all users'
    ) THEN
        CREATE POLICY "Enable all operations for all users" ON search_results
          FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 트리거 생성
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_search_results_updated_at'
    ) THEN
        CREATE TRIGGER update_search_results_updated_at
          BEFORE UPDATE ON search_results
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =============================================
-- 4. 자동 검색 설정 테이블
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

-- RLS 활성화
ALTER TABLE auto_search_configs ENABLE ROW LEVEL SECURITY;

-- 정책 생성
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

-- 트리거 생성
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
-- 5. 자동 검색 결과 테이블 (순위 검색과 분리)
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
  is_exact_match BOOLEAN DEFAULT TRUE,
  match_confidence DECIMAL(3,2) DEFAULT 1.00,
  check_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- RLS 활성화
ALTER TABLE auto_search_results ENABLE ROW LEVEL SECURITY;

-- 정책 생성
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

-- 트리거 생성
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
-- 6. 자동 검색 로그 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS auto_search_logs (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  config_id INTEGER REFERENCES auto_search_configs(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('running', 'success', 'error')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  results_count INTEGER DEFAULT 0,
  error_message TEXT,
  search_results JSONB
);

-- RLS 활성화
ALTER TABLE auto_search_logs ENABLE ROW LEVEL SECURITY;

-- 정책 생성
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'auto_search_logs' 
        AND policyname = 'Enable all operations for all users'
    ) THEN
        CREATE POLICY "Enable all operations for all users" ON auto_search_logs
          FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- =============================================
-- 7. 키워드 분석 결과 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS keyword_analysis_results (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analysis_name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  time_unit VARCHAR(20) NOT NULL,
  category TEXT NOT NULL,
  keywords TEXT NOT NULL,
  device VARCHAR(10),
  gender VARCHAR(10),
  ages TEXT,
  results TEXT NOT NULL,
  analysis_type VARCHAR(50) DEFAULT 'keyword_trend' NOT NULL,
  result_summary JSONB
);

-- RLS 활성화
ALTER TABLE keyword_analysis_results ENABLE ROW LEVEL SECURITY;

-- 정책 생성
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'keyword_analysis_results' 
        AND policyname = 'Enable all operations for all users'
    ) THEN
        CREATE POLICY "Enable all operations for all users" ON keyword_analysis_results
          FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 트리거 생성
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_keyword_analysis_results_updated_at'
    ) THEN
        CREATE TRIGGER update_keyword_analysis_results_updated_at
          BEFORE UPDATE ON keyword_analysis_results
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =============================================
-- 8. 알림 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS auto_search_notifications (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('success', 'error', 'warning', 'info')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  config_id INTEGER REFERENCES auto_search_configs(id) ON DELETE CASCADE,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE
);

-- RLS 활성화
ALTER TABLE auto_search_notifications ENABLE ROW LEVEL SECURITY;

-- 정책 생성
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'auto_search_notifications' 
        AND policyname = 'Enable all operations for all users'
    ) THEN
        CREATE POLICY "Enable all operations for all users" ON auto_search_notifications
          FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- =============================================
-- 9. 인덱스 생성 (성능 최적화)
-- =============================================

-- API 키 프로필 인덱스
CREATE INDEX IF NOT EXISTS idx_api_key_profiles_type ON api_key_profiles(api_type);
CREATE INDEX IF NOT EXISTS idx_api_key_profiles_active ON api_key_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_api_key_profiles_default ON api_key_profiles(is_default);
CREATE INDEX IF NOT EXISTS idx_api_key_profiles_usage ON api_key_profiles(usage_count DESC, last_used_at DESC);

-- 순위 검색 결과 인덱스
CREATE INDEX IF NOT EXISTS idx_search_results_query ON search_results(search_query);
CREATE INDEX IF NOT EXISTS idx_search_results_mall ON search_results(target_mall_name);
CREATE INDEX IF NOT EXISTS idx_search_results_created_at ON search_results(created_at);
CREATE INDEX IF NOT EXISTS idx_search_results_total_rank ON search_results(total_rank);
CREATE INDEX IF NOT EXISTS idx_search_results_type ON search_results(search_type);
CREATE INDEX IF NOT EXISTS idx_search_results_normalized_category ON search_results(normalized_category);

-- 자동 검색 설정 인덱스
CREATE INDEX IF NOT EXISTS idx_auto_search_configs_active ON auto_search_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_auto_search_configs_next_run ON auto_search_configs(next_run_at);
CREATE INDEX IF NOT EXISTS idx_auto_search_configs_last_run ON auto_search_configs(last_run_at);
CREATE INDEX IF NOT EXISTS idx_auto_search_configs_profile ON auto_search_configs(profile_id);

-- 자동 검색 결과 인덱스
CREATE INDEX IF NOT EXISTS idx_auto_search_results_config_id ON auto_search_results(config_id);
CREATE INDEX IF NOT EXISTS idx_auto_search_results_check_date ON auto_search_results(check_date);
CREATE INDEX IF NOT EXISTS idx_auto_search_results_total_rank ON auto_search_results(total_rank);
CREATE INDEX IF NOT EXISTS idx_auto_search_results_exact_match ON auto_search_results(is_exact_match);
CREATE INDEX IF NOT EXISTS idx_auto_search_results_created_at ON auto_search_results(created_at);

-- 자동 검색 로그 인덱스
CREATE INDEX IF NOT EXISTS idx_auto_search_logs_config_id ON auto_search_logs(config_id);
CREATE INDEX IF NOT EXISTS idx_auto_search_logs_created_at ON auto_search_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_auto_search_logs_status ON auto_search_logs(status);

-- 키워드 분석 결과 인덱스
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_results_name ON keyword_analysis_results(analysis_name);
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_results_dates ON keyword_analysis_results(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_results_created_at ON keyword_analysis_results(created_at);
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_results_type ON keyword_analysis_results(analysis_type);
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_results_device ON keyword_analysis_results(device) WHERE device IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_results_gender ON keyword_analysis_results(gender) WHERE gender IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_results_time_unit ON keyword_analysis_results(time_unit);
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_results_category ON keyword_analysis_results USING GIN ((category::jsonb));
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_results_keywords ON keyword_analysis_results USING GIN ((keywords::jsonb));
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_results_summary ON keyword_analysis_results USING GIN (result_summary);

-- 알림 인덱스
CREATE INDEX IF NOT EXISTS idx_auto_search_notifications_read ON auto_search_notifications(read);
CREATE INDEX IF NOT EXISTS idx_auto_search_notifications_created_at ON auto_search_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_auto_search_notifications_config_id ON auto_search_notifications(config_id);

-- =============================================
-- 10. 뷰 생성 (대시보드용)
-- =============================================

-- 자동 검색 대시보드 통계 뷰
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
-- 11. 함수 생성 (유틸리티)
-- =============================================

-- 순위 변화 추적 함수
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

-- =============================================
-- 12. 테이블 통계 업데이트 (쿼리 플래너 최적화)
-- =============================================
ANALYZE api_key_profiles;
ANALYZE search_results;
ANALYZE auto_search_configs;
ANALYZE auto_search_results;
ANALYZE auto_search_logs;
ANALYZE keyword_analysis_results;
ANALYZE auto_search_notifications;

-- =============================================
-- 13. 샘플 데이터 (선택사항)
-- =============================================

-- 기본 API 키 프로필 생성 (개발용)
-- INSERT INTO api_key_profiles (name, client_id, client_secret, api_type, is_default, is_active)
-- VALUES 
--   ('기본 쇼핑 API', 'your_client_id', 'your_client_secret', 'shopping', true, true),
--   ('기본 DataLab API', 'your_client_id', 'your_client_secret', 'insights', true, true)
-- ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 완료 메시지
-- =============================================
DO $$
BEGIN
    RAISE NOTICE '네이버 랭킹 시스템 데이터베이스 스키마가 성공적으로 생성되었습니다.';
    RAISE NOTICE '생성된 테이블: api_key_profiles, search_results, auto_search_configs, auto_search_results, auto_search_logs, keyword_analysis_results, auto_search_notifications';
    RAISE NOTICE '생성된 뷰: auto_search_dashboard_stats';
    RAISE NOTICE '생성된 함수: get_rank_history';
END $$;
