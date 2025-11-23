# 🛒 네이버 쇼핑 순위 검색기 & 키워드 분석 도구

네이버 쇼핑 API와 데이터랩 API를 활용하여 상품 순위 검색, 키워드 트렌드 분석, 자동화된 스케줄링을 제공하는 종합적인 마케팅 분석 도구입니다.

## 📋 프로젝트 정보

- **개발 기간**: 2024년 1월 ~ 2024년 6월 (6개월)
- **참여 인원**: 1명 (개인 프로젝트)
- **담당 역할**: 풀스택 개발 (프론트엔드, 백엔드, 데이터베이스 설계, 배포)
- **GitHub**: https://github.com/cscs0829/naver-ranking
- **상세 포트폴리오**: [PORTFOLIO.md](./PORTFOLIO.md) 참조

## ✨ 주요 기능

### 🔍 상품 순위 검색
- **정확한 순위 검색**: 네이버 쇼핑에서 특정 상품의 정확한 순위 검색
- **다중 필터링**: 쇼핑몰명, 브랜드명, 상품명으로 정밀 검색
- **실시간 분석**: 즉시 결과 확인 또는 데이터베이스 저장
- **히스토리 관리**: 검색 결과를 시간별로 추적 및 비교
- **분석/저장 모드**: 빠른 확인용 분석 모드와 데이터 저장용 저장 모드

### 📊 키워드 트렌드 분석
- **네이버 데이터랩 연동**: 검색어 트렌드 데이터 수집
- **다차원 분석**: 시간, 연령, 성별, 디바이스별 분석
- **시각화**: Recharts를 활용한 인터랙티브 차트
- **비교 분석**: 최대 5개 키워드 동시 비교
- **엑셀 내보내기**: 분석 결과를 엑셀 파일로 다운로드
- **원시 데이터 확인**: 상세 데이터 테이블 토글 기능

### ⏰ 자동 검색 스케줄링
- **유연한 스케줄링**: 30분~1개월 간격으로 자동 실행
- **다중 설정 관리**: 여러 검색어를 동시에 모니터링
- **실시간 알림**: 실행 결과를 즉시 알림
- **통계 대시보드**: 실행 성공률, 오류 현황 등 모니터링
- **실행 로그**: 상세한 실행 기록 및 오류 추적
- **즉시 실행**: 설정 생성 후 즉시 테스트 실행

### 🔑 API 키 관리
- **다중 API 키 지원**: 여러 네이버 API 키를 안전하게 관리
- **프로필 시스템**: 쇼핑/인사이트 API별로 별도 프로필 관리
- **사용량 추적**: API 키별 사용량 및 마지막 사용 시간 기록
- **자동 로테이션**: 기본 프로필 설정으로 자동 키 선택
- **보안**: 클라이언트 시크릿 마스킹 및 안전한 저장

### 🔔 실시간 알림 시스템
- **다양한 알림 타입**: 성공, 오류, 경고, 정보 알림
- **실시간 업데이트**: 30초마다 자동 새로고침
- **읽음 관리**: 개별/전체 읽음 처리
- **알림 정리**: 개별 삭제 및 전체 비우기 기능
- **우선순위 표시**: 알림 중요도별 시각적 구분

### 📱 현대적인 UI/UX
- **반응형 디자인**: 모바일과 데스크톱에서 최적화된 경험
- **다크 모드**: 시스템 설정에 따른 자동 다크 모드
- **애니메이션**: Framer Motion을 활용한 부드러운 인터랙션
- **실시간 피드백**: Toast 알림과 로딩 상태 표시
- **스켈레톤 로딩**: 자연스러운 로딩 경험
- **Lottie 애니메이션**: 빈 상태 표시용 애니메이션

### 📈 데이터 시각화
- **순위 추이 차트**: 시간별 순위 변화 시각화
- **키워드 트렌드**: 다중 키워드 비교 라인 차트
- **통계 대시보드**: 실행 성공률, 오류율 등 KPI 표시
- **실시간 모니터링**: 자동 검색 현황 실시간 확인

## 🛠 기술 스택

