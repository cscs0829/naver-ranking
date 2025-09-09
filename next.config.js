/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // 환경변수는 .env.local에서 자동으로 로드됩니다
  // 별도의 env 설정은 필요하지 않습니다
}

module.exports = nextConfig
