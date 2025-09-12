-- API 타입 구분을 위한 마이그레이션
-- Supabase SQL Editor에서 실행하세요

-- api_key_profiles 테이블에 api_type 컬럼 추가
ALTER TABLE api_key_profiles 
ADD COLUMN IF NOT EXISTS api_type VARCHAR(50) DEFAULT 'shopping' NOT NULL;

-- 기존 데이터에 대해 api_type 설정 (기본값은 'shopping')
UPDATE api_key_profiles 
SET api_type = 'shopping' 
WHERE api_type IS NULL;

-- api_type에 대한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_api_key_profiles_type ON api_key_profiles(api_type);

-- api_type과 is_default의 복합 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_api_key_profiles_type_default ON api_key_profiles(api_type, is_default);

-- api_type에 대한 체크 제약 조건 추가
ALTER TABLE api_key_profiles 
ADD CONSTRAINT check_api_type 
CHECK (api_type IN ('shopping', 'insights'));

-- 기존 기본 프로필이 있다면 shopping 타입으로 설정
UPDATE api_key_profiles 
SET api_type = 'shopping' 
WHERE is_default = true AND api_type = 'shopping';