### Frontend
- **Next.js 14**: App Router 기반 풀스택 프레임워크
- **React 18**: 최신 React 기능과 Concurrent Features
- **TypeScript**: 타입 안전성을 위한 정적 타입 검사
- **Tailwind CSS**: 유틸리티 퍼스트 CSS 프레임워크
- **Framer Motion**: 고성능 애니메이션 라이브러리
- **Recharts**: 데이터 시각화 차트 라이브러리
- **Lottie React**: 벡터 애니메이션

### Backend & Database
- **Next.js API Routes**: 서버리스 API 엔드포인트
- **Supabase**: PostgreSQL 기반 백엔드 서비스
- **Row Level Security**: 데이터베이스 레벨 보안
- **ExcelJS**: 엑셀 파일 생성 및 내보내기

### External APIs
- **네이버 쇼핑 API**: 상품 검색 및 순위 조회
- **네이버 데이터랩 API**: 검색어 트렌드 분석

### Deployment & Infrastructure
- **Vercel**: 서버리스 배포 플랫폼
- **GitHub Actions**: CI/CD 및 자동화
- **Supabase 통합**: Vercel과 Supabase 자동 연동

### 스크립트 & 유틸리티
- **Node.js 스크립트**: 자동 검색 실행 및 로그 정리
- **Axios**: HTTP 클라이언트
- **환경변수 관리**: 보안적인 API 키 관리

## 🚀 빠른 시작

### 1. 프로젝트 설정

```bash
# 저장소 클론
git clone https://github.com/your-username/naver-ranking-checker.git
cd naver-ranking-checker

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 2. 네이버 API 키 발급

1. [네이버 개발자 센터](https://developers.naver.com/) 접속
2. 새 애플리케이션 등록
3. 다음 API 활성화:
   - **쇼핑 API**: 상품 검색용
   - **데이터랩 API**: 키워드 트렌드 분석용
4. Client ID와 Client Secret 발급

### 3. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com/)에서 새 프로젝트 생성
2. 데이터베이스 스키마 설정:
   ```sql
   -- 프로젝트 루트의 supabase-current-schema.sql 파일 실행
   ```
3. API 키 확인 (Settings > API)

### 4. 환경변수 설정

`.env.local` 파일 생성:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 네이버 API 키 (선택사항 - UI에서도 설정 가능)
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
```

## 🌐 Vercel 배포

### 1. GitHub 연동

