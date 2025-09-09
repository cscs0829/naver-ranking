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

-- 네이버 API 키 샘플 데이터
INSERT INTO api_keys (key_name, key_value, description) VALUES 
('NAVER_CLIENT_ID', 'zjWPGFMpTc6cKpBepp4H', '네이버 쇼핑 API 클라이언트 ID'),
('NAVER_CLIENT_SECRET', 'ZVBsS75udC', '네이버 쇼핑 API 클라이언트 시크릿')
ON CONFLICT (key_name) DO UPDATE SET 
  key_value = EXCLUDED.key_value,
  updated_at = NOW();

-- 샘플 데이터 (선택사항)
-- INSERT INTO search_results (
--   search_query, target_mall_name, page, rank_in_page, total_rank,
--   product_title, mall_name, price, product_link, product_id
-- ) VALUES (
--   '베트남 여행', '하나투어', 1, 1, 1,
--   '베트남 다낭 3박4일 패키지', '하나투어', '299000',
--   'https://example.com', 'sample_product_1'
-- );
