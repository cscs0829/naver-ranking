const axios = require('axios');

// 키워드 개수별 테스트
async function testKeywordLimits() {
  const clientId = 'MU3rgzUHPMzSSeOUP17I';
  const clientSecret = 'fojuEbHYY4';
  const baseUrl = 'https://openapi.naver.com/v1/datalab/shopping';

  // 테스트 1: 1개 키워드 (최근 데이터)
  console.log('=== 테스트 1: 1개 키워드 (최근 데이터) ===');
  try {
    const requestBody1 = {
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      timeUnit: 'date',
      category: '50000005',
      keyword: [
        { name: '해외여행', param: ['해외여행'] }
      ]
    };
    
    const response1 = await axios.post(`${baseUrl}/category/keywords`, requestBody1, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('응답 성공:', response1.status);
    console.log('데이터 개수:', response1.data.results?.[0]?.data?.length || 0);
    console.log('첫 번째 데이터:', response1.data.results?.[0]?.data?.[0]);
  } catch (error) {
    console.error('테스트 1 실패:', error.response?.data || error.message);
  }

  // 테스트 2: 5개 키워드 (최근 데이터)
  console.log('\n=== 테스트 2: 5개 키워드 (최근 데이터) ===');
  try {
    const requestBody2 = {
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      timeUnit: 'date',
      category: '50000005',
      keyword: [
        { name: '해외여행', param: ['해외여행'] },
        { name: '해외패키지', param: ['해외패키지'] },
        { name: '해외투어', param: ['해외투어'] },
        { name: '해외자유여행', param: ['해외자유여행'] },
        { name: '동남아여행', param: ['동남아여행'] }
      ]
    };
    
    const response2 = await axios.post(`${baseUrl}/category/keywords`, requestBody2, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('응답 성공:', response2.status);
    console.log('결과 개수:', response2.data.results?.length || 0);
    response2.data.results?.forEach((result, index) => {
      console.log(`키워드 ${index + 1}: ${result.title}, 데이터 개수: ${result.data?.length || 0}`);
    });
  } catch (error) {
    console.error('테스트 2 실패:', error.response?.data || error.message);
  }

  // 테스트 3: 다른 카테고리로 테스트
  console.log('\n=== 테스트 3: 패션의류 카테고리 ===');
  try {
    const requestBody3 = {
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      timeUnit: 'date',
      category: '50000000', // 패션의류
      keyword: [
        { name: '여성의류', param: ['여성의류'] },
        { name: '남성의류', param: ['남성의류'] }
      ]
    };
    
    const response3 = await axios.post(`${baseUrl}/category/keywords`, requestBody3, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('응답 성공:', response3.status);
    console.log('결과 개수:', response3.data.results?.length || 0);
    response3.data.results?.forEach((result, index) => {
      console.log(`키워드 ${index + 1}: ${result.title}, 데이터 개수: ${result.data?.length || 0}`);
    });
  } catch (error) {
    console.error('테스트 3 실패:', error.response?.data || error.message);
  }
}

testKeywordLimits().catch(console.error);
