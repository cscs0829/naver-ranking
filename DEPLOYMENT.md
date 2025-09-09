# 배포 가이드

이 문서는 네이버 쇼핑 순위 검색기를 Vercel과 Supabase에 배포하는 방법을 단계별로 안내합니다.

## 1. 사전 준비

### 필요한 계정
- [GitHub](https://github.com/) 계정
- [Vercel](https://vercel.com/) 계정
- [Supabase](https://supabase.com/) 계정
- [네이버 개발자 센터](https://developers.naver.com/) 계정

### 필요한 정보
- 네이버 API 클라이언트 ID와 시크릿
- Supabase 프로젝트 URL과 anon key

## 2. Supabase 설정

### 2.1 프로젝트 생성
1. [Supabase](https://supabase.com/)에 로그인
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `naver-ranking-checker`
   - Database Password: 강력한 비밀번호 설정
   - Region: 가장 가까운 지역 선택
4. "Create new project" 클릭
5. 프로젝트 생성 완료까지 대기 (약 2-3분)

### 2.2 데이터베이스 설정
1. Supabase 대시보드에서 "SQL Editor" 클릭
2. `supabase-schema.sql` 파일의 내용을 복사하여 붙여넣기
3. "Run" 버튼 클릭하여 스키마 생성
4. "Table Editor"에서 `search_results` 테이블이 생성되었는지 확인

### 2.3 API 키 확인
1. Supabase 대시보드에서 "Settings" > "API" 클릭
2. 다음 정보를 복사하여 저장:
   - Project URL (예: `https://abcdefghijklmnop.supabase.co`)
   - anon public key (예: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## 3. 네이버 API 설정

### 3.1 애플리케이션 등록
1. [네이버 개발자 센터](https://developers.naver.com/)에 로그인
2. "Application" > "애플리케이션 등록" 클릭
3. 애플리케이션 정보 입력:
   - 애플리케이션 이름: `네이버 쇼핑 순위 검색기`
   - 사용 API: "쇼핑" 선택
   - 서비스 환경: "Web" 선택
   - 웹 서비스 URL: `http://localhost:3000` (개발용)
4. "등록" 클릭

### 3.2 API 키 확인
1. 등록된 애플리케이션 클릭
2. "Client ID"와 "Client Secret" 복사하여 저장

## 4. GitHub 저장소 설정

### 4.1 저장소 생성
1. [GitHub](https://github.com/)에 로그인
2. "New repository" 클릭
3. 저장소 정보 입력:
   - Repository name: `naver-ranking-checker`
   - Description: `네이버 쇼핑 상품 순위 검색 및 비교 도구`
   - Public 또는 Private 선택
4. "Create repository" 클릭

### 4.2 코드 푸시
```bash
# 프로젝트 디렉토리에서 실행
git init
git add .
git commit -m "Initial commit: 네이버 쇼핑 순위 검색기"

# GitHub 저장소 연결 (URL은 실제 저장소 URL로 변경)
git remote add origin https://github.com/your-username/naver-ranking-checker.git
git branch -M main
git push -u origin main
```

## 5. Vercel 배포

### 5.1 프로젝트 연결
1. [Vercel](https://vercel.com/)에 로그인
2. "New Project" 클릭
3. GitHub 저장소에서 `naver-ranking-checker` 선택
4. "Import" 클릭

### 5.2 프로젝트 설정
1. Project Name: `naver-ranking-checker` (또는 원하는 이름)
2. Framework Preset: Next.js가 자동으로 감지됨
3. Root Directory: `./` (기본값)
4. Build and Output Settings: 기본값 사용
5. "Deploy" 클릭

### 5.3 환경변수 설정
배포가 완료되면 환경변수를 설정해야 합니다:

1. Vercel 대시보드에서 프로젝트 선택
2. "Settings" > "Environment Variables" 클릭
3. 다음 변수들을 추가:

| Name | Value | Environment |
|------|-------|-------------|
| `NAVER_CLIENT_ID` | 네이버 API 클라이언트 ID | Production, Preview, Development |
| `NAVER_CLIENT_SECRET` | 네이버 API 클라이언트 시크릿 | Production, Preview, Development |
| `SUPABASE_URL` | Supabase 프로젝트 URL | Production, Preview, Development |
| `SUPABASE_ANON_KEY` | Supabase anon key | Production, Preview, Development |

4. 각 변수 추가 후 "Save" 클릭
5. "Redeploy" 클릭하여 환경변수 적용

## 6. 배포 확인

### 6.1 기본 기능 테스트
1. Vercel에서 제공하는 URL로 접속
2. 검색어 입력하여 상품 순위 검색 테스트
3. 결과가 데이터베이스에 저장되는지 확인

### 6.2 오류 확인
- Vercel 대시보드 > Functions에서 로그 확인
- Supabase 대시보드 > Logs에서 데이터베이스 로그 확인
- 브라우저 개발자 도구에서 네트워크 오류 확인

## 7. 추가 설정

### 7.1 커스텀 도메인 (선택사항)
1. Vercel 대시보드 > Settings > Domains
2. 원하는 도메인 입력
3. DNS 설정에 따라 도메인 연결

### 7.2 모니터링 설정
1. Vercel Analytics 활성화
2. Supabase에서 데이터베이스 모니터링 설정
3. 에러 알림 설정 (선택사항)

## 8. 문제 해결

### 8.1 일반적인 문제
- **환경변수 오류**: Vercel에서 환경변수가 제대로 설정되었는지 확인
- **API 호출 실패**: 네이버 API 키가 올바른지 확인
- **데이터베이스 연결 실패**: Supabase URL과 키가 올바른지 확인

### 8.2 로그 확인 방법
- Vercel: 대시보드 > Functions > Logs
- Supabase: 대시보드 > Logs
- 브라우저: 개발자 도구 > Console

### 8.3 재배포
환경변수 변경 후에는 반드시 재배포가 필요합니다:
1. Vercel 대시보드 > Deployments
2. 최신 배포 옆의 "..." 메뉴 클릭
3. "Redeploy" 선택

## 9. 보안 고려사항

### 9.1 API 키 보안
- 네이버 API 키는 서버 사이드에서만 사용
- 클라이언트 사이드에서는 노출되지 않음
- Supabase anon key는 공개되어도 안전함

### 9.2 데이터베이스 보안
- RLS (Row Level Security)가 활성화됨
- 필요시 더 세밀한 접근 제어 설정 가능

## 10. 성능 최적화

### 10.1 Vercel 최적화
- 자동으로 CDN과 Edge Functions 활용
- 이미지 최적화 자동 적용
- 코드 분할 자동 적용

### 10.2 Supabase 최적화
- 데이터베이스 인덱스 자동 생성
- 연결 풀링 자동 관리
- 캐싱 자동 적용

이 가이드를 따라하면 네이버 쇼핑 순위 검색기를 성공적으로 배포할 수 있습니다.
