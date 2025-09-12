-- 키워드 분석 결과 테이블 생성
-- Supabase SQL Editor에서 실행하세요

-- 키워드 분석 결과 테이블
CREATE TABLE IF NOT EXISTS keyword_analysis_results (
  id SERIAL PRIMARY KEY,
  analysis_name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  time_unit VARCHAR(20) NOT NULL,
  category TEXT NOT NULL, -- JSON 문자열로 저장
  keywords TEXT NOT NULL, -- JSON 문자열로 저장
  device VARCHAR(10),
  gender VARCHAR(10),
  ages TEXT, -- JSON 문자열로 저장
  results TEXT NOT NULL, -- JSON 문자열로 저장
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_results_name ON keyword_analysis_results(analysis_name);
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_results_dates ON keyword_analysis_results(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_results_created_at ON keyword_analysis_results(created_at);
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_results_category ON keyword_analysis_results USING GIN ((category::jsonb));
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_results_keywords ON keyword_analysis_results USING GIN ((keywords::jsonb));

-- RLS (Row Level Security) 활성화
ALTER TABLE keyword_analysis_results ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기/쓰기 가능하도록 정책 설정
CREATE POLICY "Enable all operations for all users" ON keyword_analysis_results
  FOR ALL USING (true) WITH CHECK (true);

-- updated_at 자동 업데이트를 위한 트리거 함수 (이미 존재할 수 있음)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
CREATE TRIGGER update_keyword_analysis_results_updated_at
  BEFORE UPDATE ON keyword_analysis_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
