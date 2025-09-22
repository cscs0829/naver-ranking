-- Supabase 현재 데이터베이스 스키마
-- 추출일: 2025-01-27
-- 프로젝트: naverrank (cuhhqhkdawjpmbktljyk)

-- =============================================
-- 1. API 키 테이블 (api_keys)
-- =============================================
CREATE TABLE IF NOT EXISTS api_keys (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  key_name VARCHAR UNIQUE NOT NULL,
  key_value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT
);

-- RLS 활성화
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. API 키 프로필 테이블 (api_key_profiles)
-- =============================================
CREATE TABLE IF NOT EXISTS api_key_profiles (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR UNIQUE NOT NULL,
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  api_type VARCHAR DEFAULT 'shopping' CHECK (api_type IN ('shopping', 'insights')),
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- RLS 활성화
ALTER TABLE api_key_profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. 순위 검색 결과 테이블 (search_results)
-- =============================================
CREATE TABLE IF NOT EXISTS search_results (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR NOT NULL,
  target_mall_name VARCHAR,
  target_brand VARCHAR,
  target_product_name VARCHAR,
  page INTEGER NOT NULL,
  rank_in_page INTEGER NOT NULL,
  total_rank INTEGER NOT NULL,
  product_title TEXT NOT NULL,
  mall_name VARCHAR NOT NULL,
  brand VARCHAR,
  price VARCHAR,
  product_link TEXT,
  product_id VARCHAR,
  category1 VARCHAR,
  category2 VARCHAR,
  category3 VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  search_type VARCHAR DEFAULT 'product_rank',
  normalized_category VARCHAR
);

-- RLS 활성화
ALTER TABLE search_results ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. 자동 검색 설정 테이블 (auto_search_configs)
-- =============================================
CREATE TABLE IF NOT EXISTS auto_search_configs (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR NOT NULL,
  search_query VARCHAR NOT NULL,
  target_mall_name VARCHAR,
  target_brand VARCHAR,
  target_product_name VARCHAR,
  max_pages INTEGER DEFAULT 10,
  profile_id INTEGER,
  interval_hours NUMERIC DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  run_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  description TEXT,
  
  -- 외래키 제약조건
  FOREIGN KEY (profile_id) REFERENCES api_key_profiles(id)
);

-- RLS 활성화
ALTER TABLE auto_search_configs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 5. 자동 검색 결과 테이블 (auto_search_results)
-- =============================================
CREATE TABLE IF NOT EXISTS auto_search_results (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  config_id INTEGER NOT NULL,
  search_query VARCHAR NOT NULL,
  target_mall_name VARCHAR,
  target_brand VARCHAR,
  target_product_name VARCHAR,
  page INTEGER NOT NULL,
  rank_in_page INTEGER NOT NULL,
  total_rank INTEGER NOT NULL,
  product_title TEXT NOT NULL,
  mall_name VARCHAR NOT NULL,
  brand VARCHAR,
  price VARCHAR,
  product_link TEXT,
  product_id VARCHAR,
  category1 VARCHAR,
  category2 VARCHAR,
  category3 VARCHAR,
  is_exact_match BOOLEAN DEFAULT TRUE,
  match_confidence NUMERIC DEFAULT 1.00,
  check_date DATE DEFAULT CURRENT_DATE,
  
  -- 외래키 제약조건
  FOREIGN KEY (config_id) REFERENCES auto_search_configs(id)
);

-- RLS 활성화
ALTER TABLE auto_search_results ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 6. 자동 검색 로그 테이블 (auto_search_logs)
-- =============================================
CREATE TABLE IF NOT EXISTS auto_search_logs (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  config_id INTEGER,
  status VARCHAR NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  results_count INTEGER DEFAULT 0,
  error_message TEXT,
  search_results JSONB,
  
  -- 외래키 제약조건
  FOREIGN KEY (config_id) REFERENCES auto_search_configs(id)
);

-- RLS 활성화
ALTER TABLE auto_search_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 7. 키워드 분석 결과 테이블 (keyword_analysis_results)
-- =============================================
CREATE TABLE IF NOT EXISTS keyword_analysis_results (
  id SERIAL PRIMARY KEY,
  analysis_name VARCHAR NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  time_unit VARCHAR NOT NULL,
  category TEXT NOT NULL,
  keywords TEXT NOT NULL,
  device VARCHAR,
  gender VARCHAR,
  ages TEXT,
  results TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analysis_type VARCHAR DEFAULT 'keyword_trend',
  result_summary JSONB
);

-- RLS 활성화
ALTER TABLE keyword_analysis_results ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 8. 알림 테이블 (auto_search_notifications)
-- =============================================
CREATE TABLE IF NOT EXISTS auto_search_notifications (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type VARCHAR NOT NULL CHECK (type IN ('success', 'error', 'warning', 'info')),
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  config_id INTEGER,
  priority VARCHAR DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- 외래키 제약조건
  FOREIGN KEY (config_id) REFERENCES auto_search_configs(id)
);

-- RLS 활성화
ALTER TABLE auto_search_notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 9. 인덱스 생성 (성능 최적화)
-- =============================================

-- API 키 프로필 인덱스
CREATE INDEX IF NOT EXISTS idx_api_key_profiles_type ON api_key_profiles(api_type);
CREATE INDEX IF NOT EXISTS idx_api_key_profiles_active ON api_key_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_api_key_profiles_default ON api_key_profiles(is_default);

-- 순위 검색 결과 인덱스
CREATE INDEX IF NOT EXISTS idx_search_results_query ON search_results(search_query);
CREATE INDEX IF NOT EXISTS idx_search_results_mall ON search_results(target_mall_name);
CREATE INDEX IF NOT EXISTS idx_search_results_created_at ON search_results(created_at);
CREATE INDEX IF NOT EXISTS idx_search_results_total_rank ON search_results(total_rank);

-- 자동 검색 설정 인덱스
CREATE INDEX IF NOT EXISTS idx_auto_search_configs_active ON auto_search_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_auto_search_configs_next_run ON auto_search_configs(next_run_at);
CREATE INDEX IF NOT EXISTS idx_auto_search_configs_profile ON auto_search_configs(profile_id);

-- 자동 검색 결과 인덱스
CREATE INDEX IF NOT EXISTS idx_auto_search_results_config_id ON auto_search_results(config_id);
CREATE INDEX IF NOT EXISTS idx_auto_search_results_check_date ON auto_search_results(check_date);
CREATE INDEX IF NOT EXISTS idx_auto_search_results_total_rank ON auto_search_results(total_rank);
CREATE INDEX IF NOT EXISTS idx_auto_search_results_exact_match ON auto_search_results(is_exact_match);

-- 자동 검색 로그 인덱스
CREATE INDEX IF NOT EXISTS idx_auto_search_logs_config_id ON auto_search_logs(config_id);
CREATE INDEX IF NOT EXISTS idx_auto_search_logs_created_at ON auto_search_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_auto_search_logs_status ON auto_search_logs(status);

-- 키워드 분석 결과 인덱스
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_results_name ON keyword_analysis_results(analysis_name);
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_results_dates ON keyword_analysis_results(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_results_created_at ON keyword_analysis_results(created_at);

-- 알림 인덱스
CREATE INDEX IF NOT EXISTS idx_auto_search_notifications_read ON auto_search_notifications(read);
CREATE INDEX IF NOT EXISTS idx_auto_search_notifications_created_at ON auto_search_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_auto_search_notifications_config_id ON auto_search_notifications(config_id);

-- =============================================
-- 10. RLS 정책 생성
-- =============================================

-- 모든 테이블에 대한 기본 RLS 정책
DO $$
DECLARE
    table_name TEXT;
    tables TEXT[] := ARRAY[
        'api_keys',
        'api_key_profiles', 
        'search_results',
        'auto_search_configs',
        'auto_search_results',
        'auto_search_logs',
        'keyword_analysis_results',
        'auto_search_notifications'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables
    LOOP
        -- 정책이 존재하지 않는 경우에만 생성
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = table_name 
            AND policyname = 'Enable all operations for all users'
        ) THEN
            EXECUTE format('CREATE POLICY "Enable all operations for all users" ON %I FOR ALL USING (true) WITH CHECK (true)', table_name);
        END IF;
    END LOOP;
END $$;

-- =============================================
-- 완료 메시지
-- =============================================
DO $$
BEGIN
    RAISE NOTICE 'Supabase 현재 스키마가 성공적으로 생성되었습니다.';
    RAISE NOTICE '총 8개 테이블: api_keys, api_key_profiles, search_results, auto_search_configs, auto_search_results, auto_search_logs, keyword_analysis_results, auto_search_notifications';
    RAISE NOTICE '모든 테이블에 RLS가 활성화되어 있습니다.';
END $$;
