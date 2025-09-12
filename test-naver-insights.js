const axios = require('axios');

// 네이버 쇼핑인사이트 API 테스트
async function testNaverInsightsAPI() {
  const clientId = 'MU3rgzUHPMzSSeOUP17I';
  const clientSecret = 'fojuEbHYY4';
  const baseUrl = 'https://openapi.naver.com/v1/datalab/shopping';

  // 테스트 1: category를 문자열로, keyword를 문자열 배열로
  console.log('=== 테스트 1: category 문자열, keyword 문자열 배열 ===');
  try {
    const requestBody1 = {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      timeUnit: 'date',
      category: '50000005', // 해외여행 카테고리
      keyword: ['해외여행', '해외패키지', '해외투어']
    };
    
    console.log('요청 본문:', JSON.stringify(requestBody1, null, 2));
    
    const response1 = await axios.post(`${baseUrl}/category/keywords`, requestBody1, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('응답 성공:', response1.status);
    console.log('응답 데이터:', JSON.stringify(response1.data, null, 2));
  } catch (error) {
    console.error('테스트 1 실패:', error.response?.data || error.message);
  }

  // 테스트 2: category를 배열로, keyword를 객체 배열로
  console.log('\n=== 테스트 2: category 배열, keyword 객체 배열 ===');
  try {
    const requestBody2 = {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      timeUnit: 'date',
      category: [{ name: '해외여행', param: ['50000005'] }],
      keyword: [
        { name: '해외여행', param: ['해외여행'] },
        { name: '해외패키지', param: ['해외패키지'] },
        { name: '해외투어', param: ['해외투어'] }
      ]
    };
    
    console.log('요청 본문:', JSON.stringify(requestBody2, null, 2));
    
    const response2 = await axios.post(`${baseUrl}/category/keywords`, requestBody2, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('응답 성공:', response2.status);
    console.log('응답 데이터:', JSON.stringify(response2.data, null, 2));
  } catch (error) {
    console.error('테스트 2 실패:', error.response?.data || error.message);
  }

  // 테스트 3: 다른 엔드포인트 시도
  console.log('\n=== 테스트 3: categories 엔드포인트 ===');
  try {
    const response3 = await axios.get(`${baseUrl}/categories`, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret
      },
      timeout: 15000
    });
    
    console.log('카테고리 목록 응답:', response3.status);
    console.log('카테고리 데이터:', JSON.stringify(response3.data, null, 2));
  } catch (error) {
    console.error('카테고리 조회 실패:', error.response?.data || error.message);
  }
}

testNaverInsightsAPI().catch(console.error);
