/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 14에서는 appDir이 기본값이므로 experimental 설정 불필요
  // 환경변수는 .env.local에서 자동으로 로드됩니다
  // 별도의 env 설정은 필요하지 않습니다
  
  // webpack 설정으로 모듈 해결 문제 해결
  webpack: (config, { isServer }) => {
    // 모듈 해결 설정
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname, 'src'),
      },
    }
    
    return config
  },
}

module.exports = nextConfig
