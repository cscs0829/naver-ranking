-- interval_hours 필드 타입 수정 마이그레이션
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- =============================================
-- interval_hours 필드를 INTEGER에서 DECIMAL로 변경
-- =============================================

-- 기존 데이터 백업을 위한 임시 컬럼 생성
ALTER TABLE auto_search_configs 
ADD COLUMN IF NOT EXISTS interval_hours_backup INTEGER;

-- 기존 데이터 백업
UPDATE auto_search_configs 
SET interval_hours_backup = interval_hours 
WHERE interval_hours_backup IS NULL;

-- interval_hours 컬럼을 DECIMAL로 변경
ALTER TABLE auto_search_configs 
ALTER COLUMN interval_hours TYPE DECIMAL(4,2);

-- 기본값을 2.00으로 설정
ALTER TABLE auto_search_configs 
ALTER COLUMN interval_hours SET DEFAULT 2.00;

-- 백업 컬럼 삭제
ALTER TABLE auto_search_configs 
DROP COLUMN IF EXISTS interval_hours_backup;

-- =============================================
-- 기존 데이터 검증 및 업데이트
-- =============================================

-- 기존 INTEGER 값들을 DECIMAL로 변환
UPDATE auto_search_configs 
SET interval_hours = interval_hours::DECIMAL(4,2)
WHERE interval_hours IS NOT NULL;

-- =============================================
-- 제약조건 추가 (선택사항)
-- =============================================

-- interval_hours가 0.5 이상 24 이하인지 확인하는 제약조건
ALTER TABLE auto_search_configs 
ADD CONSTRAINT check_interval_hours_range 
CHECK (interval_hours >= 0.5 AND interval_hours <= 24);

-- =============================================
-- 인덱스 재생성 (필요시)
-- =============================================

-- interval_hours 인덱스가 있다면 재생성
DROP INDEX IF EXISTS idx_auto_search_configs_interval_hours;
CREATE INDEX IF NOT EXISTS idx_auto_search_configs_interval_hours 
ON auto_search_configs(interval_hours);

-- =============================================
-- 완료 메시지
-- =============================================
DO $$
BEGIN
    RAISE NOTICE 'interval_hours 필드가 DECIMAL(4,2) 타입으로 성공적으로 변경되었습니다.';
    RAISE NOTICE '이제 0.5시간(30분) 간격으로 자동 검색을 설정할 수 있습니다.';
END $$;
