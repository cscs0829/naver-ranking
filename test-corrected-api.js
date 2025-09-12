const axios = require('axios');

// 수정된 네이버 쇼핑인사이트 API 테스트
async function testCorrectedAPI() {
  const clientId = 'MU3rgzUHPMzSSeOUP17I';
  const clientSecret = 'fojuEbHYY4';
  const baseUrl = 'https://openapi.naver.com/v1/datalab/shopping';

  console.log('=== 수정된 API 형식 테스트 ===');
  try {
    const requestBody = {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      timeUnit: 'date',
      category: '50000005', // 카테고리 코드 (문자열)
      keyword: [
        { name: '해외여행', param: ['해외여행'] },
        { name: '해외패키지', param: ['해외패키지'] },
        { name: '해외투어', param: ['해외투어'] }
      ]
    };
    
    console.log('요청 본문:', JSON.stringify(requestBody, null, 2));
    
    const response = await axios.post(`${baseUrl}/category/keywords`, requestBody, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('응답 성공:', response.status);
    console.log('응답 데이터:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('API 호출 실패:', error.response?.data || error.message);
  }
}

testCorrectedAPI().catch(console.error);