```bash
# Git 초기화
git init
git remote add origin https://github.com/your-username/naver-ranking-checker.git

# 코드 푸시
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 2. Vercel 배포

1. [Vercel](https://vercel.com/) 로그인
2. "New Project" → GitHub 저장소 선택
3. Supabase 통합 설정 (자동 환경변수 설정)
4. 네이버 API 키 환경변수 추가:
   - `NAVER_CLIENT_ID`
   - `NAVER_CLIENT_SECRET`
5. 배포 완료

### 3. 도메인 설정

- Vercel 기본 도메인 사용 또는 커스텀 도메인 연결

## 📖 사용 가이드

### 🔍 상품 순위 검색

1. **검색 탭**에서 검색어 입력
2. 필터 조건 설정 (선택사항):
   - 대상 쇼핑몰
   - 대상 브랜드
   - 대상 상품명
3. 최대 검색 페이지 수 설정
4. **분석 모드** 또는 **저장 모드** 선택
   - **분석 모드**: 빠른 확인용, 결과 저장 안함
   - **저장 모드**: 결과를 데이터베이스에 저장
5. API 키 프로필 선택 (여러 키가 있는 경우)
6. 검색 실행

### 📊 키워드 트렌드 분석

1. **키워드 분석 탭**으로 이동
2. 분석 조건 설정:
   - **분석 기간**: 시작일 ~ 종료일 (2017-08-01 이후)
   - **시간 단위**: 일/주/월
   - **분석 키워드**: 최대 5개 (각 키워드당 최대 5개 검색어)
   - **필터 조건**: 연령, 성별, 디바이스
3. API 키 프로필 선택 (데이터랩 API용)
4. 분석 실행
5. **키워드 결과 탭**에서 결과 확인:
   - 비교 차트로 트렌드 시각화
   - 상세 데이터 테이블 확인
   - 엑셀 파일로 내보내기

### ⏰ 자동 검색 설정

1. **자동 검색 탭**에서 **새 스케줄** 클릭
2. 스케줄 정보 입력:
   - 설정 이름
   - 검색어 및 필터 조건
   - 최대 페이지 수
   - 실행 주기 (30분 ~ 1개월)
   - API 키 프로필
   - 설명 (선택)
3. 생성 후 자동 실행 확인
4. **실시간 결과 탭**에서 통계 및 현황 모니터링
5. **알림 탭**에서 실행 결과 알림 확인

### 🔑 API 키 관리

1. **API 키 탭**으로 이동
2. **새 프로필** 버튼으로 API 키 추가:
   - 프로필 이름
   - API 타입 (쇼핑/인사이트)
   - Client ID & Secret
   - 기본 프로필 설정
3. 프로필 활성화/비활성화 관리
4. 사용량 및 마지막 사용 시간 확인

### 📈 데이터 관리

1. **순위 결과 탭**에서 저장된 검색 결과 확인
2. 검색어별 그룹화 및 정렬
3. 개별 결과 삭제 또는 전체 정리
4. 엑셀 파일로 내보내기
5. **키워드 결과 탭**에서 키워드 분석 결과 관리

## 🔧 API 엔드포인트

### 🔍 검색 관련

#### POST /api/search
상품 순위 검색

```json
{
  "searchQuery": "베트남 여행",
  "targetMallName": "하나투어",
  "targetBrand": "하나투어",
  "targetProductName": "다낭 패키지",
  "maxPages": 10,
  "save": true,
  "profileId": 1
}
```

#### GET /api/results
저장된 검색 결과 조회

**Query Parameters:**
- `searchQuery`: 특정 검색어 필터링
- `targetMallName`: 특정 쇼핑몰 필터링
- `sortBy`: 정렬 기준 (created_at, total_rank)
- `sortOrder`: 정렬 순서 (asc, desc)
- `rankSortOrder`: 순위 정렬 순서 (asc, desc)

#### DELETE /api/results
검색 결과 삭제

### 📊 키워드 분석

#### POST /api/keyword-analysis
키워드 트렌드 분석

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "timeUnit": "date",
  "category": ["50000005"],
  "keywords": [
    {
      "name": "베트남 여행",
      "param": ["베트남 여행", "베트남 패키지"]
    }
  ],
  "device": "pc",
  "gender": "m",
  "ages": ["20", "30"],
  "profileId": 1
}
```

#### GET /api/keyword-results
키워드 분석 결과 조회

**Query Parameters:**
- `analysisName`: 분석명 필터링
- `category`: 카테고리 필터링
- `keyword`: 키워드 필터링
- `sortBy`: 정렬 기준
- `sortOrder`: 정렬 순서

#### GET /api/keyword-analysis/export-excel
키워드 분석 결과 엑셀 내보내기

### ⏰ 자동 검색

#### POST /api/auto-search/run
자동 검색 실행

```json
{
  "configId": 1,
  "apiKeyProfileId": 1
}
```

#### GET /api/auto-search/configs
자동 검색 설정 목록 조회

#### POST /api/auto-search/configs
새 자동 검색 설정 생성

```json
{
  "name": "베트남 여행 자동 검색",
  "search_query": "베트남 여행",
  "target_mall_name": "하나투어",
  "target_brand": "하나투어",
  "target_product_name": "다낭 패키지",
  "max_pages": 10,
  "profile_id": 1,
  "interval_hours": 2,
  "description": "2시간마다 베트남 여행 상품 순위 확인"
}
```

#### PUT /api/auto-search/configs/{id}
자동 검색 설정 수정

#### DELETE /api/auto-search/configs/{id}
자동 검색 설정 삭제

#### GET /api/auto-search/dashboard
대시보드 통계 조회

### 🔔 알림 관리

#### GET /api/auto-search/notifications
알림 목록 조회

#### PUT /api/auto-search/notifications/{id}
알림 읽음 처리

```json
{
  "read": true
}
```

