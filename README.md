# 네이버 쇼핑 순위 검색기

네이버 쇼핑 API를 사용하여 상품 순위를 검색하고, Supabase 데이터베이스에 저장하여 여러 검색어의 결과를 비교할 수 있는 웹 애플리케이션입니다.

## 주요 기능

- 🔍 **상품 순위 검색**: 네이버 쇼핑에서 특정 상품의 순위 검색
- 🏪 **쇼핑몰 필터링**: 특정 쇼핑몰의 상품만 검색
- 🏷️ **브랜드/상품명 필터링**: 정확한 상품 매칭
- 📊 **다중 검색어 비교**: 여러 검색어의 결과를 한 번에 비교
- 💾 **데이터 저장**: 검색 결과를 데이터베이스에 자동 저장
- 🔄 **자동 업데이트**: 같은 검색어로 재검색 시 기존 데이터 자동 삭제 후 새로 저장
- ⏰ **자동 검색 스케줄링**: GitHub Actions를 활용한 정기 자동 검색
- 📈 **키워드 분석**: 네이버 쇼핑인사이트를 활용한 키워드 트렌드 분석
- 🔑 **API 키 관리**: 여러 네이버 API 키를 안전하게 관리
- 📊 **대시보드**: 자동 검색 통계 및 현황 모니터링
- 🔔 **알림 시스템**: 자동 검색 실행 결과 실시간 알림
- 📱 **반응형 UI**: 모바일과 데스크톱에서 모두 사용 가능

## 기술 스택

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **External API**: 네이버 쇼핑 검색 API

## 설치 및 설정

### 1. 프로젝트 클론 및 의존성 설치

```bash
git clone <repository-url>
cd naver_ranking
npm install
```

### 2. 네이버 API 키 발급

