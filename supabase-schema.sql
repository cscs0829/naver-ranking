-- Supabase 데이터베이스 스키마
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- 검색 결과 테이블
CREATE TABLE IF NOT EXISTS search_results (
  id SERIAL PRIMARY KEY,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_search_results_query ON search_results(search_query);
CREATE INDEX IF NOT EXISTS idx_search_results_mall ON search_results(target_mall_name);
CREATE INDEX IF NOT EXISTS idx_search_results_created_at ON search_results(created_at);
CREATE INDEX IF NOT EXISTS idx_search_results_total_rank ON search_results(total_rank);

-- RLS (Row Level Security) 활성화
ALTER TABLE search_results ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기/쓰기 가능하도록 정책 설정
CREATE POLICY "Enable all operations for all users" ON search_results
  FOR ALL USING (true) WITH CHECK (true);

-- updated_at 자동 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
CREATE TRIGGER update_search_results_updated_at
  BEFORE UPDATE ON search_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- API 키 테이블 생성
CREATE TABLE IF NOT EXISTS api_keys (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  key_name VARCHAR(100) NOT NULL UNIQUE,
  key_value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT
);

-- API 키 테이블 RLS 활성화
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- API 키 테이블 정책 설정
CREATE POLICY "Enable all operations for all users" ON api_keys
  FOR ALL USING (true) WITH CHECK (true);

-- API 키 테이블 updated_at 트리거
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 네이버 API 키 샘플 데이터 (실제 값은 환경변수에서 설정)
-- INSERT INTO api_keys (key_name, key_value, description) VALUES 
-- ('NAVER_CLIENT_ID', 'your_client_id_here', '네이버 쇼핑 API 클라이언트 ID'),
-- ('NAVER_CLIENT_SECRET', 'your_client_secret_here', '네이버 쇼핑 API 클라이언트 시크릿')
-- ON CONFLICT (key_name) DO UPDATE SET 
--   key_value = EXCLUDED.key_value,
--   updated_at = NOW();

-- =============================================
-- Naver API 키 프로필 (클라이언트ID/시크릿을 하나로 관리)
-- =============================================
CREATE TABLE IF NOT EXISTS api_key_profiles (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR(100) NOT NULL UNIQUE,
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE
);

ALTER TABLE api_key_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for all users" ON api_key_profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_api_key_profiles_updated_at
  BEFORE UPDATE ON api_key_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 자동 검색 스케줄 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS auto_search_schedules (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR(255) NOT NULL,
  search_query VARCHAR(255) NOT NULL,
  target_mall_name VARCHAR(255),
  target_brand VARCHAR(255),
  target_product_name VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  cron_expression VARCHAR(100) NOT NULL DEFAULT '0 */2 * * *', -- 기본 2시간마다
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  run_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  last_error_message TEXT,
  description TEXT
);

ALTER TABLE auto_search_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for all users" ON auto_search_schedules
  FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_auto_search_schedules_updated_at
  BEFORE UPDATE ON auto_search_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 자동 검색 실행 로그 테이블
CREATE TABLE IF NOT EXISTS auto_search_logs (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  schedule_id INTEGER REFERENCES auto_search_schedules(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('running', 'success', 'error')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  results_count INTEGER DEFAULT 0,
  error_message TEXT,
  execution_context JSONB
);

ALTER TABLE auto_search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for all users" ON auto_search_logs
  FOR ALL USING (true) WITH CHECK (true);

-- 알림 테이블 생성
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

ALTER TABLE auto_search_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for all users" ON auto_search_notifications
  FOR ALL USING (true) WITH CHECK (true);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_auto_search_schedules_active ON auto_search_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_auto_search_schedules_next_run ON auto_search_schedules(next_run_at);
CREATE INDEX IF NOT EXISTS idx_auto_search_logs_schedule_id ON auto_search_logs(schedule_id);
CREATE INDEX IF NOT EXISTS idx_auto_search_logs_created_at ON auto_search_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_auto_search_notifications_read ON auto_search_notifications(read);
CREATE INDEX IF NOT EXISTS idx_auto_search_notifications_created_at ON auto_search_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_auto_search_notifications_config_id ON auto_search_notifications(config_id);