#### DELETE /api/auto-search/notifications/{id}
개별 알림 삭제

#### POST /api/auto-search/notifications/read-all
모든 알림 읽음 처리

#### DELETE /api/auto-search/notifications/delete-all
모든 알림 삭제

### 🔑 API 키 관리

#### GET /api/keys
API 키 프로필 목록 조회

#### POST /api/keys
새 API 키 프로필 생성

```json
{
  "name": "메인 API",
  "client_id": "your_client_id",
  "client_secret": "your_client_secret",
  "api_type": "shopping",
  "is_default": true
}
```

#### PUT /api/keys/{id}
API 키 프로필 수정

#### DELETE /api/keys/{id}
API 키 프로필 삭제

### 🛠 유틸리티

#### POST /api/cleanup-logs
오래된 로그 정리 (7일 이상)

#### GET /api/health
시스템 상태 확인

## 🗄 데이터베이스 스키마

### 핵심 테이블

#### `search_results`
검색 결과 저장

```sql
CREATE TABLE search_results (
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
  is_exact_match BOOLEAN DEFAULT true,
  match_confidence DECIMAL(3,2) DEFAULT 1.00,
  check_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `keyword_analysis_results`
키워드 분석 결과 저장

```sql
CREATE TABLE keyword_analysis_results (
  id SERIAL PRIMARY KEY,
  analysis_name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  time_unit VARCHAR(20) NOT NULL,
  category JSONB,
  keywords JSONB NOT NULL,
  device VARCHAR(10),
  gender VARCHAR(10),
  ages VARCHAR(50),
  results JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `auto_search_configs`
자동 검색 설정

```sql
CREATE TABLE auto_search_configs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  search_query VARCHAR(255) NOT NULL,
  target_mall_name VARCHAR(255),
  target_brand VARCHAR(255),
  target_product_name VARCHAR(255),
  max_pages INTEGER DEFAULT 10,
  profile_id INTEGER REFERENCES api_key_profiles(id),
  interval_hours DECIMAL(5,2) DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP,
  next_run_at TIMESTAMP,
  run_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `auto_search_logs`
자동 검색 실행 로그

```sql
CREATE TABLE auto_search_logs (
  id SERIAL PRIMARY KEY,
  config_id INTEGER REFERENCES auto_search_configs(id),
  status VARCHAR(50) NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  duration_ms INTEGER,
  results_count INTEGER DEFAULT 0,
  error_message TEXT,
  search_results JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `auto_search_notifications`
자동 검색 알림

```sql
CREATE TABLE auto_search_notifications (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  config_id INTEGER REFERENCES auto_search_configs(id),
  priority VARCHAR(20) DEFAULT 'normal',
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `api_key_profiles`
API 키 프로필 관리

```sql
CREATE TABLE api_key_profiles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  api_type VARCHAR(20) DEFAULT 'shopping',
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔒 보안 고려사항

### API 키 보안
- 환경변수에 API 키 저장
- 데이터베이스에 암호화된 형태로 저장
- API 키 프로필별 사용량 추적
- 클라이언트 시크릿 마스킹 표시

### 데이터베이스 보안
- Row Level Security (RLS) 활성화
- 사용자별 데이터 접근 제어
- API 키 기반 인증

### API 제한
- 네이버 API 호출 제한 준수
- 요청 간격 조절 (초당 1회)
- 오류 처리 및 재시도 로직
- 타임아웃 설정 (30초)

## 📊 성능 최적화

### 프론트엔드
- Next.js App Router 활용
- 컴포넌트 레이지 로딩
- 이미지 최적화
- 번들 크기 최적화
- 스켈레톤 로딩으로 UX 개선

### 백엔드
- Supabase 연결 풀링
- API 응답 캐싱
- 데이터베이스 인덱싱
- 서버리스 함수 최적화
- 재시도 로직으로 안정성 향상

### 데이터베이스
- 적절한 인덱스 설정
- 정규화된 스키마 설계
- 자동 정리 스크립트
- 백업 및 복구 전략

## 🚨 주의사항 및 제한사항

### API 제한
- **네이버 쇼핑 API**: 초당 1회 호출 제한
- **네이버 데이터랩 API**: 일일 10,000회 호출 제한
- **검색 결과**: 한 번에 최대 1,000개 상품
- **키워드 분석**: 최대 5개 키워드, 각 키워드당 최대 5개 검색어

### 플랫폼 제한
- **Vercel**: 무료 플랜 월 100GB 대역폭
- **Supabase**: 무료 플랜 월 50,000 API 요청
- **GitHub Actions**: 무료 플랜 월 2,000분 실행

### 데이터 관리
- 같은 검색어 재검색 시 기존 데이터 덮어쓰기
- 30일 이상 된 로그 자동 정리
- API 키 프로필 삭제 시 관련 데이터 연쇄 삭제
- 키워드 분석 결과는 수동 삭제 필요

### 사용 제한
- 키워드 분석 시작 날짜: 2017-08-01 이후
- 시간 단위: date, week, month만 지원
- 연령 필터: 10, 20, 30, 40, 50, 60대만 지원

## 🔧 트러블슈팅

이 섹션에서는 프로젝트 개발 과정에서 발생한 주요 문제들과 해결 방법을 다룹니다.

### ❌ 자동검색 오류 메시지 지속 표시 문제

**문제**: 자동검색이 성공적으로 실행되었음에도 불구하고 "Request failed with status code 500" 오류 메시지가 계속 표시됨

**원인**: 
- 자동검색 성공 시 `last_error` 필드가 데이터베이스에서 자동으로 초기화되지 않음
- UI에서 이전 오류 메시지를 계속 표시하는 로직 문제

**해결 방법**:
```typescript
// app/api/auto-search/run/route.ts
// 성공 시 last_error 필드 초기화
await supabase
  .from('auto_search_configs')
  .update({
    last_run_at: new Date().toISOString(),
    run_count: (config.run_count || 0) + 1,
    success_count: (config.success_count || 0) + 1,
    last_error: null // 성공 시 이전 오류 메시지 초기화
  })
  .eq('id', configId);
```

```typescript
// src/components/AutoSearchManager.tsx
// 조건부 오류 메시지 표시
{config.last_error && config.error_count > 0 && config.success_count === 0 && (
  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
    <strong>마지막 오류:</strong> {config.last_error}
  </div>
)}
```

### ❌ 네이버 API 호출 제한 문제

**문제**: 네이버 API 호출 시 "API 호출 한도 초과" 오류 발생

**원인**:
- 네이버 쇼핑 API는 초당 1회 호출 제한
- 자동검색에서 빠른 연속 호출 시 제한 초과

**해결 방법**:
```javascript
// scripts/auto-search.js
// API 호출 간격 조절
if (startIndex <= 1000) {
  await new Promise(resolve => setTimeout(resolve, 500)); // 0.5초 대기
}
```

```javascript
// 재시도 로직 구현
if ((errorCode === 'SE99' || statusCode >= 500) && retryCount < 3) {
  const delay = Math.pow(2, retryCount) * 1000; // 1초, 2초, 4초
  console.log(`⚠️ 시스템 에러 발생. ${delay/1000}초 후 재시도... (${retryCount + 1}/3)`);
  
  await new Promise(resolve => setTimeout(resolve, delay));
  return searchNaverShopping(query, options, retryCount + 1);
}
```

### ❌ 데이터베이스 연결 오류

**문제**: Supabase 연결 실패 또는 환경변수 누락 오류

**원인**:
- 환경변수 설정 누락
- Supabase 프로젝트 설정 오류
- 네트워크 연결 문제

**해결 방법**:
```typescript
// src/utils/supabase.ts
export function checkSupabaseConfig() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Supabase 환경변수가 설정되지 않았습니다.');
  }
}
```

```bash
# 환경변수 확인
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### ❌ 키워드 분석 API 오류

**문제**: 네이버 데이터랩 API 호출 시 오류 발생

**원인**:
- 잘못된 날짜 형식 (2017-08-01 이전 날짜)
- 잘못된 키워드 형식
- API 키 타입 불일치 (쇼핑 API 키로 데이터랩 API 호출)

**해결 방법**:
```typescript
// 날짜 유효성 검사
const minDataLabDate = new Date('2017-08-01')
const startDateObj = new Date(startDate)
if (startDateObj < minDataLabDate) {
  return NextResponse.json({ error: '시작 날짜는 2017-08-01 이후여야 합니다.' }, { status: 400 })
}
```

```typescript
// API 키 타입 확인
const apiKeyProfile = await getActiveProfile(profileId, 'search') // 데이터랩용
```

### ❌ 자동검색 스크립트 실행 오류

**문제**: Node.js 스크립트 실행 시 환경변수 누락 오류

**원인**:
- 스크립트에서 환경변수를 올바르게 로드하지 못함
- Supabase 클라이언트 초기화 실패

**해결 방법**:
```javascript
// scripts/auto-search.js
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경변수가 설정되지 않았습니다.');
  console.error('SUPABASE_URL과 SUPABASE_SERVICE_KEY를 설정해주세요.');
  process.exit(1);
}
```

### ❌ 프론트엔드 로딩 상태 관리 문제

**문제**: 데이터 로딩 중 사용자 경험 저하 및 중복 요청 발생

**원인**:
- 로딩 상태 관리 부족
- 요청 중복 방지 로직 없음

**해결 방법**:
```typescript
// 로딩 상태 관리
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  if (loading) return; // 중복 요청 방지
  
  try {
    setLoading(true);
    // API 호출
  } finally {
    setLoading(false);
  }
};
```

```typescript
// AbortController를 활용한 요청 취소
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000);