1. [네이버 개발자 센터](https://developers.naver.com/)에 접속
2. 애플리케이션 등록
3. "쇼핑" API 사용 설정
4. Client ID와 Client Secret 발급

### 3. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com/)에 접속하여 새 프로젝트 생성
2. 프로젝트 이름과 데이터베이스 비밀번호 설정
3. 프로젝트 생성 완료 후 대기 (약 2-3분 소요)

### 4. Supabase 데이터베이스 설정

1. **API 키 확인**:
   - Supabase 대시보드 > Settings > API
   - `Project URL`과 `anon public` 키 복사

2. **데이터베이스 스키마 생성**:
   - Supabase 대시보드 > SQL Editor
   - `supabase-schema.sql` 파일의 내용을 복사하여 실행
   - 또는 Table Editor에서 수동으로 테이블 생성

3. **RLS (Row Level Security) 설정**:
   - 테이블 생성 시 자동으로 RLS가 활성화됩니다
   - 모든 사용자가 읽기/쓰기 가능하도록 정책이 설정됩니다

### 5. 환경변수 설정

`.env.local` 파일을 생성하고 다음 내용을 입력:

```env
# 네이버 API 설정
NAVER_CLIENT_ID=your_naver_client_id_here
NAVER_CLIENT_SECRET=your_naver_client_secret_here

# Supabase 설정 (Vercel + Supabase 통합 시 자동으로 설정됨)
# SUPABASE_URL과 SUPABASE_ANON_KEY는 Vercel에서 자동 관리
```

**중요**: 
- `.env.local` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다
- **Vercel + Supabase 통합**을 사용하면 Supabase 환경변수는 자동으로 설정됩니다
- 네이버 API 키만 수동으로 설정하면 됩니다

### 6. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000에서 애플리케이션을 확인할 수 있습니다.

## Vercel 배포

### 1. GitHub 저장소 생성 및 푸시

```bash
# Git 초기화
git init

# 원격 저장소 추가 (GitHub에서 생성한 저장소 URL 사용)
git remote add origin https://github.com/your-username/naver-ranking-checker.git

# 파일 추가 및 커밋
git add .
git commit -m "Initial commit: 네이버 쇼핑 순위 검색기"

# 메인 브랜치로 푸시
git branch -M main
git push -u origin main
```

### 2. Vercel에 프로젝트 연결

1. [Vercel](https://vercel.com/)에 로그인
2. "New Project" 클릭
3. GitHub 저장소 선택
4. "Import" 클릭

### 3. Supabase 통합 설정

1. Vercel 대시보드에서 프로젝트 선택
2. "Integrations" 탭 클릭
3. "Supabase" 검색 후 "Add Integration" 클릭
4. Supabase 프로젝트 연결
5. **자동으로 Supabase 환경변수가 설정됩니다!**

### 4. 네이버 API 환경변수 설정

Vercel 대시보드에서 Settings > Environment Variables에서 다음 변수들을 설정:

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `NAVER_CLIENT_ID` | 네이버 API 클라이언트 ID | 네이버 개발자 센터에서 발급 |
| `NAVER_CLIENT_SECRET` | 네이버 API 클라이언트 시크릿 | 네이버 개발자 센터에서 발급 |

**참고**: Supabase 환경변수는 통합을 통해 자동으로 설정되므로 수동 설정이 불필요합니다.

### 5. 배포

1. 환경변수 설정 완료 후 "Deploy" 클릭
2. 자동으로 빌드 및 배포가 진행됩니다
3. 배포 완료 후 제공되는 URL로 접속 가능합니다

### 6. 도메인 설정 (선택사항)

- Vercel에서 제공하는 기본 도메인 사용 가능
- 커스텀 도메인 연결 가능 (Settings > Domains)

## 사용 방법

### 1. 상품 순위 검색

1. 검색어 입력 (필수)
2. 쇼핑몰명, 브랜드명, 상품명 입력 (선택)
3. 최대 검색 페이지 수 설정
4. "검색 시작" 버튼 클릭

### 2. 자동 검색 스케줄링

1. **자동 검색 탭**으로 이동
2. **새 스케줄** 버튼 클릭
3. 스케줄 정보 입력:
   - 스케줄 이름
   - 검색어
   - 대상 쇼핑몰/브랜드/상품명 (선택)
   - 실행 주기 (1시간마다, 2시간마다, 6시간마다, 12시간마다, 매일 등)
   - 설명 (선택)
4. **생성** 버튼 클릭

#### 자동 검색 실행 주기 옵션
- **1시간마다**: `0 */1 * * *`
- **2시간마다**: `0 */2 * * *` (기본값)
- **6시간마다**: `0 */6 * * *`
- **12시간마다**: `0 */12 * * *`
- **매일 자정**: `0 0 * * *`
- **매주 일요일**: `0 0 * * 0`
- **매월 1일**: `0 0 1 * *`

### 3. GitHub Actions 설정

자동 검색이 작동하려면 GitHub Secrets 설정이 필요합니다:

1. **GitHub 저장소** > **Settings** > **Secrets and variables** > **Actions**
2. 다음 Secrets 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase 서비스 역할 키

### 4. 결과 확인

- 검색 결과는 자동으로 데이터베이스에 저장됩니다
- 같은 검색어로 재검색하면 기존 데이터가 자동으로 업데이트됩니다
- 여러 검색어의 결과를 한 번에 비교할 수 있습니다
- 자동 검색 실행 로그를 확인할 수 있습니다

### 5. 데이터 관리

- 각 검색 결과는 개별적으로 삭제 가능합니다
- 검색어별로 그룹화되어 표시됩니다
- 상품 링크를 클릭하면 네이버 쇼핑 페이지로 이동합니다
- 자동 검색 스케줄을 활성화/비활성화할 수 있습니다

## API 엔드포인트

### POST /api/search
상품 순위 검색

**Request Body:**
```json
{
  "searchQuery": "베트남 여행",
  "targetMallName": "하나투어",
  "targetBrand": "하나투어",
  "targetProductName": "다낭",
  "maxPages": 10
}
```

### GET /api/results
저장된 검색 결과 조회

**Query Parameters:**
- `searchQuery`: 특정 검색어 결과만 조회
- `targetMallName`: 특정 쇼핑몰 결과만 조회

### DELETE /api/results
검색 결과 삭제

**Query Parameters:**
- `id`: 삭제할 결과의 ID

## 자동 검색 API 엔드포인트

### POST /api/auto-search/run
자동 검색 실행

**Request Body:**
```json
{
  "scheduleId": 1,
  "apiKeyProfileId": 1
}
```

### GET /api/auto-search/configs
자동 검색 설정 목록 조회

### POST /api/auto-search/configs
새 자동 검색 설정 생성

### GET /api/auto-search/dashboard
대시보드 통계 조회

### GET /api/auto-search/notifications
알림 목록 조회

### POST /api/auto-search/notifications
새 알림 생성

**Request Body:**
```json
{
  "name": "베트남 여행 자동 검색",
  "search_query": "베트남 여행",
  "target_mall_name": "하나투어",
  "target_brand": "하나투어",
  "target_product_name": "다낭",
  "cron_expression": "0 */2 * * *",
  "description": "2시간마다 베트남 여행 상품 순위 확인"
}
```

### PUT /api/auto-search/schedules/{id}
자동 검색 스케줄 수정

### DELETE /api/auto-search/schedules/{id}
자동 검색 스케줄 삭제

## 데이터베이스 스키마

### search_results 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | SERIAL | 기본키 |
| search_query | VARCHAR(255) | 검색어 |
| target_mall_name | VARCHAR(255) | 대상 쇼핑몰명 |
| target_brand | VARCHAR(255) | 대상 브랜드명 |
| target_product_name | VARCHAR(255) | 대상 상품명 |
| page | INTEGER | 페이지 번호 |
| rank_in_page | INTEGER | 페이지 내 순위 |
| total_rank | INTEGER | 전체 순위 |
| product_title | TEXT | 상품명 |
| mall_name | VARCHAR(255) | 쇼핑몰명 |
| brand | VARCHAR(255) | 브랜드명 |
| price | VARCHAR(50) | 가격 |
| product_link | TEXT | 상품 링크 |
| product_id | VARCHAR(255) | 상품 ID |
| category1 | VARCHAR(255) | 카테고리1 |
| category2 | VARCHAR(255) | 카테고리2 |
| category3 | VARCHAR(255) | 카테고리3 |
| created_at | TIMESTAMP | 생성일시 |
| updated_at | TIMESTAMP | 수정일시 |

### auto_search_configs 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | SERIAL | 기본키 |
| name | VARCHAR(255) | 설정 이름 |
| search_query | VARCHAR(255) | 검색어 |
| target_mall_name | VARCHAR(255) | 대상 쇼핑몰명 |
| target_brand | VARCHAR(255) | 대상 브랜드명 |
| target_product_name | VARCHAR(255) | 대상 상품명 |
| max_pages | INTEGER | 최대 페이지 수 |
| profile_id | INTEGER | API 키 프로필 ID (외래키) |
| interval_hours | INTEGER | 실행 주기 (시간) |
| is_active | BOOLEAN | 활성화 상태 |
| last_run_at | TIMESTAMP | 마지막 실행 시간 |
| next_run_at | TIMESTAMP | 다음 실행 시간 |
| run_count | INTEGER | 실행 횟수 |
| success_count | INTEGER | 성공 횟수 |
| error_count | INTEGER | 실패 횟수 |
| last_error | TEXT | 마지막 오류 메시지 |
| description | TEXT | 설명 |
| created_at | TIMESTAMP | 생성일시 |
| updated_at | TIMESTAMP | 수정일시 |

### auto_search_logs 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | SERIAL | 기본키 |
| config_id | INTEGER | 설정 ID (외래키) |
| status | VARCHAR(50) | 실행 상태 (running, success, error) |
| started_at | TIMESTAMP | 시작 시간 |
| completed_at | TIMESTAMP | 완료 시간 |
| duration_ms | INTEGER | 실행 시간 (밀리초) |
| results_count | INTEGER | 결과 개수 |
| error_message | TEXT | 오류 메시지 |
| search_results | JSONB | 검색 결과 |
| created_at | TIMESTAMP | 생성일시 |

### auto_search_notifications 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | SERIAL | 기본키 |
| type | VARCHAR(20) | 알림 타입 (success, error, warning, info) |
| title | VARCHAR(255) | 알림 제목 |
| message | TEXT | 알림 메시지 |
| config_id | INTEGER | 설정 ID (외래키) |
| priority | VARCHAR(20) | 우선순위 (low, normal, high, urgent) |
| read | BOOLEAN | 읽음 상태 |
| read_at | TIMESTAMP | 읽음 처리 시간 |
| created_at | TIMESTAMP | 생성일시 |

## 주의사항

1. **API 호출 제한**: 네이버 API는 초당 1회 호출 제한이 있습니다
2. **검색 페이지 제한**: 한 번에 최대 1000개 상품까지 검색 가능합니다
3. **데이터 저장**: 같은 검색어로 재검색하면 기존 데이터가 삭제됩니다
4. **API 키 보안**: 환경변수에 API 키를 안전하게 보관하세요
5. **자동 검색 제한**: GitHub Actions 무료 플랜은 월 2,000분 실행 제한이 있습니다
6. **Supabase 제한**: 무료 플랜은 월 50,000회 API 요청 제한이 있습니다
7. **자동 검색 실행**: GitHub Actions는 UTC 시간 기준으로 실행됩니다

## 라이선스

MIT License

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