const response = await fetch(url, {
  signal: controller.signal,
  // ...
});
```

### ❌ 데이터베이스 성능 문제

**문제**: 대량 데이터 처리 시 성능 저하

**원인**:
- 적절한 인덱스 부족
- 비효율적인 쿼리
- 대량 데이터 조회 시 페이징 없음

**해결 방법**:
```sql
-- 인덱스 생성
CREATE INDEX idx_search_results_query_date ON search_results(search_query, created_at);
CREATE INDEX idx_auto_search_logs_config_status ON auto_search_logs(config_id, status);
CREATE INDEX idx_keyword_results_created_at ON keyword_analysis_results(created_at);
```

```typescript
// 페이징 구현
const { data, error } = await supabase
  .from('search_results')
  .select('*')
  .range(startIndex, endIndex)
  .order('created_at', { ascending: false });
```

### ❌ 메모리 누수 문제

**문제**: 장시간 사용 시 메모리 사용량 증가

**원인**:
- 이벤트 리스너 정리 부족
- 타이머 정리 누락
- 컴포넌트 언마운트 시 정리 작업 부족

**해결 방법**:
```typescript
// useEffect 정리 함수 활용
useEffect(() => {
  const interval = setInterval(fetchNotifications, 30000);
  
  return () => clearInterval(interval); // 정리 함수
}, []);

// AbortController 정리
useEffect(() => {
  const controller = new AbortController();
  
  return () => controller.abort();
}, []);
```

### ❌ 빌드 및 배포 오류

**문제**: Vercel 배포 시 빌드 실패

**원인**:
- TypeScript 타입 오류
- 환경변수 누락
- 의존성 버전 충돌

**해결 방법**:
```bash
# 로컬에서 빌드 테스트
npm run build

# TypeScript 타입 체크
npx tsc --noEmit

# 환경변수 확인
vercel env ls
```

### ❌ CORS 및 네트워크 오류

**문제**: API 호출 시 CORS 오류 또는 네트워크 타임아웃

**원인**:
- 잘못된 도메인 설정
- 네트워크 연결 불안정
- API 서버 응답 지연

**해결 방법**:
```typescript
// 타임아웃 설정
const response = await fetch(url, {
  signal: AbortSignal.timeout(30000), // 30초 타임아웃
});

// 재시도 로직
const retryFetch = async (url: string, options: RequestInit, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};
```

### 🔍 문제 진단 도구

#### 로그 확인
```bash
# 자동검색 스크립트 실행 로그
node scripts/auto-search.js 2>&1 | tee auto-search.log

# Vercel 배포 로그
vercel logs --follow
```

#### 환경변수 확인
```bash
# 로컬 환경변수 확인
cat .env.local

# Vercel 환경변수 확인
vercel env ls
```

#### 데이터베이스 상태 확인
```sql
-- 활성 연결 수 확인
SELECT count(*) FROM pg_stat_activity;

-- 테이블 크기 확인
SELECT schemaname,tablename,pg_size_pretty(size) as size
FROM (SELECT schemaname,tablename,pg_total_relation_size(schemaname||'.'||tablename) as size
      FROM pg_tables WHERE schemaname = 'public') t
ORDER BY size DESC;
```

### 📞 추가 도움

문제가 계속 발생하는 경우:

1. **GitHub Issues**: [이슈 리포팅](https://github.com/your-username/naver-ranking-checker/issues)
2. **로그 파일**: 오류 발생 시 로그 파일과 함께 이슈 등록
3. **환경 정보**: Node.js 버전, 운영체제, 브라우저 정보 포함
4. **재현 단계**: 문제를 재현할 수 있는 구체적인 단계 제공

---

**💡 팁**: 문제 해결 시 다음 순서로 접근하세요:
1. 환경변수 및 설정 확인
2. 로그 파일 확인
3. 네트워크 연결 상태 확인
4. API 키 및 권한 확인
5. 데이터베이스 연결 상태 확인

## 🔄 업데이트 및 유지보수

### 정기 작업
- 오래된 로그 정리: `npm run cleanup-logs`
- 데이터베이스 백업
- API 키 사용량 모니터링
- 성능 지표 확인

### 스크립트 실행
```bash
# 자동 검색 실행 (모든 활성 설정)
node scripts/auto-search.js

# 특정 설정만 실행
node scripts/auto-search.js [config_id]

# 로그 정리
node scripts/cleanup-old-logs.js

# 네이버 API 테스트
node scripts/test-datalab.js
```

### 모니터링
- Vercel Analytics
- Supabase 대시보드
- GitHub Actions 로그
- 에러 알림 시스템

## 🎯 사용 사례

### 🛒 전자상거래 업체
- **경쟁사 모니터링**: 경쟁사 상품 순위 추적
- **자체 상품 순위 확인**: 본사 상품의 검색 순위 모니터링
- **키워드 트렌드 분석**: 시장 트렌드 파악 및 마케팅 전략 수립

### 📈 마케팅 에이전시
- **클라이언트 모니터링**: 다수 클라이언트의 상품 순위 관리
- **키워드 분석**: 검색어 트렌드 데이터로 캠페인 최적화
- **자동화된 리포팅**: 정기적인 순위 보고서 자동 생성

### 🔍 개인 셀러
- **상품 순위 추적**: 본인 상품의 검색 순위 변화 모니터링
- **경쟁 분석**: 경쟁 상품과의 순위 비교
- **시장 트렌드 파악**: 키워드 분석으로 시장 동향 파악

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 개발 가이드라인
- TypeScript 사용 필수
- 컴포넌트는 함수형 컴포넌트 사용
- 상태 관리는 React Hooks 활용
- 스타일링은 Tailwind CSS 사용
- 애니메이션은 Framer Motion 활용

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 지원 및 문의

- **이슈 리포팅**: [GitHub Issues](https://github.com/your-username/naver-ranking-checker/issues)
- **기능 요청**: [GitHub Discussions](https://github.com/your-username/naver-ranking-checker/discussions)
- **문서**: [Wiki](https://github.com/your-username/naver-ranking-checker/wiki)

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 라이브러리들의 도움으로 만들어졌습니다:

- [Next.js](https://nextjs.org/) - React 프레임워크
- [Supabase](https://supabase.com/) - 백엔드 서비스
- [Tailwind CSS](https://tailwindcss.com/) - CSS 프레임워크
- [Framer Motion](https://www.framer.com/motion/) - 애니메이션 라이브러리
- [Recharts](https://recharts.org/) - 차트 라이브러리
- [Lucide React](https://lucide.dev/) - 아이콘 라이브러리

---

**⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요!**

**🚀 더 많은 기능과 개선사항을 위해 지속적으로 업데이트하고 있습니다.**